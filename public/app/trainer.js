// ClubComm prototype — Trainer (Besluit 7): Home · Aanwezigheid · Berichten · Spelers · Speeltijd
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;

  // ---------- Aanwezigheid opnemen (herbruikbaar: trainer, teamleider, wedstrijdbegeleider) ----------
  const kanOpnemen = (a) => { const s = D.start(a); const nu = new Date(); return !a.afgelast && a.datum <= D.vandaag() && nu - s < 48 * 3600e3; };
  const volgende = { a: 'l', l: 'x', x: 'a' };
  CC.opnemenHtml = (S, a) => {
    const ui = CC.ui;
    const sp = M.spelers(S, a.teamId);
    const opgeslagen = S.pres[a.id];
    if (!ui.draft || ui.draft.actId !== a.id) {
      const s = {};
      sp.forEach((pl) => { const st = M.status(S, pl, a); s[pl.id] = opgeslagen && opgeslagen.s[pl.id] ? opgeslagen.s[pl.id] : ['afgemeld', 'langdurig'].includes(st.code) ? 'x' : 'a'; });
      ui.draft = { actId: a.id, s };
    }
    const d = ui.draft.s;
    const n = Object.values(d).filter((v) => v !== 'x').length;
    if (!kanOpnemen(a)) {
      const reden = a.afgelast ? 'Deze activiteit is afgelast.' : a.datum > D.vandaag() ? 'Aanwezigheid opnemen kan vanaf de dag zelf.' : 'Corrigeren kan tot 48 uur na de activiteit.';
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
        const tekst = e.waarschuwing
          ? S.club.inst.waarschuwing.replace(/\[kind\]/g, pl.voornaam).replace('[team]', t.naam).replace('[deadline]', `${M.inst(S, t.id).deadlineTraining} uur`).replace('[teamleider]', tl ? tl.naam : 'de trainer')
          : `${pl.voornaam}: ${e.wat.toLowerCase()} bij de ${a.soort} van ${D.lang(a.datum)}. Dit is geregistreerd als ${e.soort === 'geel' ? 'gele' : 'oranje'} kaart (${e.punten} ${e.punten === 1 ? 'punt' : 'punten'}). Een kaart is een registratie, geen straf. Tik op de statusregel in de app voor uitleg.`;
        S.msgs.push({ id: 'b' + Date.now() + pl.id, van: 'systeem', soort: 'persoonlijk', bereik: `ouders van ${pl.voornaam}`, onderwerp: e.waarschuwing ? 'Vriendelijke herinnering' : `${e.soort === 'geel' ? 'Gele' : 'Oranje'} kaart`, tekst, tijd: new Date().toISOString(), ontvangers: pl.ouders, gelezen: [], antw: [], urgent: false, gepland: null });
        if (e.waarschuwing) herinnering++; else kaarten++;
      });
    });
    CC.save(); CC.ui.draft = null; CC.render();
    CC.toast(`Opgeslagen${herinnering ? ` · ${herinnering} vriendelijke herinnering${herinnering > 1 ? 'en' : ''} verstuurd` : ''}${kaarten ? ` · ${kaarten} kaart${kaarten > 1 ? 'en' : ''}` : ''}`);
  });
  CC.views.opnemen = (S, p) => { const a = M.act(S, p.id); return { titel: 'Aanwezigheid', html: `<div class="kaart-kop los">${h.datumBlok(a)}<div><b>${h.actTitel(S, a)}</b><small>${D.lang(a.datum)} · ${a.tijd}</small></div></div>${CC.opnemenHtml(S, a)}` }; };

  // ---------- Speeltijd (gedeeld met teamleider, module) ----------
  CC.speeltijdHtml = (S, teamId) => {
    const wedstrijden = M.komend(S, teamId, 10).filter((a) => a.soort !== 'training' && !a.afgelast);
    const kies = h.segVal('stWed', wedstrijden[0] && wedstrijden[0].id);
    const a = wedstrijden.find((x) => x.id === kies) || wedstrijden[0];
    const t = M.team(S, teamId); const c = CC.categorie(t.cat);
    const seizoen = M.spelers(S, teamId).map((pl) => ({ pl, m: S.speeltijd.min[pl.id] || 0 })).sort((x, y) => x.m - y.m);
    const max = Math.max(1, ...seizoen.map((x) => x.m));
    const tabel = `${h.sectie('Speeltijd dit seizoen')}<div class="balkjes">${seizoen.map((x) => `<div class="balkje"><span>${esc(x.pl.voornaam)}</span><i style="--w:${(100 * x.m) / max}%"></i><b>${x.m}′</b></div>`).join('')}</div>`;
    if (!a) return h.leeg('Geen wedstrijden gepland') + tabel;
    const sch = S.speeltijd.schema[a.id];
    const naam = (id) => (M.speler(S, id) || {}).voornaam;
    let body;
    if (!sch) {
      const n = M.spelers(S, teamId).filter((pl) => M.status(S, pl, a).code === 'verwacht').length;
      body = `<div class="kaartje"><p><b>${n} spelers</b> komen · ${c.vorm} · ${c.blokken} blokken van ${c.blokMin} minuten.</p><p class="zacht klein">De app verdeelt de speeltijd eerlijk: spelers met minder minuten dit seizoen krijgen voorrang. De keeper staat de hele wedstrijd op doel en wisselt per week (clubbeleid).</p><button class="knop vol" data-act="maakSchema" data-id="${a.id}">${icon('sparkles')}Maak wisselschema</button></div>`;
    } else if (!sch.bevestigd) {
      const cur = sch.huidig;
      const inNu = sch.blokken[cur] || []; const vorig = cur > 0 ? sch.blokken[cur - 1] : [];
      const erin = inNu.filter((x) => !vorig.includes(x)), eruit = vorig.filter((x) => !inNu.includes(x));
      const bank = M.spelers(S, teamId).filter((pl) => M.status(S, pl, a).code === 'verwacht' && !inNu.includes(pl.id));
      body = `<div class="blokken">${sch.blokken.map((_, i) => `<span class="${i === cur ? 'aan' : i < cur ? 'klaar' : ''}">${i + 1}</span>`).join('')}</div>
        <div class="kaartje"><h4>Blok ${cur + 1} van ${sch.blokken.length} · ${sch.blokMin} min</h4>
        ${cur > 0 ? `<div class="wissel"><div><small>Erin</small>${erin.map((x) => `<span class="chip groen">${esc(naam(x))}</span>`).join('') || '–'}</div><div><small>Eruit</small>${eruit.map((x) => `<span class="chip grijs">${esc(naam(x))}</span>`).join('') || '–'}</div></div>` : ''}
        <p><b>Keeper:</b> ${esc(naam(sch.keepers[cur]))}</p><p><b>In het veld:</b> ${inNu.filter((x) => x !== sch.keepers[cur]).map(naam).map(esc).join(', ')}</p><p class="zacht"><b>Wissel:</b> ${bank.map((p) => esc(p.voornaam)).join(', ') || 'niemand'}</p></div>
        ${cur < sch.blokken.length - 1 ? `<button class="knop groot vol" data-act="volgendBlok" data-id="${a.id}">${icon('skip-forward')}Volgend blok</button>` : `<button class="knop groot vol" data-act="bevestigSchema" data-id="${a.id}">${icon('circle-check')}Wedstrijd klaar: bevestigen</button>`}
        <button class="linkknop" data-act="nieuwSchema" data-id="${a.id}">Schema opnieuw maken</button>`;
    } else body = `<div class="info groen">${icon('circle-check')}<span>Speeltijd van deze wedstrijd is verwerkt in de seizoenstotalen.</span></div>`;
    return `${wedstrijden.length > 1 ? `<label class="klein-kop" for="stw">Wedstrijd</label><select id="stw" class="kies" data-change="kiesStWed">${wedstrijden.map((w) => `<option value="${w.id}" ${w.id === a.id ? 'selected' : ''}>${D.kort(w.datum)} · ${h.actTitel(S, w)}</option>`).join('')}</select>` : ''}
      ${body}${tabel}`;
  };
  CC.on('kiesStWed', (el) => { CC.ui.seg.stWed = el.value; CC.render(); });
  CC.on('maakSchema', (el) => { const S = CC.S(); S.speeltijd.schema[el.dataset.id] = M.maakSchema(S, M.act(S, el.dataset.id)); CC.save(); CC.render(); });
  CC.on('nieuwSchema', (el) => { const S = CC.S(); delete S.speeltijd.schema[el.dataset.id]; CC.save(); CC.render(); });
  CC.on('volgendBlok', (el) => { const S = CC.S(); S.speeltijd.schema[el.dataset.id].huidig++; CC.save(); CC.render(); });
  CC.on('bevestigSchema', (el) => { const S = CC.S(); const sch = S.speeltijd.schema[el.dataset.id]; const kb = S.speeltijd.keeper || (S.speeltijd.keeper = {}); if (sch.keepers[0]) kb[sch.keepers[0]] = (kb[sch.keepers[0]] || 0) + 1; sch.blokken.forEach((b) => b.forEach((id) => { S.speeltijd.min[id] = (S.speeltijd.min[id] || 0) + sch.blokMin; })); sch.bevestigd = true; CC.save(); CC.render(); CC.toast('Speeltijd bijgewerkt'); });

  // ---------- Beoordelen (per speler of per vaardigheid) ----------
  CC.views.beoordelen = (S, p) => {
    const tid = CC.teamId(); const t = M.team(S, tid); const c = CC.categorie(t.cat);
    const modus = h.segVal('beoModus', 'vaardig');
    const fase = 'Fase 1 (sep–okt)';
    const opties = c.schaal === '1-5' ? [1, 2, 3, 4, 5] : [1, 2, 3];
    const knoppen = (plId, v) => { const cur = S.beoord[plId] && S.beoord[plId].scores[v]; return `<span class="score">${opties.map((o) => `<button class="${cur === o ? 'aan' : ''}" data-act="zetScore" data-id="${plId}" data-v="${esc(v)}" data-s="${o}" aria-label="${o}">${CC.scoreTekst(t, o)}</button>`).join('')}</span>`; };
    let body;
    if (modus === 'vaardig') {
      const v = h.segVal('beoV', c.vaardig[0]);
      body = `<div class="chips">${c.vaardig.map((x) => `<button class="chipknop ${x === v ? 'aan' : ''}" data-act="seg" data-key="beoV" data-val="${esc(x)}">${esc(x)}</button>`).join('')}</div>
        <div class="lijst">${M.spelers(S, tid).map((pl) => `<div class="rij"><span class="rij-tekst"><b>${esc(pl.voornaam)}</b></span>${knoppen(pl.id, v)}</div>`).join('')}</div>`;
    } else {
      const sp = M.spelers(S, tid); const id = h.segVal('beoSp', sp[0].id);
      body = `<select class="kies" data-change="kiesBeoSp" aria-label="Speler">${sp.map((pl) => `<option value="${pl.id}" ${pl.id === id ? 'selected' : ''}>${esc(M.naam(S, pl))}</option>`).join('')}</select>
        <div class="lijst">${c.vaardig.map((v) => `<div class="rij"><span class="rij-tekst"><b>${esc(v)}</b></span>${knoppen(id, v)}</div>`).join('')}</div>`;
    }
    return { titel: 'Beoordelen', html: `<div class="info">${icon('info')}<span>${esc(t.naam)}: ${esc(c.naam.toLowerCase())}, ${esc(c.vorm)}. Schaal: ${c.schaal === '1-5' ? '1 tot 5' : 'drie smileys'}. ${esc(fase)}. Ouders zien alleen de beoordeling van hun eigen kind.</span></div>
      ${h.seg('beoModus', [['vaardig', 'Per vaardigheid'], ['speler', 'Per speler']], 'vaardig')}${body}` };
  };
  CC.on('kiesBeoSp', (el) => { CC.ui.seg.beoSp = el.value; CC.render(); });
  CC.on('zetScore', (el) => { const S = CC.S(); const b = S.beoord[el.dataset.id] || (S.beoord[el.dataset.id] = { fase: 'Fase 1 (sep–okt)', scores: {} }); b.scores[el.dataset.v] = Number(el.dataset.s); CC.save(); CC.render(); });

  // ---------- Trainer ----------
  // Opschalingsstap als rij; bij "bellen" direct bel- en WhatsApp-knop naar de ouder
  CC.stapRij = (S, s) => {
    const pl = M.speler(S, s.spelerId); const o = pl && M.persoon(S, pl.ouders[0]);
    const knoppen = s.soort === 'bellen' && o ? `<a class="icoonknop blauw" href="tel:${o.tel}" aria-label="Bel ${esc(o.naam)}">${icon('phone')}</a><a class="icoonknop groen" href="https://wa.me/31${o.tel.slice(1)}" target="_blank" rel="noopener" aria-label="WhatsApp ${esc(o.naam)}">${icon('message-circle')}</a>` : '';
    return h.rij({ ic: s.soort === 'bellen' ? 'phone' : 'users', titel: esc(s.tekst), sub: esc(s.sub), kleur: 'rood', act: 'open', attrs: `data-view="speler" data-id="${s.spelerId}"`, rechts: knoppen, chevron: !knoppen });
  };
  const signaalRij = (S, s) => h.rij({ ic: ['bellen'].includes(s.soort) ? 'phone' : ['gesprekHjo', 'clubbesluit'].includes(s.soort) ? 'users' : s.soort === 'gesprek' ? 'message-circle' : s.soort === 'lang' ? 'hospital' : s.soort === 'patroon' ? 'repeat' : 'triangle-alert', titel: esc(s.tekst), sub: esc(s.sub || ''), kleur: s.niveau === 'info' ? '' : s.niveau, act: s.spelerId ? 'open' : '', attrs: s.spelerId ? `data-view="speler" data-id="${s.spelerId}"` : '' });
  CC.signaalRij = signaalRij;
  // Home toont alleen voorgestelde gesprekken los; overige signalen in één regel (weinig scrollen)
  CC.signaalRegels = (S, tid, zonderLang) => {
    const sig = M.signalen(S, [tid], false).filter((s) => !(zonderLang && s.soort === 'lang'));
    const stappen = ['bellen', 'gesprekHjo', 'clubbesluit'];
    const gesprek = sig.filter((s) => stappen.includes(s.soort)); const rest = sig.filter((s) => !stappen.includes(s.soort));
    const namen = [...new Set(rest.map((s) => s.tekst.split(':')[0].split(' ')[0]))];
    return [...gesprek.map((s) => CC.stapRij(S, s)), rest.length ? h.rij({ ic: 'triangle-alert', titel: `${namen.length} ${namen.length === 1 ? 'speler vraagt' : 'spelers vragen'} aandacht`, sub: namen.join(', '), kleur: 'oranje', act: 'open', attrs: `data-view="teamSignalen" data-team="${tid}"` }) : ''].filter(Boolean);
  };
  CC.views.teamSignalen = (S, p) => ({ titel: 'Signalen', html: `<p class="zacht klein">ClubComm signaleert; jij en de ${M.team(S, p.team).teamleiderId ? 'teamleider' : 'trainer'} beslissen of een gesprek nodig is.</p><div class="lijst">${M.signalen(S, [p.team], false).map((s) => signaalRij(S, s)).join('') || h.leeg('Geen signalen')}</div>` });

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
        const mat = CC.materiaalRij && CC.materiaalRij(S, tid); if (mat) acties.push(mat);
        return `<article class="kaartje hoofd">
            <small>${D.relatief(volgendeT.datum)}${volgendeT.soort !== 'training' ? '' : ''}</small><h2>${h.actTitel(S, volgendeT)}</h2><p class="zacht">${h.actSub(S, volgendeT)}</p>
            <div class="verwacht"><b>${sp.length - af.length}</b><span>van ${sp.length} verwacht</span></div>
            ${af.length ? `<div class="lijst compact">${af.map((x) => h.rij({ ic: h.reden(x.st.afm ? x.st.afm.reden : 'Blessure'), titel: esc(M.naam(S, x.pl)), sub: x.st.code === 'langdurig' ? `Langdurig afwezig (${esc(x.st.lang.reden.toLowerCase())})` : `${esc(x.st.afm.reden)}${x.st.afm.opm ? ' · ' + esc(x.st.afm.opm) : ''}` })).join('')}</div>` : '<p class="zacht">Iedereen komt.</p>'}
            ${vandaag ? (S.pres[vandaag.id] ? `<button class="knop licht vol" data-act="open" data-view="opnemen" data-id="${vandaag.id}">${icon('circle-check')}Aanwezigheid opgeslagen · aanpassen</button>` : `<button class="knop groot vol" data-act="open" data-view="opnemen" data-id="${vandaag.id}">${icon('clipboard-check')}Aanwezigheid opnemen</button>`) : ''}
            ${CC.kanNietBlok ? CC.kanNietBlok(S, volgendeT) : ''}
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
          ${a ? `<div class="kaart-kop los">${h.datumBlok(a)}<div><b>${h.actTitel(S, a)}</b><small>${h.actSub(S, a)}</small></div></div>${CC.opnemenHtml(S, a)}` : ''}
          <button class="knop licht vol" data-act="planningAanpassen">${icon('calendar-plus')}Planning aanpassen of oefenwedstrijd toevoegen</button>`;
      },
      berichten: (S) => CC.berichtenScherm(S, { nieuw: true }),
      spelers(S) {
        const tid = CC.teamId(); const per = M.periode(S, 'blok');
        return `<div class="knoppen"><button class="knop" data-act="open" data-view="beoordelen">${icon('star')}Beoordelen</button><button class="knop licht" data-act="uitnodigSheet">${icon('user-plus')}Ouders uitnodigen</button></div>
          ${CC.materiaalStatus ? `<div class="lijst">${CC.materiaalStatus(S, tid)}</div>` : ''}
          <div class="lijst">${M.spelers(S, tid).map((pl) => { const st = M.stats(S, pl, per); const b = S.beoord[pl.id]; return h.rij({ ic: h.avatar(pl.voornaam), titel: esc(M.naam(S, pl)), sub: `${st.pct == null ? '–' : st.pct + '%'} aanwezig · ${b ? `beoordeeld (${Object.keys(b.scores).length})` : 'nog niet beoordeeld'}`, rechts: h.stip(M.zone(S, st.pct, tid)), act: 'open', attrs: `data-view="speler" data-id="${pl.id}"` }); }).join('')}</div>`;
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
      <div class="lijst">${rijen.map(({ pl, st, k }) => h.rij({ ic: h.stip(M.zone(S, st.pct, tid)), titel: esc(M.naam(S, pl)), sub: `${st.pct == null ? '–' : st.pct + '%'} aanwezig${st.telaat ? ` · ${st.telaat}× te laat` : ''}${st.lang ? ' · langdurig' : ''}`, rechts: h.kaartjes(k), act: 'open', attrs: `data-view="speler" data-id="${pl.id}"` })).join('')}</div>`;
  };
})();
