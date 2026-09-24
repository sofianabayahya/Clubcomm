// ClubComm prototype — Agenda-abonnement (Besluit 18): trainingen en wedstrijden in de eigen agenda
// via een persoonlijke, geheime iCalendar-link (open standaard, werkt met Google, Apple en Outlook).
// In de demo is er geen server; de link en het abonneren zijn nagebootst, de .ics-inhoud is echt.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;

  const token = (p) => p.agendaToken || (p.agendaToken = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10));
  const link = (p) => `webcal://clubcomm.nl/agenda/${token(p)}.ics`;

  // Welke activiteiten komen in de agenda van deze persoon?
  const teamsVan = (S, p) => {
    const kids = S.players.filter((x) => x.teamId && x.ouders.includes(p.id));
    const staf = p.rollen.filter((r) => r.teamId).map((r) => r.teamId);
    return [...new Set([...kids.map((k) => k.teamId), ...staf])];
  };
  const events = (S, p, n) => {
    const keuze = p.agendaKeuze || { training: true, wedstrijd: true };
    return S.acts.filter((a) => teamsVan(S, p).includes(a.teamId) && a.datum >= D.vandaag() && (a.soort === 'training' ? keuze.training : keuze.wedstrijd)).slice(0, n || 500);
  };
  const titel = (S, a) => (a.soort === 'training' ? `Training ${a.teamId}` : a.soort === 'oefen' ? `Oefenwedstrijd ${a.teamId}` : `${a.teamId} ${a.thuis ? 'thuis' : 'uit'} tegen ${a.tegen}`);
  const sportpark = () => { const c = CC.S().club; return c.sportpark || (c.naam ? `Sportpark ${c.naam}` : 'Sportpark'); };
  const plaats = (a) => (a.soort === 'training' || a.thuis ? `${a.adres && a.thuis ? a.adres : sportpark()}${a.veld ? ', ' + a.veld : ''}` : a.adres || '');
  const beginTijd = (a) => (a.soort === 'training' ? a.tijd : a.verzamel || a.tijd);

  // Echte iCalendar-tekst (RFC 5545), zoals de server in versie 2 hem levert
  CC.icsTekst = (S, p) => {
    const st = (datum, tijd) => `${datum.replace(/-/g, '')}T${tijd.replace(':', '')}00`;
    const esc2 = (t) => String(t).replace(/\\/g, '\\\\').replace(/[,;]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
    const regels = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ClubComm//NL', 'CALSCALE:GREGORIAN', `X-WR-CALNAME:ClubComm ${S.club.naam}`, 'X-WR-TIMEZONE:Europe/Amsterdam', 'REFRESH-INTERVAL;VALUE=DURATION:PT1H'];
    events(S, p).forEach((a) => {
      const omschr = `${a.soort === 'training' ? '' : `Verzamelen ${a.verzamel}, aftrap ${a.tijd}.\n`}Kan je kind niet? Meld af in ClubComm: https://clubcomm.nl`;
      regels.push('BEGIN:VEVENT', `UID:${a.id}@clubcomm.nl`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
        `DTSTART;TZID=Europe/Amsterdam:${st(a.datum, beginTijd(a))}`, `DTEND;TZID=Europe/Amsterdam:${st(a.datum, a.eind || a.tijd)}`,
        `SUMMARY:${esc2((a.afgelast ? 'AFGELAST: ' : '') + titel(S, a))}`, `LOCATION:${esc2(plaats(a))}`, `DESCRIPTION:${esc2(omschr)}`,
        a.afgelast ? 'STATUS:CANCELLED' : 'STATUS:CONFIRMED', 'END:VEVENT');
    });
    (CC.gesprekkenVoor ? CC.gesprekkenVoor(S, p) : []).forEach((g) => {
      const pl = M.speler(S, g.spelerId);
      regels.push('BEGIN:VEVENT', `UID:${g.id}@clubcomm.nl`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
        `DTSTART;TZID=Europe/Amsterdam:${st(g.datum, g.tijd)}`, `DTEND;TZID=Europe/Amsterdam:${st(g.datum, g.eind)}`,
        `SUMMARY:${esc2(`Ontwikkelgesprek ${pl.voornaam} (${g.teamId})`)}`, `LOCATION:${esc2(`${sportpark()}, ${g.plek}`)}`, `DESCRIPTION:${esc2('Gesprek met de trainer; ouder en kind zijn er samen bij.')}`, 'STATUS:CONFIRMED', 'END:VEVENT');
    });
    regels.push('END:VCALENDAR');
    return regels.join('\r\n');
  };

  CC.agendaRij = () => !teamsVan(CC.S(), CC.me()).length ? '' : h.rij({ ic: 'calendar-plus', titel: 'Zet in mijn agenda', sub: 'Trainingen en wedstrijden automatisch in je eigen agenda', act: 'agendaSheet' });

  CC.on('agendaSheet', () => {
    const S = CC.S(); const p = CC.me(); const k = p.agendaKeuze || { training: true, wedstrijd: true };
    const vb = events(S, p, 3);
    CC.sheet('Zet in mijn agenda', `
      <p>Eén keer abonneren, daarna staan alle trainingen en wedstrijden${teamsVan(S, p).length ? ` van ${teamsVan(S, p).map(esc).join(' en ')}` : ''} vanzelf in je eigen agenda. Wijzigingen komen er automatisch in.</p>
      <label class="schakel"><span>Trainingen</span><input type="checkbox" ${k.training ? 'checked' : ''} data-change="agendaKeuze" data-k="training"><i></i></label>
      <label class="schakel"><span>Wedstrijden</span><input type="checkbox" ${k.wedstrijd ? 'checked' : ''} data-change="agendaKeuze" data-k="wedstrijd"><i></i></label>
      <button class="knop vol" data-act="agendaAbonneer" data-soort="apple">${icon('calendar-plus')}iPhone of Mac: abonneren</button>
      <button class="knop licht vol" data-act="agendaAbonneer" data-soort="google">${icon('calendar-plus')}Google Agenda (Android)</button>
      <button class="knop licht vol" data-act="agendaAbonneer" data-soort="outlook">${icon('calendar-plus')}Outlook</button>
      <h3 class="klein-kop">Jouw persoonlijke link</h3>
      <div class="linkvak"><code id="agenda-link">${esc(link(p))}</code><button class="icoonknop" data-act="agendaKopieer" aria-label="Link kopiëren">${icon('share-2')}</button></div>
      <p class="zacht klein">Deel deze link niet. Telefoon kwijt? <button class="linkknop" data-act="agendaVernieuw">Maak een nieuwe link</button>; de oude werkt dan niet meer.</p>
      <h3 class="klein-kop">Zo ziet het eruit in je agenda</h3>
      <div class="lijst compact">${vb.map((a) => h.rij({ ic: h.datumBlok(a), titel: esc(titel(S, a)), sub: `${beginTijd(a)}–${a.eind || ''} · ${esc(plaats(a))}` })).join('') || '<p class="zacht klein">Geen activiteiten gepland.</p>'}</div>
      <div class="info">${icon('info')}<span>Je agenda kijkt zelf af en toe of er iets is veranderd (meestal binnen een uur). Voor spoed, zoals een afgelasting, krijg je ook altijd een pushmelding. <b>Afmelden gaat via ClubComm</b>; in elke afspraak staat een link.</span></div>
`, { groot: true });
  });
  CC.on('agendaKeuze', (el) => { const p = CC.me(); p.agendaKeuze = { ...(p.agendaKeuze || { training: true, wedstrijd: true }), [el.dataset.k]: el.checked }; CC.save(); });
  CC.on('agendaAbonneer', (el) => {
    const p = CC.me(); p.agendaAbonnement = el.dataset.soort; CC.save();
    const uitleg = { apple: 'Je iPhone vraagt: "Abonneren op agenda?" Tik op Abonneer. Klaar!', google: 'Google Agenda opent met "Agenda toevoegen via URL". Tik op Toevoegen. Klaar!', outlook: 'Outlook vraagt of je de agenda wilt toevoegen. Kies Ja. Klaar!' }[el.dataset.soort];
    CC.closeSheet(); CC.toast('Demo: in de echte app opent nu je agenda');
    setTimeout(() => CC.sheet('Bijna klaar', `<p>${uitleg}</p><p class="zacht klein">In deze demo is er nog geen server, dus je agenda opent nu niet echt. In versie 2 werkt deze knop direct.</p><button class="knop vol" data-act="sluit">Oké</button>`), 400);
  });
  CC.on('agendaKopieer', async () => { const t = link(CC.me()); try { await navigator.clipboard.writeText(t); CC.toast('Link gekopieerd'); } catch (e) { const r = document.createRange(); r.selectNodeContents(document.getElementById('agenda-link')); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); CC.toast('Selecteer en kopieer de link'); } });
  CC.on('agendaVernieuw', () => { const p = CC.me(); p.agendaToken = null; token(p); CC.save(); CC.closeSheet(); CC.toast('Nieuwe link gemaakt; de oude werkt niet meer'); });

})();
