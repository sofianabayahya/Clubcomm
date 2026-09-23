// ClubComm prototype — Besluit 28: wie helpt er mee? (taken én rijden)
// Ouder: alleen de eigen bijdrage, positief. Teamleider: per gezin, om eerlijk te verdelen.
// Coördinator en HJO: per team (niet per ouder), met een signaal als het werk op een paar gezinnen neerkomt.
// Nooit een ranglijst voor ouders.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;

  // Wat heeft deze persoon gedaan in dit team (dit seizoen)?
  const bijdrage = (S, tid, ids) => {
    const v = D.vandaag(); const st = S.club.seizoen.start; const r = { taken: {}, ritten: 0, gepland: 0, kanNiet: 0 };
    S.taken.forEach((t) => {
      const a = M.act(S, t.actId); if (!a || a.teamId !== tid || a.datum < st) return;
      if (ids.includes(t.personId)) { if (a.datum < v) r.taken[t.soort] = (r.taken[t.soort] || 0) + 1; else r.gepland++; }
      if ((t.kanNiet || []).some((x) => ids.includes(x))) r.kanNiet++;
    });
    Object.entries(S.vervoer).forEach(([aid, x]) => { const a = M.act(S, aid); if (a && a.teamId === tid && a.datum >= st && a.datum < v && x.aanbod.some((y) => ids.includes(y.personId))) r.ritten++; });
    r.totaal = Object.values(r.taken).reduce((s, n) => s + n, 0) + r.ritten;
    return r;
  };
  const tekst = (r) => [r.ritten && `${r.ritten}× gereden`, ...Object.entries(r.taken).map(([s, n]) => `${n}× ${s.toLowerCase()}`)].filter(Boolean).join(', ');
  // Gezinnen = de ouders van een kind (samen geteld)
  CC.hulpPerGezin = (S, tid) => M.spelers(S, tid).map((pl) => ({ pl, r: bijdrage(S, tid, pl.ouders) }));

  // ---- Ouder ----
  CC.mijnHulp = (S, pl) => {
    const me = CC.me(); const r = bijdrage(S, pl.teamId, [me.id]);
    const team = CC.hulpPerGezin(S, pl.teamId).reduce((s, x) => s + x.r.totaal, 0);
    return `<div class="info groen">${icon('hand-helping')}<span>${r.totaal ? `<b>Dit seizoen:</b> ${tekst(r)}. Dank je wel!` : 'Je hebt dit seizoen nog niet meegeholpen. Een taak is zo gedaan, en het team is je er dankbaar voor.'}${r.gepland ? ` Ingepland: ${r.gepland}×.` : ''}${team ? `<br><small>Samen hebben de ouders van ${esc(pl.teamId)} al ${team}× geholpen (taken en rijden).</small>` : ''}</span></div>
      <p class="zacht klein">Staat een taak ${S.club.inst.oproepDagen} dagen van tevoren nog open, dan krijgt iedereen automatisch een oproep.</p>`;
  };

  // ---- Teamleider ----
  CC.hulpTeamleider = (S, tid) => {
    const g = CC.hulpPerGezin(S, tid).sort((a, b) => b.r.totaal - a.r.totaal);
    const wel = g.filter((x) => x.r.totaal); const niet = g.filter((x) => !x.r.totaal);
    const ouders = (pl) => pl.ouders.map((o) => (M.persoon(S, o) || { naam: '' }).naam.split(' ')[0]).join(' en ');
    return `<details class="uitklap"><summary>${icon('hand-helping')}Wie helpt er mee? (${wel.length} van ${g.length} gezinnen)</summary>
      <p class="zacht klein">Taken en rijden dit seizoen, per gezin. Alleen jij ziet dit, zodat je eerlijk kunt verdelen.</p>
      <div class="lijst compact">${wel.map(({ pl, r }) => h.rij({ ic: h.avatar(pl.voornaam), titel: `${esc(ouders(pl))} <small class="zacht">(${esc(pl.voornaam)})</small>`, sub: esc(tekst(r)) + (r.kanNiet ? ` · ${r.kanNiet}× kan niet` : ''), rechts: `<b>${r.totaal}×</b>` })).join('')}</div>
      ${niet.length ? `<p class="klein"><b>Nog niet geholpen (${niet.length}):</b> ${niet.map(({ pl, r }) => `${esc(ouders(pl))} (${esc(pl.voornaam)})${r.kanNiet ? ` · ${r.kanNiet}× kan niet` : ''}`).join(', ')}</p><p class="zacht klein">Tip: vraag deze ouders persoonlijk, bijv. "Wil jij zaterdag de wastas doen?". Een directe vraag werkt beter dan een groepsoproep. Vaak "kan niet"? Een kort gesprekje helpt meer dan nog een oproep.</p>` : ''}</details>`;
  };

  // ---- Coördinator en HJO: per team ----
  CC.hulpTeam = (S, tid) => {
    const g = CC.hulpPerGezin(S, tid); const tot = g.reduce((s, x) => s + x.r.totaal, 0);
    const top = g.map((x) => x.r.totaal).sort((a, b) => b - a).slice(0, 3).reduce((s, n) => s + n, 0);
    const v = D.vandaag(); const tk = S.taken.filter((t) => { const a = M.act(S, t.actId); return a && a.teamId === tid && a.datum >= S.club.seizoen.start && a.datum < v; });
    return { gezinnen: g.length, helpen: g.filter((x) => x.r.totaal).length, tot, topAandeel: tot ? Math.round((100 * top) / tot) : 0, ingevuld: tk.length ? Math.round((100 * tk.filter((t) => t.personId).length) / tk.length) : null };
  };
  const origInzicht = CC.rollen.hjo.schermen.inzicht;
  CC.rollen.hjo.schermen.inzicht = (S) => {
    if (!S.club.modules.taken) return origInzicht(S);
    const rij = S.teams.map((t) => ({ t, x: CC.hulpTeam(S, t.id) })).filter(({ x }) => x.tot);
    const zwaar = rij.filter(({ x }) => x.tot >= 5 && x.topAandeel >= 70);
    return origInzicht(S) + `${h.sectie('Meehelpen per team')}
      ${zwaar.length ? `<div class="info oranje">${icon('triangle-alert')}<span>${zwaar.map(({ t, x }) => `<b>${esc(t.naam)}:</b> 3 gezinnen doen ${x.topAandeel}% van het werk`).join('<br>')}. Die mensen raken snel overbelast. Vraag de teamleider om het breder te verdelen.</span></div>` : ''}
      <div class="lijst compact">${rij.map(({ t, x }) => h.rij({ ic: 'hand-helping', titel: esc(t.naam), sub: `${x.helpen} van ${x.gezinnen} gezinnen helpen · ${x.tot}× geholpen${x.ingevuld != null ? ` · ${x.ingevuld}% van de taken ingevuld` : ''}`, rechts: x.tot >= 5 && x.topAandeel >= 70 ? '<span class="chip oranje mini">scheef</span>' : '' })).join('') || '<p class="zacht klein">Nog geen taken of ritten dit seizoen.</p>'}</div>
      <p class="zacht klein">Taken en rijden, per team. Welke ouder wat doet, ziet alleen de teamleider.</p>`;
  };

  // Demo: O10-1 heeft al een paar uitwedstrijden gehad; een paar ouders reden
  const demo = (S) => {
    const v = D.vandaag(); const pO = (n) => S.players.find((p) => p.voornaam === n && p.teamId === 'O10-1');
    const rijders = ['Lucas', 'Noah', 'Lucas', 'Omar'].map((n) => pO(n)).filter(Boolean).map((p) => p.ouders[0]);
    S.acts.filter((a) => a.teamId === 'O10-1' && a.soort === 'wedstrijd' && !a.thuis && a.datum < v && !a.afgelast).forEach((a, k) => {
      if (!S.vervoer[a.id]) S.vervoer[a.id] = { aanbod: [{ personId: rijders[k % rijders.length], plekken: 3 }, { personId: rijders[(k + 1) % rijders.length], plekken: 2 }], plek: {} };
    });
    S.hulpDemo = true;
  };
  const orig = CC.generate;
  CC.generate = function () { const S = orig(); demo(S); return S; };
  const S0 = CC.S(); if (!S0.hulpDemo) { demo(S0); CC.save(); }
})();
