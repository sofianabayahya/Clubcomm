// ClubComm — catalogus oefenvormtypes (Besluit 131). Gegevens, geen methodiek: gelijk voor alle clubs.
// Vaste id's met een losse naam. Een nieuw type = een regel erbij; een onbekende id in een vorm blijft geldig ("overig").
// Methodiek (fasen, leerdoelen, spelprincipes) staat in het opleidingsprofiel van de club, niet hier.
(function () {
  window.CC = window.CC || {};
  window.CC.VORMTYPES = {
    v: 1,
    // Hoofdtypes: op het scherm, één keuze
    types: [
      { id: 'droog', naam: 'Droog / techniek', kleur: '#0869c2' },
      { id: 'duel', naam: 'Passeer- en duelvorm', kleur: '#7c3aed' },
      { id: 'rondo', naam: 'Rondo', kleur: '#0f766e' },
      { id: 'positie', naam: 'Positiespel', kleur: '#137333' },
      { id: 'partij', naam: 'Partijvorm', kleur: '#0b4f7a' },
      { id: 'afwerk', naam: 'Afwerkvorm', kleur: '#b45309' },
      { id: 'patroon', naam: 'Patroon / tactisch', kleur: '#475569' },
      { id: 'keeper', naam: 'Keeper', kleur: '#1f2937' },
    ],
    // Meer precies (optioneel, meerdere): de zestien categorieën, elk onder één hoofdtype
    precies: [
      { id: 'droge-vorm', naam: 'Droge vorm (unopposed)', type: 'droog' },
      { id: 'techniek', naam: 'Technische oefenvorm', type: 'droog' },
      { id: 'loop-combi', naam: 'Loop- en combinatievorm', type: 'droog' },
      { id: 'beweging', naam: 'Bewegingsscholing / coördinatie', type: 'droog' },
      { id: 'passeer-duel', naam: 'Passeer- en duelvorm', type: 'duel' },
      { id: 'rondo', naam: 'Rondo', type: 'rondo' },
      { id: 'positiespel', naam: 'Positiespel', type: 'positie' },
      { id: 'partijvorm', naam: 'Partijvorm', type: 'partij' },
      { id: 'ssg', naam: 'Small-sided game (SSG)', type: 'partij' },
      { id: 'spelvorm', naam: 'Spel- en wedstrijdvorm', type: 'partij' },
      { id: 'afwerkvorm', naam: 'Afwerkvorm', type: 'afwerk' },
      { id: 'patroon-opbouw', naam: 'Opbouw- en aanvalspatroon', type: 'patroon' },
      { id: 'stroom-golf', naam: 'Stroom- en golfvorm', type: 'patroon' },
      { id: 'linie-team', naam: 'Linie- en teamtactische vorm', type: 'patroon' },
      { id: 'keepersvorm', naam: 'Keepersvorm', type: 'keeper' },
    ],
    // Aanvullende aanduiding (los van het type)
    aanduidingen: [{ id: 'functioneel', naam: 'functioneel / linietactisch' }],
    // Schakelvorm is geen type maar een kenmerk: omschakeling met een richting
    omschakeling: [{ id: 'geen', naam: 'geen', kort: '' }, { id: 'av', naam: 'aanval → verdediging', kort: 'A→V' }, { id: 'va', naam: 'verdediging → aanval', kort: 'V→A' }, { id: 'beide', naam: 'beide', kort: 'A⇄V' }],
    weerstandExtra: [{ id: 'passief', naam: 'passief' }, { id: 'afleiding', naam: 'met afleiding' }, { id: 'wisselend', naam: 'wisselend' }],
    // Zoeken: deze woorden vinden het type
    synoniemen: { ssg: 'partij', 'small-sided': 'partij', partij: 'partij', wedstrijdvorm: 'partij', unopposed: 'droog', droog: 'droog', techniek: 'droog', coordinatie: 'droog', coördinatie: 'droog', duel: 'duel', passeren: 'duel', '1v1': 'duel', rondo: 'rondo', positiespel: 'positie', afwerken: 'afwerk', schieten: 'afwerk', patroon: 'patroon', linie: 'patroon', keeper: 'keeper' },
    // Oude soort (Besluit 128) → type; spacing is een plek in de training, geen type
    vanSoort: { droog: 'droog', positie: 'positie', partij: 'partij', spacing: null },
    // Minimale eisen om een vorm te publiceren in de vormenbank (concepten mogen onvolledig zijn)
    publiceren: ['naam', 'tekening-of-organisatie', 'type', 'aantal', 'hoofdleerdoel'],
  };
})();
