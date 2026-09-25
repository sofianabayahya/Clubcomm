// ClubComm — live-versie: inloggen met een e-mailcode, gegevens uit de database, automatisch opslaan.
// Alleen actief als config.js is ingevuld en supabase.js geladen is; met ?demo in de adres­balk draait de demo.
(function () {
  const CC = window.CC; const cfg = window.CC_CONFIG; const h = CC.h, icon = CC.icon, esc = CC.esc, D = CC.date;
  const demo = /[?&]demo\b/.test(location.search);
  if (!cfg || !cfg.url || !window.supabase || demo) { CC.live = false; return; }
  CC.live = true;

  const sb = window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  CC.sb = sb;
  let club = cfg.club; // na inloggen: de club uit de koppeling
  const L = { stap: 'laden', email: '', fout: '', snap: new Map(), geweigerd: new Map(), bezig: false, opnieuw: false, timer: null, geladen: 0, pid: null, uitleg: '' };
  const WACHT = 'clubcomm-aanmelding-v1';
  const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* */ } }, del(k) { try { localStorage.removeItem(k); } catch (e) { /* */ } } };

  // ---------- Laden ----------
  const alleRijen = async () => {
    const uit = []; const stuk = 1000;
    for (let van = 0; ; van += stuk) {
      const { data, error } = await sb.from('rij').select('soort,id,scope,team_id,speler_id,persoon_id,act_id,data').eq('club_id', club).order('soort').order('id').range(van, van + stuk - 1);
      if (error) throw error;
      uit.push(...data); if (data.length < stuk) break;
    }
    return uit;
  };
  const snapshot = (S) => { L.snap = new Map(); CC.naarRijen(S, club).forEach((r, k) => L.snap.set(k, JSON.stringify(r))); };
  const laden = async () => {
    const rijen = await alleRijen();
    const S = CC.uitRijen(rijen, D.vandaag());
    CC.zetS(S); snapshot(S); L.geladen = Date.now();
    return S;
  };

  // ---------- Opslaan: alleen wat veranderd is ----------
  CC.save = () => { clearTimeout(L.timer); L.timer = setTimeout(sync, 400); };
  const RECHTEN = /row-level security|mag alleen|Alleen |niet|42501|P0001/i;
  const sync = async () => {
    if (!L.pid) return;
    if (L.bezig) { L.opnieuw = true; return; }
    L.bezig = true; let geweigerd = 0, offline = false;
    try {
      const nu = CC.naarRijen(CC.S(), club); const nieuw = []; const berichten = [];
      nu.forEach((r, k) => {
        const j = JSON.stringify(r); if (L.snap.get(k) === j || L.geweigerd.get(k) === j) return;
        // Berichten van een ander: alleen "gelezen" en antwoorden, veilig samenvoegen via de database
        if (r.soort === 'msgs' && r.data.van !== L.pid && L.snap.has(k)) { berichten.push({ k, j, r, oud: JSON.parse(L.snap.get(k)).data }); return; }
        nieuw.push({ k, j, r });
      });
      const weg = [...L.snap.keys()].filter((k) => !nu.has(k));
      // Upsert in stukken; lukt een stuk niet, dan per rij (zodat één geweigerde rij de rest niet tegenhoudt)
      for (let i = 0; i < nieuw.length; i += 400) {
        const stuk = nieuw.slice(i, i + 400);
        const { error } = await sb.from('rij').upsert(stuk.map((x) => x.r), { onConflict: 'club_id,soort,id' });
        if (!error) { stuk.forEach((x) => L.snap.set(x.k, x.j)); continue; }
        if (!RECHTEN.test(error.message + ' ' + error.code)) { offline = true; break; }
        for (const x of stuk) {
          const { error: e2 } = await sb.from('rij').upsert(x.r, { onConflict: 'club_id,soort,id' });
          if (!e2) L.snap.set(x.k, x.j);
          else if (RECHTEN.test(e2.message + ' ' + e2.code)) { L.geweigerd.set(x.k, x.j); geweigerd++; console.warn('Niet opgeslagen', x.k, e2.message); }
          else { offline = true; break; }
        }
      }
      for (const b of berichten) {
        const gelezen = (b.r.data.gelezen || []).includes(L.pid) && !(b.oud.gelezen || []).includes(L.pid);
        const oudAntw = new Set((b.oud.antw || []).map((a) => JSON.stringify(a)));
        const antw = (b.r.data.antw || []).filter((a) => !oudAntw.has(JSON.stringify(a)));
        if (!gelezen && !antw.length) { L.geweigerd.set(b.k, b.j); continue; }
        const { error } = await sb.rpc('bericht_bij', { p_id: b.r.id, p_gelezen: gelezen, p_antw: antw });
        if (!error) L.snap.set(b.k, b.j); else offline = true;
      }
      const perSoort = {}; weg.forEach((k) => { const [s, ...id] = k.split('|'); (perSoort[s] || (perSoort[s] = [])).push(id.join('|')); });
      for (const [soort, ids] of Object.entries(perSoort)) {
        const { error } = await sb.from('rij').delete().eq('club_id', club).eq('soort', soort).in('id', ids);
        if (!error) ids.forEach((id) => L.snap.delete(`${soort}|${id}`)); else offline = true;
      }
    } catch (e) { console.warn(e); offline = true; }
    L.bezig = false;
    if (geweigerd) CC.toast('Niet alles is opgeslagen: daarvoor heb je geen rechten', 'fout');
    if (offline) { CC.toast('Geen verbinding. We proberen het zo opnieuw.', 'fout'); clearTimeout(L.timer); L.timer = setTimeout(sync, 15000); }
    if (L.opnieuw) { L.opnieuw = false; sync(); }
  };
  // Is alles opgeslagen? (dan mogen we veilig verversen)
  const allesOpgeslagen = () => {
    if (L.bezig) return false; const nu = CC.naarRijen(CC.S(), club); let ok = true;
    nu.forEach((r, k) => { if (!ok) return; const j = JSON.stringify(r); if (L.snap.get(k) !== j && L.geweigerd.get(k) !== j) ok = false; });
    return ok && [...L.snap.keys()].every((k) => nu.has(k));
  };
  // Verversen: bij terugkomen in de app en elke 2 minuten, maar niet als iemand aan het typen is
  const ververs = async (dwing) => {
    if (!L.pid || document.hidden) return;
    if (!dwing && Date.now() - L.geladen < 60000) return;
    const actief = document.activeElement; const typt = actief && /INPUT|TEXTAREA|SELECT/.test(actief.tagName);
    const sheet = document.getElementById('sheet'); if (!dwing && (typt || (sheet && !sheet.hidden))) return;
    if (!allesOpgeslagen()) { CC.save(); return; }
    try { await laden(); CC.render(); } catch (e) { console.warn(e); }
  };
  document.addEventListener('visibilitychange', () => ververs(false));
  setInterval(() => ververs(false), 120000);
  CC.ververs = () => ververs(true);

  // ---------- Inloggen ----------
  const scherm = (inhoud) => `<div class="login"><img src="assets/clubcomm-icon.png" class="login-logo" alt="ClubComm">${inhoud}</div>`;
  const foutRegel = () => (L.fout ? `<div class="info rood">${icon('circle-alert')}<span>${esc(L.fout)}</span></div>` : '');
  CC.loginScherm = () => {
    const hash = (location.hash || '').replace('#', '');
    if (L.stap === 'laden') return scherm(`<p class="zacht">Even laden…</p>`);
    if (L.stap === 'wacht') return scherm(`<h1>Bijna klaar!</h1><p class="zacht">${esc(L.uitleg)}</p><p class="zacht klein">Je krijgt een bericht zodra de teamleider je aanmelding heeft goedgekeurd.</p>
      <button class="knop" data-act="liveOpnieuw">Opnieuw proberen</button><button class="linkknop" data-act="liveUit">Uitloggen</button>`);
    if (L.stap === 'onbekend') return scherm(`<h1>Nog niet gekoppeld</h1><p class="zacht">Je bent ingelogd als <b>${esc(L.email)}</b>, maar dit e-mailadres is nog niet bekend bij ${esc(L.clubNaam || 'de club')}.</p>
      <div class="info">${icon('info')}<span>Heb je een uitnodiging van de teamleider (QR-code of link)? Open die, dan kun je je aanmelden. Gebruik je bij de club een ander e-mailadres? Log dan uit en log in met dat adres.</span></div>
      <button class="knop" data-act="liveOpnieuw">Opnieuw proberen</button><button class="linkknop" data-act="liveUit">Uitloggen</button>`);
    if (hash.startsWith('uitnodiging-') && L.stap === 'mail') return uitnodiging(hash.slice(12));
    if (L.stap === 'code') return scherm(`<h1>Check je mail</h1><p class="zacht">We hebben een mail gestuurd naar <b>${esc(L.email)}</b>. Tik op de knop in de mail (open hem op dit apparaat), of typ de code over als die in de mail staat.</p>${foutRegel()}
      <form data-submit="liveCode" class="codeform"><label for="lc">Code uit de mail</label><input id="lc" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="10" required placeholder="123456"><button class="knop">Inloggen</button></form>
      <p class="zacht klein">Geen mail? Kijk ook in je spam. <button class="linkknop" data-act="liveNogmaals">Stuur opnieuw</button> · <button class="linkknop" data-act="liveTerug">Ander e-mailadres</button></p>`);
    return scherm(`<h1>ClubComm</h1><p class="zacht">${esc(L.clubNaam || 'Jeugdvoetbal')}</p>${foutRegel()}
      <form data-submit="liveMail" class="codeform"><label for="lm">Je e-mailadres</label><input id="lm" name="email" type="email" autocomplete="email" required placeholder="naam@voorbeeld.nl" value="${esc(L.email)}"><button class="knop">Stuur mij een inlogcode</button></form>
      <p class="zacht klein">Geen wachtwoord nodig. Je blijft ingelogd op dit apparaat.</p>`);
  };
  const uitnodiging = (teamId) => {
    if (!L.uitnod || L.uitnod.team !== teamId) { L.uitnod = { team: teamId, info: null }; sb.rpc('uitnodiging_info', { p_club: club, p_team: teamId }).then(({ data }) => { L.uitnod.info = data || {}; CC.render(); }); return scherm('<p class="zacht">Even laden…</p>'); }
    const i = L.uitnod.info || {}; CC.privacyClub = { naam: i.club };
    if (!i.team) return scherm(`<h1>Uitnodiging</h1><p class="zacht">Deze uitnodiging bestaat niet (meer). Vraag de teamleider om een nieuwe.</p><button class="knop" data-act="liveSluitUitnodiging">Naar inloggen</button>`);
    return scherm(`<h1>Aanmelden bij ${esc(i.team)}</h1><p class="zacht">${esc(i.club || '')} gebruikt ClubComm voor afmelden, planning en berichten.</p>${foutRegel()}
      <form data-submit="liveAanmelden" data-team="${esc(teamId)}" class="codeform">
        <label for="a-mail">Jouw e-mailadres</label><input id="a-mail" name="email" type="email" required autocomplete="email">
        <label for="a-ouder">Jouw naam</label><input id="a-ouder" name="ouder" required placeholder="Voor- en achternaam" autocomplete="name">
        <label for="a-kind">Voornaam van je kind</label><input id="a-kind" name="voor" required>
        <label for="a-kind2">Achternaam van je kind</label><input id="a-kind2" name="achter" required>
        <label class="vink"><input type="checkbox" name="ok" required> Ik heb de <a href="#" data-act="privacy">privacyverklaring</a> gelezen en geef toestemming dat de club de gegevens van mijn kind in ClubComm gebruikt.</label>
        <button class="knop" type="submit">Aanmelden</button></form>`);
  };
  const stuurCode = async (email) => {
    L.fout = ''; L.email = email;
    const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: location.origin + location.pathname } });
    if (error) { L.fout = /rate|seconds|limit/i.test(error.message) ? 'Er is net al een inlogmail verstuurd. Gebruik de knop in die mail, of probeer het over een paar minuten opnieuw.' : `Versturen lukte niet: ${error.message}`; }
    else L.stap = 'code';
    CC.render();
  };
  CC.on('liveMail', (f) => stuurCode(f.email.value.trim().toLowerCase()));
  CC.on('liveNogmaals', () => stuurCode(L.email));
  CC.on('liveTerug', () => { L.stap = 'mail'; L.fout = ''; CC.render(); });
  CC.on('liveCode', async (f) => {
    const { error } = await sb.auth.verifyOtp({ email: L.email, token: f.code.value.trim(), type: 'email' });
    if (error) { L.fout = 'Deze code klopt niet of is verlopen. Vraag een nieuwe aan.'; CC.render(); return; }
    await naInloggen();
  });
  CC.on('liveAanmelden', (f) => {
    store.set(WACHT, { team: f.dataset.team, ouder: f.ouder.value.trim(), voor: f.voor.value.trim(), achter: f.achter.value.trim() });
    history.replaceState(null, '', location.pathname);
    stuurCode(f.email.value.trim().toLowerCase());
  });
  CC.on('liveSluitUitnodiging', () => { history.replaceState(null, '', location.pathname); L.stap = 'mail'; CC.render(); });
  CC.on('liveOpnieuw', () => naInloggen());
  CC.on('liveUit', () => CC.logout());
  const oudLogout = CC.logout;
  CC.logout = async () => { await sb.auth.signOut().catch(() => {}); L.pid = null; L.stap = 'mail'; L.email = ''; oudLogout(); };

  // Na inloggen: koppelen aan de persoon in de club, eventuele aanmelding versturen, gegevens laden
  const naInloggen = async () => {
    if (L.inloggen) return L.inloggen; // niet twee keer tegelijk (code én inlogmelding)
    L.inloggen = inloggen().finally(() => { L.inloggen = null; });
    return L.inloggen;
  };
  const inloggen = async () => {
    L.stap = 'laden'; CC.render();
    const { data: sessie } = await sb.auth.getSession(); const user = sessie && sessie.session && sessie.session.user;
    if (!user) { L.stap = 'mail'; CC.render(); return; }
    L.email = user.email;
    const { data: kop, error } = await sb.rpc('koppel_mij');
    if (error) { L.stap = 'mail'; L.fout = `Er ging iets mis: ${error.message}`; CC.render(); return; }
    const wacht = store.get(WACHT);
    if (wacht) {
      const { error: e2 } = await sb.rpc('aanmelden', { p_club: club, p_team: wacht.team, p_ouder: wacht.ouder, p_voor: wacht.voor, p_achter: wacht.achter, p_akkoord: true });
      store.del(WACHT);
      if (!e2 && !(kop && kop.length)) { L.stap = 'wacht'; L.uitleg = `Je aanmelding voor ${wacht.voor} is verstuurd naar de teamleider.`; CC.render(); return; }
      if (!e2) CC.toast(`Aanmelding voor ${wacht.voor} verstuurd naar de teamleider`);
    }
    if (!kop || !kop.length) { L.stap = 'onbekend'; CC.render(); return; }
    L.pid = kop[0].persoon_id; club = kop[0].club_id || club;
    try { await laden(); } catch (e) { L.stap = 'mail'; L.fout = `Laden lukte niet: ${e.message}`; L.pid = null; CC.render(); return; }
    if (!CC.me()) { CC.zetSessie(L.pid); }
    CC.zetSessie(L.pid);
    if (!CC.me()) { L.stap = 'mail'; L.fout = 'Je account is gekoppeld, maar je gegevens konden niet worden geladen. Ververs de pagina.'; L.pid = null; CC.render(); return; }
    L.stap = 'klaar'; CC.render();
  };

  // ---------- Beheer: club vullen met voorbeelddata om te testen, of leegmaken ----------
  const vullen = async () => {
    const S = CC.generate(); const ik = CC.me(); const peter = S.people.find((p) => p.id === S.demo.peter);
    // De voorbeeld-HJO wordt jij; voorbeeldadressen kunnen geen mail ontvangen (.invalid)
    let json = JSON.stringify(S).split(`"${peter.id}"`).join(`"${ik.id}"`);
    // Voorbeeldadres van het sportpark vervangen door dat van de eigen club
    const club0 = CC.S().club; if (club0.sportpark) json = json.split('Sportpark Buitenveldert, De Boelelaan 50, Amsterdam').join(club0.sportpark);
    const T = JSON.parse(json); T.people.forEach((p) => { if (p.id !== ik.id) p.email = p.email.replace(/@.*$/, '@demo.invalid'); });
    T.club = CC.S().club;
    const rijen = [...CC.naarRijen(T, club).values()].filter((r) => r.soort !== 'club');
    for (let i = 0; i < rijen.length; i += 800) {
      const { error } = await sb.rpc('club_vullen', { p_rijen: rijen.slice(i, i + 800) });
      if (error) { CC.toast(`Vullen mislukt: ${error.message}`, 'fout'); return; }
      CC.toast(`Bezig… ${Math.min(i + 800, rijen.length)} van ${rijen.length}`);
    }
    await laden(); CC.render(); CC.toast('Klaar: de club is gevuld met voorbeelddata');
  };
  CC.on('liveVullen', () => CC.sheet('Voorbeelddata laden', `<p>Dit vult de club met 16 voorbeeldteams, spelers, ouders en een seizoen aan afmeldingen, zodat je alles kunt uitproberen. <b>Jij</b> wordt de HJO in de voorbeelddata.</p><p class="zacht klein">De voorbeeldmensen hebben nep-e-mailadressen; niemand krijgt mail. Later maak je de club weer leeg voor de echte gegevens.</p><button class="knop vol" data-act="liveVullenOk">Voorbeelddata laden</button>`));
  CC.on('liveVullenOk', () => { CC.closeSheet(); vullen(); });
  CC.on('liveLeeg', () => CC.sheet('Club leegmaken', `<p><b>Alle</b> teams, spelers, ouders, afmeldingen en berichten worden verwijderd. De instellingen van de club en jouw account blijven.</p><p class="zacht klein">Dit kan niet ongedaan worden gemaakt.</p><form data-submit="liveLeegOk" class="codeform"><label for="ll">Typ LEEGMAKEN om te bevestigen</label><input id="ll" name="b" required autocomplete="off"><button class="knop vol rood">Club leegmaken</button></form>`));
  CC.on('liveLeegOk', async (f) => {
    if (f.b.value.trim() !== 'LEEGMAKEN') return CC.toast('Typ LEEGMAKEN in hoofdletters', 'fout');
    CC.closeSheet(); const { data, error } = await sb.rpc('club_leegmaken');
    if (error) return CC.toast(`Mislukt: ${error.message}`, 'fout');
    await laden(); CC.render(); CC.toast(`${data} rijen verwijderd`);
  });
  // Back-up (Besluit 37): de server maakt elke zondag een back-up (8 weken bewaard); de beheerder kan zelf een kopie downloaden
  CC.on('liveBackup', () => {
    const rijen = [...CC.naarRijen(CC.S(), club).values()];
    const blob = new Blob([JSON.stringify({ club, gemaakt: new Date().toISOString(), rijen }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `clubcomm-${club}-${D.vandaag()}.json`; document.body.appendChild(a); a.click(); a.remove();
    CC.toast(`Back-up gedownload (${rijen.length} rijen). Bewaar hem veilig: er staan persoonsgegevens in.`);
  });
  const origBeheerHome = CC.rollen.beheerder.schermen.home;
  CC.rollen.beheerder.schermen.home = (S) => origBeheerHome(S) + `${h.sectie('Gegevens')}<div class="lijst">
    ${h.rij({ ic: 'file-down', titel: 'Back-up downloaden', sub: 'Automatisch: elke zondag op de server (8 weken). Download af en toe zelf een kopie.', act: 'liveBackup' })}</div>
    ${h.sectie('Testen')}<div class="lijst">
    ${h.rij({ ic: 'upload', titel: 'Voorbeelddata laden', sub: S.teams.length ? `${S.teams.length} teams in de club` : 'De club is nog leeg', act: 'liveVullen' })}
    ${h.rij({ ic: 'trash-2', titel: 'Club leegmaken', sub: 'Voor de start met echte gegevens', act: 'liveLeeg', kleur: 'rood' })}</div>`;

  // ---------- Starten ----------
  const origStart = CC.start;
  CC.start = () => {
    CC.zetS(CC.uitRijen([], D.vandaag())); // lege club tot de gegevens geladen zijn
    CC.zetSessie(null);
    L.stap = 'laden'; origStart();
    sb.auth.onAuthStateChange((ev) => { if (ev === 'SIGNED_IN' && !L.pid) naInloggen(); if (ev === 'SIGNED_OUT') { L.pid = null; } });
    naInloggen();
  };
})();
