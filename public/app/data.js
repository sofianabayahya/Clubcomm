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
  CC.date = { DAG, DAG_KORT, MAAND, iso, parse, addDays, vandaag, start, dagen,
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
  CC.TAAKSOORTEN = ['Spelbegeleider', 'Coach', 'Fotograaf', 'Bardienst', 'Wastas'];
  CC.VAARDIGHEDEN = {
    mini: ['Plezier', 'Balgevoel'],
    o8: ['Passen', 'Aannemen', 'Dribbelen', 'Schieten', 'Inzet'],
    o11: ['Passen', 'Aannemen', 'Dribbelen', 'Schieten', 'Positie kiezen', 'Overzicht', 'Samenwerken'],
    o13: ['Techniek', 'Tactiek', 'Fysiek', 'Mentaal', 'Sociaal'],
  };
  CC.categorie = (cat) => {
    const n = parseInt(cat.replace(/\D/g, ''), 10);
    if (n <= 7) return { naam: "Mini's", vorm: '4 tegen 4', opVeld: 4, blokken: 4, blokMin: 10, schaal: 'mini', vaardig: CC.VAARDIGHEDEN.mini };
    if (n <= 10) return { naam: 'Onderbouw', vorm: '6 tegen 6', opVeld: 6, blokken: 4, blokMin: 12, schaal: 'smiley', vaardig: CC.VAARDIGHEDEN.o8 };
    if (n <= 12) return { naam: 'Onderbouw', vorm: '8 tegen 8', opVeld: 8, blokken: 4, blokMin: 15, schaal: '1-5', vaardig: CC.VAARDIGHEDEN.o11 };
    return { naam: 'Middenbouw', vorm: '11 tegen 11', opVeld: 11, blokken: 4, blokMin: 20, schaal: '1-5', vaardig: CC.VAARDIGHEDEN.o13 };
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
      v: 4, gen: today,
      club: {
        id: 'scb', naam: 'SC Buitenveldert', regio: 'Noord',
        seizoen: { start: '2026-08-19', eind: '2027-06-05' },
        vakanties: CC.VAKANTIES_NOORD.map((v) => ({ ...v })),
        stops: [{ id: 'goedevrijdag', naam: 'Goede Vrijdag (club dicht)', van: '2027-03-26', tot: '2027-03-26', trainen: false }],
        // Fases volgen de competitie-indeling (jaarplanning onderbouw 2026/27). De kaartenteller begint per fase opnieuw.
        fasen: [{ nr: 1, van: '2026-08-19' }, { nr: 2, van: '2026-10-31' }, { nr: 3, van: '2027-01-20' }, { nr: 4, van: '2027-04-02' }],
        inst: { deadlineTraining: 3, deadlineWedstrijd: 24, geel: 3, oranje: 5, zones: { breedte: { groen: 80, oranje: 75 }, selectie: { groen: 90, oranje: 85 } }, oproepDagen: 2, waarschuwing: CC.WAARSCHUWING },
        modules: { vervoer: true, taken: true, speeltijd: true, beoordeling: true, beloningen: false },
        labels: { hjo: 'HJO', coordinator: 'Coördinator' }, coordinatorAan: false,
        ingericht: { seizoen: true, vakanties: true, regels: true, rollen: true, modules: false },
      },
      teams: [], people: [], players: [], acts: [], afm: [], pres: {}, lang: [], gesprekken: [], msgs: [],
      vervoer: {}, taken: [], aanm: [], beoord: {}, notities: {}, speeltijd: { min: {}, schema: {} }, wijzigingen: [],
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
      a.begeleiderId = t.teamleiderId || t.trainerId || null;
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
      if (a.soort === 'training' && idx % 3 === 1) rec[pO('Liam').id] = 'l';
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
      w1.begeleiderId = linda.id;
      const ouder = (n) => pO(n).ouders[0];
      S.vervoer[w1.id] = { aanbod: [{ personId: linda.id, plekken: 3 }, { personId: ouder('Lucas'), plekken: 2 }], plek: {} };
      S.vervoer[w1.id].plek[pO('Noah').id] = linda.id; S.vervoer[w1.id].plek[pO('Levi').id] = linda.id; S.vervoer[w1.id].plek[pO('Mees').id] = linda.id;
      S.vervoer[w1.id].plek[pO('Lucas').id] = ouder('Lucas'); S.vervoer[w1.id].plek[pO('Adam').id] = ouder('Lucas');
      S.taken.push({ id: id('t'), actId: w1.id, soort: 'Spelbegeleider', personId: null });
      S.taken.push({ id: id('t'), actId: w1.id, soort: 'Wastas', personId: pO('Omar').ouders[0] });
      S.taken.push({ id: id('t'), actId: w1.id, soort: 'Fotograaf', personId: null });
    }
    if (w2) {
      w2.begeleiderId = null;
      S.taken.push({ id: id('t'), actId: w2.id, soort: 'Coach', personId: null });
      S.taken.push({ id: id('t'), actId: w2.id, soort: 'Bardienst', personId: pO('Sven').ouders[0] });
      S.taken.push({ id: id('t'), actId: w2.id, soort: 'Spelbegeleider', personId: null });
    }
    // Wie helpt vaak? (historie van taken)
    verleden.filter((a) => a.soort === 'wedstrijd').forEach((a, k) => {
      S.taken.push({ id: id('t'), actId: a.id, soort: 'Spelbegeleider', personId: [pO('Lucas').ouders[0], linda.id, pO('Omar').ouders[0]][k % 3] });
      S.taken.push({ id: id('t'), actId: a.id, soort: 'Wastas', personId: [pO('Omar').ouders[0], pO('Mees').ouders[0]][k % 2] });
    });

    // Speeltijd: minuten tot nu toe
    o10.forEach((pl, k) => { S.speeltijd.min[pl.id] = pl.voornaam === 'Finn' ? 60 : 110 + ((k * 37) % 70); });

    // Beoordelingen (fase 1 deels ingevuld)
    const vaardig = CC.categorie('O10').vaardig;
    o10.slice(0, 7).forEach((pl, k) => { S.beoord[pl.id] = { fase: 'Fase 1 (sep–okt)', scores: Object.fromEntries(vaardig.map((v, j) => [v, 1 + ((k + j) % 3)])) }; });
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

  M.acts = (S, teamId, van, tot) => S.acts.filter((a) => a.teamId === teamId && (!van || a.datum >= van) && (!tot || a.datum <= tot));
  M.komend = (S, teamId, n) => { const nu = Date.now(); return S.acts.filter((a) => a.teamId === teamId && start(a).getTime() + 90 * 6e4 > nu).slice(0, n || 999); };
  M.afm = (S, spelerId, actId) => S.afm.find((f) => f.spelerId === spelerId && f.actId === actId);
  M.lang = (S, spelerId, datum) => S.lang.find((l) => l.spelerId === spelerId && datum >= l.van && datum <= l.tot);
  M.deadline = (S, act) => { const i = M.inst(S, act.teamId); return new Date(start(act).getTime() - (act.soort === 'wedstrijd' ? i.deadlineWedstrijd : i.deadlineTraining) * 3600e3); };
  M.deadlineTekst = (S, act) => { const i = M.inst(S, act.teamId); const u = act.soort === 'wedstrijd' ? i.deadlineWedstrijd : i.deadlineTraining; const d = M.deadline(S, act); return u >= 24 ? `${CC.date.kort(iso(d))} ${pad(d.getHours())}:${pad(d.getMinutes())}` : `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  M.teLaatAfgemeld = (S, f, act) => new Date(f.tijd) > M.deadline(S, act);

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
    const acts = M.acts(S, pl.teamId, per.van, per.tot).filter((a) => !a.afgelast && S.pres[a.id] && S.pres[a.id].s[pl.id]);
    const r = { totaal: 0, aanwezig: 0, telaat: 0, afwezig: 0, redenen: {}, lang: 0, niet: 0, lijst: [] };
    acts.forEach((a) => {
      const st = M.status(S, pl, a); r.totaal++; r.lijst.push({ act: a, st });
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

  // kaarten binnen een blok
  M.kaarten = (S, pl, blok) => {
    blok = blok || M.blok(S, vandaag());
    const ev = [];
    M.acts(S, pl.teamId, blok.van, blok.tot < vandaag() ? blok.tot : vandaag()).filter((a) => !a.afgelast).forEach((a) => {
      const st = M.status(S, pl, a);
      if (st.code === 'telaat') ev.push({ act: a, soort: 'oranje', punten: 1, wat: 'Te laat gekomen' });
      if (st.code === 'afgemeld' && st.laat) ev.push({ act: a, soort: 'geel', punten: 1, wat: 'Te laat afgemeld' });
      if (st.code === 'nietafgemeld') ev.push({ act: a, soort: 'geel', punten: 2, wat: 'Niet afgemeld en niet gekomen' });
    });
    const eerst = {};
    ev.forEach((e) => { if (!eerst[e.soort]) { eerst[e.soort] = true; e.waarschuwing = true; } });
    const geel = ev.filter((e) => e.soort === 'geel' && !e.waarschuwing).reduce((s, e) => s + e.punten, 0);
    const oranje = ev.filter((e) => e.soort === 'oranje' && !e.waarschuwing).reduce((s, e) => s + e.punten, 0);
    const i = M.inst(S, pl.teamId);
    return { ev, geel, oranje, drempel: geel >= i.geel || oranje >= i.oranje, inst: i };
  };

  // signalen voor een persoon/rol
  M.signalen = (S, teamIds, voorHjo) => {
    const res = [];
    const per = M.periode(S, 'blok');
    teamIds.forEach((tid) => {
      const t = M.team(S, tid);
      const ts = M.teamStats(S, tid, per);
      const tz = M.zone(S, ts.pct, tid);
      if (voorHjo && tz !== 'groen') res.push({ soort: 'team', niveau: tz, teamId: tid, tekst: `${t.naam}: teamgemiddelde ${ts.pct}% (${t.type})`, sub: 'Waarschijnlijk iets in het team: tijd, trainer of sfeer?' });
      ts.spelers.forEach(({ pl, st }) => {
        const z = M.zone(S, st.pct, tid);
        const naam = M.naam(S, pl);
        const lang = S.lang.find((l) => l.spelerId === pl.id && l.tot >= vandaag());
        if (lang) res.push({ soort: 'lang', niveau: 'info', teamId: tid, spelerId: pl.id, tekst: `${naam}: langdurig afwezig (${lang.reden.toLowerCase()})`, sub: `Tot ongeveer ${CC.date.kort(lang.tot)}${lang.opm ? ' · ' + lang.opm : ''}` });
        if (z === 'rood' && tz !== 'rood' && !lang) {
          const top = Object.entries(st.redenen).sort((a, b) => b[1] - a[1])[0];
          res.push({ soort: 'speler', niveau: 'rood', teamId: tid, spelerId: pl.id, tekst: `${naam}: ${st.pct}% (team: ${ts.pct}%)`, sub: top ? `${st.afwezig}× afwezig, waarvan ${top[1]}× ${top[0].toLowerCase()}` : '' });
        } else if (z === 'oranje' && tz === 'groen' && !lang) {
          res.push({ soort: 'speler', niveau: 'oranje', teamId: tid, spelerId: pl.id, tekst: `${naam}: ${st.pct}% (team: ${ts.pct}%)`, sub: 'Let op: nog geen rood, een gesprek kan nu preventief zijn.' });
        }
        // patroon: afwezig op vaste dag
        const afw = st.lijst.filter((x) => !['aanwezig', 'telaat', 'langdurig'].includes(x.st.code));
        if (afw.length >= 3) {
          const per = {}; afw.forEach((x) => { const d = parse(x.act.datum).getDay(); per[d] = (per[d] || 0) + 1; });
          const [dag, n] = Object.entries(per).sort((a, b) => b[1] - a[1])[0];
          if (n >= 3 && n / afw.length >= 0.6) res.push({ soort: 'patroon', niveau: 'oranje', teamId: tid, spelerId: pl.id, tekst: `${naam}: vooral afwezig op ${DAG[dag]}`, sub: `${n} van de ${afw.length} keer afwezig op ${DAG[dag]}` });
        }
        // patroon: reeks korte ziek/blessuremeldingen
        const kort = S.afm.filter((f) => f.spelerId === pl.id && ['Ziek', 'Blessure'].includes(f.reden) && new Date(f.tijd) > new Date(Date.now() - 28 * 864e5));
        if (kort.length >= 3 && !lang) res.push({ soort: 'patroon', niveau: 'oranje', teamId: tid, spelerId: pl.id, tekst: `${naam}: ${kort.length}× ziek/blessure in 4 weken`, sub: `Waarvan ${kort.filter((f) => f.reden === 'Blessure').length}× blessure. Eerst vragen hoe het gaat?` });
        // kaartendrempel
        const k = M.kaarten(S, pl);
        // Opschaling (Besluit 15): herinneren → waarschuwen (kaart) → bellen/appen → persoonlijk gesprek HJO → clubbesluit
        const stap = M.stap(S, pl, k);
        if (stap) res.push({ ...stap, teamId: tid, spelerId: pl.id, tekst: `${naam}: ${stap.tekst}` });
      });
    });
    return res;
  };

  // Opschalingsstap na de drempel. Contact = gebeld/geappt; gesprek = persoonlijk gesprek met de HJO.
  M.stap = (S, pl, k) => {
    k = k || M.kaarten(S, pl);
    if (!k.drempel) return null;
    const fase = M.blok(S, vandaag());
    const vast = S.gesprekken.filter((g) => g.spelerId === pl.id && g.datum >= fase.van).sort((a, b) => a.datum.localeCompare(b.datum));
    const contact = vast.filter((g) => g.soort !== 'gesprek').pop();
    const gesprek = vast.filter((g) => g.soort === 'gesprek').pop();
    const naDatum = (d) => k.ev.filter((e) => !e.waarschuwing && e.act.datum > d);
    const hjo = S.club.labels.hjo;
    if (gesprek) return naDatum(gesprek.datum).length ? { soort: 'clubbesluit', niveau: 'rood', stap: 5, tekst: 'opnieuw na het gesprek', sub: `Tweede gele kaart na het gesprek. Volgens het clubbeleid kan de club afscheid nemen; dat beslist de ${hjo} met het bestuur.` } : null;
    if (contact) return naDatum(contact.datum).length ? { soort: 'gesprekHjo', niveau: 'rood', stap: 4, tekst: `persoonlijk gesprek met de ${hjo}`, sub: `Na het telefonisch contact (${CC.date.kort(contact.datum)}) opnieuw: ${naDatum(contact.datum).map((e) => e.wat.toLowerCase()).join(', ')}.` } : null;
    return { soort: 'bellen', niveau: 'rood', stap: 3, tekst: 'bel of app de ouders', sub: `Drempel bereikt: ${k.geel} punten geel, ${k.oranje} oranje deze fase. Trainer of ${hjo} neemt contact op.` };
  };

  // ontvangers en ongelezen
  M.zichtbaar = (S, m, pid) => m.ontvangers.includes(pid) && (!m.gepland || new Date(m.gepland) <= new Date());
  M.ongelezen = (S, pid, soort) => S.msgs.filter((m) => M.zichtbaar(S, m, pid) && !m.gelezen.includes(pid) && (!soort || m.soort === soort) && m.van !== pid).length;
  M.oudersVan = (S, teamId) => [...new Set(M.spelers(S, teamId).flatMap((p) => p.ouders))];

  // speeltijdschema: eerlijke verdeling, keepers rouleren, minste minuten eerst
  M.maakSchema = (S, act) => {
    const t = M.team(S, act.teamId); const c = CC.categorie(t.cat);
    const beschikbaar = M.spelers(S, act.teamId).filter((pl) => ['verwacht', 'aanwezig', 'telaat'].includes(M.status(S, pl, act).code));
    const min = {}; beschikbaar.forEach((p) => { min[p.id] = S.speeltijd.min[p.id] || 0; });
    // Clubbeleid: geen vaste keeper → elke week een andere speler de hele wedstrijd op doel.
    const kb = S.speeltijd.keeper || (S.speeltijd.keeper = {});
    const keeper = [...beschikbaar].sort((x, y) => (kb[x.id] || 0) - (kb[y.id] || 0) || min[x.id] - min[y.id] || x.voornaam.localeCompare(y.voornaam))[0];
    const veld = beschikbaar.filter((p) => p !== keeper);
    const blokken = []; const keepers = [];
    for (let b = 0; b < c.blokken; b++) {
      const volgorde = [...veld].sort((x, y) => min[x.id] - min[y.id] || x.voornaam.localeCompare(y.voornaam));
      const inBlok = volgorde.slice(0, Math.min(c.opVeld - 1, volgorde.length));
      inBlok.forEach((p) => { min[p.id] += c.blokMin; });
      keepers.push(keeper && keeper.id);
      blokken.push([keeper, ...inBlok].filter(Boolean).map((p) => p.id));
    }
    return { blokken, keepers, huidig: 0, bevestigd: false, blokMin: c.blokMin, vorm: c.vorm };
  };
})();
