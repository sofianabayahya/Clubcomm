// ClubComm prototype — demodata en rekenregels (aanwezigheid, kaarten, zones, signalen).
// Alles volgt docs/besluiten.md. Data staat in localStorage; bij een nieuwe dag wordt de demo opnieuw gemaakt,
// zodat "vandaag" altijd klopt.
(function () {
  const CC = (window.CC = window.CC || {});

  // ---------- Datums ----------
  const DAG = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  const DAG_KORT = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
  const MAAND = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
  const vandaag = () => iso(new Date());
  const start = (act) => { const d = parse(act.datum); const [h, m] = act.tijd.split(':').map(Number); d.setHours(h, m, 0, 0); return d; };
  const dagen = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
  // Weeknummer volgens de kalender (ISO): een week loopt van maandag tot en met zondag
  const weeknr = (s) => { const d = parse(s); d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7)); const jan4 = new Date(d.getFullYear(), 0, 4); return 1 + Math.round(((d - jan4) / 864e5 - 3 + ((jan4.getDay() + 6) % 7)) / 7); };
  CC.date = { DAG, DAG_KORT, MAAND, iso, parse, addDays, vandaag, start, dagen, weeknr,
    kort: (s) => { const d = parse(s); return `${DAG_KORT[d.getDay()]} ${d.getDate()} ${MAAND[d.getMonth()]}`; },
    lang: (s) => { const d = parse(s); return `${DAG[d.getDay()]} ${d.getDate()} ${MAAND[d.getMonth()]}`; },
    relatief: (s) => { const n = dagen(vandaag(), s); if (n === 0) return 'Vandaag'; if (n === 1) return 'Morgen'; if (n === -1) return 'Gisteren'; return CC.date.kort(s); },
    tijdstip: (t) => { const d = new Date(t); const n = dagen(iso(d), vandaag()); const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`; return n === 0 ? hm : n === 1 ? `gisteren ${hm}` : `${d.getDate()} ${MAAND[d.getMonth()]}`; },
  };

  // ---------- Vaste lijsten ----------
  CC.REDENEN = [
    ['Ziek', 'thermometer'], ['Blessure', 'bandage'], ['School/huiswerk', 'graduation-cap'], ['Vakantie', 'plane'],
    ['Familie', 'heart'], ['Andere sport', 'dumbbell'], ['Overig', 'ellipsis'],
  ];
  CC.TAAKSOORTEN = ['Trainer-coach', 'Timekeeper', 'Spelbegeleider', 'Vlagger', 'Scheidsrechter', 'Fotograaf', 'Bardienst', 'Wastas'];
  // Vaste taken bij elke wedstrijd, per leeftijd (Besluit 33 en 35); de club kan de lijsten aanpassen.
  // Tot en met O12: spelbegeleider (alleen thuis). Vanaf O13: vlagger (elke wedstrijd) en scheidsrechter (alleen thuis).
  CC.VASTE_TAKEN = { pupillen: ['Trainer-coach', 'Timekeeper', 'Spelbegeleider'], junioren: ['Trainer-coach', 'Vlagger', 'Scheidsrechter'] };
  CC.ALLEEN_THUIS = ['Spelbegeleider', 'Scheidsrechter'];
  CC.vasteTakenVoor = (S, team) => { const n = parseInt(String((team || {}).cat || '').replace(/\D/g, ''), 10) || 0; const v = S.club.vasteTaken || CC.VASTE_TAKEN; return Array.isArray(v) ? v : v[n >= 13 ? 'junioren' : 'pupillen']; };
  CC.VAARDIGHEDEN = {
    mini: ['Plezier', 'Balgevoel'],
    o8: ['Passen', 'Aannemen', 'Dribbelen', 'Schieten', 'Inzet'],
    o11: ['Passen', 'Aannemen', 'Dribbelen', 'Schieten', 'Positie kiezen', 'Overzicht', 'Samenwerken'],
    o13: ['Techniek', 'Tactiek', 'Fysiek', 'Mentaal', 'Sociaal'],
  };
  CC.categorie = (cat) => {
    const n = parseInt(cat.replace(/\D/g, ''), 10);
    // duur = speeltijd van de wedstrijd in minuten; blokMin = advies: wisselen per blok (Besluit 39)
    if (n <= 7) return { naam: "Mini's", vorm: '4 tegen 4', key: 'v4', opVeld: 4, duur: 40, blokken: 4, blokMin: 10, schaal: 'mini', vaardig: CC.VAARDIGHEDEN.mini };
    if (n <= 10) return { naam: 'Onderbouw', vorm: '6 tegen 6', key: 'v6', opVeld: 6, duur: 50, blokken: 4, blokMin: 12.5, schaal: 'smiley', vaardig: CC.VAARDIGHEDEN.o8 };
    if (n <= 12) return { naam: 'Onderbouw', vorm: '8 tegen 8', key: 'v8', opVeld: 8, duur: 60, blokken: 4, blokMin: 15, schaal: '1-5', vaardig: CC.VAARDIGHEDEN.o11 };
    return { naam: 'Middenbouw', vorm: '11 tegen 11', key: 'v11', opVeld: 11, duur: 70, blokken: 4, blokMin: 17.5, schaal: '1-5', vaardig: CC.VAARDIGHEDEN.o13 };
  };

  // ---------- Demo genereren ----------
  function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  const VOORNAMEN = ['Lucas', 'Sem', 'Noah', 'Levi', 'Finn', 'Daan', 'Mees', 'Liam', 'Luuk', 'Bram', 'Milan', 'Jesse', 'Thijs', 'Adam', 'Mohammed', 'Sven', 'Ruben', 'Gijs', 'Olivier', 'Max', 'Julian', 'Siem', 'Boaz', 'Hugo', 'Ayoub', 'Yusuf', 'Omar', 'Teun', 'Jens', 'Stijn', 'Emma', 'Julia', 'Mila', 'Tess', 'Sophie', 'Zoë', 'Nora', 'Sara', 'Yara', 'Lina', 'Fleur', 'Lotte'];
  const MEIDEN = ['Emma', 'Julia', 'Mila', 'Tess', 'Sophie', 'Zoë', 'Nora', 'Sara', 'Yara', 'Lina', 'Fleur', 'Lotte', 'Isa', 'Evi', 'Noor', 'Saar', 'Anna', 'Liv'];
  const ACHTERNAMEN = ['de Jong', 'Jansen', 'de Vries', 'van den Berg', 'van Dijk', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks', 'van Leeuwen', 'Dekker', 'Brouwer', 'de Wit', 'Dijkstra', 'Smits', 'El Idrissi', 'Yilmaz', 'Kaya', 'Boukhari', 'Pinas', 'Wong', 'Kramer', 'Schouten', 'van Vliet', 'Postma'];
  const OUDERNAMEN = ['Sanne', 'Mark', 'Linda', 'Peter', 'Anouk', 'Jeroen', 'Marieke', 'Rob', 'Fatima', 'Kees', 'Esther', 'Bas', 'Nadia', 'Tom', 'Iris', 'Hasan', 'Eva', 'Michiel', 'Samira', 'Joost', 'Lisa', 'Dennis', 'Petra', 'Ahmed', 'Karin', 'Wouter', 'Mirjam', 'Rik', 'Laura', 'Erik'];
  const TEGENSTANDERS = ['SV Nieuwe Meer', 'FC Amstelland', 'VV Zuidas', 'AVV Bosbaan', 'SC Oeverpad', 'RKV Amstelhoek', 'FC Slotervaart-Oost', 'VV De Kwakel-Noord', 'SV Diemen-Zuid', 'AFC Rivierenbuurt'];

  // Pilot = onderbouw (Besluit 16): mini's t/m O12
  const TEAMS = [
    ['O6-1', 'breedte', 1], ['O7-1', 'breedte', 1], ['O7-2', 'breedte', 1], ['O8-1', 'breedte', 2], ['O8-2', 'breedte', 2],
    ['O9-1', 'breedte', 2], ['O9-2', 'breedte', 2], ['O10-1', 'breedte', 2], ['O10-2', 'breedte', 2], ['O11-1', 'selectie', 2],
    ['O11-2', 'breedte', 2], ['O11-3', 'breedte', 2], ['O12-1', 'selectie', 2], ['O12-2', 'breedte', 2], ['O12-3', 'breedte', 2], ['O12-4', 'breedte', 2],
  ];

  CC.VAKANTIES_NOORD = [
    { id: 'herfst', naam: 'Herfstvakantie', van: '2026-10-11', tot: '2026-10-18', trainen: false },
    { id: 'kerst', naam: 'Kerstvakantie', van: '2026-12-19', tot: '2027-01-03', trainen: false },
    { id: 'voorjaar', naam: 'Voorjaarsvakantie', van: '2027-02-21', tot: '2027-02-28', trainen: false },
    { id: 'mei', naam: 'Meivakantie', van: '2027-04-26', tot: '2027-05-09', trainen: false },
    { id: 'zomer', naam: 'Zomervakantie', van: '2027-07-10', tot: '2027-08-22', trainen: false },
  ];

  CC.WAARSCHUWING = 'Beste ouder van [kind],\n\n[kind] was vandaag niet bij de training van [team], en we hadden geen afmelding ontvangen. Geen probleem, het kan iedereen gebeuren! Wil je in het vervolg [kind] via ClubComm afmelden als hij/zij niet kan? Dat helpt de trainer enorm bij de voorbereiding. Afmelden kan tot [deadline] voor de training.\n\nSportieve groet, [teamleider]';

  CC.generate = function () {
    const R = rng(20260923);
    const pick = (a) => a[Math.floor(R() * a.length)];
    const today = vandaag();
    const now = Date.now();
    let uid = 1; const id = (p) => `${p}${uid++}`;

    const S = {
      v: 8, gen: today,
      club: {
        id: 'scb', naam: 'SC Buitenveldert', regio: 'Noord',
        seizoen: { start: '2026-08-19', eind: '2027-06-05' },
        vakanties: CC.VAKANTIES_NOORD.map((v) => ({ ...v })),
        stops: [{ id: 'goedevrijdag', naam: 'Goede Vrijdag (club dicht)', van: '2027-03-26', tot: '2027-03-26', trainen: false }],
        // Fases volgen de competitie-indeling (jaarplanning onderbouw 2026/27). De kaartenteller begint per fase opnieuw.
        fasen: [{ nr: 1, van: '2026-08-19' }, { nr: 2, van: '2026-10-31' }, { nr: 3, van: '2027-01-20' }, { nr: 4, van: '2027-04-02' }],
        inst: { deadlineTraining: 3, deadlineWedstrijd: 24, waarschuwingen: { breedte: 2, selectie: 1 }, telaat: { breedte: { kort: 3, seizoen: 8 }, selectie: { kort: 2, seizoen: 5 } }, zones: { breedte: { groen: 80, oranje: 75 }, selectie: { groen: 90, oranje: 85 } }, oproepDagen: 2, opnemenUur: 48, waarschuwing: CC.WAARSCHUWING },
        modules: { vervoer: true, taken: true, speeltijd: true, beoordeling: true, beloningen: false },
        labels: { hjo: 'HJO', coordinator: 'Coördinator' }, coordinatorAan: false,
        ingericht: { seizoen: true, vakanties: true, regels: true, rollen: true, modules: false },
      },
      teams: [], people: [], players: [], acts: [], afm: [], pres: {}, lang: [], gesprekken: [], msgs: [],
      vervoer: {}, taken: [], opgave: [], aanm: [], beoord: {}, notities: {}, speeltijd: { min: {}, schema: {}, mogelijk: {} }, wijzigingen: [],
    };

    const person = (naam, extra = {}) => {
      const p = { id: id('p'), naam, email: naam.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '') + '@voorbeeld.nl', tel: '06' + String(10000000 + Math.floor(R() * 89999999)), rollen: [], ...extra };
      S.people.push(p); return p;
    };

    // Vaste demo-accounts
    const sanne = person('Sanne de Vries', { email: 'sanne@voorbeeld.nl', rollen: [{ rol: 'ouder' }] });
    const mark = person('Mark Jansen', { email: 'mark@voorbeeld.nl', rollen: [{ rol: 'trainer', teamId: 'O10-1' }, { rol: 'ouder' }] });
    const linda = person('Linda Bakker', { email: 'linda@voorbeeld.nl', rollen: [{ rol: 'teamleider', teamId: 'O10-1' }, { rol: 'ouder' }] });
    const peter = person('Peter Visser', { email: 'peter@voorbeeld.nl', rollen: [{ rol: 'hjo' }, { rol: 'beheerder' }] });
    S.demo = { sanne: sanne.id, mark: mark.id, linda: linda.id, peter: peter.id };

    const dowToday = parse(today).getDay();
    const t2 = (dowToday + 3) % 7 === 6 ? (dowToday + 2) % 7 : (dowToday + 3) % 7;

    TEAMS.forEach(([naam, type, per], i) => {
      const cat = naam.replace(/-\d+$/, '');
      let dagenT;
      if (naam === 'O10-1') dagenT = [dowToday === 6 ? 5 : dowToday, t2 === 6 ? 4 : t2];
      else dagenT = per >= 2 ? [3, 5] : [3]; // onderbouw traint woensdag en vrijdag (jaarplanning)
      const u = 16 + (i % 2), m = i % 4 < 2 ? '00' : '30';
      const velden = ['Veld 1', 'Veld 2', 'Veld 4A', 'Veld 4B'];
      const team = {
        id: naam, naam, cat, type,
        rooster: dagenT.map((d) => ({ dag: d, tijd: `${pad(u)}:${m}`, eind: `${pad(u + 1)}:${m}`, veld: velden[i % 4] })),
        afwijking: {}, vorig: 78 + Math.floor(R() * 16), trainerId: null, teamleiderId: null,
      };
      S.teams.push(team);
    });
    const T = (n) => S.teams.find((t) => t.id === n);
    T('O10-1').trainerId = mark.id; T('O10-1').teamleiderId = linda.id;
    T('O10-1').rooster.forEach((r) => { r.tijd = '17:00'; r.eind = '18:00'; r.veld = 'Veld 2'; });

    // Staf voor overige teams (sommige ontbreken bewust)
    S.teams.forEach((t) => {
      if (t.id === 'O10-1') return;
      if (t.id !== 'O12-4') { const p = person(`${pick(OUDERNAMEN)} ${pick(ACHTERNAMEN)}`); p.rollen.push({ rol: 'trainer', teamId: t.id }); t.trainerId = p.id; }
      if (!['O9-2', 'O11-3', 'O12-4'].includes(t.id)) { const p = person(`${pick(OUDERNAMEN)} ${pick(ACHTERNAMEN)}`); p.rollen.push({ rol: 'teamleider', teamId: t.id }); t.teamleiderId = p.id; }
    });

    // Spelers en ouders
    const addPlayer = (voornaam, achternaam, teamId, ouder) => {
      const pl = { id: id('s'), voornaam, achternaam, teamId, ouders: [], bondsnummer: null };
      if (!ouder) ouder = person(`${pick(OUDERNAMEN)} ${achternaam}`, { rollen: [{ rol: 'ouder' }] });
      pl.ouders.push(ouder.id);
      if (!ouder.rollen.some((r) => r.rol === 'ouder')) ouder.rollen.push({ rol: 'ouder' });
      S.players.push(pl); return pl;
    };
    const o10 = [
      ['Jesse', 'de Vries', sanne], ['Daan', 'Jansen', mark], ['Noah', 'Bakker', linda], ['Sem', 'Mulder'], ['Liam', 'Smit'], ['Finn', 'de Boer'],
      ['Lucas', 'Meijer'], ['Adam', 'El Idrissi'], ['Levi', 'Bos'], ['Mees', 'Vos'], ['Sven', 'Peters'], ['Omar', 'Yilmaz'],
    ].map(([v, a, o]) => addPlayer(v, a, 'O10-1', o));
    addPlayer('Mila', 'de Vries', 'O8-2', sanne);
    S.teams.forEach((t) => {
      if (t.id === 'O10-1') return;
      const n = parseInt(t.cat.replace(/\D/g, ''), 10) <= 7 ? 8 : parseInt(t.cat.replace(/\D/g, ''), 10) <= 10 ? 10 : parseInt(t.cat.replace(/\D/g, ''), 10) <= 12 ? 12 : 15;
      const namen = t.id.startsWith('MO') ? MEIDEN : VOORNAMEN;
      for (let k = t.id === 'O8-2' ? 1 : 0; k < n; k++) addPlayer(pick(namen), pick(ACHTERNAMEN), t.id);
    });
    // Tweede ouder voor Jesse (bestaat nog niet: komt binnen als aanmelding)

    // ---------- Activiteiten ----------
    const histStart = [S.club.seizoen.start, addDays(today, -49)].sort()[1];
    const eindGen = addDays(today, 56);
    const inVak = (d) => [...S.club.vakanties, ...S.club.stops].find((v) => d >= v.van && d <= v.tot);
    const afgelastDag = addDays(today, -9);
    const ageMin = (cat) => parseInt(cat.replace(/\D/g, ''), 10);
    S.teams.forEach((t, ti) => {
      let thuis = ti % 2 === 0;
      for (let d = histStart; d <= eindGen; d = addDays(d, 1)) {
        const dow = parse(d).getDay();
        const vak = inVak(d);
        t.rooster.forEach((r) => {
          if (r.dag !== dow) return;
          if (vak && !vak.trainen) return;
          S.acts.push({ id: id('a'), teamId: t.id, soort: 'training', datum: d, tijd: r.tijd, eind: r.eind, veld: r.veld, afgelast: d === afgelastDag });
        });
        if (dow === 6 && !vak) {
          const a = ageMin(t.cat);
          const uur = a <= 10 ? 8 + (ti % 3) : a <= 13 ? 10 + (ti % 3) : 12 + (ti % 3);
          const tijd = `${pad(uur)}:${ti % 2 ? '30' : '00'}`;
          const [h, m] = tijd.split(':').map(Number);
          const vz = thuis ? h * 60 + m - 30 : h * 60 + m - 60;
          const tegen = TEGENSTANDERS[(ti + S.acts.length) % TEGENSTANDERS.length];
          S.acts.push({
            id: id('a'), teamId: t.id, soort: 'wedstrijd', datum: d, tijd, eind: `${pad(h + 1)}:${pad(m)}`, thuis, tegen: `${tegen} ${t.cat}-${1 + (ti % 2)}`,
            veld: thuis ? `Veld ${1 + (ti % 4)}` : '', adres: thuis ? 'Sportpark Buitenveldert, De Boelelaan 50, Amsterdam' : `${tegen.replace(/^(SV|FC|VV|AVV|SC|RKV|AFC) /, 'Sportpark ')}, Amstelveen`,
            verzamel: `${pad(Math.floor(vz / 60))}:${pad(vz % 60)}`, tenue: thuis ? 'Thuistenue (wit/blauw)' : 'Uittenue (blauw)', begeleiderId: null, uitslag: null,
          });
          thuis = !thuis;
        }
      }
    });
    S.acts.sort((a, b) => (a.datum + a.tijd).localeCompare(b.datum + b.tijd));

    // Wedstrijdbegeleiders en uitslagen
    S.acts.filter((a) => a.soort === 'wedstrijd').forEach((a) => {
      const t = T(a.teamId);
      if (a.datum < today) { const g = Math.floor(R() * 6), h = Math.floor(R() * 6); a.uitslag = a.thuis ? `${g}-${h}` : `${h}-${g}`; }
    });

    // ---------- Aanwezigheid (verleden) ----------
    const basis = { 'O12-3': 0.22, 'O11-1': 0.15, 'O9-1': 0.2 };
    const redenGewicht = ['Ziek', 'Ziek', 'Blessure', 'School/huiswerk', 'School/huiswerk', 'Vakantie', 'Familie', 'Familie', 'Andere sport', 'Overig'];
    const afmMaken = (pl, a, reden, uurVoor) => {
      const t = new Date(start(a).getTime() - uurVoor * 3600e3);
      S.afm.push({ id: id('f'), spelerId: pl.id, actId: a.id, reden, opm: '', tijd: t.toISOString(), door: pl.ouders[0] });
    };
    S.acts.filter((a) => a.datum < today && !a.afgelast && a.teamId !== 'O10-1').forEach((a) => {
      const spelers = S.players.filter((p) => p.teamId === a.teamId);
      const p0 = basis[a.teamId] || 0.07;
      const rec = {};
      spelers.forEach((pl, k) => {
        const f = p0 * (k % 7 === 3 ? 1.8 : k % 3 === 0 ? 1.0 : 0.7);
        const r = R();
        if (r < f) {
          const r2 = R();
          if (r2 < 0.1) rec[pl.id] = 'x';
          else { rec[pl.id] = 'x'; afmMaken(pl, a, pick(redenGewicht), r2 < 0.2 ? 1 : 26 + Math.floor(R() * 40)); }
        } else rec[pl.id] = R() < 0.04 ? 'l' : 'a';
      });
      S.pres[a.id] = { s: rec, door: T(a.teamId).trainerId, tijd: start(a).toISOString() };
    });

    // O10-1: vaste verhalen (zie docs/besluiten.md, Besluit 5 en 10)
    const pO = (n) => o10.find((p) => p.voornaam === n);
    const verleden = S.acts.filter((a) => a.teamId === 'O10-1' && a.datum < today && !a.afgelast);
    const trainT2 = verleden.filter((a) => a.soort === 'training' && parse(a.datum).getDay() === T('O10-1').rooster[1].dag);
    const finnVan = addDays(today, -15);
    S.lang.push({ id: id('l'), spelerId: pO('Finn').id, reden: 'Blessure', opm: 'Gebroken pols, gips tot half oktober', van: finnVan, tot: addDays(today, 20), door: pO('Finn').ouders[0], gemeld: new Date(parse(finnVan).getTime() + 10 * 3600e3).toISOString() });
    verleden.forEach((a, idx) => {
      const rec = {};
      o10.forEach((pl) => { rec[pl.id] = 'a'; });
      // Finn: langdurig afwezig
      if (a.datum >= finnVan) rec[pO('Finn').id] = 'x';
      // Jesse: vaak afwezig op de tweede trainingsdag (Andere sport), één keer te laat afgemeld
      const ti = trainT2.indexOf(a);
      if (ti >= trainT2.length - 3 && ti >= 0) {
        rec[pO('Jesse').id] = 'x';
        afmMaken(pO('Jesse'), a, 'Andere sport', ti === trainT2.length - 2 ? 1 : 30);
      }
      // Noah: reeks korte blessuremeldingen
      if (a.datum >= addDays(today, -20) && a.soort === 'training' && idx % 2 === 0) { rec[pO('Noah').id] = 'x'; afmMaken(pO('Noah'), a, 'Blessure', 20); }
      // Liam: vaak te laat
      if (a.soort === 'training' && idx % 3 === 2) rec[pO('Liam').id] = 'l';
      // Adam en Levi: incidenteel, netjes afgemeld
      if (idx === 2) { rec[pO('Adam').id] = 'x'; afmMaken(pO('Adam'), a, 'Ziek', 28); }
      if (idx === 5) { rec[pO('Levi').id] = 'x'; afmMaken(pO('Levi'), a, 'Familie', 50); }
      S.pres[a.id] = { s: rec, door: a.soort === 'wedstrijd' ? linda.id : mark.id, tijd: start(a).toISOString() };
    });
    // Sem: niet afgemeld + niet gekomen (2×) en één keer te laat afgemeld
    const semActs = verleden.filter((a) => a.soort === 'training').slice(-7);
    if (semActs.length >= 7) {
      S.pres[semActs[0].id].s[pO('Sem').id] = 'x';
      S.pres[semActs[3].id].s[pO('Sem').id] = 'x'; afmMaken(pO('Sem'), semActs[3], 'Overig', 1);
      S.pres[semActs[6].id].s[pO('Sem').id] = 'x';
    }
    S.gesprekken = [];

    // ---------- Komende activiteiten O10-1 ----------
    const komend = S.acts.filter((a) => a.teamId === 'O10-1' && a.datum >= today && !a.afgelast);
    const eersteTraining = komend.find((a) => a.soort === 'training');
    const wedstrijden = komend.filter((a) => a.soort === 'wedstrijd');
    // zorg dat de eerste wedstrijd een uitwedstrijd is (vervoer)
    if (wedstrijden[0] && wedstrijden[0].thuis) {
      wedstrijden.forEach((w) => { w.thuis = !w.thuis; w.veld = w.thuis ? 'Veld 2' : ''; w.adres = w.thuis ? 'Sportpark Buitenveldert, De Boelelaan 50, Amsterdam' : 'Sportpark Nieuwe Meer, Amstelveen'; w.tenue = w.thuis ? 'Thuistenue (wit/blauw)' : 'Uittenue (blauw)'; const [h, m] = w.tijd.split(':').map(Number); const vz = w.thuis ? h * 60 + m - 30 : h * 60 + m - 60; w.verzamel = `${pad(Math.floor(vz / 60))}:${pad(vz % 60)}`; });
    }
    const w1 = wedstrijden[0], w2 = wedstrijden[1];
    if (eersteTraining) afmMaken(pO('Noah'), eersteTraining, 'Blessure', 30);
    if (w1) {
      afmMaken(pO('Sem'), w1, 'Familie', 72);
      const ouder = (n) => pO(n).ouders[0];
      S.vervoer[w1.id] = { aanbod: [{ personId: linda.id, plekken: 3 }, { personId: ouder('Lucas'), plekken: 3 }], plek: {} };
      S.vervoer[w1.id].plek[pO('Noah').id] = linda.id; S.vervoer[w1.id].plek[pO('Levi').id] = linda.id; S.vervoer[w1.id].plek[pO('Mees').id] = linda.id;
      S.vervoer[w1.id].plek[pO('Lucas').id] = ouder('Lucas'); S.vervoer[w1.id].plek[pO('Adam').id] = ouder('Lucas');
      // Twee ouders kunnen zelf niet rijden en vragen om een plek
      S.vervoer[w1.id].vraag = { [pO('Daan').id]: { door: ouder('Daan'), tijd: new Date().toISOString() }, [pO('Sven').id]: { door: ouder('Sven'), tijd: new Date().toISOString() } };
      S.taken.push({ id: id('t'), actId: w1.id, soort: 'Wastas', personId: pO('Omar').ouders[0] });
      S.taken.push({ id: id('t'), actId: w1.id, soort: 'Fotograaf', personId: null });
    }
    if (w2) {
      S.taken.push({ id: id('t'), actId: w2.id, soort: 'Trainer-coach', personId: null });
      S.taken.push({ id: id('t'), actId: w2.id, soort: 'Bardienst', personId: pO('Sven').ouders[0] });
      S.taken.push({ id: id('t'), actId: w2.id, soort: 'Spelbegeleider', personId: null });
    }
    // Wie helpt vaak? (historie van taken)
    verleden.filter((a) => a.soort === 'wedstrijd').forEach((a, k) => {
      S.taken.push({ id: id('t'), actId: a.id, soort: 'Spelbegeleider', personId: [pO('Lucas').ouders[0], linda.id, pO('Omar').ouders[0]][k % 3] });
      S.taken.push({ id: id('t'), actId: a.id, soort: 'Wastas', personId: [pO('Omar').ouders[0], pO('Mees').ouders[0]][k % 2] });
    });

    // Speeltijd: minuten tot nu toe
    // Speeltijd tot nu toe: mogelijk = 48 min per bijgewoonde wedstrijd; gespeeld ongeveer 65–80% daarvan
    S.speeltijd.mogelijk = {};
    o10.forEach((pl, k) => {
      const wed = verleden.filter((a) => a.soort === 'wedstrijd' && ['a', 'l'].includes((S.pres[a.id] || { s: {} }).s[pl.id])).length;
      S.speeltijd.mogelijk[pl.id] = wed * 48; S.speeltijd.min[pl.id] = Math.round(wed * 48 * (0.65 + ((k * 7) % 16) / 100));
    });

    // Beoordelingen (fase 1 deels ingevuld)
    const vaardig = CC.categorie('O10').vaardig;
    o10.slice(0, 7).forEach((pl, k) => { S.beoord[pl.id] = { m1: { scores: Object.fromEntries(vaardig.map((v, j) => [v, 1 + ((k + j) % 3)])), goed: '', werken: '' } }; });
    S.notities[pO('Jesse').id] = [{ tekst: 'Sterk aan de bal, durft meer te vragen. Mist vaak de tweede training.', tijd: new Date(now - 6 * 864e5).toISOString(), door: mark.id }];

    // ---------- Aanmeldingen ----------
    S.aanm.push({ id: id('m'), teamId: 'O10-1', email: 'tom.devries@voorbeeld.nl', ouderNaam: 'Tom de Vries', kindVoor: 'Jesse', kindAchter: 'de Vries', tijd: new Date(now - 5 * 3600e3).toISOString(), status: 'open' });
    S.aanm.push({ id: id('m'), teamId: 'O10-1', email: 'n.elamrani@voorbeeld.nl', ouderNaam: 'Nadia El Amrani', kindVoor: 'Yara', kindAchter: 'El Amrani', tijd: new Date(now - 20 * 3600e3).toISOString(), status: 'open' });
    S.aanm.push({ id: id('m'), teamId: 'O9-2', email: 'j.pinas@voorbeeld.nl', ouderNaam: 'Joost Pinas', kindVoor: 'Boaz', kindAchter: 'Pinas', tijd: new Date(now - 60 * 3600e3).toISOString(), status: 'open' });

    // ---------- Berichten ----------
    const msg = (o) => S.msgs.push({ id: id('b'), gelezen: [], antw: [], urgent: false, gepland: null, ...o });
    const ouders = (teamId) => [...new Set(S.players.filter((p) => p.teamId === teamId).flatMap((p) => p.ouders))];
    const allen = S.people.map((p) => p.id);
    msg({ van: peter.id, soort: 'nieuws', bereik: 'Hele club', onderwerp: 'Welkom in seizoen 2026/2027', tekst: 'Beste leden en ouders,\n\nWelkom in het nieuwe seizoen! Vanaf dit seizoen gebruiken we ClubComm voor afmelden, planning en berichten. Zet de app op je beginscherm en zet meldingen aan, dan mis je niets.\n\nSportieve groet,\nPeter Visser, HJO', tijd: new Date(now - 26 * 864e5).toISOString(), ontvangers: allen, gelezen: allen.filter((_, k) => k % 5 !== 0 && k % 7 !== 0) });
    msg({ van: peter.id, soort: 'nieuws', bereik: 'Hele club', onderwerp: 'Zo werkt afmelden en de kaarten', tekst: 'Beste ouders,\n\nVanaf dit seizoen meldt u uw kind af in ClubComm, bij de training of wedstrijd zelf. Tik bij "Wat betekenen de kaarten?" voor de stappen: herinneren, waarschuwen, bellen of appen en een gesprek. De eerste keer krijgt u altijd een vriendelijke herinnering.\n\nVragen? Stuur mij een persoonlijk bericht.\nPeter Visser, HJO', tijd: new Date(now - 2 * 864e5).toISOString(), ontvangers: allen, gelezen: allen.filter((_, k) => k % 3 === 1), vastTot: new Date(now + 12 * 864e5).toISOString() });
    msg({ van: linda.id, soort: 'nieuws', bereik: 'O10-1', vastTot: new Date(now + 5 * 864e5).toISOString(), onderwerp: 'Teamfoto zaterdag', tekst: 'Zaterdag maken we voor de wedstrijd de teamfoto. Graag allemaal in het thuistenue en op tijd!', tijd: new Date(now - 2 * 864e5).toISOString(), ontvangers: ouders('O10-1'), gelezen: ouders('O10-1').slice(0, 8) });
    msg({ van: mark.id, soort: 'persoonlijk', bereik: 'Sanne de Vries', onderwerp: 'Jesse en de tweede training', tekst: `Hoi Sanne, ik zie dat Jesse de laatste weken op ${DAG[T('O10-1').rooster[1].dag]} vaak niet kan. Is dat een vaste andere sport? Dan kunnen we even kijken wat handig is. Groet, Mark`, tijd: new Date(now - 3 * 3600e3).toISOString(), ontvangers: [sanne.id], urgent: false });
    msg({ van: peter.id, soort: 'nieuws', bereik: 'Hele club', onderwerp: 'Nog 3 weken tot de herfstvakantie', tekst: 'In de herfstvakantie (10 t/m 18 oktober) wordt er niet getraind. Wedstrijden gaan wel door volgens het programma.', tijd: new Date(now + 7 * 864e5).toISOString(), gepland: new Date(now + 7 * 864e5).toISOString(), ontvangers: allen });
    msg({ van: sanne.id, soort: 'persoonlijk', bereik: 'Mark Jansen', onderwerp: 'Re: training', tekst: 'Hoi Mark, Jesse heeft op die dag zwemles. Ik laat het weten zodra dat verandert!', tijd: new Date(now - 30 * 864e5).toISOString(), ontvangers: [mark.id], gelezen: [mark.id] });
    msg({ van: 'systeem', soort: 'melding', bereik: 'Linda Bakker', onderwerp: 'Planning gewijzigd door de trainer', tekst: `Mark Jansen heeft een oefenwedstrijd toegevoegd voor O10-1. Ter informatie, je hoeft niets te doen.`, tijd: new Date(now - 4 * 864e5).toISOString(), ontvangers: [linda.id, peter.id] });
    S.wijzigingen.push({ id: id('w'), teamId: 'O10-1', door: mark.id, tekst: 'Oefenwedstrijd toegevoegd', tijd: new Date(now - 4 * 864e5).toISOString() });
    S.wijzigingen.push({ id: id('w'), teamId: 'O12-1', door: T('O12-1').trainerId, tekst: 'Training verplaatst naar veld 4', tijd: new Date(now - 1 * 864e5).toISOString() });

    return S;
  };

  // ---------- Rekenregels ----------
  const M = (CC.m = {});
  M.team = (S, id) => S.teams.find((t) => t.id === id);
  M.persoon = (S, id) => S.people.find((p) => p.id === id);
  M.speler = (S, id) => S.players.find((p) => p.id === id);
  M.act = (S, id) => S.acts.find((a) => a.id === id);
  M.spelers = (S, teamId) => S.players.filter((p) => p.teamId === teamId).sort((a, b) => a.voornaam.localeCompare(b.voornaam));
  M.naam = (S, pl) => `${pl.voornaam} ${pl.achternaam}`;
  M.inst = (S, teamId) => ({ ...S.club.inst, ...((teamId && M.team(S, teamId).afwijking) || {}) });

  // Vaste taken aanvullen voor komende wedstrijden (vaste id's, dus nooit dubbel)
  M.vulVasteTaken = (S) => {
    if (!S.club.modules || !S.club.modules.taken) return;
    const nu = vandaag();
    S.acts.forEach((a) => {
      if (!M.isWed(a) || a.afgelast || a.datum < nu) return;
      const t = S.teams.find((x) => x.id === a.teamId) || {};
      CC.vasteTakenVoor(S, t).forEach((soort) => {
        if ((CC.ALLEEN_THUIS.includes(soort) && !a.thuis) || (a.zonderTaken || []).includes(soort)) return;
        if (S.taken.some((x) => x.actId === a.id && x.soort === soort)) return;
        S.taken.push({ id: `v-${a.id}-${soort.toLowerCase().replace(/[^a-z]/g, '')}`, actId: a.id, soort, personId: soort === 'Trainer-coach' ? t.trainerId || null : null });
      });
    });
  };
  // Wie doet wat op de wedstrijddag: de trainer-coach vult de aanwezigheid in, de timekeeper doet de wissels
  M.taakVan = (S, a, soort) => { const t = S.taken.find((x) => x.actId === a.id && x.soort === soort); return t ? t.personId : null; };
  M.coachVan = (S, a) => M.taakVan(S, a, 'Trainer-coach') || (M.team(S, a.teamId) || {}).trainerId || null;
  // Wedstrijd of oefenwedstrijd? (een 'activiteit' zoals zaalvoetbal of een uitje telt als training)
  M.isWed = (a) => a.soort === 'wedstrijd' || a.soort === 'oefen';
  M.acts = (S, teamId, van, tot) => S.acts.filter((a) => a.teamId === teamId && (!van || a.datum >= van) && (!tot || a.datum <= tot));
  M.komend = (S, teamId, n) => { const nu = Date.now(); return S.acts.filter((a) => a.teamId === teamId && start(a).getTime() + 90 * 6e4 > nu).slice(0, n || 999); };
  M.afm = (S, spelerId, actId) => S.afm.find((f) => f.spelerId === spelerId && f.actId === actId);
  M.lang = (S, spelerId, datum) => S.lang.find((l) => l.spelerId === spelerId && datum >= l.van && datum <= l.tot);
  M.deadline = (S, act) => { const i = M.inst(S, act.teamId); return new Date(start(act).getTime() - (act.soort === 'wedstrijd' ? i.deadlineWedstrijd : i.deadlineTraining) * 3600e3); };
  M.deadlineTekst = (S, act) => { const i = M.inst(S, act.teamId); const u = act.soort === 'wedstrijd' ? i.deadlineWedstrijd : i.deadlineTraining; const d = M.deadline(S, act); return u >= 24 ? `${CC.date.kort(iso(d))} ${pad(d.getHours())}:${pad(d.getMinutes())}` : `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  M.teLaatAfgemeld = (S, f, act) => !act.opgave && new Date(f.tijd) > M.deadline(S, act);

  // status van een speler bij een activiteit
  M.status = (S, pl, act) => {
    const p = S.pres[act.id];
    const f = M.afm(S, pl.id, act.id);
    const l = M.lang(S, pl.id, act.datum);
    if (act.afgelast) return { code: 'afgelast' };
    if (p && p.s[pl.id]) {
      const v = p.s[pl.id];
      if (v === 'a') return { code: 'aanwezig', afm: f };
      if (v === 'l') return { code: 'telaat', afm: f };
      if (l) return { code: 'langdurig', lang: l };
      if (f) return { code: 'afgemeld', afm: f, laat: M.teLaatAfgemeld(S, f, act) };
      return { code: 'nietafgemeld' };
    }
    if (l) return { code: 'langdurig', lang: l };
    // Activiteit met opgave (Besluit 36): ja = komt, nee = afgemeld, nog niets = open
    if (act.opgave) { if (f) return { code: 'afgemeld', afm: f, laat: false }; return (S.opgave || []).some((o) => o.actId === act.id && o.spelerId === pl.id) ? { code: 'verwacht', opgave: true } : { code: 'open' }; }
    if (f) return { code: 'afgemeld', afm: f, laat: M.teLaatAfgemeld(S, f, act) };
    return { code: 'verwacht' };
  };

  // fases (competitie-indeling van de club; kaarten en zones tellen per fase)
  M.blokken = (S) => {
    const f = [...S.club.fasen].sort((a, b) => a.van.localeCompare(b.van));
    return f.map((x, k) => ({ nr: k + 1, naam: `Fase ${k + 1}`, van: x.van, tot: k < f.length - 1 ? addDays(f[k + 1].van, -1) : S.club.seizoen.eind }));
  };
  M.blok = (S, datum) => M.blokken(S).find((b) => datum >= b.van && datum <= b.tot) || M.blokken(S)[0];
  M.periode = (S, soort) => soort === 'seizoen' ? { van: S.club.seizoen.start, tot: vandaag() } : { van: M.blok(S, vandaag()).van, tot: vandaag() };

  M.stats = (S, pl, per) => {
    const acts = M.acts(S, pl.teamId, per.van, per.tot).filter((a) => !a.afgelast && !a.opgave && S.pres[a.id] && S.pres[a.id].s[pl.id]);
    const r = { totaal: 0, aanwezig: 0, telaat: 0, afwezig: 0, redenen: {}, lang: 0, niet: 0, lijst: [], tr: { tot: 0, aan: 0 }, wed: { tot: 0, aan: 0 } };
    acts.forEach((a) => {
      const st = M.status(S, pl, a); r.totaal++; r.lijst.push({ act: a, st });
      // apart bijhouden: trainingen en wedstrijden (Besluit 34)
      const soort = M.isWed(a) ? r.wed : r.tr; soort.tot++; if (['aanwezig', 'telaat'].includes(st.code)) soort.aan++;
      if (st.code === 'aanwezig') r.aanwezig++;
      else if (st.code === 'telaat') { r.aanwezig++; r.telaat++; }
      else {
        r.afwezig++;
        const reden = st.code === 'langdurig' ? `Langdurig (${st.lang.reden.toLowerCase()})` : st.code === 'afgemeld' ? st.afm.reden : 'Niet afgemeld';
        if (st.code === 'langdurig') r.lang++;
        if (st.code === 'nietafgemeld') r.niet++;
        r.redenen[reden] = (r.redenen[reden] || 0) + 1;
      }
    });
    r.pct = r.totaal ? Math.round((100 * r.aanwezig) / r.totaal) : null;
    r.pctTr = r.tr.tot ? Math.round((100 * r.tr.aan) / r.tr.tot) : null; r.pctWed = r.wed.tot ? Math.round((100 * r.wed.aan) / r.wed.tot) : null;
    return r;
  };
  M.zone = (S, pct, teamId) => {
    if (pct == null) return 'grijs';
    const t = M.team(S, teamId); const z = (M.inst(S, teamId).zones || S.club.inst.zones)[t.type];
    return pct >= z.groen ? 'groen' : pct >= z.oranje ? 'oranje' : 'rood';
  };
  M.teamStats = (S, teamId, per) => {
    const sp = M.spelers(S, teamId).map((pl) => ({ pl, st: M.stats(S, pl, per) }));
    const tot = sp.reduce((s, x) => s + x.st.totaal, 0), aan = sp.reduce((s, x) => s + x.st.aanwezig, 0);
    const redenen = {}; sp.forEach((x) => Object.entries(x.st.redenen).forEach(([k, v]) => { redenen[k] = (redenen[k] || 0) + v; }));
    return { pct: tot ? Math.round((100 * aan) / tot) : null, spelers: sp, redenen, telaat: sp.reduce((s, x) => s + x.st.telaat, 0) };
  };

  // Kaartregels (Besluit 32), per soort team; de club kan ze aanpassen
  M.KAART_STD = { waarschuwingen: { breedte: 2, selectie: 1 }, telaat: { breedte: { kort: 3, seizoen: 8 }, selectie: { kort: 2, seizoen: 5 } } };
  M.kaartRegels = (S, teamId) => {
    const i = M.inst(S, teamId); const type = (teamId && M.team(S, teamId).type) === 'selectie' ? 'selectie' : 'breedte';
    const w = (i.waarschuwingen || M.KAART_STD.waarschuwingen)[type]; const tl = (i.telaat || M.KAART_STD.telaat)[type];
    return { type, waarschuwingen: w ?? M.KAART_STD.waarschuwingen[type], telaat: { ...M.KAART_STD.telaat[type], ...(tl || {}) } };
  };
  M.seizoen = (S) => ({ van: S.club.seizoen.start, tot: vandaag() });

  // Kaarten over het hele seizoen (afmeldgedrag). Te laat komen is geen kaart meer (zie M.teLaat).
  // - de eerste 1 (selectie) of 2 (breedte) keer: vriendelijke herinnering
  // - te laat afgemeld: gele kaart; twee gele kaarten = rode kaart
  // - niet afgemeld en niet gekomen: direct rode kaart
  // - te laat afgemeld wegens ziekte telt niet (kinderen worden op de dag zelf ziek)
  // - "geaccepteerd": de trainer/HJO legde na de kaart vast dat het begrijpelijk was; de kaart blijft zichtbaar maar telt niet voor de volgende stap
  M.kaarten = (S, pl) => {
    const r = M.kaartRegels(S, pl.teamId); const sz = M.seizoen(S);
    const ev = [];
    M.acts(S, pl.teamId, sz.van, sz.tot).filter((a) => !a.afgelast && !a.opgave).forEach((a) => {
      const st = M.status(S, pl, a);
      if (st.code === 'afgemeld' && st.laat && st.afm.reden !== 'Ziek') ev.push({ act: a, soort: 'laat', wat: 'Te laat afgemeld' });
      if (st.code === 'nietafgemeld') ev.push({ act: a, soort: 'niet', wat: 'Niet afgemeld en niet gekomen' });
    });
    const log = S.gesprekken.filter((g) => g.spelerId === pl.id && g.datum >= sz.van).sort((x, y) => x.datum.localeCompare(y.datum));
    let n = 0, geelOpen = 0;
    ev.forEach((e) => {
      n++;
      if (n <= r.waarschuwingen) { e.kaart = 'herinnering'; e.waarschuwing = true; e.laatsteHerinnering = n === r.waarschuwingen; return; }
      if (e.soort === 'niet') e.kaart = 'rood';
      else if (geelOpen) { e.kaart = 'rood'; e.tweedeGeel = true; geelOpen = 0; } else { e.kaart = 'geel'; geelOpen = 1; }
      const eerste = log.find((g) => g.datum >= e.act.datum);
      e.geaccepteerd = e.kaart === 'rood' && !!eerste && eerste.soort === 'geaccepteerd';
    });
    const tel = (k) => ev.filter((e) => e.kaart === k).length;
    return { ev, geel: tel('geel'), rood: tel('rood'), herinneringen: Math.min(n, r.waarschuwingen), max: r.waarschuwingen, regels: r };
  };

  // Te laat komen: geen kaart, wel twee signalen (kort en vaak, of structureel over het seizoen)
  M.teLaat = (S, pl) => {
    const r = M.kaartRegels(S, pl.teamId); const sz = M.seizoen(S); const grens = addDays(vandaag(), -28);
    const keer = M.acts(S, pl.teamId, sz.van, sz.tot).filter((a) => !a.afgelast && S.pres[a.id] && S.pres[a.id].s[pl.id] === 'l');
    const kort = keer.filter((a) => a.datum >= grens).length;
    return { seizoen: keer.length, kort, signaal: kort >= r.telaat.kort ? 'kort' : keer.length >= r.telaat.seizoen ? 'seizoen' : null, regels: r.telaat };
  };

  // signalen voor een persoon/rol
  M.signalen = (S, teamIds, voorHjo) => {
    const res = [];
    const per = M.periode(S, 'blok');
    teamIds.forEach((tid) => {
      const t = M.team(S, tid);
      const ts = M.teamStats(S, tid, per);
      const tz = M.zone(S, ts.pct, tid);
      if (voorHjo && ['oranje', 'rood'].includes(tz)) res.push({ soort: 'team', niveau: tz, teamId: tid, tekst: `${t.naam}: teamgemiddelde ${ts.pct}% (${t.type})`, sub: 'Waarschijnlijk iets in het team: tijd, trainer of sfeer?', ernst: 100 - (ts.pct || 0) });
      ts.spelers.forEach(({ pl, st }) => {
        const z = M.zone(S, st.pct, tid);
        const naam = M.naam(S, pl);
        const lang = S.lang.find((l) => l.spelerId === pl.id && l.tot >= vandaag());
        if (lang) res.push({ soort: 'lang', niveau: 'info', teamId: tid, spelerId: pl.id, tekst: `${naam}: langdurig afwezig (${lang.reden.toLowerCase()})`, sub: `Tot ongeveer ${CC.date.kort(lang.tot)}${lang.opm && (!CC.zicht || CC.zicht('toelichting')) ? ' · ' + lang.opm : ''}`, ernst: 0, sleutelExtra: lang.id });
        if (z === 'rood' && tz !== 'rood' && !lang) {
          const top = Object.entries(st.redenen).sort((a, b) => b[1] - a[1])[0];
          res.push({ soort: 'speler', niveau: 'rood', teamId: tid, spelerId: pl.id, tekst: `${naam}: ${st.pct}% (team: ${ts.pct}%)`, sub: top ? `${st.afwezig}× afwezig, waarvan ${top[1]}× ${top[0].toLowerCase()}` : '', ernst: st.afwezig });
        } else if (z === 'oranje' && tz === 'groen' && !lang) {
          res.push({ soort: 'speler', niveau: 'oranje', teamId: tid, spelerId: pl.id, tekst: `${naam}: ${st.pct}% (team: ${ts.pct}%)`, sub: 'Let op: nog geen rood, een gesprek kan nu preventief zijn.', ernst: st.afwezig });
        }
        // patroon: afwezig op vaste dag
        const afw = st.lijst.filter((x) => !['aanwezig', 'telaat', 'langdurig'].includes(x.st.code));
        if (afw.length >= 3) {
          const per = {}; afw.forEach((x) => { const d = parse(x.act.datum).getDay(); per[d] = (per[d] || 0) + 1; });
          const [dag, n] = Object.entries(per).sort((a, b) => b[1] - a[1])[0];
          if (n >= 3 && n / afw.length >= 0.6) res.push({ soort: 'patroon', niveau: 'oranje', teamId: tid, spelerId: pl.id, tekst: `${naam}: vooral afwezig op ${DAG[dag]}`, sub: `${n} van de ${afw.length} keer afwezig op ${DAG[dag]}`, ernst: n, sleutelExtra: 'dag' + dag });
        }
        // patroon: reeks korte ziek/blessuremeldingen
        const kort = S.afm.filter((f) => f.spelerId === pl.id && ['Ziek', 'Blessure'].includes(f.reden) && new Date(f.tijd) > new Date(Date.now() - 28 * 864e5));
        if (kort.length >= 3 && !lang) res.push({ soort: 'patroon', niveau: 'oranje', teamId: tid, spelerId: pl.id, tekst: `${naam}: ${kort.length}× ziek/blessure in 4 weken`, sub: `Waarvan ${kort.filter((f) => f.reden === 'Blessure').length}× blessure. Eerst vragen hoe het gaat?`, ernst: kort.length, sleutelExtra: 'kort' });
        // te laat komen (Besluit 32)
        const tl = M.teLaat(S, pl);
        if (tl.signaal === 'kort') res.push({ soort: 'telaat', niveau: 'oranje', teamId: tid, spelerId: pl.id, tekst: `${naam}: ${tl.kort}× te laat in 4 weken`, sub: 'Even vragen of er iets speelt?', ernst: tl.kort, sleutelExtra: 'kort' });
        else if (tl.signaal === 'seizoen') res.push({ soort: 'telaat', niveau: 'oranje', teamId: tid, spelerId: pl.id, tekst: `${naam}: ${tl.seizoen}× te laat dit seizoen`, sub: 'Is dit een patroon? Even praten kan helpen.', ernst: tl.seizoen, sleutelExtra: 'seizoen' });
        const k = M.kaarten(S, pl);
        // Opschaling (Besluit 15): herinneren → waarschuwen (kaart) → bellen/appen → persoonlijk gesprek HJO → clubbesluit
        const stap = M.stap(S, pl, k);
        if (stap) res.push({ ...stap, teamId: tid, spelerId: pl.id, tekst: `${naam}: ${stap.tekst}` });
      });
    });
    // Signalen ter informatie kunnen afgedaan worden ("Gezien, geen actie nodig"); ze komen terug als het erger wordt.
    // Opschalingssignalen (bellen, gesprek HJO, clubbesluit) verdwijnen alleen door de actie zelf (Besluit 15).
    const afgedaan = S.signaalAfgedaan || [];
    const rang = { info: 0, oranje: 1, rood: 2 };
    res.forEach((s) => { s.sleutel = [s.soort, s.teamId, s.spelerId || '', s.sleutelExtra || ''].join('|'); s.afdoenbaar = !M.STAPPEN.includes(s.soort); });
    return res.filter((s) => {
      if (!s.afdoenbaar) return true;
      const a = afgedaan.filter((x) => x.sleutel === s.sleutel).pop();
      return !a || (s.ernst || 0) > (a.ernst || 0) || (rang[s.niveau] || 0) > (rang[a.niveau] || 0);
    });
  };
  M.STAPPEN = ['bellen', 'gesprekHjo', 'clubbesluit'];
  M.afgedaanRecent = (S, teamIds, dagen = 14) => (S.signaalAfgedaan || []).filter((x) => teamIds.includes(x.teamId) && Date.now() - new Date(x.tijd) < dagen * 864e5);

  // Opschaling (Besluit 15 en 32) met geheugen over het hele seizoen. Een rode kaart die niet is geaccepteerd:
  // eerst bellen/appen; opnieuw rood na dat contact: persoonlijk gesprek (HJO); opnieuw na het gesprek: clubbesluit.
  M.stap = (S, pl, k) => {
    k = k || M.kaarten(S, pl);
    const rood = k.ev.filter((e) => e.kaart === 'rood' && !e.geaccepteerd);
    if (!rood.length) return null;
    const log = S.gesprekken.filter((g) => g.spelerId === pl.id && g.datum >= M.seizoen(S).van).sort((a, b) => a.datum.localeCompare(b.datum));
    const contact = log.filter((g) => ['gebeld', 'geappt'].includes(g.soort)).pop();
    const gesprek = log.filter((g) => g.soort === 'gesprek').pop();
    const na = (d) => rood.filter((e) => e.act.datum > d);
    const wat = (e) => `${e.tweedeGeel ? 'tweede gele kaart (te laat afgemeld)' : 'niet afgemeld'} bij de ${M.isWed(e.act) ? 'wedstrijd' : e.act.soort === 'activiteit' ? 'activiteit' : 'training'} van ${CC.date.kort(e.act.datum)}`;
    const hjo = S.club.labels.hjo;
    if (gesprek) { const x = na(gesprek.datum); return x.length ? { soort: 'clubbesluit', niveau: 'rood', stap: 5, tekst: 'opnieuw rood na het gesprek', sub: `Rode kaart: ${wat(x[x.length - 1])}. Volgens het clubbeleid kan de club afscheid nemen; dat beslist de ${CC.wie ? CC.wie('clubbesluit', pl.teamId) : hjo} met het bestuur.` } : null; }
    if (contact) { const x = na(contact.datum); return x.length ? { soort: 'gesprekHjo', niveau: 'rood', stap: 4, tekst: `persoonlijk gesprek met de ${CC.wie ? CC.wie('gesprek', pl.teamId) : hjo}`, sub: `Na het contact van ${CC.date.kort(contact.datum)} opnieuw rood: ${wat(x[x.length - 1])}.` } : null; }
    const laatst = rood[rood.length - 1];
    const al = log.find((g) => g.datum >= laatst.act.datum);
    if (al) return null;
    return { soort: 'bellen', niveau: 'rood', stap: 3, tekst: 'bel of app de ouders', sub: `Rode kaart: ${wat(laatst)}. ${CC.wie ? CC.wie('bellen', pl.teamId).replace(/^./, (c) => c.toUpperCase()) : 'Trainer of ' + hjo} neemt contact op. Begrijpelijk? Leg dan vast: geaccepteerd.` };
  };


  // Vervoer: aangeboden plekken zijn voor ándere kinderen; het eigen kind van de chauffeur telt niet mee
  M.meerijders = (S, v, chauffeurId) => Object.entries(v.plek).filter(([, d]) => d === chauffeurId).map(([s]) => M.speler(S, s)).filter(Boolean);
  M.vrijePlekken = (S, v, x) => { const mee = M.meerijders(S, v, x.personId).filter((pl) => !pl.ouders.includes(x.personId)); return x.plekken - mee.length - mee.filter((pl) => (v.ouderMee || {})[pl.id]).length; };
  // Besluit 31: iedereen brengt zijn eigen kind, tenzij de ouder om een plek vraagt
  M.plekZoekers = (S, a) => { const v = S.vervoer[a.id]; if (!v || !v.vraag) return []; return Object.keys(v.vraag).map((id) => M.speler(S, id)).filter((pl) => pl && pl.teamId === a.teamId && !v.plek[pl.id] && M.status(S, pl, a).code === 'verwacht'); };
  M.neemMee = (S, a, pl, chauffeurId) => {
    const v = S.vervoer[a.id] || (S.vervoer[a.id] = { aanbod: [], plek: {}, vraag: {} }); v.plek[pl.id] = chauffeurId;
    const n = M.meerijders(S, v, chauffeurId).filter((x) => !x.ouders.includes(chauffeurId)).length; const x = v.aanbod.find((y) => y.personId === chauffeurId);
    if (x) x.plekken = Math.max(x.plekken, n); else v.aanbod.push({ personId: chauffeurId, plekken: n });
  };
  M.meerijderNaam = (S, v, pl, chauffeurId) => pl.voornaam + (pl.ouders.includes(chauffeurId) ? ' (eigen kind)' : (v.ouderMee || {})[pl.id] ? ' + ouder' : '');

  // ontvangers en ongelezen
  // Vastgezet nieuws is ook te lezen voor ouders die later instromen (Besluit 41); het telt dan niet als ongelezen
  M.vastVoor = (S, m, pid) => m.soort === 'nieuws' && !!m.vastTot && new Date(m.vastTot) > new Date()
    && (m.bereik === 'Hele club' || String(m.bereik || '').split(', ').some((t) => S.players.some((p) => p.teamId === t && p.ouders.includes(pid))));
  M.zichtbaar = (S, m, pid) => (m.ontvangers.includes(pid) || M.vastVoor(S, m, pid)) && (!m.gepland || new Date(m.gepland) <= new Date());
  M.ongelezen = (S, pid, soort) => S.msgs.filter((m) => m.ontvangers.includes(pid) && M.zichtbaar(S, m, pid) && !m.gelezen.includes(pid) && (!soort || m.soort === soort) && m.van !== pid).length;
  // Alle trainers en/of teamleiders van een team (een team kan er meer hebben; Besluit 44)
  M.stafVan = (S, teamId, rollen = ['trainer', 'teamleider']) => { const t = M.team(S, teamId) || {};
    return [...new Set([...(rollen.includes('trainer') ? [t.trainerId] : []), ...(rollen.includes('teamleider') ? [t.teamleiderId] : []),
      ...S.people.filter((p) => p.rollen.some((r) => rollen.includes(r.rol) && r.teamId === teamId)).map((p) => p.id)].filter(Boolean))]; };
  M.oudersVan = (S, teamId) => [...new Set(M.spelers(S, teamId).flatMap((p) => p.ouders))];

  // speeltijdschema: eerlijke verdeling, keepers rouleren, minste minuten eerst
  // Speeltijd (Besluit 33): eerlijk = percentage van de mogelijke speeltijd in de wedstrijden waarbij het kind er was.
  // Gemiste wedstrijden (ziek, blessure, andere reden) tellen niet mee: geen achterstand en geen inhaalvoorrang.
  M.speeltijdStand = (S, pl) => {
    const min = S.speeltijd.min[pl.id] || 0; const mog = (S.speeltijd.mogelijk || {})[pl.id] || 0;
    const wed = M.acts(S, pl.teamId, S.club.seizoen.start, vandaag()).filter((a) => M.isWed(a) && !a.afgelast && S.pres[a.id] && S.pres[a.id].s[pl.id]);
    const gemist = {}; let gespeeld = 0;
    wed.forEach((a) => { const st = M.status(S, pl, a); if (['aanwezig', 'telaat'].includes(st.code)) gespeeld++; else { const r = st.code === 'langdurig' ? st.lang.reden : st.code === 'afgemeld' ? st.afm.reden : 'niet afgemeld'; gemist[r] = (gemist[r] || 0) + 1; } });
    return { min, mogelijk: mog, pct: mog ? Math.round((100 * min) / mog) : null, gespeeld, gemist };
  };
  // Mag de trainer bij dit team afwijken (een blok minder)? Standaard alleen bij selectieteams.
  M.speeltijdAfwijken = (S, teamId) => { const i = M.inst(S, teamId).speeltijdAfwijken || { breedte: false, selectie: true }; return !!i[M.team(S, teamId).type === 'selectie' ? 'selectie' : 'breedte']; };
  // Wisselen om de … minuten (Besluit 39): de club kiest per speelvorm, de trainer mag per wedstrijd afwijken. Advies: per blok.
  CC.SPEELVORMEN = [['v4', '4 tegen 4', 10, 40], ['v6', '6 tegen 6', 12.5, 50], ['v8', '8 tegen 8', 15, 60], ['v11', '11 tegen 11', 17.5, 70]];
  M.wisselMin = (S, teamId) => { const c = CC.categorie(M.team(S, teamId).cat); return Number((M.inst(S, teamId).wissel || {})[c.key]) || c.blokMin; };
  // Lengte van elk blok: steeds het gekozen aantal minuten; het laatste blok is de rest (een korte rest gaat bij het laatste blok)
  M.blokLengtes = (duur, om) => {
    om = Math.min(Math.max(Number(om) || duur, 1), duur); let n = Math.ceil(duur / om - 1e-9);
    if (n > 1 && duur - om * (n - 1) < om / 2) n--;
    return Array.from({ length: n }, (_, i) => Math.round((i < n - 1 ? om : duur - om * (n - 1)) * 10) / 10);
  };
  M.minTekst = (m) => String(m).replace('.', ',');
  // Minuten per speler in een schema (ook oude schema's met vaste blokken)
  M.schemaLengtes = (sch) => sch.blokLen || sch.blokken.map(() => sch.blokMin);
  M.schemaMinuten = (sch) => { const len = M.schemaLengtes(sch); const m = {}; sch.blokken.forEach((b, i) => b.forEach((id) => { m[id] = Math.round(((m[id] || 0) + len[i]) * 10) / 10; })); return m; };
  M.maakSchema = (S, act, minder, om) => {
    const t = M.team(S, act.teamId); const c = CC.categorie(t.cat);
    const beschikbaar = M.spelers(S, act.teamId).filter((pl) => ['verwacht', 'aanwezig', 'telaat'].includes(M.status(S, pl, act).code));
    const blokLen = M.blokLengtes(c.duur, om || M.wisselMin(S, act.teamId));
    const wedMin = c.duur; const mog = S.speeltijd.mogelijk || {};
    const min = {}; beschikbaar.forEach((p) => { min[p.id] = S.speeltijd.min[p.id] || 0; });
    // voorrang: laagste percentage (inclusief deze wedstrijd) eerst
    const score = (p) => (min[p.id]) / ((mog[p.id] || 0) + wedMin);
    // Clubbeleid: geen vaste keeper → elke week een andere speler de hele wedstrijd op doel.
    const kb = S.speeltijd.keeper || (S.speeltijd.keeper = {});
    const keeper = [...beschikbaar].sort((x, y) => (kb[x.id] || 0) - (kb[y.id] || 0) || score(x) - score(y) || x.voornaam.localeCompare(y.voornaam))[0];
    const veld = beschikbaar.filter((p) => p !== keeper);
    // minder speeltijd (alleen als de club dat toestaat): één blok minder dan een gelijke verdeling
    const minderIds = (minder || []).filter((id) => veld.some((p) => p.id === id));
    // in minuten, want het laatste blok kan korter zijn; "blok minder" = één wisselmoment minder dan gelijk verdeeld
    const plek = Math.min(c.opVeld - 1, veld.length);
    const gelijk = veld.length ? (wedMin * plek) / veld.length : 0;
    const minNu = {}; const cap = (p) => (minderIds.includes(p.id) ? Math.max(blokLen[0], gelijk - blokLen[0]) : Infinity);
    const blokken = []; const keepers = [];
    blokLen.forEach((len) => {
      // eerst gelijk verdelen binnen deze wedstrijd, dan voorrang voor het laagste seizoenspercentage
      const volgorde = [...veld].sort((x, y) => ((minNu[x.id] || 0) >= cap(x)) - ((minNu[y.id] || 0) >= cap(y)) || (minNu[x.id] || 0) - (minNu[y.id] || 0) || score(x) - score(y) || x.voornaam.localeCompare(y.voornaam));
      const inBlok = volgorde.slice(0, plek);
      inBlok.forEach((p) => { min[p.id] += len; minNu[p.id] = (minNu[p.id] || 0) + len; });
      keepers.push(keeper && keeper.id);
      blokken.push([keeper, ...inBlok].filter(Boolean).map((p) => p.id));
    });
    return { blokken, keepers, huidig: 0, bevestigd: false, blokMin: blokLen[0], blokLen, vorm: c.vorm, opVeld: c.opVeld, spelers: beschikbaar.map((p) => p.id), wedMin, minder: minderIds };
  };

})();
