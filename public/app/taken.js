// ClubComm prototype — Besluit 25: taken per rol (vervangt Besluit 24 "wie ziet wat").
// Rollen zijn vaste bouwstenen met een bereik; de club (bestuur) bepaalt welke taken bij welke rol horen.
// De clubbeheerder vinkt dat aan en kan het altijd aanpassen. Coördinator = laag tussen trainer en HJO
// voor een groep teams. Taken van de coördinator gaan vanzelf naar de HJO als een team geen coördinator heeft.
(function () {
  const CC = window.CC; const M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;
  const ROLLEN = ['trainer', 'teamleider', 'coordinator', 'hjo'];

  // [trainer, teamleider, coördinator, HJO] — voorstel; de pilotclub geeft haar eigen basis
  CC.TAKEN = [
    { groep: 'Planning en team', k: 'planning', titel: 'Planning aanpassen', sub: 'Training verplaatsen, extra training, oefenwedstrijd', std: [1, 1, 0, 1] },
    { groep: 'Planning en team', k: 'clubbericht', titel: 'Bericht aan de hele club en afgelasten', sub: 'Clubbrede berichten, alles afgelasten', std: [0, 0, 0, 1] },
    { groep: 'Planning en team', k: 'staf', titel: 'Teams zonder staf oplossen', sub: 'Trainer of teamleider zoeken en koppelen', std: [0, 0, 0, 1] },
    { groep: 'Planning en team', k: 'aanmeldingen48', titel: 'Aanmeldingen die blijven liggen', sub: 'Langer dan 48 uur niet goedgekeurd', std: [0, 0, 1, 0] },
    { groep: 'Spelers opvolgen', k: 'afdoen', titel: 'Spelers opvolgen en signalen afdoen', sub: 'Aanwezigheid, kaarten en signalen zien; "Gezien, geen actie nodig"', std: [1, 0, 1, 1] },
    { groep: 'Spelers opvolgen', k: 'langdurig', titel: 'Langdurig afwezig melden', sub: 'Na een gesprek met de ouder', std: [1, 1, 1, 1] },
    { groep: 'Spelers opvolgen', k: 'bellen', titel: 'Bellen of appen bij de drempel', sub: 'Stap 3 van de opschaling', std: [1, 0, 1, 0] },
    { groep: 'Spelers opvolgen', k: 'gesprek', titel: 'Persoonlijk gesprek met ouders', sub: 'Stap 4: als het na het bellen doorgaat', std: [0, 0, 1, 0] },
    { groep: 'Spelers opvolgen', k: 'clubbesluit', titel: 'Clubbesluit voorbereiden', sub: 'Stap 5, samen met het bestuur', std: [0, 0, 0, 1] },
    { groep: 'Ontwikkeling', k: 'beoordelen', titel: 'Spelers beoordelen', sub: 'Winter en einde seizoen', std: [1, 0, 0, 0] },
    { groep: 'Ontwikkeling', k: 'ontwgesprek', titel: 'Ontwikkelgesprekken plannen en voeren', sub: 'Met ouder en kind', std: [1, 0, 0, 0] },
    { groep: 'Trainers', k: 'trainerNiet', titel: 'Registreren dat de trainer niet kwam', sub: 'Bij de laatste trainingen', std: [0, 0, 0, 0] },
    { groep: 'Trainers', k: 'trainersVolgen', titel: 'Trainers begeleiden en opvolgen', sub: 'O.a. gesprek bij vaak afmelden', std: [0, 0, 1, 0] },
    { groep: 'Materiaal', k: 'materiaal', titel: 'Materiaal controleren', sub: 'Checklist aan het begin van het seizoen', std: [1, 0, 0, 0] },
    { groep: 'Wat zie je', k: 'toelichting', titel: 'Toelichting bij afmelden', sub: 'Wat de ouder erbij typt, bijv. "enkelblessure"', std: [1, 0, 1, 1] },
    { groep: 'Wat zie je', k: 'beoordelingZien', titel: 'Beoordelingen van spelers', sub: 'Scores en gesprekpunten', std: [1, 0, 1, 1] },
    { groep: 'Wat zie je', k: 'notities', titel: 'Gespreksnotities en afspraken', sub: 'Gebeld, geappt, persoonlijk gesprek', std: [1, 0, 1, 1] },
  ];
  const standaard = () => Object.fromEntries(CC.TAKEN.map((t) => [t.k, Object.fromEntries(ROLLEN.map((r, i) => [r, !!t.std[i]]))]));
  const taken = (S) => { const z = S.club.taken || (S.club.taken = standaard()); CC.TAKEN.forEach((t) => { if (!z[t.k]) z[t.k] = standaard()[t.k]; }); return z; };

  // Bereik van de coördinator: een groep teams (op leeftijd)
  CC.coordinatorVoor = (S, teamId) => {
    if (!S.club.coordinatorAan) return null; const t = M.team(S, teamId); if (!t) return null;
    return S.people.find((p) => p.rollen.some((r) => r.rol === 'coordinator' && (r.cats || []).includes(t.cat))) || null;
  };
  const bereikTeams = (S, r) => S.teams.filter((t) => (r.cats || []).includes(t.cat));

  // Mag deze rol deze taak (eventueel voor dit team)?
  CC.mag = (k, rol, teamId) => {
    const S = CC.S(); const r = rol || (CC.rol() || {}).rol; const z = taken(S)[k]; if (!z) return false;
    if (r === 'hjo') {
      if (z.hjo) return true;
      if (!z.coordinator) return false;
      if (!S.club.coordinatorAan) return true; // geen coördinatoren: HJO neemt het over
      if (teamId) return !CC.coordinatorVoor(S, teamId); // team zonder coördinator
      return S.teams.some((t) => !CC.coordinatorVoor(S, t.id));
    }
    if (r === 'coordinator') return S.club.coordinatorAan && z.coordinator;
    return !!z[r];
  };
  // Wie doet dit? (voor teksten als "de trainer of coördinator neemt contact op")
  CC.wie = (k, teamId) => {
    const S = CC.S(); const L = S.club.labels; const naam = { trainer: 'trainer', teamleider: 'teamleider', coordinator: L.coordinator.toLowerCase(), hjo: L.hjo };
    const rollen = ROLLEN.filter((r) => (r === 'hjo' ? CC.mag(k, 'hjo', teamId) : r === 'coordinator' ? CC.mag(k, r) && (!teamId || CC.coordinatorVoor(S, teamId)) : CC.mag(k, r)));
    const n = rollen.map((r) => naam[r]); return n.length ? n.length === 1 ? n[0] : `${n.slice(0, -1).join(', ')} of ${n[n.length - 1]}` : 'club';
  };
  // Oude namen (Besluit 24) blijven werken
  CC.zicht = (k, rol) => {
    const r = rol || (CC.rol() || {}).rol;
    if (k === 'contact') return CC.mag('bellen', r) || CC.mag('gesprek', r);
    return CC.mag({ toelichting: 'toelichting', beoordeling: 'beoordelingZien', gesprekken: 'notities' }[k] || k, r);
  };
  CC.metToelichting = (ids, rolVan) => ids.filter(Boolean).reduce((acc, id) => { (CC.zicht('toelichting', rolVan(id)) ? acc.met : acc.zonder).push(id); return acc; }, { met: [], zonder: [] });

  // ---------- Clubbeheerder: taken per rol ----------
  const matrix = (S) => {
    const z = taken(S); const L = S.club.labels; const co = S.club.coordinatorAan;
    const kol = ROLLEN.filter((r) => r !== 'coordinator' || co);
    const kop = { trainer: 'Trainer', teamleider: 'Team&shy;leider', coordinator: esc(L.coordinator), hjo: esc(L.hjo) };
    let groep = '';
    const rijen = CC.TAKEN.map((t) => {
      const g = t.groep !== groep ? `<tr class="groep"><th colspan="${kol.length + 1}">${esc(t.groep)}</th></tr>` : ''; groep = t.groep;
      const niemand = !kol.some((r) => z[t.k][r]);
      const via = !co && z[t.k].coordinator && !z[t.k].hjo;
      return `${g}<tr><td><b>${esc(t.titel)}</b><small>${esc(t.sub)}</small>${niemand ? `<small class="rood-tekst">Niemand heeft deze taak</small>` : ''}</td>${kol.map((r) => `<td><input type="checkbox" ${z[t.k][r] || (r === 'hjo' && via) ? 'checked' : ''} ${r === 'hjo' && via ? 'disabled title="Via de coördinator; de club gebruikt geen coördinatoren"' : ''} data-change="taakZet" data-k="${t.k}" data-rol="${r}" aria-label="${esc(t.titel)}: ${r}"></td>`).join('')}</tr>`;
    }).join('');
    return `${h.sectie('Taken per rol')}
      <p class="zacht klein">Het bestuur bepaalt welke rol welke taak heeft; jij vinkt het hier aan. Je kunt het altijd aanpassen. ${co ? `Heeft een team geen ${esc(L.coordinator.toLowerCase())}, dan gaan diens taken vanzelf naar de ${esc(L.hjo)}.` : `Zet je bij "Hoe noemt jullie club deze rollen?" de ${esc(L.coordinator.toLowerCase())} aan, dan komt er een kolom bij.`}</p>
      <div class="tabelvak"><table class="tabel zicht"><thead><tr><th></th>${kol.map((r) => `<th>${kop[r]}</th>`).join('')}</tr></thead><tbody>
        <tr class="groep"><th colspan="${kol.length + 1}">Altijd</th></tr>
        <tr><td><b>Aanwezigheid, afmeldingen, kaarten en signalen zien</b><small>Van de eigen teams, met soort reden (ziek, blessure…)</small></td>${kol.map(() => '<td>✓</td>').join('')}</tr>
        ${rijen}
      </tbody></table></div>
      <p class="zacht klein">Ouders zien altijd alleen hun eigen kind. In versie 2 dwingt de server dit af. <button class="linkknop" data-act="takenStandaard">Terug naar het voorstel</button></p>`;
  };
  CC.on('taakZet', (el) => { const S = CC.S(); taken(S)[el.dataset.k][el.dataset.rol] = el.checked; CC.save(); CC.render(); CC.toast('Opgeslagen'); });
  CC.on('takenStandaard', () => { const S = CC.S(); S.club.taken = standaard(); CC.save(); CC.render(); CC.toast('Teruggezet naar het voorstel'); });
  const origRollen = CC.rollen.beheerder.schermen.rollen;
  CC.rollen.beheerder.schermen.rollen = (S) => origRollen(S) + matrix(S);

  // ---------- Rol coördinator: de HJO-schermen, maar alleen voor de eigen groep teams ----------
  CC.rollen.coordinator = {
    context(S) { const r = CC.rol(); return { titel: S.club.naam, sub: `${S.club.labels.coordinator} · ${r.groep || ''}` }; },
    tabs: (S) => CC.rollen.hjo.tabs(S),
    schermen: new Proxy({}, { get: (_, tab) => CC.rollen.hjo.schermen[tab] }),
  };
  let alle = null;
  const origRender = CC.render;
  CC.render = () => {
    const S = CC.S(); const r = CC.rol();
    if (!r || r.rol !== 'coordinator' || alle) return origRender();
    alle = S.teams; S.teams = bereikTeams(S, r);
    try { origRender(); } finally { S.teams = alle; alle = null; }
  };
  const origSave = CC.save;
  CC.save = () => { if (!alle) return origSave(); const S = CC.S(); const f = S.teams; S.teams = alle; try { origSave(); } finally { S.teams = f; } };

  // ---------- Demo ----------
  const demo = (S) => {
    taken(S); delete S.club.zicht;
    S.club.coordinatorAan = true;
    S.club.groepen = S.club.groepen || [{ naam: 'O6–O9', cats: ['O6', 'O7', 'O8', 'O9'] }, { naam: 'O10–O12', cats: ['O10', 'O11', 'O12'] }];
    if (!S.demo.esther) {
      const p = { id: 'p-esther', naam: 'Esther Smit', email: 'esther@voorbeeld.nl', tel: '0612345670', rollen: [{ rol: 'coordinator', groep: 'O10–O12', cats: ['O10', 'O11', 'O12'] }] };
      S.people.push(p); S.demo.esther = p.id;
    }
  };
  const orig = CC.generate;
  CC.generate = function () { const S = orig(); demo(S); return S; };
  const S0 = CC.S(); if (!S0.demo.esther) { demo(S0); CC.save(); }
})();
