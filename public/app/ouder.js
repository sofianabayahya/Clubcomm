// ClubComm prototype — Ouder (Besluit 4): Home · Planning · Vervoer · Berichten · Taken
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;

  const openTaken = (S, teamId) => S.taken.filter((t) => { const a = M.act(S, t.actId); return a && a.teamId === teamId && a.datum >= D.vandaag() && a.datum <= D.addDays(D.vandaag(), 21) && !t.personId; });
  const geenVervoer = (S, pl) => {
    if (!S.club.modules.vervoer) return null;
    const a = M.komend(S, pl.teamId, 6).find((x) => x.soort === 'wedstrijd' && !x.thuis && !x.afgelast);
    if (!a || M.status(S, pl, a).code !== 'verwacht') return null;
    const v = S.vervoer[a.id]; return v && v.plek[pl.id] ? null : a;
  };

  CC.rollen.ouder = {
    context(S) { const k = CC.kind(); const kids = CC.kinderen(); return k ? { titel: `${k.voornaam} · ${k.teamId}`, sub: S.club.naam, act: kids.length > 1 ? 'kiesKind' : null } : { titel: 'ClubComm', sub: S.club.naam }; },
    tabs(S) {
      const me = CC.me(); const k = CC.kind();
      return [['home', 'Home', 'house'], ['planning', 'Planning', 'calendar-days'], S.club.modules.vervoer && ['vervoer', 'Vervoer', 'car', k && geenVervoer(S, k) ? 1 : 0],
        ['berichten', 'Berichten', 'message-circle', M.ongelezen(S, me.id)], S.club.modules.taken && ['taken', 'Taken', 'list-checks', k ? openTaken(S, k.teamId).length : 0]];
    },
    schermen: {
      home(S) {
        const pl = CC.kind(); if (!pl) return h.leeg('Er is nog geen kind aan je account gekoppeld. Wacht op goedkeuring van de teamleider.', 'hourglass');
        const me = CC.me();
        const komend = M.komend(S, pl.teamId, 3);
        const st = M.stats(S, pl, M.periode(S, 'blok'));
        const k = M.kaarten(S, pl);
        const z = M.zone(S, st.pct, pl.teamId);
        const lang = S.lang.find((l) => l.spelerId === pl.id && l.tot >= D.vandaag());
        const acties = [];
        const pers = S.msgs.filter((m) => M.zichtbaar(S, m, me.id) && m.soort === 'persoonlijk' && !m.gelezen.includes(me.id));
        pers.forEach((m) => acties.push(h.rij({ ic: 'message-circle', titel: m.van === 'systeem' ? 'Bericht van ClubComm' : `Bericht van ${esc(M.persoon(S, m.van).naam.split(' ')[0])}`, sub: esc(m.onderwerp), act: 'open', attrs: `data-view="bericht" data-id="${m.id}"`, kleur: 'blauw' })));
        S.acts.filter((a) => a.begeleiderId === me.id && a.teamId === pl.teamId && a.datum >= D.vandaag() && !a.afgelast).slice(0, 1).forEach((a) => acties.push(h.rij({ ic: 'clipboard-check', titel: `Jij begeleidt ${D.relatief(a.datum).toLowerCase()}`, sub: `Aanwezigheid${S.club.modules.speeltijd ? ' en speeltijd' : ''} voor deze wedstrijd`, act: 'open', attrs: `data-view="begeleiden" data-id="${a.id}"`, kleur: 'blauw' })));
        const gv = geenVervoer(S, pl); if (gv) acties.push(h.rij({ ic: 'car', titel: `Nog geen vervoer voor ${esc(pl.voornaam)}`, sub: `${D.relatief(gv.datum)} uit bij ${esc(gv.tegen)}`, act: 'tab', attrs: 'data-tab="vervoer"', kleur: 'oranje' }));
        const ot = S.club.modules.taken ? openTaken(S, pl.teamId) : [];
        if (ot.length) { const a = M.act(S, ot[0].actId); acties.push(h.rij({ ic: 'hand-helping', titel: `${ot.length} ${ot.length === 1 ? 'taak' : 'taken'} nog open`, sub: `${esc(ot[0].soort)} · ${D.relatief(a.datum)}. Help je mee?`, act: 'tab', attrs: 'data-tab="taken"' })); }
        const statusregel = st.pct == null ? 'Nog geen activiteiten dit blok' : `Aanwezig ${st.pct}%${st.telaat ? ` · ${st.telaat}× te laat` : ''}`;
        const compliment = z === 'groen' && !k.geel && !k.oranje && !st.telaat ? `<span class="compliment">${icon('star')}Betrouwbare speler!</span>` : '';
        return `
          ${lang ? `<div class="info">${icon('hospital')}<span><b>${esc(pl.voornaam)} is langdurig afwezig</b> tot ongeveer ${D.kort(lang.tot)}. Je hoeft niet per training af te melden.</span></div>` : ''}
          ${h.sectie('Komt eraan')}
          <div class="acts">${komend.map((a) => CC.actKaart(S, a, pl)).join('') || h.leeg('Geen activiteiten gepland', 'calendar')}</div>
          <button class="status ${z}" data-act="uitlegKaarten"><span>${h.stip(z)}${statusregel} <small>dit blok</small></span><span>${h.kaartjes(k)}${compliment}${icon('circle-help', 'zacht')}</span></button>
          ${acties.length ? `${h.sectie('Actie nodig')}<div class="lijst">${acties.join('')}</div>` : ''}`;
      },
      planning(S) {
        const pl = CC.kind(); if (!pl) return '';
        const ver = h.segVal('verder', '0') === '1';
        const tot = D.addDays(D.vandaag(), ver ? 42 : 13);
        const acts = M.acts(S, pl.teamId, D.vandaag(), tot);
        const week = (a) => { const d = D.parse(a.datum); const ma = new Date(d); ma.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return D.iso(ma); };
        const dezeWeek = week({ datum: D.vandaag() });
        const groepen = {}; acts.forEach((a) => { (groepen[week(a)] = groepen[week(a)] || []).push(a); });
        const st = M.stats(S, pl, M.periode(S, 'seizoen'));
        const telSoort = (s) => st.lijst.filter((x) => x.act.soort === s).length;
        const hist = S.afm.filter((f) => f.spelerId === pl.id).map((f) => ({ f, a: M.act(S, f.actId) })).filter((x) => x.a && x.a.datum < D.vandaag()).sort((x, y) => y.a.datum.localeCompare(x.a.datum));
        return `${Object.entries(groepen).map(([w, as]) => `${h.sectie(w === dezeWeek ? 'Deze week' : w === D.addDays(dezeWeek, 7) ? 'Volgende week' : `Week van ${D.kort(w)}`)}<div class="lijst">${as.map((a) => h.rij({ ic: h.datumBlok(a), titel: h.actTitel(S, a), sub: h.actSub(S, a), rechts: h.chip(M.status(S, pl, a)), act: 'open', attrs: `data-view="activiteit" data-id="${a.id}"` })).join('')}</div>`).join('')}
          ${!ver ? `<button class="knop licht vol" data-act="seg" data-key="verder" data-val="1">${icon('calendar-days')}Verder vooruit kijken</button>` : ''}
          <details class="uitklap"><summary>${icon('chart-column')}Seizoensoverzicht</summary>
            <div class="cijfers"><div class="cijfer ${M.zone(S, st.pct, pl.teamId)}"><b>${st.pct == null ? '–' : st.pct + '%'}</b><small>aanwezig</small></div><div class="cijfer"><b>${telSoort('training')}</b><small>trainingen</small></div><div class="cijfer"><b>${telSoort('wedstrijd')}</b><small>wedstrijden</small></div></div></details>
          <details class="uitklap"><summary>${icon('clock')}Afmeldgeschiedenis</summary><div class="lijst compact">${hist.map(({ f, a }) => h.rij({ ic: h.reden(f.reden), titel: `${D.kort(a.datum)} · ${esc(f.reden)}`, sub: h.actTitel(S, a), rechts: M.teLaatAfgemeld(S, f, a) ? '<span class="chip geel mini">te laat</span>' : '<span class="chip groen mini">op tijd</span>' })).join('') || '<p class="zacht klein">Nog geen afmeldingen.</p>'}</div></details>
          <button class="knop licht vol" data-act="langdurigSheet" data-id="${pl.id}">${icon('hospital')}Langer geblesseerd of ziek? Meld het één keer</button>`;
      },
      vervoer(S) {
        const pl = CC.kind(); const me = CC.me();
        const uit = M.komend(S, pl.teamId, 12).filter((a) => a.soort === 'wedstrijd' && !a.thuis && !a.afgelast).slice(0, 3);
        if (!uit.length) return h.leeg('Geen uitwedstrijden de komende tijd. Bij thuiswedstrijden is geen vervoer nodig.', 'car');
        return uit.map((a) => {
          const v = S.vervoer[a.id] || (S.vervoer[a.id] = { aanbod: [], plek: {} });
          const mijnAanbod = v.aanbod.find((x) => x.personId === me.id);
          const komt = M.status(S, pl, a).code === 'verwacht';
          const bij = v.plek[pl.id] && M.persoon(S, v.plek[pl.id]);
          const vrij = (x) => x.plekken - Object.values(v.plek).filter((p) => p === x.personId).length;
          return `<article class="kaartje">
            <div class="kaart-kop">${h.datumBlok(a)}<div><b>${h.actTitel(S, a)}</b><small>Verzamelen ${a.verzamel} · ${esc(a.adres)}</small></div></div>
            ${!komt ? `<p class="zacht">${esc(pl.voornaam)} is afgemeld voor deze wedstrijd.</p>` : bij ? `<div class="info groen">${icon('circle-check')}<span>${esc(pl.voornaam)} rijdt mee met <b>${esc(bij.naam)}</b>.</span></div>` : `<div class="info oranje">${icon('car')}<span>${esc(pl.voornaam)} heeft nog geen vervoer.</span></div>`}
            <h4>Wie rijdt er?</h4>
            ${v.aanbod.map((x) => { const p = M.persoon(S, x.personId); return h.rij({ ic: h.avatar(p.naam), titel: esc(p.naam), sub: `${vrij(x)} van ${x.plekken} plekken vrij`, rechts: komt && !bij && vrij(x) > 0 && x.personId !== me.id ? `<button class="knop klein" data-act="meerijden" data-a="${a.id}" data-p="${x.personId}">Meerijden</button>` : '' }); }).join('') || '<p class="zacht klein">Nog niemand.</p>'}
            <div class="knoppen">${mijnAanbod ? `<button class="knop licht" data-act="aanbodStop" data-a="${a.id}">${icon('x')}Ik rijd toch niet</button>` : `<button class="knop" data-act="ikRijd" data-a="${a.id}">${icon('car')}Ik rijd</button>`}${bij ? `<button class="knop licht" data-act="afmeldenRit" data-a="${a.id}">Plek opgeven</button>` : ''}</div>
          </article>`;
        }).join('');
      },
      berichten: (S) => CC.berichtenScherm(S, { ouder: true }),
      taken(S) {
        const pl = CC.kind(); const me = CC.me();
        const acts = M.acts(S, pl.teamId, D.vandaag(), D.addDays(D.vandaag(), 28)).filter((a) => S.taken.some((t) => t.actId === a.id));
        const mijn = S.taken.filter((t) => t.personId === me.id).length;
        return `<div class="info">${icon('info')}<span>Staat een taak 2 dagen van tevoren nog open, dan krijgt iedereen automatisch een oproep. Je hebt dit seizoen <b>${mijn}×</b> geholpen. Dank je wel!</span></div>
          ${acts.map((a) => `${h.sectie(`${D.relatief(a.datum)} · ${h.actTitel(S, a)}`)}<div class="lijst">${S.taken.filter((t) => t.actId === a.id).map((t) => {
            const p = t.personId && M.persoon(S, t.personId);
            return h.rij({ ic: t.soort === 'Coach' ? 'clipboard-check' : t.soort === 'Spelbegeleider' ? 'flag' : t.soort === 'Fotograaf' ? 'eye' : t.soort === 'Wastas' ? 'shirt' : 'hand-helping', titel: esc(t.soort), sub: p ? (p.id === me.id ? 'Jij doet dit. Top!' : esc(p.naam)) : 'Nog niemand', kleur: p ? '' : 'oranje',
              rechts: !p ? `<button class="knop klein" data-act="ikDoeHet" data-id="${t.id}">Ik doe het</button>` : p.id === me.id ? `<button class="knop klein licht" data-act="taakAf" data-id="${t.id}">Afmelden</button>` : icon('circle-check', 'groen') });
          }).join('')}</div>`).join('') || h.leeg('Geen taken de komende weken', 'list-checks')}`;
      },
    },
  };

  // Activiteitkaart met afmeldknop (Home)
  CC.actKaart = (S, a, pl) => {
    const st = M.status(S, pl, a);
    const voorDeadline = new Date() < M.deadline(S, a);
    const begonnen = new Date() > D.start(a);
    let knop = '';
    if (!begonnen && st.code === 'verwacht') knop = `<button class="knop klein licht rood-tekst" data-act="afmelden" data-act2="${a.id}" data-speler="${pl.id}">Afmelden</button>`;
    if (!begonnen && st.code === 'afgemeld' && voorDeadline) knop = `<button class="knop klein licht" data-act="intrekken" data-act2="${a.id}" data-speler="${pl.id}">${icon('undo-2')}Intrekken</button>`;
    const extra = '';
    const status = st.code === 'verwacht' ? (begonnen ? '' : `<small class="zacht">Afmelden tot ${M.deadlineTekst(S, a)}</small>`) : h.chip(st);
    return `<article class="act ${a.afgelast ? 'afgelast' : ''}">
      <button class="act-body" data-act="open" data-view="activiteit" data-id="${a.id}">${h.datumBlok(a)}<span class="act-tekst"><small>${D.relatief(a.datum)}</small><b>${h.actTitel(S, a)}</b><small>${h.actSub(S, a)}</small>${extra}</span></button>
      <div class="act-voet">${status}${knop}</div></article>`;
  };

  // Activiteit-detail (alle rollen)
  CC.views.activiteit = (S, p) => {
    const a = M.act(S, p.id); const rol = CC.rol().rol; const t = M.team(S, a.teamId);
    const kaart = a.adres ? `<a class="rij" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.adres)}" target="_blank" rel="noopener"><span class="rij-ic">${icon('map-pin')}</span><span class="rij-tekst"><b>${esc(a.adres)}</b><small>Open in kaarten</small></span>${icon('chevron-right', 'chev')}</a>` : '';
    let meer = '';
    if (rol === 'ouder') { const pl = CC.kind(); meer = `<div class="acts">${CC.actKaart(S, a, pl)}</div>`; }
    else {
      const sp = M.spelers(S, a.teamId).map((pl) => ({ pl, st: M.status(S, pl, a) }));
      const af = sp.filter((x) => !['verwacht', 'aanwezig', 'telaat'].includes(x.st.code));
      meer = `${h.sectie(`Verwacht: ${sp.length - af.length} van ${sp.length}`)}<div class="lijst compact">${af.map((x) => h.rij({ ic: h.avatar(x.pl.voornaam), titel: esc(M.naam(S, x.pl)), rechts: h.chip(x.st), sub: x.st.afm && x.st.afm.opm ? esc(x.st.afm.opm) : '' })).join('') || '<p class="zacht klein">Iedereen komt.</p>'}</div>
        ${['trainer', 'teamleider'].includes(rol) && a.soort === 'training' && !a.afgelast ? `<button class="knop licht vol" data-act="wijzigDeze" data-id="${a.id}">${icon('pencil')}Deze training aanpassen</button>` : ''}`;
    }
    return {
      titel: a.soort === 'training' ? 'Training' : a.soort === 'oefen' ? 'Oefenwedstrijd' : 'Wedstrijd',
      html: `<article class="kaartje"><div class="kaart-kop">${h.datumBlok(a)}<div><b>${h.actTitel(S, a)}</b><small>${D.lang(a.datum)} · ${esc(t.naam)}</small></div></div>
        <dl class="gegevens">${a.soort === 'training' ? `<dt>Tijd</dt><dd>${a.tijd}–${a.eind}</dd><dt>Veld</dt><dd>${esc(a.veld)}</dd>` : `<dt>Verzamelen</dt><dd>${a.verzamel}</dd><dt>Aftrap</dt><dd>${a.tijd}</dd>${a.veld ? `<dt>Veld</dt><dd>${esc(a.veld)}</dd>` : ''}<dt>Tenue</dt><dd>${esc(a.tenue || '–')}</dd>${a.uitslag ? `<dt>Uitslag</dt><dd>${esc(a.uitslag)}</dd>` : ''}`}<dt>Afmelden</dt><dd>tot ${M.deadlineTekst(S, a)}</dd></dl>
        ${a.afgelast ? `<div class="info rood">${icon('ban')}<span>Deze activiteit is afgelast.</span></div>` : ''}${kaart}</article>${meer}`,
    };
  };
  CC.on('wijzigDeze', (el) => CC.wijzigingSheet(el.dataset.id));

  CC.on('kiesKind', () => {
    const kids = CC.kinderen(); const cur = CC.kind();
    CC.sheet('Kies je kind', `<div class="lijst">${kids.map((k) => h.rij({ ic: h.avatar(k.voornaam), titel: esc(M.naam(CC.S(), k)), sub: esc(k.teamId), act: 'zetKind', attrs: `data-id="${k.id}"`, rechts: k.id === cur.id ? icon('check') : '' })).join('')}</div>`);
  });
  CC.on('zetKind', (el) => { CC.sessie().kindId = el.dataset.id; try { localStorage.setItem('clubcomm-sessie-v1', JSON.stringify(CC.sessie())); } catch (e) { /* */ } CC.closeSheet(); CC.render(); });

  // Vervoer
  CC.on('ikRijd', (el) => CC.sheet('Ik rijd', `<form data-submit="ikRijdOk" data-a="${el.dataset.a}" class="codeform"><label for="pl">Hoeveel kinderen kun je meenemen (naast je eigen kind)?</label><div class="stepper"><button type="button" data-act="stap" data-d="-1" aria-label="Minder">−</button><input id="pl" name="n" type="number" min="1" max="6" value="3"><button type="button" data-act="stap" data-d="1" aria-label="Meer">+</button></div><button class="knop vol">Aanbieden</button></form>`));
  CC.on('stap', (el) => { const i = el.parentElement.querySelector('input'); i.value = Math.max(1, Math.min(6, Number(i.value) + Number(el.dataset.d))); });
  CC.on('ikRijdOk', (f) => {
    const S = CC.S(); const v = S.vervoer[f.dataset.a]; const me = CC.me(); const pl = CC.kind();
    v.aanbod.push({ personId: me.id, plekken: Number(f.n.value) }); v.plek[pl.id] = me.id;
    CC.save(); CC.closeSheet(); CC.render(); CC.toast('Dank je wel! De teamleider ziet dat je rijdt.');
  });
  CC.on('aanbodStop', (el) => { const S = CC.S(); const v = S.vervoer[el.dataset.a]; const me = CC.me(); v.aanbod = v.aanbod.filter((x) => x.personId !== me.id); Object.keys(v.plek).forEach((k) => { if (v.plek[k] === me.id) delete v.plek[k]; }); CC.save(); CC.render(); CC.toast('Aanbod ingetrokken; de meerijders krijgen bericht'); });
  CC.on('meerijden', (el) => { const S = CC.S(); S.vervoer[el.dataset.a].plek[CC.kind().id] = el.dataset.p; CC.save(); CC.render(); CC.toast('Geregeld! De chauffeur krijgt een melding.'); });
  CC.on('afmeldenRit', (el) => { const S = CC.S(); delete S.vervoer[el.dataset.a].plek[CC.kind().id]; CC.save(); CC.render(); });

  // Taken
  CC.on('ikDoeHet', (el) => {
    const S = CC.S(); const t = S.taken.find((x) => x.id === el.dataset.id); t.personId = CC.me().id;
    const a = M.act(S, t.actId); let extra = '';
    if (t.soort === 'Coach' && !a.begeleiderId) { a.begeleiderId = CC.me().id; extra = ' Je bent wedstrijdbegeleider: je ziet aanwezigheid en speeltijd op Home.'; }
    CC.save(); CC.render(); CC.toast(`Top! Jij bent ${t.soort.toLowerCase()}.${extra}`);
  });
  // Tijdelijke toegang voor de ouder-coach (Besluit 7): alleen deze wedstrijd, vervalt daarna vanzelf
  CC.views.begeleiden = (S, p) => {
    const a = M.act(S, p.id);
    if (a.begeleiderId !== CC.me().id || a.datum < D.vandaag()) return { titel: 'Begeleiden', html: h.leeg('Je toegang voor deze wedstrijd is verlopen.', 'lock') };
    return { titel: 'Wedstrijd begeleiden', html: `<div class="info">${icon('info')}<span>Je hebt tijdelijk toegang, alleen voor deze wedstrijd.</span></div>
      <div class="kaart-kop los">${h.datumBlok(a)}<div><b>${h.actTitel(S, a)}</b><small>Verzamelen ${a.verzamel} · aftrap ${a.tijd}</small></div></div>
      ${h.sectie('Aanwezigheid')}${CC.opnemenHtml(S, a)}${S.club.modules.speeltijd ? `${h.sectie('Speeltijd')}${CC.speeltijdHtml(S, a.teamId)}` : ''}` };
  };
  CC.on('taakAf', (el) => { const S = CC.S(); const t = S.taken.find((x) => x.id === el.dataset.id); const a = M.act(S, t.actId); if (t.soort === 'Coach' && a.begeleiderId === t.personId) a.begeleiderId = null; t.personId = null; CC.save(); CC.render(); CC.toast('Afgemeld voor deze taak; de teamleider krijgt bericht'); });
})();
