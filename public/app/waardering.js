// ClubComm prototype — Besluit 29: waardering voor trainers en teamleiders.
// Aanwezig zijn belonen in plaats van afmelden makkelijk maken. Alleen positief, nooit vergelijken, geen extra werk:
// ClubComm telt wat er al gebeurt. Mijlpalen (10, 25, 50, 100) met felicitatie; coördinator/HJO zien wie ze kunnen bedanken.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;
  const MIJLPALEN = [10, 25, 50, 100, 200];

  const teamsVan = (p, rol) => p.rollen.filter((r) => r.rol === rol && r.teamId).map((r) => r.teamId);
  // Trainingen die deze persoon dit seizoen gaf (eigen team, niet afgelast, niet afwezig) + invallen bij een ander team
  CC.trainerTeller = (S, p) => {
    const v = D.vandaag(); const st = S.club.seizoen.start; const tids = teamsVan(p, 'trainer');
    const gegeven = S.acts.filter((a) => a.soort === 'training' && !a.afgelast && a.datum >= st && D.start(a) < new Date() && ((tids.includes(a.teamId) && !a.trainerAfwezig) || a.vervangerId === p.id)).length;
    const opgenomen = S.acts.filter((a) => tids.includes(a.teamId) && a.datum >= st && a.datum <= v && S.pres[a.id]).length;
    const pct = tids.length ? M.teamStats(S, tids[0], M.periode(S, 'blok')).pct : null;
    const sp = tids.flatMap((t) => M.spelers(S, t)); const beo = CC.beoordLaatste ? sp.filter((pl) => CC.beoordLaatste(S, pl.id)).length : 0;
    return { gegeven, opgenomen, pct, beo, spelers: sp.length, team: tids[0] };
  };
  CC.teamleiderTeller = (S, p) => {
    const v = D.vandaag(); const st = S.club.seizoen.start; const tids = teamsVan(p, 'teamleider');
    const wed = S.acts.filter((a) => tids.includes(a.teamId) && a.soort !== 'training' && !a.afgelast && a.datum >= st && a.datum < v);
    const taken = S.taken.filter((t) => { const a = M.act(S, t.actId); return a && tids.includes(a.teamId) && a.datum >= st && a.datum < v && t.personId; }).length;
    const goed = S.aanm.filter((x) => tids.includes(x.teamId) && x.status !== 'open' && x.status !== 'af').length;
    return { wedstrijden: wed.length, taken, goed, team: tids[0] };
  };

  const gezien = (S, key) => ((S.mijlpaalGezien || {})[key]);
  const blok = (S, p, n, zin, regels) => {
    const m = [...MIJLPALEN].reverse().find((x) => n >= x); const key = `${p.id}-${m}`;
    const feest = m && !gezien(S, key) ? `<div class="info groen mijlpaal">${icon('star')}<span><b>${zin(m)}</b> De club is je dankbaar.<br><button class="linkknop" data-act="mijlpaalGezien" data-key="${key}">Dank je!</button></span></div>` : '';
    const opties = regels.filter(Boolean); const dag = Math.floor(Date.now() / 864e5);
    return feest || (opties.length ? `<p class="compliment waardering">${icon('heart')}${opties[dag % opties.length]}</p>` : '');
  };
  CC.on('mijlpaalGezien', (el) => { const S = CC.S(); (S.mijlpaalGezien || (S.mijlpaalGezien = {}))[el.dataset.key] = new Date().toISOString(); CC.save(); CC.render(); });

  CC.waarderingTrainer = (S, p) => {
    const t = CC.trainerTeller(S, p);
    return blok(S, p, t.gegeven, (m) => `${m} trainingen gegeven dit seizoen!`, [
      t.gegeven && `Je gaf dit seizoen al ${t.gegeven} ${t.gegeven === 1 ? 'training' : 'trainingen'}. Fantastisch!`,
      t.pct != null && t.pct >= 80 && `Je team was deze fase ${t.pct}% aanwezig. Ze komen graag!`,
      t.opgenomen >= 3 && `Je nam al ${t.opgenomen}× de aanwezigheid op. Daar heeft de hele club wat aan.`,
      t.spelers && t.beo === t.spelers && `Alle ${t.spelers} spelers beoordeeld. Top!`,
    ]);
  };
  CC.waarderingTeamleider = (S, p) => {
    const t = CC.teamleiderTeller(S, p);
    return blok(S, p, t.wedstrijden, (m) => `${m} wedstrijden geregeld!`, [
      t.wedstrijden && `Je regelde dit seizoen al ${t.wedstrijden} ${t.wedstrijden === 1 ? 'wedstrijd' : 'wedstrijden'}: vervoer, taken, alles. Dank je wel!`,
      t.taken && `Dankzij jou zijn er al ${t.taken} taken ingevuld.`,
      t.goed && `Je hielp ${t.goed} nieuwe ${t.goed === 1 ? 'gezin' : 'gezinnen'} op weg in ClubComm.`,
    ]);
  };
  const wrap = (rol, fn) => { const o = CC.rollen[rol].schermen.home; CC.rollen[rol].schermen.home = (S) => o(S) + fn(S, CC.me()); };
  wrap('trainer', CC.waarderingTrainer);
  wrap('teamleider', CC.waarderingTeamleider);

  // ---- Coördinator en HJO: wie kun je bedanken? ----
  const origInzicht = CC.rollen.hjo.schermen.inzicht;
  CC.rollen.hjo.schermen.inzicht = (S) => {
    const tids = S.teams.map((t) => t.id);
    const tr = S.people.filter((p) => p.rollen.some((r) => r.rol === 'trainer' && tids.includes(r.teamId))).map((p) => ({ p, n: CC.trainerTeller(S, p).gegeven, wat: 'trainingen gegeven' }));
    const tl = S.people.filter((p) => p.rollen.some((r) => r.rol === 'teamleider' && tids.includes(r.teamId))).map((p) => ({ p, n: CC.teamleiderTeller(S, p).wedstrijden, wat: 'wedstrijden geregeld' }));
    const lijst = [...tr, ...tl].map((x) => ({ ...x, m: [...MIJLPALEN].reverse().find((y) => x.n >= y) })).filter((x) => x.m).sort((a, b) => b.m - a.m || a.p.naam.localeCompare(b.p.naam));
    return origInzicht(S) + `${h.sectie('Mijlpalen: wie kun je bedanken?')}
      ${lijst.length ? `<div class="lijst compact">${lijst.map((x) => h.rij({ ic: 'star', titel: esc(x.p.naam), sub: `${x.m}+ ${x.wat} · ${esc(x.p.rollen.filter((r) => r.teamId && tids.includes(r.teamId)).map((r) => r.teamId).join(', '))}`, rechts: `<button class="knop klein licht" data-act="bedank" data-id="${x.p.id}" data-tekst="${esc(`${x.m} ${x.wat}`)}">${icon('heart')}Bedank</button>` })).join('')}</div>` : '<p class="zacht klein">Nog geen mijlpalen dit seizoen.</p>'}
      <p class="zacht klein">Mijlpalen bij 10, 25, 50 en 100. Geen ranglijst: iedereen die een mijlpaal haalt, staat erbij.</p>`;
  };
  CC.on('bedank', (el) => {
    const S = CC.S(); const p = M.persoon(S, el.dataset.id);
    CC.sheet(`Bedank ${p.naam.split(' ')[0]}`, `<form data-submit="bedankOk" data-id="${p.id}" class="codeform"><label for="bd-t">Bericht</label><textarea id="bd-t" name="t" rows="4">Hoi ${esc(p.naam.split(' ')[0])}, al ${esc(el.dataset.tekst)} dit seizoen. Heel veel dank namens de club!</textarea><button class="knop vol">${icon('send')}Versturen</button></form>`);
  });
  CC.on('bedankOk', (f) => { const S = CC.S(); const me = CC.me(); S.msgs.push({ id: 'b' + Date.now(), van: me.id, soort: 'persoonlijk', bereik: M.persoon(S, f.dataset.id).naam, onderwerp: 'Dank je wel!', tekst: f.t.value, tijd: new Date().toISOString(), ontvangers: [f.dataset.id], gelezen: [], antw: [], urgent: false, gepland: null }); CC.save(); CC.closeSheet(); CC.render(); CC.toast('Verstuurd. Leuk!'); });
})();
