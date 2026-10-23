// ClubComm — demo met rondleiding voor besturen (Besluit 89). Alleen op /demo, alleen voor e-mailadressen op de
// toegangslijst (tabel demo_toegang, migratie 023). Inloggen zoals in de echte app (e-mail + code). De demo gebruikt
// alleen verzonnen voorbeeldgegevens in de browser en schrijft nooit naar de database.
// Laptop: links de app op telefoonbreedte, rechts een vast uitlegpaneel; een gele rand toont het besproken onderdeel.
(function () {
  const CC = window.CC; const cfg = window.CC_CONFIG; const esc = CC.esc, icon = CC.icon, M = CC.m;
  if (!CC.demoPad) return;

  // ---------- Toegang ----------
  const sb = cfg && cfg.url && window.supabase ? window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true } }) : null;
  const G = { stap: 'laden', email: '', fout: '', ok: false };
  const appRender = CC.render;
  const scherm = (inhoud) => `<div class="login"><img src="assets/clubcomm-icon.png" class="login-logo" alt="ClubComm">${inhoud}</div>`;
  const foutRegel = () => (G.fout ? `<div class="info rood">${icon('circle-alert')}<span>${esc(G.fout)}</span></div>` : '');
  const poort = () => {
    if (G.stap === 'laden') return scherm('<p class="zacht">Even laden…</p>');
    if (G.stap === 'geen') return scherm(`<h1>Alleen op uitnodiging</h1><p class="zacht">Deze demo van ClubComm is alleen te bekijken op uitnodiging.${G.email ? ` <b>${esc(G.email)}</b> staat niet op de lijst.` : ''}</p>
      <p class="zacht klein">Interesse in ClubComm voor jouw club? Neem contact op met degene die je over ClubComm vertelde.</p><button class="linkknop" data-act="demoPoortUit">Ander e-mailadres</button>`);
    if (G.stap === 'code') return scherm(`<h1>Check je mail</h1><p class="zacht">We hebben een code gestuurd naar <b>${esc(G.email)}</b>. Typ de 6 cijfers hieronder over.</p>${foutRegel()}
      <form data-submit="demoPoortCode" class="codeform"><label for="dc">Code uit de mail</label><input id="dc" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="10" required placeholder="123456" autofocus><button class="knop">Demo openen</button></form>
      <p class="zacht klein">Geen mail? Kijk bij Ongewenste e-mail. <button class="linkknop" data-act="demoPoortUit">Ander e-mailadres</button></p>`);
    return scherm(`<h1>ClubComm · demo</h1><p class="zacht">Rondleiding voor besturen. Alleen op uitnodiging.</p>${foutRegel()}
      <form data-submit="demoPoortMail" class="codeform"><label for="dm">Je e-mailadres</label><input id="dm" name="email" type="email" autocomplete="email" required placeholder="naam@voorbeeld.nl" value="${esc(G.email)}"><button class="knop">Stuur mij een code</button></form>
      <p class="zacht klein">Geen wachtwoord nodig. Alle namen in de demo zijn verzonnen.</p>`);
  };
  CC.render = () => {
    if (G.ok) return appRender();
    document.body.classList.remove('rl');
    document.getElementById('app').innerHTML = poort();
  };
  const toegang = async () => {
    const { data } = await sb.auth.getSession();
    if (!data || !data.session) { G.stap = 'mail'; return CC.render(); }
    G.email = data.session.user.email || '';
    const { data: mag, error } = await sb.rpc('demo_toegang');
    if (error || !mag) { G.stap = 'geen'; return CC.render(); }
    G.ok = true; start();
  };
  CC.on('demoPoortMail', async (f) => {
    const email = f.email.value.trim().toLowerCase(); G.email = email; G.fout = '';
    const { data: uitgenodigd, error: e1 } = await sb.rpc('demo_uitgenodigd', { p_email: email });
    if (e1) { G.fout = 'Er ging iets mis. Probeer het zo opnieuw.'; return CC.render(); }
    if (!uitgenodigd) { G.stap = 'geen'; return CC.render(); }
    const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) G.fout = /rate|seconds|limit/i.test(error.message) ? 'Er is net al een code verstuurd. Gebruik die, of probeer het over een paar minuten opnieuw.' : `Versturen lukte niet: ${error.message}`;
    else G.stap = 'code';
    CC.render();
  });
  CC.on('demoPoortCode', async (f) => {
    const { error } = await sb.auth.verifyOtp({ email: G.email, token: f.code.value.trim(), type: 'email' });
    if (error) { G.fout = 'Deze code klopt niet of is verlopen. Vraag een nieuwe aan.'; return CC.render(); }
    G.fout = ''; toegang();
  });
  CC.on('demoPoortUit', async () => { if (sb) await sb.auth.signOut().catch(() => {}); G.ok = false; G.stap = 'mail'; G.email = ''; G.fout = '';
    ['rondleiding', 'rl-rand', 'rl-open'].forEach((id) => { const x = document.getElementById(id); if (x) x.remove(); }); CC.closeSheet(); CC.render(); });

  // ---------- Rondleiding ----------
  const bewaar = { get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* */ } } };
  const R = { i: bewaar.get('cc-rl-stap') || 0, open: true, keuze: bewaar.get('cc-rl-keuze') }; // keuze: de hoofdstukken die het bestuur wil zien (Besluit 114)
  const S = () => CC.S();
  // Hulp om de juiste stand klaar te zetten
  const als = (wie, rol, tab) => {
    CC.closeSheet(); const pid = S().demo[wie]; CC.zetSessie(pid);
    const i = CC.me().rollen.findIndex((r) => r.rol === rol); CC.wisselRol(i < 0 ? 0 : i);
    if (tab && tab !== 'home') CC.go(tab);
  };
  const klik = (sel) => { const el = document.querySelector(sel); if (el) el.click(); };
  const segKlik = (tekst) => { const b = [...document.querySelectorAll('#app [data-act="seg"]')].find((x) => x.innerText.trim().startsWith(tekst)); if (b) b.click(); };
  // Wat de gele rand omlijnt
  const sectie = (titel) => () => { const k = [...document.querySelectorAll('#app .sectie-kop')].find((x) => x.innerText.trim().toLowerCase().startsWith(titel.toLowerCase())); return k ? [k, k.nextElementSibling].filter(Boolean) : []; };
  const el = (sel) => () => { const e = document.querySelector(sel); return e ? [e] : []; };
  const rijMet = (tekst) => () => { const e = [...document.querySelectorAll('#app .rij')].find((x) => x.innerText.includes(tekst)); return e ? [e] : []; };
  // Het eerste doel dat iets vindt (de demo rekent vanaf vandaag; niet elke dag staat er hetzelfde)
  const eerste = (...fns) => () => { for (const f of fns) { const r = f(); if (r.length) return r; } return []; };

  const ROL = { ouder: 'Ouder', trainer: 'Trainer', teamleider: 'Teamleider', coordinator: 'Coördinator', hjo: 'Hoofd jeugdopleiding', beheerder: 'Clubbeheerder' };
  // ---------- Het verhaal (Besluit 114) ----------
  // Eén week bij de democlub, met twee kinderen uit de O10-1: Jesse (meldt netjes af) en Sem (vergeet het weleens).
  // Een paar stappen doen het echt (afmelden), zodat je ziet hoe het "overspringt" naar trainer, teamleider en chauffeur.
  const kind = (naam) => S().players.find((p) => p.voornaam === naam && p.teamId === 'O10-1') || S().players.find((p) => p.voornaam === naam);
  const jesse = () => kind('Jesse'); const sem = () => kind('Sem');
  // De eerstvolgende wedstrijd (anders de eerstvolgende activiteit). Is de afmeldtermijn al voorbij: bij ziek telt dat niet.
  const jesseAct = () => { const j = jesse(); const l = M.komend(S(), j.teamId).filter((a) => !a.afgelast && !a.opgave); return l.find(M.isWed) || l[0]; };
  const isEerste = () => { const l = M.komend(S(), jesse().teamId).filter((a) => !a.afgelast); return l[0] && jesseAct() && l[0].id === jesseAct().id; };
  const afmVan = () => { const a = jesseAct(); return a && S().afm.find((x) => x.spelerId === jesse().id && x.actId === a.id); };
  // Jesse rijdt mee met Linda (zij heeft zelf een kind in het team); zo hoort zij het vanzelf als hij afgemeld wordt
  const zetRit = () => { const a = jesseAct(); if (!a || afmVan()) return; const v = S().vervoer[a.id];
    if (!(v && v.plek[jesse().id])) { M.neemMee(S(), a, jesse(), S().demo.linda); CC.save(); } };
  const knop = (act, data) => { const b = Object.assign(document.createElement('button'), { hidden: true }); b.dataset.act = act; Object.assign(b.dataset, data); document.body.appendChild(b); b.click(); b.remove(); };
  // Overgeslagen? Dan meldt Sanne Jesse alsnog af (zonder venster), zodat het verhaal verderop klopt
  const zorgAfgemeld = () => { if (afmVan()) return; const a = jesseAct(); if (!a) return; zetRit(); als('sanne', 'ouder');
    const j = jesse(); S().afm.push({ id: 'f' + Date.now(), spelerId: j.id, actId: a.id, reden: 'Ziek', opm: '', tijd: new Date().toISOString(), door: CC.me().id });
    if (M.isWed(a) || a.soort === 'activiteit') CC.ritVervalt(S(), a, j, `${j.voornaam} is afgemeld`);
    const v = S().vervoer[a.id]; if (v) delete v.plek[j.id]; CC.save(); };
  const ritBericht = () => S().msgs.find((m) => m.soort === 'persoonlijk' && m.ontvangers.includes(S().demo.linda) && /rijdt .* niet mee/.test(m.onderwerp) && m.onderwerp.startsWith('Jesse'));
  const tijdVan = (iso) => new Date(iso).toTimeString().slice(0, 5);
  const spoor = () => { const f = afmVan(); const r = ritBericht(); const rij = (ok, tekst, sub) => `<li class="${ok ? 'ok' : ''}"><b>${ok ? '✓' : '→'}</b><span>${tekst}${sub ? `<small>${sub}</small>` : ''}</span></li>`;
    return `<div class="rl-spoor"><small>Wat er net gebeurde</small><ul>${rij(!!f, 'Sanne meldt Jesse af', f ? `${tijdVan(f.tijd)} · ${esc(f.reden.toLowerCase())}` : '')}${rij(!!f, 'Mark (trainer) ziet het op zijn Home', 'meteen')}${rij(!!f, 'Linda (teamleider) ziet het bij de wedstrijd', 'meteen')}${r ? rij(true, 'Jesse zou met Linda meerijden: zij kreeg een bericht', 'vanzelf, met een pushmelding') : ''}</ul></div>`; };
  // Linda's bericht aan het team: wie het kreeg (app, pushmelding, e-mail) en wie nog niet (Besluit 107 en 113)
  const lindaBericht = () => { const s = S(); const id = 'b-demo-verhaal'; let m = s.msgs.find((x) => x.id === id);
    if (!m) { const o = M.oudersVan(s, 'O10-1').filter((x) => x !== s.demo.linda);
      m = { id, van: s.demo.linda, vanRol: 'teamleider', soort: 'nieuws', bereik: 'O10-1', onderwerp: 'Zaterdag: denk aan de wastas', tekst: 'Beste ouders, deze week neemt het gezin van Jesse de wastas mee. Lukt het niet? Laat het mij even weten.', tijd: new Date().toISOString(), ontvangers: o, gelezen: o.slice(0, 5), antw: [], urgent: false, gepland: null, mail: true };
      s.msgs.push(m); s.bezorgd = s.bezorgd || {}; s.bezorgd[id] = { van: s.demo.linda, ontvangers: o, push: o.slice(5, 9), mail: o.slice(9, o.length - 1), antw: {} }; CC.save(); }
    return m; };

  // Mark kan een training niet geven (werk): de coördinator ziet het en regelt een vervanger (Besluit 115)
  const markTraining = () => M.komend(S(), 'O10-1').find((a) => a.soort === 'training' && !a.afgelast);
  const zorgKanNiet = () => { const a = markTraining(); if (!a || a.trainerAfwezig) return; als('mark', 'trainer'); knop('kanNiet', { id: a.id });
    const f = document.querySelector('#sheet form[data-submit="kanNietOk"]'); if (!f) return; f.r.value = 'werk'; f.requestSubmit(); };
  const spoorKanNiet = () => { const a = markTraining(); const x = a && a.trainerAfwezig; const e = S().demo.esther;
    const kreeg = x && S().msgs.some((m) => m.ontvangers.includes(e) && /Vervanger nodig/.test(m.onderwerp));
    const rij = (ok, tekst, sub) => `<li class="${ok ? 'ok' : ''}"><b>${ok ? '✓' : '→'}</b><span>${tekst}${sub ? `<small>${sub}</small>` : ''}</span></li>`;
    return x ? `<div class="rl-spoor"><small>Wat er net gebeurde</small><ul>${rij(true, 'Mark meldt zich af als trainer', `${tijdVan(x.tijd)} · ${esc(x.reden || '')}`)}${rij(kreeg, 'Esther (coördinator) krijgt een bericht', 'met een pushmelding')}${rij(false, 'Esther neemt over, zet een vervanger in of gelast af', 'haar keuze')}</ul></div>` : ''; };

  const STAPPEN = [
    { hfd: 'Proloog', wie: 'sanne', rol: 'ouder', titel: 'Het begon langs de lijn',
      tekst: '<p>Als hoofd opleiding zag ik het elke week bij ouders: afmelden met losse appjes aan de trainer, lijstjes voor het rijden, op zaterdag nog bellen wie de klok wil doen. Goed bedoeld, maar het zat overal en nergens. De trainer wist vaak pas op het veld wie er was.</p><p>Daarom bouwde ik ClubComm: één app waarin alles op elkaar aansluit. Iedereen ziet precies wat hij nodig heeft.</p><p>We volgen één week bij VV De Voorbeeldclub, met twee kinderen uit de O10-1: <b>Jesse</b>, die netjes afmeldt, en <b>Sem</b>, die het weleens vergeet.</p>',
      zet: () => als('sanne', 'ouder') },
    { hfd: 'Ouder', wie: 'sanne', rol: 'ouder', titel: 'Jesse is ziek',
      tekst: () => (afmVan() ? '<p>Sanne heeft Jesse afgemeld: <b>Afmelden → Ziek → Afmelden</b>. Drie tikken.</p><p>Ga verder en kijk wat de trainer ziet.</p>'
        : `<p>Jesse heeft koorts. Vroeger appte Sanne de trainer, en hoopte dat hij het las.</p><p>Nu meldt ze Jesse af bij de wedstrijd zelf: <b>Afmelden → Ziek → Afmelden</b>. Drie tikken.${jesseAct() && new Date() > M.deadline(S(), jesseAct()) ? ' De afmeldtermijn is al voorbij, maar bij ziek telt dat niet.' : ''}</p><div class="rl-doe">${icon('play')}<span><b>Kijk mee:</b> de demo doet het echt.<small>Tik op Afmelden, of op Volgende.</small></span></div>`),
      zet: () => { als('sanne', 'ouder'); zetRit(); const a = jesseAct(); if (!a || afmVan()) return;
        knop('afmelden', { act2: a.id, speler: jesse().id });
        setTimeout(() => { const r = [...document.querySelectorAll('#sheet label.reden')].find((x) => /Ziek/.test(x.innerText)); if (r) r.click(); }, 700); },
      // Volgende = Sanne tikt op Afmelden (als ze dat zelf nog niet deed)
      verder: (door) => { const f = document.querySelector('#sheet form[data-submit="bevestigAfmelden"]'); if (!f) return false;
        const z = [...f.querySelectorAll('input[name="reden"]')].find((x) => x.value === 'Ziek'); if (z) z.checked = true; f.requestSubmit(); setTimeout(door, 700); return true; },
      doel: eerste(el('#sheet .sheet'), rijMet('Jesse'), sectie('Programma'), el('#app main > *')) },
    { hfd: 'Ouder', wie: 'linda', rol: 'ouder', titel: 'De chauffeur hoort het vanzelf',
      tekst: '<p>Jesse zou meerijden met Linda, de moeder van Noah. Zij krijgt vanzelf een bericht (en een pushmelding): Jesse rijdt niet mee, je hoeft hem niet op te halen.</p><p>Niemand hoeft eraan te denken het door te geven.</p>',
      zet: () => { zorgAfgemeld(); als('linda', 'ouder', 'berichten'); }, doel: eerste(rijMet('Jesse rijdt'), el('#app .lijst'), el('#app main > *')) },
    { hfd: 'Trainer', wie: 'mark', rol: 'trainer', titel: 'Het springt over',
      tekst: () => `<p>Mark is trainer. Hij opent de app en ziet het meteen: <b>Jesse komt niet, ziek.</b> Zonder appje, zonder bellen.</p>${spoor()}`,
      // Is de wedstrijd van Jesse de eerstvolgende, dan staat het op Home; anders bij die wedstrijd zelf
      zet: () => { zorgAfgemeld(); als('mark', 'trainer'); if (!isEerste()) CC.open('activiteit', { id: jesseAct().id }); },
      doel: eerste(rijMet(`${jesse().voornaam} ${jesse().achternaam}`), sectie('Actie nodig'), el('#app main > *')) },
    { hfd: 'Trainer', wie: 'mark', rol: 'trainer', titel: 'Aanwezigheid in één minuut',
      tekst: '<p>Na de training tikt Mark aan wie er was en wie te laat kwam. Afmeldingen, zoals die van Jesse, staan er al in.</p><p>Was er iemand niet die ook niet had afgemeld, zoals Sem laatst? Dan tikt Mark dat aan. De rest rekent de app zelf uit.</p>',
      zet: () => { als('mark', 'trainer', 'aanwezigheid'); segKlik('Opnemen'); }, doel: eerste(el('#app .opnemen'), el('#app .lijst'), el('#app main > *')) }, // in een vakantie staat er geen training: dan de lijst of het scherm
    { hfd: 'Trainer', wie: 'mark', rol: 'trainer', titel: 'De regels doen de rest',
      tekst: () => `<p>Op de spelerskaart van ${esc(sem().voornaam)} ziet Mark hoe het gaat. De club bepaalt de regels, bijvoorbeeld:</p><ul><li>de eerste keren een <b>vriendelijke herinnering</b> aan de ouders;</li><li><b>te laat afmelden</b>: een gele kaart;</li><li><b>niet afmelden en niet komen</b>: rood.</li></ul><p>Ziek telt nooit. En de ouders zien bij hun eigen kind precies hetzelfde.</p>`,
      zet: () => { als('mark', 'trainer', 'spelers'); knop('spelerKaart', { id: sem().id }); }, doel: eerste(el('#sheet .sheet'), el('#app .lijst'), el('#app main > *')) },
    { hfd: 'Trainer', wie: 'mark', rol: 'trainer', titel: 'ClubComm signaleert, de trainer beslist',
      tekst: () => `<p>Gaat het vaker mis, dan stelt de app voor: <b>bel of app de ouders van ${esc(sem().voornaam)}</b>. Mark belt vanuit de app en legt kort vast wat er speelt.</p><p>Is er een goede reden, dan tikt hij <b>Begrijpelijk</b>: geen kaart. De app signaleert, de trainer beslist.</p>`,
      zet: () => als('mark', 'trainer'), doel: eerste(rijMet('bel of app de ouders'), sectie('Actie nodig'), el('#app main > *')) },
    { hfd: 'Teamleider', wie: 'linda', rol: 'teamleider', titel: 'De wedstrijd: wie doet wat?',
      tekst: '<p>Linda is ook teamleider. Ze ziet wie er komt (Jesse niet) en welke taken nog open staan: trainer-coach, timekeeper, fotograaf, wastas.</p><p>Met <b>Oproep delen</b> vraagt ze in de teamgroep om hulp. Wie zich opgeeft, staat meteen ingedeeld.</p>',
      zet: () => als('linda', 'teamleider', 'wedstrijd'), doel: eerste(sectie('Taken'), el('#app main > *')) },
    { hfd: 'Teamleider', wie: 'linda', rol: 'teamleider', titel: 'Berichten die aankomen',
      tekst: '<p>Linda stuurt een bericht aan het team. Ze ziet niet alleen wie het las, maar ook <b>hoe het aankwam</b>: in de app, met een pushmelding of per e-mail.</p><p>Bovenaan staat wie het (nog) niet kreeg, met een knop om even te bellen of te appen.</p>',
      zet: () => { als('linda', 'teamleider', 'berichten'); const m = lindaBericht(); CC.open('bericht', { id: m.id }); knop('aankomstVenster', { id: m.id }); },
      doel: eerste(el('#sheet .sheet'), el('#app main > *')) },
    { hfd: 'Wedstrijddag', wie: 'mark', rol: 'trainer', titel: 'Schema, score en speeltijd',
      tekst: '<p>De trainer maakt met één tik een wisselschema, met de speelduur volgens de KNVB voor de leeftijd. Jesse staat er niet in: hij is afgemeld. Wie het minst speelde, krijgt voorrang.</p><p>Langs de lijn houdt de timekeeper, een ouder, de klok en de doelpunten bij. Na <b>Einde wedstrijd</b> liggen uitslag, speeltijd en aanwezigheid vast. Vergeet de trainer het, dan doet de server het 2 uur na afloop.</p>',
      zet: () => als('mark', 'trainer', 'speeltijd'), doel: () => { // Scorebord als er een wedstrijd loopt of net gespeeld is; anders het wisselschema (hangt af van de dag van de week)
        const b = document.querySelector('#app button[data-act="uitslagKlaar"]') || document.querySelector('#app button[data-act="maakSchema"]');
        const k = b && (b.closest('.kaart') || b.parentElement); if (k) return [k];
        return eerste(sectie('Speeltijd dit seizoen'), el('#app main > *'))(); } },
    { hfd: 'Wedstrijddag', wie: 'sanne', rol: 'ouder', titel: 'De uitslag gaat vanzelf naar huis',
      tekst: '<p>Jesse ligt ziek in bed, maar Sanne ziet de uitslag gewoon in de app. Herinneringen, de uitslag, vakanties, het begin van het seizoen: de server verstuurt ze vanzelf, met de regels die de club instelt.</p><p>Nieuws verdwijnt vanzelf naar het archief als het niet meer speelt.</p>',
      zet: () => als('sanne', 'ouder', 'berichten'), doel: eerste(el('#app .lijst'), el('#app main > *')) },
    { hfd: 'De club', wie: 'peter', rol: 'hjo', titel: 'De club in één oogopslag',
      tekst: '<p>Peter is hoofd opleiding: hij maakt de trainers beter. Op zijn Home staat alleen wat over zijn trainers gaat: wie aandacht vraagt, wanneer hij deze week kan gaan kijken, en het rapport Trainers per lichting.</p><p>Het regelwerk (vervanger, staf, aanmeldingen) doet de coördinator. Alleen voor teams zonder coördinator staat het hier, in een eigen blok.</p>',
      zet: () => als('peter', 'hjo'), doel: eerste(sectie('Te doen'), el('#app main > *')) },
    { hfd: 'De club', wie: 'esther', rol: 'coordinator', titel: 'Trainer kan niet? De coördinator regelt het',
      tekst: () => `<p>Mark moet onverwacht werken. Hij meldt zich af als trainer, bij de training zelf. Esther, coördinator van de O10 tot en met O12, krijgt meteen bericht en ziet het bovenaan haar Home.</p><p>Met één tik neemt ze de training over, of ze zet een vervanger in. Lukt het niet, dan gelast ze af: de ouders krijgen vanzelf bericht. Zo blijft het regelwerk niet liggen bij de hoofd opleiding.</p>${spoorKanNiet()}`,
      zet: () => { zorgKanNiet(); als('esther', 'coordinator'); }, doel: eerste(rijMet('Trainer kan niet'), sectie('Te doen'), el('#app main > *')) },
    { hfd: 'De club', wie: 'peter', rol: 'hjo', titel: 'Inzicht: waar gaat het goed of mis?',
      tekst: '<p>Aanwezigheid per team en leeftijdsgroep, met de norm van de club (selectie 90%, breedte 80%). Waarom kinderen afwezig zijn, en hoe het zich ontwikkelt.</p><p>Zo ziet het bestuur waar een team extra aandacht nodig heeft.</p>',
      zet: () => als('peter', 'hjo', 'inzicht'), doel: eerste(sectie('1. Waar gaat het goed'), el('#app main > *')) },
    { hfd: 'De club', wie: 'peter', rol: 'beheerder', titel: 'De club bepaalt de regels',
      tekst: '<p>Afmeldtermijn, kaarten, verzameltijd, speeltijd, automatische berichten: alles is een instelling van de club. Niets ligt vast in de app.</p><p>Ook zet de club zelf aan wat ze nodig heeft: vervoer, taken, speeltijd, ontwikkelgesprekken. Klein beginnen kan, uitbreiden later ook.</p>',
      zet: () => als('peter', 'beheerder', 'regels'), doel: eerste(sectie('Afmelden'), el('#app main > *')) },
    { hfd: 'Slot', wie: 'peter', rol: 'hjo', titel: 'Veilig, en samen ingericht',
      tekst: '<ul><li><b>Privacy:</b> gegevens staan in de EU. Ouders zien alleen hun eigen kind. De rechten zijn in de database zelf geregeld, niet alleen op het scherm.</li><li><b>Inloggen</b> met e-mail en een code: geen wachtwoorden.</li><li><b>In gebruik</b> bij een jeugdteam in Amsterdam, sinds september 2026.</li><li><b>Starten:</b> we richten ClubComm samen met de club in, stap voor stap.</li></ul>',
      zet: () => als('peter', 'hjo') },
  ];
  // Hoofdstukken die het bestuur kan kiezen; Proloog en Slot horen er altijd bij
  const KIES = [['Ouder', 'Afmelden; de chauffeur hoort het vanzelf'], ['Trainer', 'Ziet het meteen, aanwezigheid, kaarten, bellen'], ['Teamleider', 'Taken verdelen, berichten die aankomen'], ['Wedstrijddag', 'Wisselschema, speeltijd, de uitslag gaat vanzelf naar huis'], ['De club', 'Hoofd opleiding, coördinator, inzicht, clubregels']];
  const actief = () => STAPPEN.filter((s) => !KIES.some(([k]) => k === s.hfd) || (R.keuze || []).includes(s.hfd));
  Object.defineProperty(CC, 'demoStappen', { get: () => actief(), configurable: true }); // voor de automatische test (Besluit 88)

  // Startscherm (Besluit 114): samen met het bestuur kiezen wat ze willen zien
  const startPaneel = () => `<div class="rl-kop"><span class="rl-merk">${icon('play')} Rondleiding · ClubComm</span></div>
      <h2 class="rl-titel">Een week bij VV De Voorbeeldclub</h2>
      <div class="rl-tekst"><p>We volgen één week, van een afmelding tot de uitslag. Kies wat u wilt zien; het begin en het slot horen er altijd bij.</p></div>
      <form data-submit="rlBegin" class="rl-keuze">${KIES.map(([k, sub]) => { const n = STAPPEN.filter((x) => x.hfd === k).length;
        return `<label><input type="checkbox" name="h" value="${esc(k)}" checked><span><b>${esc(k)}</b><small>${esc(sub)} · ${n} ${n === 1 ? 'stap' : 'stappen'}</small></span></label>`; }).join('')}
        <div class="rl-knoppen"><button class="knop">Begin het verhaal ${icon('chevron-right')}</button></div></form>
      <p class="rl-hulp">Tip: vraag vooraf wat het bestuur wil zien. Alle namen en clubs zijn verzonnen.</p>
      <button class="linkknop rl-uit" data-act="demoPoortUit">Uitloggen uit de demo</button>`;
  const paneel = () => {
    if (!R.keuze) return startPaneel();
    const ST = actief(); const s = ST[R.i]; const hfds = [...new Set(ST.map((x) => x.hfd))];
    const persoon = CC.me(); const naam = persoon ? persoon.naam.split(' ')[0] : '';
    return `<div class="rl-kop"><span class="rl-merk">${icon('play')} Rondleiding · ClubComm</span><button class="rl-klein" data-act="rlSluit" title="Vrij rondkijken (Esc)">Vrij rondkijken</button></div>
      <div class="rl-rol rol-${s.rol}"><small>Je kijkt nu als</small><b>${esc(ROL[s.rol])}${naam ? ` · ${esc(naam)}` : ''}</b></div>
      <div class="rl-voortgang" aria-hidden="true"><i style="width:${Math.round(((R.i + 1) / ST.length) * 100)}%"></i></div>
      <p class="rl-teller">Stap ${R.i + 1} van ${ST.length} · ${esc(s.hfd)}</p>
      <h2 class="rl-titel">${esc(s.titel)}</h2>
      <div class="rl-tekst">${typeof s.tekst === 'function' ? s.tekst() : s.tekst}</div>
      <div class="rl-knoppen"><button class="knop licht" data-act="rlVorige" ${R.i === 0 ? 'disabled' : ''}>${icon('chevron-left')} Vorige</button><button class="knop" data-act="rlVolgende" ${R.i === ST.length - 1 ? 'disabled' : ''}>Volgende ${icon('chevron-right')}</button></div>
      <nav class="rl-lijst" aria-label="Alle stappen">${hfds.map((hf) => `<div class="rl-hfd"><h3>${esc(hf)}</h3>${ST.map((x, i) => (x.hfd === hf ? `<button class="${i === R.i ? 'aan' : ''}" data-act="rlGa" data-i="${i}"><span>${i + 1}</span>${esc(x.titel)}</button>` : '')).join('')}</div>`).join('')}</nav>
      <p class="rl-hulp">Pijltjes ← → of een presentatieklikker: vorige en volgende. Esc: vrij rondkijken in de app. Alle namen en clubs zijn verzonnen.</p>
      <div class="rl-onder"><button class="linkknop" data-act="rlOpnieuw">Opnieuw beginnen</button><button class="linkknop" data-act="demoPoortUit">Uitloggen uit de demo</button></div>`;
  };
  const aside = () => document.getElementById('rondleiding') || document.body.appendChild(Object.assign(document.createElement('aside'), { id: 'rondleiding' }));
  const rand = () => document.getElementById('rl-rand') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'rl-rand' }));
  let doelen = [];
  const plaatsRand = () => {
    const r = rand(); const els = doelen.filter((e) => e.isConnected && e.getClientRects().length);
    if (!R.open || !els.length) { r.hidden = true; return; }
    const b = els.map((e) => e.getBoundingClientRect()); const pad = 6;
    const top = Math.min(...b.map((x) => x.top)) - pad, left = Math.min(...b.map((x) => x.left)) - pad;
    Object.assign(r.style, { top: `${top}px`, left: `${left}px`, width: `${Math.max(...b.map((x) => x.right)) - left + pad}px`, height: `${Math.max(...b.map((x) => x.bottom)) - top + pad}px` });
    r.hidden = false;
  };
  const tekenPaneel = () => { const a = aside(); a.hidden = !R.open; a.innerHTML = R.open ? paneel() : ''; document.body.classList.toggle('rl', R.open);
    let k = document.getElementById('rl-open'); if (!k) { k = document.body.appendChild(Object.assign(document.createElement('button'), { id: 'rl-open', className: 'knop' })); k.dataset.act = 'rlOpen'; k.innerHTML = `${icon('play')} Rondleiding`; }
    k.hidden = R.open; };
  const toon = (i) => {
    if (!R.keuze) { try { als('sanne', 'ouder'); } catch (e) { console.error(e); } doelen = []; tekenPaneel(); plaatsRand(); return; }
    const ST = actief(); R.i = Math.max(0, Math.min(ST.length - 1, i)); bewaar.set('cc-rl-stap', R.i);
    const s = ST[R.i];
    try { s.zet(); } catch (e) { console.error(e); }
    tekenPaneel();
    requestAnimationFrame(() => {
      doelen = s.doel ? s.doel() : [];
      // Het onderdeel in beeld: in het midden, of bij een lang onderdeel het begin (onder de kop van de app)
      const eerste = doelen[0];
      if (eerste && !eerste.closest('#sheet')) { const b = eerste.getBoundingClientRect(); const y = window.scrollY + b.top;
        window.scrollTo(0, b.height > innerHeight * 0.6 ? y - 90 : y - (innerHeight - b.height) / 2); }
      else if (!eerste) window.scrollTo(0, 0);
      plaatsRand();
      // Alleen de stappenlijst meeschuiven, niet het paneel (dan blijven rol en titel in beeld)
      const lijst = document.querySelector('#rondleiding .rl-lijst'); const actief = lijst && lijst.querySelector('.aan');
      if (actief) lijst.scrollTop = actief.offsetTop - lijst.clientHeight / 2;
    });
  };
  // Volgende: doet een stap iets echt (afmelden), dan eerst dat, daarna verder
  const volgende = () => { const s = R.keuze && actief()[R.i]; if (s && s.verder && s.verder(() => toon(R.i + 1))) return; toon(R.i + 1); };
  CC.on('rlVolgende', volgende);
  CC.on('rlBegin', (f) => { const k = [...f.querySelectorAll('input[name="h"]:checked')].map((x) => x.value); R.keuze = k; bewaar.set('cc-rl-keuze', k); toon(0); });
  // Opnieuw beginnen: de democlub zoals hij was (de afmelding van Jesse is weer weg) en opnieuw kiezen
  CC.on('rlOpnieuw', () => { CC.reset(); R.keuze = null; R.i = 0; bewaar.set('cc-rl-keuze', null); bewaar.set('cc-rl-stap', 0); toon(0); });
  CC.on('rlVorige', () => toon(R.i - 1));
  CC.on('rlGa', (b) => toon(Number(b.dataset.i)));
  CC.on('rlSluit', () => { R.open = false; tekenPaneel(); plaatsRand(); });
  CC.on('rlOpen', () => { R.open = true; toon(R.i); });
  document.addEventListener('keydown', (e) => {
    if (!G.ok || e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target; if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
    if (e.key === 'Escape') { if (!R.open) { R.open = true; toon(R.i); } else if (document.getElementById('sheet').hidden) { R.open = false; tekenPaneel(); plaatsRand(); } return; }
    if (!R.open) return;
    if (!R.keuze) return;
    if (['ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); volgende(); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); toon(R.i - 1); }
  });
  // De rand volgt het onderdeel bij scrollen, venstergrootte en opnieuw tekenen; klikt iemand zelf verder, dan verdwijnt hij.
  window.addEventListener('scroll', plaatsRand, { passive: true });
  window.addEventListener('resize', plaatsRand);
  new MutationObserver(() => requestAnimationFrame(plaatsRand)).observe(document.body, { childList: true, subtree: true });

  const start = () => { appRender(); toon(R.i); };
  CC.start = () => {
    CC.render();
    if (sb) toegang().catch(() => { G.stap = 'mail'; CC.render(); });
    else { G.ok = true; start(); } // zonder databaseverbinding (alleen op de eigen computer): meteen de demo
  };
})();
