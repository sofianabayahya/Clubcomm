// ClubComm prototype — module Materiaal (Besluit 17): checklist per team bij de start van het seizoen.
// Trainer vinkt aan wat in orde is; ontbreekt iets, dan gaat er een mail naar de secretaris en ziet de HJO het.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;

  // Standaardlijst (clubbeheerder kan aanpassen). aantal 'spelers' = 1 per speler van het team.
  CC.MATERIAAL = [
    { id: 'ballen', naam: 'Ballen', aantal: 'spelers', voor: ['mini', 'o8', 'o11'] },
    { id: 'hoedjes', naam: 'Hoedjes', aantal: 40, voor: ['mini', 'o8', 'o11'] },
    { id: 'hesjes', naam: 'Hesjes (2 kleuren)', aantal: 'spelers', voor: ['mini', 'o8', 'o11'] },
    { id: 'doeltjes', naam: 'Minidoeltjes', aantal: 4, voor: ['mini', 'o8'] },
    { id: 'ballentas', naam: 'Ballentas', aantal: 1, voor: ['mini', 'o8', 'o11'] },
    { id: 'pomp', naam: 'Ballenpomp met naald', aantal: 1, voor: ['mini', 'o8', 'o11'] },
    { id: 'ehbo', naam: 'EHBO-tas (gevuld)', aantal: 1, voor: ['mini', 'o8', 'o11'] },
    { id: 'keeper', naam: 'Keepershandschoenen', aantal: 1, voor: ['o8', 'o11'] },
    { id: 'pak', naam: 'Trainingspak trainer', aantal: 1, voor: ['mini', 'o8', 'o11'] },
  ];
  const groep = (t) => { const n = parseInt(t.cat.replace(/\D/g, ''), 10); return n <= 7 ? 'mini' : n <= 10 ? 'o8' : 'o11'; };
  const maat = (t) => (groep(t) === 'mini' ? 'maat 3' : 'maat 4');
  const lijstVoor = (S, t) => S.club.materiaal.lijst.filter((x) => x.voor.includes(groep(t)));
  const aantalTekst = (S, t, x) => (x.aantal === 'spelers' ? `${M.spelers(S, t.id).length} (1 per speler)` : String(x.aantal));
  const status = (S, tid) => S.materiaal[tid] || null;
  const open = (S, tid) => { const m = status(S, tid); return m && m.ingediend ? Object.keys(m.items).filter((k) => m.items[k] === 'mist' && !m.geleverd[k]) : []; };
  CC.materiaalOpen = open;

  // Demodata (wordt aangeroepen vanuit CC.generate via hook)
  CC.materiaalDemo = (S) => {
    S.club.modules.materiaal = true;
    S.club.materiaal = { wie: 'Secretaris', mail: 'secretaris@scbuitenveldert.nl', lijst: CC.MATERIAAL.map((x) => ({ ...x, voor: [...x.voor] })) };
    S.materiaal = {}; S.mails = [];
    const ingediend = new Date(Date.now() - 20 * 864e5).toISOString();
    S.teams.forEach((t) => {
      if (['O10-1', 'O6-1', 'O12-3'].includes(t.id)) return; // nog niet ingevuld
      const items = {}; lijstVoor(S, t).forEach((x) => { items[x.id] = 'ok'; });
      if (t.id === 'O8-2') items.hesjes = 'mist';
      if (t.id === 'O11-2') { items.ballen = 'mist'; items.pak = 'mist'; }
      S.materiaal[t.id] = { items, opm: t.id === 'O11-2' ? 'Nog maar 7 ballen, de rest is lek.' : '', ingediend, geleverd: {} };
    });
  };

  // Rij voor Home van de trainer (alleen als er iets te doen is)
  CC.materiaalRij = (S, tid) => {
    if (!S.club.modules.materiaal) return '';
    const m = status(S, tid);
    if (!m || !m.ingediend) return h.rij({ ic: 'list-checks', titel: 'Controleer je materiaal', sub: 'Eén keer bij de start van het seizoen: ballen, hoedjes, hesjes…', kleur: 'oranje', act: 'open', attrs: `data-view="materiaal" data-team="${tid}"` });
    const o = open(S, tid);
    return o.length ? h.rij({ ic: 'hourglass', titel: `${o.length} ${o.length === 1 ? 'item' : 'items'} nog niet ontvangen`, sub: `Doorgegeven aan de ${S.club.materiaal.wie.toLowerCase()}`, act: 'open', attrs: `data-view="materiaal" data-team="${tid}"` }) : '';
  };
  // Statusregel (voor Spelers-tab en teamdetail)
  CC.materiaalStatus = (S, tid) => {
    if (!S.club.modules.materiaal) return '';
    const m = status(S, tid); const o = open(S, tid);
    const sub = !m || !m.ingediend ? 'Nog niet gecontroleerd' : o.length ? `${o.length} nog niet ontvangen` : 'Compleet';
    return h.rij({ ic: 'list-checks', titel: 'Materiaal', sub, kleur: !m || !m.ingediend || o.length ? 'oranje' : '', act: 'open', attrs: `data-view="materiaal" data-team="${tid}"` });
  };

  CC.views.materiaal = (S, p) => {
    const tid = p.team || CC.teamId(); const t = M.team(S, tid);
    const m = status(S, tid) || { items: {}, opm: '', geleverd: {} };
    const concept = CC.ui.matConcept && CC.ui.matConcept.team === tid ? CC.ui.matConcept : (CC.ui.matConcept = { team: tid, items: { ...m.items }, opm: m.opm });
    const lijst = lijstVoor(S, t);
    const rij = (x) => {
      const v = concept.items[x.id]; const gel = m.geleverd[x.id];
      const naam = `${esc(x.naam)}${x.id === 'ballen' ? ` <span class="label">${maat(t)}</span>` : ''}`;
      const na = m.ingediend && m.items[x.id] === 'mist' ? (gel ? `<small class="groen-tekst">Geleverd op ${D.kort(gel)}</small>` : `<small class="oranje-tekst">Doorgegeven aan de ${esc(S.club.materiaal.wie.toLowerCase())}</small>`) : '';
      return `<div class="rij matrij"><span class="rij-tekst"><b>${naam}</b><small>Aantal: ${aantalTekst(S, t, x)}</small>${na}</span>
        <span class="keuze" role="group" aria-label="${esc(x.naam)}"><button class="${v === 'ok' ? 'aan ok' : ''}" data-act="matZet" data-id="${x.id}" data-v="ok" aria-pressed="${v === 'ok'}">${icon('check')}In orde</button><button class="${v === 'mist' ? 'aan mist' : ''}" data-act="matZet" data-id="${x.id}" data-v="mist" aria-pressed="${v === 'mist'}">${icon('x')}Niet ontvangen</button></span></div>`;
    };
    const klaar = lijst.every((x) => concept.items[x.id]);
    return {
      titel: `Materiaal ${t.naam}`,
      html: `<div class="info">${icon('info')}<span>Controleer bij de start van het seizoen of alles er is. Wat niet in orde is, geven we door aan de ${esc(S.club.materiaal.wie.toLowerCase())}${m.ingediend ? '' : '. Het kost je 1 minuut'}.</span></div>
        ${m.ingediend ? `<p class="zacht klein">Doorgegeven op ${D.kort(m.ingediend.slice(0, 10))}. Je kunt het hieronder bijwerken.</p>` : ''}
        <button class="knop licht vol" data-act="matAllesOk">${icon('circle-check')}Alles in orde (zet daarna wat ontbreekt op "Niet ontvangen")</button>
        <div class="lijst">${lijst.map(rij).join('')}</div>
        <label for="mat-opm" class="klein-kop">Opmerking (mag leeg)</label><textarea id="mat-opm" rows="2" data-input="matOpm" placeholder="Bijv. 3 ballen zijn lek">${esc(concept.opm || '')}</textarea>
        <button class="knop vol" data-act="matDoorgeven" data-team="${tid}" ${klaar ? '' : 'disabled'}>${icon('send')}${m.ingediend ? 'Wijziging doorgeven' : 'Doorgeven'}</button>
        ${klaar ? '' : '<p class="zacht klein midden">Kies bij elk item "In orde" of "Niet ontvangen".</p>'}`,
    };
  };
  CC.on('matAllesOk', () => { const S = CC.S(); const c = CC.ui.matConcept; const t = M.team(S, c.team); lijstVoor(S, t).forEach((x) => { if (!c.items[x.id]) c.items[x.id] = 'ok'; }); CC.render(); });
  CC.on('matZet', (el) => { CC.ui.matConcept.items[el.dataset.id] = el.dataset.v; CC.render(); });
  CC.on('matOpm', (el) => { CC.ui.matConcept.opm = el.value; });
  CC.on('matDoorgeven', (el) => {
    const S = CC.S(); const tid = el.dataset.team; const t = M.team(S, tid); const c = CC.ui.matConcept; const me = CC.me();
    const oud = S.materiaal[tid] || { geleverd: {} };
    S.materiaal[tid] = { items: { ...c.items }, opm: c.opm || '', ingediend: new Date().toISOString(), geleverd: oud.geleverd || {} };
    const mist = lijstVoor(S, t).filter((x) => c.items[x.id] === 'mist' && !(oud.geleverd || {})[x.id]);
    if (mist.length) {
      const tekst = `${t.naam} (trainer ${me.naam}) mist: ${mist.map((x) => `${x.naam} (${aantalTekst(S, t, x)})`).join(', ')}.${c.opm ? ` Opmerking: ${c.opm}` : ''}`;
      S.mails.push({ aan: S.club.materiaal.mail, onderwerp: `Materiaal ${t.naam}`, tekst, tijd: new Date().toISOString() });
      const hjo = S.people.filter((x) => x.id !== me.id && x.rollen.some((r) => r.rol === 'hjo')).map((x) => x.id);
      S.msgs.push({ id: 'b' + Date.now(), van: me.id, soort: 'melding', bereik: tid, onderwerp: `Materiaal ${t.naam} niet compleet`, tekst: `${tekst} De ${S.club.materiaal.wie.toLowerCase()} is gemaild.`, tijd: new Date().toISOString(), ontvangers: hjo, gelezen: [], antw: [], urgent: false, gepland: null });
    }
    CC.ui.matConcept = null; CC.save(); CC.terug();
    CC.toast(mist.length ? `Doorgegeven; mail naar ${S.club.materiaal.mail}` : 'Top, alles is compleet!');
  });

  // Overzicht voor HJO (en secretaris): wat ontbreekt waar
  CC.materiaalAandacht = (S) => {
    if (!S.club.modules.materiaal) return '';
    const teams = S.teams.filter((t) => open(S, t.id).length);
    return teams.length ? h.rij({ ic: 'list-checks', titel: `${teams.length} ${teams.length === 1 ? 'team mist' : 'teams missen'} materiaal`, sub: teams.map((t) => `${t.naam}: ${open(S, t.id).map((k) => (S.club.materiaal.lijst.find((x) => x.id === k) || { naam: k }).naam.toLowerCase()).join(', ')}`).join(' · '), kleur: 'oranje', act: 'open', attrs: 'data-view="materiaalOverzicht"' }) : '';
  };
  CC.views.materiaalOverzicht = (S) => {
    const naam = (k) => (S.club.materiaal.lijst.find((x) => x.id === k) || { naam: k }).naam;
    const mist = S.teams.filter((t) => open(S, t.id).length);
    const niet = S.teams.filter((t) => !status(S, t.id) || !status(S, t.id).ingediend);
    return { titel: 'Materiaal', html: `<p class="zacht klein">Meldingen gaan per mail naar ${esc(S.club.materiaal.mail)}. Tik op "Geleverd" als het team het heeft gekregen; de trainer krijgt dan bericht.</p>
      ${h.sectie('Nog niet ontvangen')}${mist.length ? mist.map((t) => `<div class="kaartje"><h4>${icon('shield')}${esc(t.naam)}</h4>${open(S, t.id).map((k) => `<div class="rij"><span class="rij-tekst"><b>${esc(naam(k))}</b><small>Aantal: ${aantalTekst(S, t, S.club.materiaal.lijst.find((x) => x.id === k) || { aantal: 1 })}</small></span><button class="knop klein" data-act="matGeleverd" data-team="${t.id}" data-id="${k}">Geleverd</button></div>`).join('')}${status(S, t.id).opm ? `<p class="klein zacht">"${esc(status(S, t.id).opm)}"</p>` : ''}</div>`).join('') : h.leeg('Alles is geleverd')}
      ${h.sectie('Checklist nog niet ingevuld')}<p class="klein">${niet.map((t) => esc(t.naam)).join(', ') || 'Alle teams hebben de checklist ingevuld.'}</p>` };
  };
  CC.on('matGeleverd', (el) => {
    const S = CC.S(); const t = M.team(S, el.dataset.team); const m = S.materiaal[t.id]; m.geleverd[el.dataset.id] = D.vandaag();
    const item = S.club.materiaal.lijst.find((x) => x.id === el.dataset.id);
    if (t.trainerId) S.msgs.push({ id: 'b' + Date.now(), van: 'systeem', soort: 'melding', bereik: t.id, onderwerp: 'Materiaal geleverd', tekst: `${item ? item.naam : 'Materiaal'} voor ${t.naam} is geleverd. Veel trainingsplezier!`, tijd: new Date().toISOString(), ontvangers: [t.trainerId], gelezen: [], antw: [], urgent: false, gepland: null });
    CC.save(); CC.render(); CC.toast('Afgevinkt; de trainer krijgt bericht');
  });

  // Instellingen voor de clubbeheerder
  CC.views.materiaalInst = (S) => {
    const c = S.club.materiaal;
    const g = { mini: "mini's", o8: 'O8–O10', o11: 'O11–O12' };
    return { titel: 'Materiaal instellen', html: `<form data-submit="matInstOk" class="kaartje codeform"><div class="twee"><div><label for="mi-w">Wie ontvangt meldingen?</label><input id="mi-w" name="w" value="${esc(c.wie)}"></div><div><label for="mi-m">E-mailadres</label><input id="mi-m" name="m" type="email" value="${esc(c.mail)}"></div></div><p class="zacht klein">Deze persoon heeft geen account nodig; de melding komt per mail.</p><button class="knop licht klein">Opslaan</button></form>
      ${h.sectie('Checklist')}<div class="lijst">${c.lijst.map((x, i) => h.rij({ ic: 'list-checks', titel: esc(x.naam), sub: `${x.aantal === 'spelers' ? '1 per speler' : x.aantal} · ${x.voor.map((v) => g[v]).join(', ')}`, rechts: `<button class="icoonknop" data-act="matItemWeg" data-i="${i}" aria-label="${esc(x.naam)} verwijderen">${icon('trash-2')}</button>` })).join('')}</div>
      <form data-submit="matItemErbij" class="kaartje codeform"><label for="mi-n">Item toevoegen</label><input id="mi-n" name="n" required placeholder="Bijv. Pionnen"><div class="twee"><div><label for="mi-a">Aantal</label><input id="mi-a" name="a" type="number" min="1" placeholder="leeg = 1 per speler"></div><div><label for="mi-g">Voor</label><select id="mi-g" name="g"><option value="alle">Alle onderbouwteams</option><option value="mini">Mini's</option><option value="o8">O8–O10</option><option value="o11">O11–O12</option></select></div></div><button class="knop licht klein">${icon('plus')}Toevoegen</button></form>` };
  };
  CC.on('matInstOk', (f) => { const S = CC.S(); S.club.materiaal.wie = f.w.value || 'Secretaris'; S.club.materiaal.mail = f.m.value; CC.save(); CC.render(); CC.toast('Opgeslagen'); });
  CC.on('matItemWeg', (el) => { const S = CC.S(); S.club.materiaal.lijst.splice(Number(el.dataset.i), 1); CC.save(); CC.render(); });
  CC.on('matItemErbij', (f) => { const S = CC.S(); S.club.materiaal.lijst.push({ id: 'i' + Date.now(), naam: f.n.value, aantal: f.a.value ? Number(f.a.value) : 'spelers', voor: f.g.value === 'alle' ? ['mini', 'o8', 'o11'] : [f.g.value] }); CC.save(); CC.render(); CC.toast('Toegevoegd'); });
})();

// Demodata aanhaken: bij elke nieuwe demo en bij een bestaande demo zonder materiaal
(function () {
  const CC = window.CC; const orig = CC.generate;
  CC.generate = function () { const S = orig(); CC.materiaalDemo(S); return S; };
  const S = CC.S(); if (!S.materiaal) { CC.materiaalDemo(S); CC.save(); }
})();
