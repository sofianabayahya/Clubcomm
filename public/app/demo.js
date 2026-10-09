// ClubComm — demo met rondleiding voor besturen (Besluit 89). Alleen op /demo, alleen voor e-mailadressen op de
// toegangslijst (tabel demo_toegang, migratie 023). Inloggen zoals in de echte app (e-mail + code). De demo gebruikt
// alleen verzonnen voorbeeldgegevens in de browser en schrijft nooit naar de database.
// Laptop: links de app op telefoonbreedte, rechts een vast uitlegpaneel; een gele rand toont het besproken onderdeel.
(function () {
  const CC = window.CC; const cfg = window.CC_CONFIG; const esc = CC.esc, icon = CC.icon;
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
  const R = { i: bewaar.get('cc-rl-stap') || 0, open: true };
  const S = () => CC.S();
  // Hulp om de juiste stand klaar te zetten
  const als = (wie, rol, tab) => {
    const pid = S().demo[wie]; CC.zetSessie(pid);
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

  const ROL = { ouder: 'Ouder', trainer: 'Trainer', teamleider: 'Teamleider', hjo: 'Hoofd jeugdopleiding', beheerder: 'Clubmanager' };
  const STAPPEN = [
    { hfd: 'Start', wie: 'sanne', rol: 'ouder', titel: 'Eén app voor de hele jeugdafdeling',
      tekst: '<p>Afmelden via WhatsApp, lijstjes voor vervoer, bellen om een timekeeper: bij de meeste clubs zit het overal en nergens. De trainer weet vaak pas op het veld wie er is.</p><p>ClubComm brengt dat samen in één app op de telefoon. Iedere rol ziet precies wat hij nodig heeft, en alles sluit op elkaar aan.</p><p>We volgen <b>één week rond een wedstrijd</b> van de O10-1 van de verzonnen <b>VV De Voorbeeldclub</b>.</p>',
      zet: () => als('sanne', 'ouder') },
    { hfd: 'Ouder', wie: 'sanne', rol: 'ouder', titel: 'Home: wat moet ik doen, wat komt er?',
      tekst: '<p>Sanne is moeder van Jesse. Bovenaan staat alleen wat zij nu moet doen: een bericht van de trainer lezen, vervoer, een open taak.</p><p>Staat er niets, dan hoeft ze niets. Daaronder het programma van de week.</p>',
      zet: () => als('sanne', 'ouder'), doel: sectie('Actie nodig') },
    { hfd: 'Ouder', wie: 'sanne', rol: 'ouder', titel: 'Afmelden in 3 tikken',
      tekst: '<p>Afmelden gebeurt bij de training of wedstrijd zelf: tik op <b>Afmelden</b>, kies een reden, klaar.</p><p>De trainer en teamleider zien het meteen. Is de afmeldtermijn voorbij, dan zegt de app dat vooraf. Er is geen verrassing achteraf.</p>',
      zet: () => { als('sanne', 'ouder'); klik('#app button[data-act="afmelden"]'); }, doel: el('#sheet .sheet') },
    { hfd: 'Ouder', wie: 'sanne', rol: 'ouder', titel: 'Vervoer: wie rijdt er?',
      tekst: '<p>Voor een uitwedstrijd zien ouders wie nog vervoer zoekt, en met één tik bieden ze een plek aan.</p><p>Meldt een kind zich af dat zou meerijden, dan krijgt de chauffeur vanzelf bericht.</p>',
      zet: () => als('sanne', 'ouder', 'vervoer'), doel: eerste(rijMet('zoekt vervoer'), el('#app button[data-act="plekZoeken"]'), el('#app main > *')) },
    { hfd: 'Trainer', wie: 'mark', rol: 'trainer', titel: 'De trainer weet wie er komt',
      tekst: '<p>Mark is trainer. Op zijn Home: wie er niet komt en waarom, of een uitslag nog moet worden opgeslagen, en welke spelers aandacht vragen.</p><p><b>ClubComm signaleert, mensen beslissen.</b> Bij een speler die vaak niet afmeldt, stelt de app voor de ouders te bellen. De trainer beslist.</p>',
      zet: () => als('mark', 'trainer'), doel: sectie('Actie nodig') },
    { hfd: 'Trainer', wie: 'mark', rol: 'trainer', titel: 'Aanwezigheid in één minuut',
      tekst: '<p>Na de training tikt de trainer aan wie er was en wie te laat kwam. Afmeldingen staan er al in.</p><p>Aanwezigheid per fase, kaarten en signalen rekent de app daarna zelf uit. Dezelfde cijfers ziet de ouder bij het eigen kind.</p>',
      zet: () => { als('mark', 'trainer', 'aanwezigheid'); segKlik('Opnemen'); }, doel: el('#app .opnemen') },
    { hfd: 'Trainer', wie: 'mark', rol: 'trainer', titel: 'Wedstrijddag: schema, score en speeltijd',
      tekst: '<p>De trainer maakt met één tik een wisselschema, met de speelduur volgens de KNVB voor de leeftijd. Wie het minst speelde, krijgt voorrang. De timekeeper, een ouder, ziet het schema op de wedstrijddag.</p><p>Langs de lijn houdt de timekeeper de doelpunten bij. Na <b>Einde wedstrijd</b> liggen uitslag, speeltijd en aanwezigheid vast. Vergeet de trainer het, dan doet de server het 2 uur na afloop.</p>',
      zet: () => als('mark', 'trainer', 'speeltijd'), doel: () => { // Scorebord als er een wedstrijd loopt of net gespeeld is; anders het wisselschema (hangt af van de dag van de week)
        const b = document.querySelector('#app button[data-act="uitslagKlaar"]') || document.querySelector('#app button[data-act="maakSchema"]');
        const k = b && (b.closest('.kaart') || b.parentElement); if (k) return [k];
        return sectie('Speeltijd dit seizoen')(); } },
    { hfd: 'Teamleider', wie: 'linda', rol: 'teamleider', titel: 'De wedstrijd: wie doet wat?',
      tekst: '<p>Linda is teamleider. Ze ziet wie er komt en welke taken nog open staan: trainer-coach, timekeeper, fotograaf, wastas.</p><p>Met <b>Oproep delen</b> vraagt ze in de teamgroep om hulp. Wie zich opgeeft, staat meteen ingedeeld.</p>',
      zet: () => als('linda', 'teamleider', 'wedstrijd'), doel: sectie('Taken') },
    { hfd: 'Teamleider', wie: 'linda', rol: 'teamleider', titel: 'Het hele team bereiken',
      tekst: '<p>Nieuwe ouders melden zich zelf aan met een link of QR-code. De teamleider keurt alleen goed.</p><p>De teamleider ziet ook welke gezinnen pushmeldingen krijgen, en spreekt de rest langs het veld aan.</p>',
      zet: () => als('linda', 'teamleider', 'team'), doel: sectie('Pushmeldingen') },
    { hfd: 'Vanzelf', wie: 'sanne', rol: 'ouder', titel: 'Berichten die vanzelf gaan',
      tekst: '<p>Herinneringen voor trainingen en wedstrijden, de uitslag, vakanties, het begin van het seizoen: de server verstuurt ze elk kwartier vanzelf, met de regels die de club instelt.</p><p>Gesprekken met de staf staan apart. Nieuws verdwijnt vanzelf naar het archief als het niet meer speelt.</p>',
      zet: () => als('sanne', 'ouder', 'berichten'), doel: el('#app .lijst') },
    { hfd: 'Club', wie: 'peter', rol: 'hjo', titel: 'De club in één oogopslag',
      tekst: '<p>Peter is hoofd jeugdopleiding. Hij hoeft niet rond te bellen: kan een trainer niet, zit een team zonder staf, ligt een aanmelding te lang stil, dan staat het hier.</p><p>Met één tik neemt hij over of gelast af. Wat alleen informatie is, staat apart.</p>',
      zet: () => als('peter', 'hjo'), doel: sectie('Te doen') },
    { hfd: 'Club', wie: 'peter', rol: 'hjo', titel: 'Inzicht: waar gaat het goed of mis?',
      tekst: '<p>Aanwezigheid per team en leeftijdsgroep, met de norm van de club (selectie 90%, breedte 80%). Waarom kinderen afwezig zijn, en hoe het zich ontwikkelt.</p><p>Zo ziet het bestuur waar een team extra aandacht nodig heeft.</p>',
      zet: () => als('peter', 'hjo', 'inzicht'), doel: sectie('1. Waar gaat het goed') },
    { hfd: 'Beheer', wie: 'peter', rol: 'beheerder', titel: 'De club bepaalt de regels',
      tekst: '<p>Afmeldtermijn, kaarten, zones, speeltijd, automatische berichten: alles is een instelling van de club. Niets ligt vast in de app.</p><p>Zo past ClubComm bij de afspraken die de club al heeft.</p>',
      zet: () => als('peter', 'beheerder', 'regels'), doel: sectie('Afmelden') },
    { hfd: 'Beheer', wie: 'peter', rol: 'beheerder', titel: 'Modules aan of uit',
      tekst: '<p>Vervoer, taken, speeltijd, ontwikkelgesprekken: de club zet aan wat ze nodig heeft. Klein beginnen kan, uitbreiden later ook.</p>',
      zet: () => als('peter', 'beheerder', 'modules'), doel: el('#app .lijst') },
    { hfd: 'Afsluiting', wie: 'peter', rol: 'hjo', titel: 'Veilig, en samen ingericht',
      tekst: '<ul><li><b>Privacy:</b> gegevens staan in de EU. Ouders zien alleen hun eigen kind. De rechten zijn in de database zelf geregeld, niet alleen op het scherm.</li><li><b>Inloggen</b> met e-mail en een code: geen wachtwoorden.</li><li><b>In gebruik</b> bij een jeugdteam in Amsterdam, sinds september 2026.</li><li><b>Starten:</b> we richten ClubComm samen met de club in, stap voor stap.</li></ul>',
      zet: () => als('peter', 'hjo') },
  ];
  CC.demoStappen = STAPPEN; // voor de automatische test (Besluit 88)

  const paneel = () => {
    const s = STAPPEN[R.i]; const hfds = [...new Set(STAPPEN.map((x) => x.hfd))];
    const persoon = CC.me(); const naam = persoon ? persoon.naam.split(' ')[0] : '';
    return `<div class="rl-kop"><span class="rl-merk">${icon('play')} Rondleiding · ClubComm</span><button class="rl-klein" data-act="rlSluit" title="Vrij rondkijken (Esc)">Vrij rondkijken</button></div>
      <div class="rl-rol rol-${s.rol}"><small>Je kijkt nu als</small><b>${esc(ROL[s.rol])}${naam ? ` · ${esc(naam)}` : ''}</b></div>
      <div class="rl-voortgang" aria-hidden="true"><i style="width:${Math.round(((R.i + 1) / STAPPEN.length) * 100)}%"></i></div>
      <p class="rl-teller">Stap ${R.i + 1} van ${STAPPEN.length} · ${esc(s.hfd)}</p>
      <h2 class="rl-titel">${esc(s.titel)}</h2>
      <div class="rl-tekst">${s.tekst}</div>
      <div class="rl-knoppen"><button class="knop licht" data-act="rlVorige" ${R.i === 0 ? 'disabled' : ''}>${icon('chevron-left')} Vorige</button><button class="knop" data-act="rlVolgende" ${R.i === STAPPEN.length - 1 ? 'disabled' : ''}>Volgende ${icon('chevron-right')}</button></div>
      <nav class="rl-lijst" aria-label="Alle stappen">${hfds.map((hf) => `<div class="rl-hfd"><h3>${esc(hf)}</h3>${STAPPEN.map((x, i) => (x.hfd === hf ? `<button class="${i === R.i ? 'aan' : ''}" data-act="rlGa" data-i="${i}"><span>${i + 1}</span>${esc(x.titel)}</button>` : '')).join('')}</div>`).join('')}</nav>
      <p class="rl-hulp">Pijltjes ← → of een presentatieklikker: vorige en volgende. Esc: vrij rondkijken in de app. Alle namen en clubs zijn verzonnen.</p>
      <button class="linkknop rl-uit" data-act="demoPoortUit">Uitloggen uit de demo</button>`;
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
    R.i = Math.max(0, Math.min(STAPPEN.length - 1, i)); bewaar.set('cc-rl-stap', R.i);
    const s = STAPPEN[R.i];
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
  CC.on('rlVolgende', () => toon(R.i + 1));
  CC.on('rlVorige', () => toon(R.i - 1));
  CC.on('rlGa', (b) => toon(Number(b.dataset.i)));
  CC.on('rlSluit', () => { R.open = false; tekenPaneel(); plaatsRand(); });
  CC.on('rlOpen', () => { R.open = true; toon(R.i); });
  document.addEventListener('keydown', (e) => {
    if (!G.ok || e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target; if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
    if (e.key === 'Escape') { if (!R.open) { R.open = true; toon(R.i); } else if (document.getElementById('sheet').hidden) { R.open = false; tekenPaneel(); plaatsRand(); } return; }
    if (!R.open) return;
    if (['ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); toon(R.i + 1); }
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
