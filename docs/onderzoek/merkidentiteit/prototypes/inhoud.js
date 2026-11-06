// Gedeelde inhoud voor de vier merkrichtingen (verzonnen namen; structuur zoals in ClubComm, Besluit 166–178).
window.INHOUD = {
  club: { naam: 'VV De Voorbeeldclub', kort: 'VDV', kleur: '#B3122E', kleur2: '#FFFFFF' }, // verzonnen clubkleuren
  ik: { naam: 'Peter de Vries', voor: 'Peter', rol: 'Hoofd jeugdopleiding' },
  vandaag: 'vrijdag 6 november',
  actie: [
    { soort: 'training', titel: 'Training van Dennis Peters bekijken', sub: 'O9-1 · di 10 nov · Opbouwen onder druk', urgent: false },
    { soort: 'moment', titel: 'Wedstrijd za 14 nov · O9-1', sub: 'Begeleidingsmoment · Dennis vulde de voorbereiding in', urgent: false },
    { soort: 'stap', titel: '2 trainers wachten op een stap van jou', sub: '③ traject starten of ④ eerste moment plannen', urgent: true },
  ],
  trajecten: [
    { naam: 'Dennis Peters', team: 'O9-1', gedaan: 1, plan: 2, volgend: 'za 14 nov', leerdoel: 'Spelers vaker zelf laten oplossen' },
    { naam: 'Samira Brouwer', team: 'O8-1', gedaan: 2, plan: 3, volgend: 'za 21 nov', leerdoel: 'Eerst kijken, dan coachen' },
    { naam: 'Anouk van Vliet', team: 'O10-2', gedaan: 0, plan: 2, volgend: null, leerdoel: 'Rust bij de uitleg' },
  ],
  week: { wedstrijden: 15, trainingen: 27, thuis: 8, dagen: [['ma', 9, 1], ['di', 10, 13], ['wo', 11, 15], ['do', 12, 12], ['vr', 13, 9], ['za', 14, 15], ['zo', 15, 0]] },
  wedstrijden: [
    { tijd: '08:30', team: 'O8-1', trainer: 'Samira Brouwer', thuis: false, tegen: 'FC Lindeboom O8-2' },
    { tijd: '09:00', team: 'O9-1', trainer: 'Dennis Peters', thuis: true, tegen: 'SV Duinzicht-Oost O9-1', veld: 'Veld 3', moment: true },
    { tijd: '10:00', team: 'O10-2', trainer: 'Anouk van Vliet', thuis: true, tegen: 'SV De Kraanvogels O10-1', veld: 'Veld 1' },
    { tijd: '10:30', team: 'O11-1', trainer: 'Hasan van Dijk', thuis: false, tegen: 'FC Waterkant O11-2' },
  ],
  training: { team: 'O10-1', dag: 'vr 6 nov', tijd: '17:00–18:15', thema: 'Opbouwen onder druk', min: 68, van: 75,
    afspraak: 'Bij elke vorm eerst 2 minuten alleen kijken',
    blokken: [
      { code: 'Start', naam: 'Rondo 5 tegen 2', min: 10, spelers: '7' },
      { code: 'A1', naam: 'Passen in driehoeken', min: 12, spelers: '9' },
      { code: 'A2', naam: 'Positiespel 5 tegen 3 met doelen', min: 14, spelers: '8' },
      { code: 'B1', naam: 'Afwerken na kaats', min: 12, spelers: '10' },
      { code: 'Partij', naam: 'Partij 6 tegen 6', min: 20, spelers: '12' },
    ] },
};
// Kleine tekening van een oefenvorm (ClubComm-tekentool, vereenvoudigd): veld, spelers met nummers
window.VELDJE = (kleur = '#2f7d32', lijn = 'rgba(255,255,255,.75)', a = '#d7263d', b = '#1f5fbf') => `<svg viewBox="0 0 300 190" role="img" aria-label="Tekening: rondo 5 tegen 2">
  <rect width="300" height="190" rx="6" fill="${kleur}"/><rect x="40" y="30" width="220" height="130" fill="none" stroke="${lijn}" stroke-width="2"/>
  ${[[70, 55, 1], [230, 55, 2], [70, 140, 3], [230, 140, 4], [150, 45, 5]].map(([x, y, n]) => `<circle cx="${x}" cy="${y}" r="11" fill="${a}"/><text x="${x}" y="${y + 4}" font-size="11" text-anchor="middle" fill="#fff" font-family="sans-serif">${n}</text>`).join('')}
  ${[[140, 100], [175, 110]].map(([x, y]) => `<path d="M${x} ${y - 12} L${x + 11} ${y + 8} L${x - 11} ${y + 8} Z" fill="${b}"/>`).join('')}
  <path d="M82 58 L218 58" stroke="#fff" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#p)"/>
  <defs><marker id="p" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#fff"/></marker></defs></svg>`;
