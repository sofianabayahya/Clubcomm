// ClubComm prototype — Trainer (Besluit 7): Home · Aanwezigheid · Berichten · Spelers · Speeltijd
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;

  // ---------- Aanwezigheid opnemen (herbruikbaar: trainer, teamleider, wedstrijdbegeleider) ----------
  // Invullen kan vanaf de dag zelf tot een instelbaar aantal uur na de start (clubinstelling, standaard 48)
  const opnemenUur = () => CC.S().club.inst.opnemenUur || 48;
  CC.opnemenTot = (a) => new Date(D.start(a).getTime() + opnemenUur() * 3600e3);
  const kanOpnemen = (a) => !a.afgelast && a.datum <= D.vandaag() && new Date() < CC.opnemenTot(a);
  const volgende = { a: 'l', l: 'x', x: 'a' };
  CC.opnemenHtml = (S, a) => {
    const ui = CC.ui;
    const sp = M.spelers(S, a.teamId);
    const opgeslagen = S.pres[a.id];
    if (!ui.draft || ui.draft.actId !== a.id) {
      const s = {};
      sp.forEach((pl) => { const st = M.status(S, pl, a); s[pl.id] = opgeslagen && opgeslagen.s[pl.id] ? opgeslagen.s[pl.id] : ['afgemeld', 'langdurig', 'open'].includes(st.code) ? 'x' : 'a'; });
      ui.draft = { actId: a.id, s };
    }
    const d = ui.draft.s;
    const n = Object.values(d).filter((v) => v !== 'x').length;
    if (!kanOpnemen(a)) {
      const reden = a.afgelast ? 'Deze activiteit is afgelast.' : a.datum > D.vandaag() ? 'Aanwezigheid opnemen kan vanaf de dag zelf.' : `Invullen en corrigeren kon tot ${opnemenUur()} uur na de start.`;
      return `<div class="info">${icon('info')}<span>${reden}</span></div><div class="lijst compact">${sp.map((pl) => h.rij({ ic: h.avatar(pl.voornaam), titel: esc(M.naam(S, pl)), rechts: h.chip(M.status(S, pl, a)) })).join('')}</div>`;
    }
    return `<p class="zacht klein">Iedereen staat op aanwezig. Tik op een naam: aanwezig → te laat → afwezig.</p>
      <div class="opnemen">${sp.map((pl) => {
        const st = M.status(S, pl, a); const v = d[pl.id];
        const sub = st.code === 'afgemeld' ? `Afgemeld: ${esc(st.afm.reden)}` : st.code === 'langdurig' ? 'Langdurig afwezig' : '';
        return `<button class="speler ${v}" data-act="tikSpeler" data-id="${pl.id}" aria-label="${esc(pl.voornaam)}: ${v === 'a' ? 'aanwezig' : v === 'l' ? 'te laat' : 'afwezig'}">
          <span class="sp-ic">${icon(v === 'a' ? 'check' : v === 'l' ? 'clock' : 'x')}</span><span class="rij-tekst"><b>${esc(M.naam(S, pl))}</b>${sub ? `<small>${sub}</small>` : ''}</span><span class="sp-status">${v === 'a' ? 'Aanwezig' : v === 'l' ? 'Te laat' : 'Afwezig'}</span></button>`;
      }).join('')}</div>
      <div class="plakvoet"><span><b>${n}</b> van ${sp.length} aanwezig</span><button class="knop" data-act="opslaanAanwezigheid" data-id="${a.id}">${opgeslagen ? 'Wijziging opslaan' : 'Opslaan'}</button></div>`;
  };
  CC.on('tikSpeler', (el) => { const d = CC.ui.draft.s; d[el.dataset.id] = volgende[d[el.dataset.id]]; CC.render(); });
  CC.on('opslaanAanwezigheid', (el) => {
    const S = CC.S(); const a = M.act(S, el.dataset.id); const me = CC.me(); const t = M.team(S, a.teamId);
    const voor = {}; M.spelers(S, a.teamId).forEach((pl) => { voor[pl.id] = M.kaarten(S, pl).ev.length; });
    S.pres[a.id] = { s: { ...CC.ui.draft.s }, door: me.id, tijd: new Date().toISOString() };
    let herinnering = 0, kaarten = 0;
    M.spelers(S, a.teamId).forEach((pl) => {
      const k = M.kaarten(S, pl); const nieuw = k.ev.filter((e) => e.act.id === a.id);
      if (k.ev.length <= voor[pl.id]) return;
      nieuw.forEach((e) => {
        const tl = M.persoon(S, t.teamleiderId || t.trainerId);
        const wanneer = `de ${M.isWed(a) ? 'wedstrijd' : a.soort === 'activiteit' ? 'activiteit' : 'training'} van ${D.lang(a.datum)}`;
        const tekst = e.kaart === 'herinnering'
          ? S.club.inst.waarschuwing.replace(/\[kind\]/g, pl.voornaam).replace('[team]', t.naam).replace('[deadline]', `${M.inst(S, t.id).deadlineTraining} uur`).replace('[teamleider]', tl ? tl.naam : 'de trainer') + (e.laatsteHerinnering ? '\n\nLet op: dit was de laatste vriendelijke herinnering van dit seizoen. Hierna volgt een kaart.' : '')
          : e.kaart === 'geel' ? `${pl.voornaam}: te laat afgemeld voor ${wanneer}. Dit is geregistreerd als gele kaart. Twee gele kaarten zijn samen een rode kaart. Een kaart is een registratie, geen straf; tik op de statusregel in de app voor uitleg.`
          : `${pl.voornaam}: ${e.tweedeGeel ? 'opnieuw te laat afgemeld' : 'niet afgemeld en niet gekomen'} bij ${wanneer}. Dit is ${e.tweedeGeel ? 'de tweede gele kaart, samen een rode kaart' : 'een rode kaart'}. De trainer of ${esc(S.club.labels.hjo)} neemt contact met je op: kunnen we ergens mee helpen?`;
        S.msgs.push({ id: 'b' + Date.now() + pl.id, van: 'systeem', soort: 'persoonlijk', bereik: `ouders van ${pl.voornaam}`, onderwerp: e.kaart === 'herinnering' ? 'Vriendelijke herinnering' : e.kaart === 'geel' ? 'Gele kaart' : 'Rode kaart', tekst, tijd: new Date().toISOString(), ontvangers: pl.ouders, gelezen: [], antw: [], urgent: false, gepland: null });
        if (e.kaart === 'herinnering') herinnering++; else kaarten++;
      });
    });
    CC.save(); CC.ui.draft = null; CC.render();
    CC.toast(`Opgeslagen${herinnering ? ` · ${herinnering} vriendelijke herinnering${herinnering > 1 ? 'en' : ''} verstuurd` : ''}${kaarten ? ` · ${kaarten} kaart${kaarten > 1 ? 'en' : ''}` : ''}`);
  });
  CC.views.opnemen = (S, p) => { const a = M.act(S, p.id); return { titel: 'Aanwezigheid', html: `<div class="kaart-kop los">${h.datumBlok(a)}<div><b>${h.actTitel(S, a)}</b><small>${D.lang(a.datum)} · ${a.tijd}</small></div></div>${CC.opnemenHtml(S, a)}` }; };

  // ---------- Speeltijd (gedeeld met teamleider, module) ----------
  // opties.alleenSchema: voor de timekeeper (ouder) alleen het wisselschema van deze wedstrijd, zonder seizoenscijfers
  CC.speeltijdHtml = (S, teamId, opties = {}) => {
    const wedstrijden = M.komend(S, teamId, 10).filter((a) => M.isWed(a) && !a.afgelast && (!opties.act || a.id === opties.act));
    const kies = h.segVal('stWed', wedstrijden[0] && wedstrijden[0].id);
    const a = wedstrijden.find((x) => x.id === kies) || wedstrijden[0];
    const t = M.team(S, teamId); const c = CC.categorie(t.cat);
    // Percentage van de mogelijke speeltijd in bijgewoonde wedstrijden (Besluit 33)
    const seizoen = M.spelers(S, teamId).map((pl) => ({ pl, x: M.speeltijdStand(S, pl) })).sort((a, b) => (a.x.pct ?? -1) - (b.x.pct ?? -1));
    const gemistTekst = (g) => Object.entries(g).map(([r, n]) => `${n}× ${r.toLowerCase()}`).join(', ');
    const tabel = `${h.sectie('Speeltijd dit seizoen')}<div class="balkjes">${seizoen.map(({ pl, x }) => `<div class="balkje"><span>${esc(pl.voornaam)}</span><i style="--w:${x.pct ?? 0}%"></i><b>${x.pct == null ? '–' : x.pct + '%'}</b></div>`).join('')}</div>
      <p class="zacht klein">Percentage van de mogelijke speeltijd in de wedstrijden waarbij het kind er was. Gemiste wedstrijden tellen niet mee${seizoen.some(({ x }) => Object.keys(x.gemist).length) ? `: ${seizoen.filter(({ x }) => Object.keys(x.gemist).length).map(({ pl, x }) => `${esc(pl.voornaam)} (${gemistTekst(x.gemist)})`).join(', ')}` : ''}.</p>`;
    if (!a) return h.leeg('Geen wedstrijden gepland') + (opties.alleenSchema ? '' : tabel);
    const sch = S.speeltijd.schema[a.id];
    const naam = (id) => (M.speler(S, id) || {}).voornaam;
    let body;
    if (!sch) {
      const n = M.spelers(S, teamId).filter((pl) => M.status(S, pl, a).code === 'verwacht').length;
      // Selectie (instelbaar): de trainer mag iemand een blok minder geven; de app laat de trainingen van deze week zien
      let minderBlok = '';
      if (!opties.alleenSchema && M.speeltijdAfwijken(S, teamId)) {
        const gekozen = (h.segVal(`minder_${a.id}`, '') || '').split(',').filter(Boolean);
        const week = S.acts.filter((x) => x.teamId === teamId && x.soort === 'training' && !x.afgelast && x.datum < D.vandaag() && x.datum >= D.addDays(D.vandaag(), -7) && S.pres[x.id]);
        const rij = (pl) => { const w = week.map((x) => M.status(S, pl, x)); const er = w.filter((st) => ['aanwezig', 'telaat'].includes(st.code)).length; const niet = w.filter((st) => st.code === 'nietafgemeld').length; const aan = gekozen.includes(pl.id);
          return h.rij({ ic: h.avatar(pl.voornaam), titel: esc(pl.voornaam), sub: `${er} van ${week.length} trainingen deze week${niet ? ` · ${niet}× niet afgemeld` : ''}`, rechts: `<button class="knop klein ${aan ? '' : 'licht'}" data-act="minderBlok" data-a="${a.id}" data-s="${pl.id}">${aan ? 'Blok minder ✓' : 'Blok minder'}</button>` }); };
        minderBlok = `<details class="uitklap" ${gekozen.length ? 'open' : ''}><summary>${icon('sliders-horizontal')}Iemand een blok minder geven${gekozen.length ? ` (${gekozen.length})` : ''}</summary><p class="zacht klein">Alleen als jij dat beslist, bijvoorbeeld na weinig trainen. Het wordt vastgelegd bij deze wedstrijd.</p><div class="lijst compact">${M.spelers(S, teamId).filter((pl) => M.status(S, pl, a).code === 'verwacht').map(rij).join('')}</div></details>`;
      }
      body = `<div class="kaartje"><p><b>${n} spelers</b> komen · ${c.vorm} · ${c.blokken} blokken van ${c.blokMin} minuten.</p><p class="zacht klein">De app verdeelt de speeltijd eerlijk: wie in de gespeelde wedstrijden het laagste percentage speeltijd had, krijgt voorrang. Gemiste wedstrijden tellen niet mee. De keeper staat de hele wedstrijd op doel en wisselt per week (clubbeleid).</p>${minderBlok}<button class="knop vol" data-act="maakSchema" data-id="${a.id}">${icon('sparkles')}Maak wisselschema</button></div>`;
    } else if (!sch.bevestigd) {
      const cur = sch.huidig;
      const inNu = sch.blokken[cur] || []; const vorig = cur > 0 ? sch.blokken[cur - 1] : [];
      const erin = inNu.filter((x) => !vorig.includes(x)), eruit = vorig.filter((x) => !inNu.includes(x));
      const bank = M.spelers(S, teamId).filter((pl) => M.status(S, pl, a).code === 'verwacht' && !inNu.includes(pl.id));
      body = `<div class="blokken">${sch.blokken.map((_, i) => `<span class="${i === cur ? 'aan' : i < cur ? 'klaar' : ''}">${i + 1}</span>`).join('')}</div>
        <div class="kaartje"><h4>Blok ${cur + 1} van ${sch.blokken.length} · ${sch.blokMin} min</h4>
        ${cur > 0 ? `<div class="wissel"><div><small>Erin</small>${erin.map((x) => `<span class="chip groen">${esc(naam(x))}</span>`).join('') || '–'}</div><div><small>Eruit</small>${eruit.map((x) => `<span class="chip grijs">${esc(naam(x))}</span>`).join('') || '–'}</div></div>` : ''}
        ${(sch.minder || []).length ? `<p class="klein zacht">Blok minder (besluit trainer): ${sch.minder.map(naam).map(esc).join(', ')}</p>` : ''}<p><b>Keeper:</b> ${esc(naam(sch.keepers[cur]))}</p><p><b>In het veld:</b> ${inNu.filter((x) => x !== sch.keepers[cur]).map(naam).map(esc).join(', ')}</p><p class="zacht"><b>Wissel:</b> ${bank.map((p) => esc(p.voornaam)).join(', ') || 'niemand'}</p></div>
        ${cur < sch.blokken.length - 1 ? `<button class="knop groot vol" data-act="volgendBlok" data-id="${a.id}">${icon('skip-forward')}Volgend blok</button>` : `<button class="knop groot vol" data-act="bevestigSchema" data-id="${a.id}">${icon('circle-check')}Wedstrijd klaar: bevestigen</button>`}
        <button class="linkknop" data-act="nieuwSchema" data-id="${a.id}">Schema opnieuw maken</button>`;
    } else body = `<div class="info groen">${icon('circle-check')}<span>Speeltijd van deze wedstrijd is verwerkt in de seizoenstotalen.</span></div>`;
    return `${wedstrijden.length > 1 ? `<label class="klein-kop" for="stw">Wedstrijd</label><select id="stw" class="kies" data-change="kiesStWed">${wedstrijden.map((w) => `<option value="${w.id}" ${w.id === a.id ? 'selected' : ''}>${D.kort(w.datum)} · ${h.actTitel(S, w)}</option>`).join('')}</select>` : ''}
      ${body}${opties.alleenSchema ? '' : tabel}`;
  };
  CC.on('kiesStWed', (el) => { CC.ui.seg.stWed = el.value; CC.render(); });
  CC.on('minderBlok', (el) => { const k = `minder_${el.dataset.a}`; const l = (CC.ui.seg[k] || '').split(',').filter(Boolean); const i = l.indexOf(el.dataset.s); if (i >= 0) l.splice(i, 1); else l.push(el.dataset.s); CC.ui.seg[k] = l.join(','); CC.render(); });
  CC.on('maakSchema', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.id); const minder = M.speeltijdAfwijken(S, a.teamId) ? (CC.ui.seg[`minder_${a.id}`] || '').split(',').filter(Boolean) : []; S.speeltijd.schema[a.id] = M.maakSchema(S, a, minder); CC.save(); CC.render(); });
  CC.on('nieuwSchema', (el) => { const S = CC.S(); delete S.speeltijd.schema[el.dataset.id]; CC.save(); CC.render(); });
  CC.on('volgendBlok', (el) => { const S = CC.S(); S.speeltijd.schema[el.dataset.id].huidig++; CC.save(); CC.render(); });
  CC.on('bevestigSchema', (el) => { const S = CC.S(); const sch = S.speeltijd.schema[el.dataset.id]; const kb = S.speeltijd.keeper || (S.speeltijd.keeper = {}); if (sch.keepers[0]) kb[sch.keepers[0]] = (kb[sch.keepers[0]] || 0) + 1; sch.blokken.forEach((b) => b.forEach((id) => { S.speeltijd.min[id] = (S.speeltijd.min[id] || 0) + sch.blokMin; })); const mog = S.speeltijd.mogelijk || (S.speeltijd.mogelijk = {}); (sch.spelers || [...new Set(sch.blokken.flat())]).forEach((id) => { mog[id] = (mog[id] || 0) + (sch.wedMin || sch.blokMin * sch.blokken.length); }); sch.bevestigd = true; CC.save(); CC.render(); CC.toast('Speeltijd bijgewerkt'); });

  // Beoordelen: zie beoordeling.js (Besluit 23)

  // Spelers filteren en sorteren (trainer en teamleider)
  CC.spelerFilter = (S, tid, eenvoudig) => {
    const per = M.periode(S, 'blok'); const f = h.segVal('spF', 'alle'); const so = h.segVal('spSort', 'naam');
    const volg = M.komend(S, tid, 8).find((a) => !a.afgelast);
    const rijen = M.spelers(S, tid).map((pl) => { const st = M.stats(S, pl, per); const k = M.kaarten(S, pl); return { pl, st, k, z: M.zone(S, st.pct, tid), vs: volg ? M.status(S, pl, volg) : null, b: CC.beoordLaatste ? CC.beoordLaatste(S, pl.id) : null }; });
    const filters = [['alle', 'Alle'], volg && ['komt', `Komt ${D.kort(volg.datum)}`], volg && ['af', `Afgemeld ${D.kort(volg.datum)}`], !eenvoudig && ['aandacht', 'Oranje/rood'], !eenvoudig && ['kaarten', 'Kaarten'], ['lang', 'Langdurig'], !eenvoudig && CC.mag('beoordelingZien') && ['nietbeo', 'Niet beoordeeld']].filter(Boolean);
    const pas = { alle: () => true, komt: (x) => x.vs && x.vs.code === 'verwacht', af: (x) => x.vs && ['afgemeld', 'langdurig'].includes(x.vs.code), aandacht: (x) => ['oranje', 'rood'].includes(x.z), kaarten: (x) => x.k.geel || x.k.rood, lang: (x) => x.vs && x.vs.code === 'langdurig' || S.lang.some((l) => l.spelerId === x.pl.id && l.tot >= D.vandaag()), nietbeo: (x) => !x.b }[f] || (() => true);
    const sorteer = { naam: (a, b) => M.naam(S, a.pl).localeCompare(M.naam(S, b.pl)), laag: (a, b) => (a.st.pct ?? 101) - (b.st.pct ?? 101), hoog: (a, b) => (b.st.pct ?? -1) - (a.st.pct ?? -1), kaarten: (a, b) => (b.k.geel + 2 * b.k.rood) - (a.k.geel + 2 * a.k.rood) }[so];
    const lijst = rijen.filter(pas).sort(sorteer);
    const bar = `<div class="chips scroll">${filters.map(([k, l]) => `<button class="chipknop ${k === f ? 'aan' : ''}" data-act="seg" data-key="spF" data-val="${k}">${esc(l)}</button>`).join('')}</div>
      <label class="sorteer">${icon('sliders-horizontal')}<select data-change="spSort" aria-label="Sorteren">${(eenvoudig ? [['naam', 'Op naam']] : [['naam', 'Op naam'], ['laag', 'Aanwezigheid: laagste eerst'], ['hoog', 'Aanwezigheid: hoogste eerst'], ['kaarten', 'Meeste kaarten eerst']]).map(([k, l]) => `<option value="${k}" ${k === so ? 'selected' : ''}>${l}</option>`).join('')}</select><small class="zacht">${lijst.length} van ${rijen.length}</small></label>`;
    return { bar, lijst, volg };
  };
  CC.on('spSort', (el) => { CC.ui.seg.spSort = el.value; CC.render(); });
  CC.on('kiesBeoSp', (el) => { CC.ui.seg.beoSp = el.value; CC.render(); });

  // ---------- Trainer ----------
  // Opschalingsstap als rij; bij "bellen" direct bel- en WhatsApp-knop naar de ouder
  CC.stapRij = (S, s) => {
    const pl = M.speler(S, s.spelerId); const o = pl && M.persoon(S, pl.ouders[0]);
    // Bellen: 1) bel of app de ouder, 2) leg vast wat je afsprak (dan verdwijnt de stap)
    const knoppen = s.soort === 'bellen' && o && CC.mag('bellen', null, pl.teamId) ? `<div class="stap-knoppen"><a class="knop klein licht" href="tel:${o.tel}">${icon('phone')}Bel ${esc(o.naam.split(' ')[0])}</a><a class="knop klein licht" href="https://wa.me/31${o.tel.slice(1)}" target="_blank" rel="noopener">${icon('message-circle')}WhatsApp</a><button class="knop klein" data-act="gesprekVastleggen" data-id="${s.spelerId}">${icon('check')}Contact vastleggen</button></div>` : '';
    const rij = h.rij({ ic: s.soort === 'bellen' ? 'phone' : 'users', titel: esc(s.tekst), sub: esc(s.sub), kleur: 'rood', act: 'open', attrs: `data-view="speler" data-id="${s.spelerId}"` });
    return knoppen ? `<div class="signaal">${rij}<div class="signaal-voet">${knoppen}</div></div>` : rij;
  };
  CC.signaalRijAfdoen = (S, s) => {
    const rij = signaalRij(S, s);
    if (!s.afdoenbaar || !CC.mag('afdoen')) return rij;
    const knop = `<button class="knop klein licht" data-act="signaalAfdoen" data-sleutel="${esc(s.sleutel)}">${icon('check')}${s.soort === 'telaat' ? 'Begrijpelijk' : 'Gezien'}</button>`;
    return `<div class="signaal">${rij}<div class="signaal-voet">${knop}<small class="zacht">${s.soort === 'telaat' ? 'geaccepteerd; komt terug als het vaker gebeurt' : 'geen actie nodig'}</small></div></div>`;
  };
  CC.on('snelGebeld', (el) => { const S = CC.S(); S.gesprekken.push({ id: 'g' + Date.now(), spelerId: el.dataset.id, soort: 'gebeld', datum: D.vandaag(), door: CC.me().id, notitie: 'Gebeld (notitie kan nog worden aangevuld)', afspraak: '' }); CC.save(); CC.render(); CC.toast('Vastgelegd als gebeld. Aanvullen kan bij de speler.'); });
  const signaalRij = (S, s) => h.rij({ ic: ['bellen'].includes(s.soort) ? 'phone' : ['gesprekHjo', 'clubbesluit'].includes(s.soort) ? 'users' : s.soort === 'gesprek' ? 'message-circle' : s.soort === 'lang' ? 'hospital' : s.soort === 'patroon' ? 'repeat' : s.soort === 'telaat' ? 'clock' : 'triangle-alert', titel: esc(s.tekst), sub: esc(s.sub || ''), kleur: s.niveau === 'info' ? '' : s.niveau, act: s.spelerId ? 'open' : '', attrs: s.spelerId ? `data-view="speler" data-id="${s.spelerId}"` : '' });
  CC.signaalRij = signaalRij;
  // Home toont alleen voorgestelde gesprekken los; overige signalen in één regel (weinig scrollen)
  CC.signaalRegels = (S, tid, zonderLang) => {
    const sig = M.signalen(S, [tid], false).filter((s) => !(zonderLang && s.soort === 'lang'));
    const stappen = ['bellen', 'gesprekHjo', 'clubbesluit'];
    const magStap = (s) => stappen.includes(s.soort) && CC.mag({ bellen: 'bellen', gesprekHjo: 'gesprek', clubbesluit: 'clubbesluit' }[s.soort], null, tid);
    const gesprek = sig.filter(magStap); const rest = sig.filter((s) => !magStap(s));
    const namen = [...new Set(rest.map((s) => s.tekst.split(':')[0].split(' ')[0]))];
    return [...gesprek.map((s) => CC.stapRij(S, s)), rest.length ? h.rij({ ic: 'triangle-alert', titel: `${namen.length} ${namen.length === 1 ? 'speler vraagt' : 'spelers vragen'} aandacht`, sub: namen.join(', '), kleur: 'oranje', act: 'open', attrs: `data-view="teamSignalen" data-team="${tid}"` }) : ''].filter(Boolean);
  };
  CC.views.teamSignalen = (S, p) => {
    const sig = M.signalen(S, [p.team], false);
    const af = M.afgedaanRecent(S, [p.team]);
    return { titel: 'Signalen', html: `<p class="zacht klein">ClubComm signaleert; jij en de ${M.team(S, p.team).teamleiderId ? 'teamleider' : 'trainer'} beslissen. Is er niets aan de hand? Tik op <b>Gezien</b>. Het signaal komt terug als het erger wordt.</p>
      <div class="lijst">${sig.map((s) => (s.afdoenbaar ? CC.signaalRijAfdoen(S, s) : CC.stapRij(S, s))).join('') || h.leeg('Geen signalen')}</div>
      ${af.length ? `<details class="uitklap"><summary>${icon('check')}Afgedaan (${af.length})</summary><div class="lijst compact">${af.map((x) => h.rij({ ic: 'check', titel: esc(x.tekst), sub: `${esc((M.persoon(S, x.door) || { naam: '' }).naam)} · ${D.tijdstip(x.tijd)}${x.notitie ? ' · ' + esc(x.notitie) : ''}` })).join('')}</div></details>` : ''}` };
  };
  CC.on('signaalAfdoen', (el) => {
    const S = CC.S(); const sleutel = el.dataset.sleutel;
    CC.sheet('Gezien, geen actie nodig', `<form data-submit="signaalAfdoenOk" data-sleutel="${esc(sleutel)}" class="codeform"><label for="sa-n">Korte notitie (mag leeg)</label><input id="sa-n" name="n" placeholder="Bijv. zwemles op vrijdag, besproken met ouder">
      <button class="knop vol">${icon('check')}Afdoen</button><p class="zacht klein">Het signaal verdwijnt. Wordt het erger (nieuwe afwezigheid of van oranje naar rood), dan komt het terug. De ${esc(S.club.labels.hjo)} ziet dat het is afgedaan.</p></form>`);
  });
  CC.on('signaalAfdoenOk', (f) => {
    const S = CC.S(); const alle = [...new Set(S.teams.map((t) => t.id))];
    const s = M.signalen(S, alle, true).find((x) => x.sleutel === f.dataset.sleutel) || M.signalen(S, alle, false).find((x) => x.sleutel === f.dataset.sleutel);
    if (s) (S.signaalAfgedaan || (S.signaalAfgedaan = [])).push({ sleutel: s.sleutel, teamId: s.teamId, spelerId: s.spelerId, soort: s.soort, niveau: s.niveau, ernst: s.ernst || 0, tekst: s.tekst, notitie: f.n.value, door: CC.me().id, tijd: new Date().toISOString() });
    CC.save(); CC.closeSheet(); CC.render(); CC.toast('Afgedaan');
  });

  CC.rollen.trainer = {
    context(S) { const t = M.team(S, CC.teamId()); return { titel: t.naam, sub: `Trainer · ${S.club.naam}` }; },
    tabs(S) { const me = CC.me(); return [['home', 'Home', 'house'], ['aanwezigheid', 'Aanwezigheid', 'clipboard-check'], ['berichten', 'Berichten', 'message-circle', M.ongelezen(S, me.id)], ['spelers', 'Spelers', 'users'], S.club.modules.speeltijd && ['speeltijd', 'Speeltijd', 'timer']]; },
    schermen: {
      home(S) {
        const tid = CC.teamId(); const t = M.team(S, tid); const me = CC.me();
        const volgendeT = M.komend(S, tid, 8).find((a) => !a.afgelast);
        if (!volgendeT) return h.leeg('Geen activiteiten gepland');
        const sp = M.spelers(S, tid).map((pl) => ({ pl, st: M.status(S, pl, volgendeT) }));
        const af = sp.filter((x) => ['afgemeld', 'langdurig'].includes(x.st.code));
        const vandaag = S.acts.find((a) => a.teamId === tid && a.datum === D.vandaag() && !a.afgelast);
        const acties = [];
        const n = M.ongelezen(S, me.id); if (n) acties.push(h.rij({ ic: 'message-circle', titel: `${n} ${n === 1 ? 'nieuw bericht' : 'nieuwe berichten'}`, act: 'tab', attrs: 'data-tab="berichten"', kleur: 'blauw' }));
        if (!t.teamleiderId) { const open = S.aanm.filter((x) => x.teamId === tid && x.status === 'open').length; if (open) acties.push(h.rij({ ic: 'user-check', titel: `${open} aanmelding${open > 1 ? 'en' : ''} goedkeuren`, sub: 'Dit team heeft geen teamleider, dus jij keurt goed', act: 'open', attrs: 'data-view="aanmeldingen"', kleur: 'oranje' })); }
        acties.push(...CC.signaalRegels(S, tid, true));
        // Herinnering: training van een eerdere dag waarvan de aanwezigheid nog niet is ingevuld, zolang het nog kan
        S.acts.filter((a) => a.teamId === tid && !M.isWed(a) && a.datum < D.vandaag() && !a.afgelast && !a.vervangerId && !S.pres[a.id] && kanOpnemen(a)).forEach((a) => {
          const tot = CC.opnemenTot(a);
          acties.push(h.rij({ ic: 'clipboard-check', titel: 'Aanwezigheid nog niet ingevuld', sub: `${a.soort === 'activiteit' ? esc(a.naam || 'Activiteit') : 'Training'} ${D.kort(a.datum)} ${a.tijd} · kan nog tot ${D.kort(D.iso(tot))} ${String(tot.getHours()).padStart(2, '0')}:${String(tot.getMinutes()).padStart(2, '0')}`, kleur: 'oranje', act: 'open', attrs: `data-view="opnemen" data-id="${a.id}"` }));
        });
        const mat = CC.materiaalRij && CC.mag('materiaal') && CC.materiaalRij(S, tid); if (mat) acties.push(mat);
        if (CC.beoordRijTrainer) acties.push(...CC.beoordRijTrainer(S, tid));
        return `<article class="kaartje hoofd">
            <small>${D.relatief(volgendeT.datum)}${volgendeT.soort !== 'training' ? '' : ''}</small><h2>${h.actTitel(S, volgendeT)}</h2><p class="zacht">${h.actSub(S, volgendeT)}</p>
            <div class="verwacht"><b>${sp.length - af.length}</b><span>van ${sp.length} verwacht</span></div>
            ${af.length ? `<div class="lijst compact">${af.map((x) => h.rij({ ic: h.reden(x.st.afm ? x.st.afm.reden : 'Blessure'), titel: esc(M.naam(S, x.pl)), sub: x.st.code === 'langdurig' ? `Langdurig afwezig (${esc(x.st.lang.reden.toLowerCase())})` : `${esc(x.st.afm.reden)}${x.st.afm.opm ? ' · ' + esc(x.st.afm.opm) : ''}` })).join('')}</div>` : '<p class="zacht">Iedereen komt.</p>'}
            ${vandaag ? (S.pres[vandaag.id] ? `<button class="knop licht vol" data-act="open" data-view="opnemen" data-id="${vandaag.id}">${icon('circle-check')}Aanwezigheid opgeslagen · aanpassen</button>` : `<button class="knop groot vol" data-act="open" data-view="opnemen" data-id="${vandaag.id}">${icon('clipboard-check')}Aanwezigheid opnemen</button>`) : ''}
            ${CC.kanNietBlok ? CC.kanNietBlok(S, volgendeT, true) : ''}
          </article>
          ${acties.length ? `${h.sectie('Actie nodig')}<div class="lijst">${acties.join('')}</div>` : ''}`;
      },
      aanwezigheid(S) {
        const tid = CC.teamId(); const modus = h.segVal('aanwModus', 'opnemen');
        if (modus === 'overzicht') return h.seg('aanwModus', [['opnemen', 'Opnemen'], ['overzicht', 'Overzicht']], 'opnemen') + CC.overzichtHtml(S, tid);
        const ma = (() => { const d = D.parse(D.vandaag()); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return D.iso(d); })();
        const acts = M.acts(S, tid, D.addDays(ma, -7), D.addDays(ma, 13));
        const standaard = (acts.find((a) => a.datum === D.vandaag()) || acts.filter((a) => a.datum <= D.vandaag()).pop() || acts[0]);
        const kies = h.segVal('aanwAct', standaard && standaard.id);
        const a = acts.find((x) => x.id === kies) || standaard;
        return `${h.seg('aanwModus', [['opnemen', 'Opnemen'], ['overzicht', 'Overzicht']], 'opnemen')}
          <div class="weekstrook" role="tablist">${acts.map((x) => { const d = D.parse(x.datum); return `<button role="tab" aria-selected="${x.id === a.id}" class="${x.id === a.id ? 'aan' : ''} ${x.afgelast ? 'afg' : ''} ${x.datum === D.vandaag() ? 'vandaag' : ''} ${S.pres[x.id] ? 'gedaan' : ''}" data-act="seg" data-key="aanwAct" data-val="${x.id}"><small>${D.DAG_KORT[d.getDay()]}</small><b>${d.getDate()}</b><small>${x.soort === 'training' ? 'T' : 'W'}</small></button>`; }).join('')}</div>
          ${a ? `<div class="kaart-kop los">${h.datumBlok(a)}<div><b>${h.actTitel(S, a)}</b><small>${h.actSub(S, a)}</small></div></div>${CC.opnemenHtml(S, a)}${CC.kanNietBlok && D.start(a) > new Date() ? CC.kanNietBlok(S, a) : ''}` : ''}
          ${CC.mag('planning') ? `<button class="knop licht vol" data-act="planningAanpassen">${icon('calendar-plus')}Planning aanpassen of iets toevoegen (activiteit, oefenwedstrijd)</button>` : ''}`;
      },
      berichten: (S) => CC.berichtenScherm(S, { nieuw: true }),
      spelers(S) {
        const tid = CC.teamId(); const per = M.periode(S, 'blok');
        return `<div class="knoppen">${CC.mag('beoordelen') ? `<button class="knop" data-act="open" data-view="beoordelen">${icon('star')}Beoordelen</button>` : ''}<button class="knop licht" data-act="uitnodigSheet">${icon('user-plus')}Ouders uitnodigen</button></div>
          ${(() => { const F = CC.spelerFilter(S, tid); return `${F.bar}<div class="lijst">${F.lijst.map(({ pl, st, k, z, vs, b }) => h.rij({ ic: h.avatar(pl.voornaam), titel: esc(M.naam(S, pl)), sub: `${st.pct == null ? '–' : st.pct + '%'} aanwezig${vs && vs.code !== 'verwacht' ? ` · ${h.chip(vs)}` : ''} · ${b ? `beoordeeld (${b.m.naam.toLowerCase()})` : 'nog niet beoordeeld'}`, rechts: h.let(S, pl, k) + h.stip(z), act: 'open', attrs: `data-view="speler" data-id="${pl.id}"` })).join('') || h.leeg('Geen spelers met dit filter')}</div>`; })()}
          ${CC.materiaalStatus && S.club.modules.materiaal ? `${h.sectie('Team')}<div class="lijst">${CC.materiaalStatus(S, tid)}</div>` : ''}`;
      },
      speeltijd: (S) => CC.speeltijdHtml(S, CC.teamId()),
    },
  };
  CC.on('planningAanpassen', () => CC.wijzigingSheet());
  CC.on('uitnodigSheet', () => CC.sheet('Ouders uitnodigen', `<p class="zacht">Deel de uitnodiging van ${esc(CC.teamId())}. Ouders vullen zelf hun e-mail en de naam van hun kind in; daarna keur je goed.</p>${CC.uitnodigBlok(CC.teamId())}`));

  // Overzicht per speler (trainer + teamleider)
  CC.overzichtHtml = (S, tid) => {
    const per = M.periode(S, h.segVal('ovPer', 'blok'));
    const rijen = M.spelers(S, tid).map((pl) => ({ pl, st: M.stats(S, pl, per), k: M.kaarten(S, pl) })).sort((a, b) => (a.st.pct ?? 101) - (b.st.pct ?? 101));
    const ts = M.teamStats(S, tid, per);
    return `${h.seg('ovPer', [['blok', 'Deze fase'], ['seizoen', 'Heel seizoen']], 'blok')}
      <p class="zacht klein">Team: <b>${ts.pct ?? '–'}%</b> aanwezig · ${M.team(S, tid).type} · laagste bovenaan</p>
      <div class="lijst">${rijen.map(({ pl, st, k }) => h.rij({ ic: h.stip(M.zone(S, st.pct, tid)), titel: esc(M.naam(S, pl)), sub: `${st.pct == null ? '–' : st.pct + '%'} aanwezig (${h.split(st).toLowerCase()})${st.telaat ? ` · ${st.telaat}× te laat` : ''}${st.lang ? ' · langdurig' : ''}`, rechts: h.let(S, pl, k), act: 'open', attrs: `data-view="speler" data-id="${pl.id}"` })).join('')}</div>`;
  };
})();
