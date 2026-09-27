// ClubComm tests — een kleine club zoals DCG in de pilot (patroon C uit de pilotlog: de demo verbergt het).
// Teamnaam ≠ teamcode, weinig spelers, twee teamleiders, geen telefoonnummers, (nog) geen activiteiten.
// Werkt in de browser (window.kleineClub) en in Node (module.exports). Geeft S terug; CC komt van de app of de servermotor.
(function (root) {
  const kleineClub = (CC) => {
    const S = CC.uitRijen([], CC.date.vandaag());
    const demo = CC.generate();
    S.club = { ...demo.club, id: 'dcg', naam: 'RKSV DCG', ingericht: { seizoen: true, vakanties: true, regels: true, rollen: true, modules: true } };
    S.teams = [{ id: 'O12-1', naam: 'O12 talententeam', cat: 'O12', type: 'selectie', rooster: [], afwijking: {}, trainerId: 'p-beheer', teamleiderId: 'p-tl1' }];
    const p = (id, naam, email, rollen) => ({ id, naam, email, tel: '', rollen });
    S.people = [
      p('p-beheer', 'Sofian Abayahya', 'admin@test.nl', [{ rol: 'trainer', teamId: 'O12-1' }, { rol: 'ouder' }, { rol: 'hjo' }, { rol: 'beheerder' }]),
      p('p-tl1', 'Inge van den Berg-Oosterhuis', 'inge.vandenberg.oosterhuis@hotmail.com', [{ rol: 'teamleider', teamId: 'O12-1' }]),
      p('p-tl2', 'Karim Amrani', 'karim@test.nl', [{ rol: 'teamleider', teamId: 'O12-1' }, { rol: 'ouder' }]),
      p('p-o1', 'Amin Tahiri', 'amin@test.nl', [{ rol: 'ouder' }]),
      p('p-o2', 'Fatima Tahiri', 'fatima@test.nl', [{ rol: 'ouder' }]),
    ];
    const kind = (id, voornaam, achternaam, ouders) => ({ id, voornaam, achternaam, teamId: 'O12-1', ouders, bondsnummer: null });
    S.players = [kind('s1', 'Yassin', 'Abayahya', ['p-beheer']), kind('s2', 'Tahsin', 'Tahiri', ['p-o1', 'p-o2']), kind('s3', 'Rayan', 'Amrani', ['p-tl2']), kind('s4', 'Jack', 'de Wit', [])];
    return S;
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = { kleineClub }; else root.kleineClub = kleineClub;
})(typeof window !== 'undefined' ? window : globalThis);
