// ClubComm — pushmeldingen (Besluit 53).
// Per telefoon aan te zetten in Profiel → Meldingen. Op de iPhone alleen als ClubComm op het beginscherm staat (iOS 16.4+).
// Soorten: noodberichten (altijd), persoonlijk, aankondigingen, herinneringen, en voor de staf: aanmeldingen/afmeldingen.
// De server (Edge Function "melding") verstuurt; nachtrust 21:00–07:30 behalve noodberichten. Wie geen push heeft, krijgt e-mail.
(function () {
  const CC = window.CC; const h = CC.h, icon = CC.icon, esc = CC.esc;
  const OPSLAG = 'clubcomm-push-v1';
  const lees = () => { try { return JSON.parse(localStorage.getItem(OPSLAG)) || null; } catch (e) { return null; } };
  const bewaar = (v) => { try { if (v) localStorage.setItem(OPSLAG, JSON.stringify(v)); else localStorage.removeItem(OPSLAG); } catch (e) { /* */ } };
  const SOORTEN = [
    ['persoonlijk', 'Persoonlijk', 'Berichten en antwoorden aan jou, kaarten, taken en vervoer'],
    ['aankondiging', 'Nieuws en activiteiten', 'Nieuwe activiteiten en berichten van team of club'],
    ['herinnering', 'Herinneringen', 'Vakantie, start seizoen, opgave (dan geen e-mail meer)'],
    ['staf', 'Voor de staf', 'Nieuwe aanmelding, afmelding op de dag zelf, trainer kan niet'],
  ];
  const beginscherm = () => (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const iPhone = () => /iPhone|iPad|iPod/.test(navigator.userAgent);
  const kan = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const isStaf = () => (CC.me() ? CC.me().rollen : []).some((r) => r.rol !== 'ouder');
  const b64 = (s) => { const p = '='.repeat((4 - (s.length % 4)) % 4); const r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...r].map((c) => c.charCodeAt(0))); };

  // Status op deze telefoon: 'aan', 'uit', 'geblokkeerd', 'beginscherm' (iPhone: eerst op beginscherm), 'kanniet', 'demo'
  CC.pushStatus = () => {
    if (!CC.live) return 'demo';
    if (!kan()) return iPhone() && !beginscherm() ? 'beginscherm' : 'kanniet';
    if (Notification.permission === 'denied') return 'geblokkeerd';
    return lees() && Notification.permission === 'granted' ? 'aan' : 'uit';
  };
  CC.meldingenSub = () => ({ aan: 'Pushmeldingen staan aan op deze telefoon', uit: 'Zet pushmeldingen aan', beginscherm: 'Pushmeldingen: zet eerst de app op je beginscherm', geblokkeerd: 'Pushmeldingen geblokkeerd in je instellingen' }[CC.pushStatus()] || 'In de app, en per e-mail bij belangrijke berichten');

  const aanmelden = async (voorkeur) => {
    const sb = CC.sb; const club = CC.clubId();
    let { data: sleutel } = await sb.rpc('push_sleutel');
    if (!sleutel) { const r = await sb.functions.invoke('melding', { body: { sleutel: true } }); sleutel = r.data && r.data.publiek; }
    if (!sleutel) throw new Error('Pushmeldingen zijn nog niet ingesteld');
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(sleutel) });
    const j = sub.toJSON();
    const toestel = `${iPhone() ? 'iPhone' : /Android/.test(navigator.userAgent) ? 'Android' : 'Computer'}${beginscherm() ? ' (beginscherm)' : ''}`;
    const { error } = await sb.rpc('push_aan', { p_club: club, p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth, p_voorkeur: voorkeur, p_toestel: toestel });
    if (error) throw error;
    bewaar({ endpoint: j.endpoint, voorkeur });
  };

  CC.on('meldingen', () => {
    const st = CC.pushStatus(); const nu = lees(); const v = (nu && nu.voorkeur) || {};
    const uitleg = `<p class="zacht klein">Alles staat altijd in de app bij <b>Berichten</b>. Noodberichten (afgelast, wijziging) krijg je altijd. Tussen 21:00 en 07:30 komen andere meldingen pas 's ochtends. Zonder pushmeldingen krijg je belangrijke berichten per e-mail.</p>`;
    let inhoud;
    if (st === 'demo') inhoud = `<p>Pushmeldingen werken alleen in de echte versie van ClubComm.</p>${uitleg}`;
    else if (st === 'beginscherm') inhoud = `<div class="info">${icon('smartphone')}<span>Op de iPhone werken pushmeldingen alleen als ClubComm op je <b>beginscherm</b> staat. Zet de app daar eerst neer, open hem via het icoon en kom dan hier terug.</span></div>
      <button class="knop vol" data-act="beginscherm">${icon('smartphone')}App op je beginscherm zetten</button>${uitleg}`;
    else if (st === 'kanniet') inhoud = `<p>Deze browser ondersteunt geen pushmeldingen. Je krijgt belangrijke berichten per e-mail.</p>${uitleg}`;
    else if (st === 'geblokkeerd') inhoud = `<div class="info oranje">${icon('bell-off')}<span>Meldingen voor ClubComm staan uit in de instellingen van je telefoon. ${iPhone() ? 'Ga naar <b>Instellingen → Meldingen → ClubComm</b> en zet <b>Sta meldingen toe</b> aan.' : 'Tik op het slotje naast het webadres, of ga naar de instellingen van je telefoon → Apps → ClubComm → Meldingen.'}</span></div>${uitleg}`;
    else {
      const soorten = SOORTEN.filter(([k]) => k !== 'staf' || isStaf());
      inhoud = `${st === 'aan' ? `<div class="info groen">${icon('bell')}<span>Pushmeldingen staan <b>aan</b> op deze telefoon.</span></div>` : `<p>Krijg een melding op je telefoon bij belangrijke berichten, ook als de app dicht is.</p>`}
        <form data-submit="pushOk" class="codeform">
          <label class="vink"><input type="checkbox" checked disabled><span><b>Noodberichten</b><br><small class="zacht">Afgelast, tijd of veld gewijzigd. Altijd aan.</small></span></label>
          ${soorten.map(([k, l, s]) => `<label class="vink"><input type="checkbox" name="${k}" ${v[k] === false ? '' : 'checked'}><span><b>${esc(l)}</b><br><small class="zacht">${esc(s)}</small></span></label>`).join('')}
          <button class="knop vol">${icon('bell')}${st === 'aan' ? 'Opslaan' : 'Meldingen aanzetten'}</button>
        </form>
        ${st === 'aan' ? `<button class="knop licht vol" data-act="pushUit">${icon('bell-off')}Uitzetten op deze telefoon</button>` : ''}${uitleg}`;
    }
    CC.sheet('Meldingen', inhoud);
  });

  // Aanzetten: toestemming vragen meteen bij de tik (de iPhone staat het alleen dan toe), daarna de telefoon aanmelden
  const zetAan = async (voorkeur, knop) => {
    const toestemming = Notification.permission === 'granted' ? Promise.resolve('granted') : Notification.requestPermission();
    if (knop) { knop.disabled = true; knop.textContent = 'Even geduld…'; }
    try {
      if ((await toestemming) !== 'granted') { CC.closeSheet(); CC.toast('Geen toestemming: meldingen staan uit', 'fout'); return; }
      await aanmelden(voorkeur);
      CC.closeSheet(); CC.render(); CC.toast('Pushmeldingen staan aan');
    } catch (e) { console.warn(e); if (knop) { knop.disabled = false; knop.textContent = 'Opnieuw proberen'; } CC.toast(`Aanzetten lukte niet: ${e.message || e}`, 'fout'); }
  };
  CC.on('pushOk', (f) => {
    const voorkeur = {}; SOORTEN.forEach(([k]) => { if (f[k]) voorkeur[k] = f[k].checked; });
    zetAan(voorkeur, f.querySelector('button'));
  });

  // Welkom (Besluit 55): één keer per telefoon, meteen na het eerste inloggen. Alles staat standaard aan; één tik + "Sta toe".
  const WELKOM = 'clubcomm-push-welkom';
  CC.pushWelkom = () => {
    const st = CC.pushStatus(); if (st !== 'uit' && st !== 'beginscherm') return;
    try { if (localStorage.getItem(WELKOM)) return; localStorage.setItem(WELKOM, String(Date.now())); } catch (e) { return; }
    if (st === 'beginscherm') return CC.sheet('Mis niets van het team', `<p>Krijg een melding bij een afgelasting, wijziging of bericht voor jou. Zet ClubComm daarvoor eerst op je beginscherm:</p>${CC.beginStappen ? CC.beginStappen() : ''}<p class="zacht klein">Open ClubComm daarna via het icoon en log in met de code. Dan vragen we of je meldingen wilt.</p>`);
    CC.sheet('Mis niets van het team', `<div class="welkom-push">${icon('bell')}</div>
      <p>Krijg een melding bij een <b>afgelasting</b>, een <b>wijziging</b> of een <b>bericht voor jou</b>, ook als de app dicht is.</p>
      <button class="knop groot vol" data-act="pushWelkomAan">${icon('bell')}Meldingen aanzetten</button>
      <button class="linkknop vol" data-act="sluit">Later</button>
      <p class="zacht klein">Tik daarna op <b>Sta toe</b>. Je kiest later zelf wat je wel en niet wilt (Profiel → Meldingen). Tussen 21:00 en 07:30 alleen noodberichten.</p>`);
  };
  CC.on('pushWelkomAan', (el) => zetAan({}, el));

  CC.on('pushUit', async () => {
    const nu = lees();
    try {
      const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription();
      if (nu) await CC.sb.rpc('push_uit', { p_endpoint: nu.endpoint });
      if (sub) await sub.unsubscribe();
    } catch (e) { console.warn(e); }
    bewaar(null); CC.closeSheet(); CC.render(); CC.toast('Pushmeldingen staan uit op deze telefoon');
  });

  // Eén keer voorstellen op Home (Actie nodig), zolang het kan en nog niet aan staat. "Niet nu" verbergt het 30 dagen.
  const LATER = 'clubcomm-push-later';
  CC.pushRij = () => {
    const st = CC.pushStatus(); if (st !== 'uit' && st !== 'beginscherm') return '';
    try { if (Number(localStorage.getItem(LATER) || 0) > Date.now()) return ''; } catch (e) { /* */ }
    return h.rij({ ic: 'bell', titel: 'Zet pushmeldingen aan', sub: st === 'beginscherm' ? 'Zet eerst ClubComm op je beginscherm' : 'Dan mis je geen afgelasting of bericht', act: 'meldingen', kleur: 'blauw',
      rechts: `<button class="linkknop" data-act="pushLater" data-stop="1">Niet nu</button>` });
  };
  CC.on('pushLater', () => { try { localStorage.setItem(LATER, String(Date.now() + 30 * 864e5)); } catch (e) { /* */ } CC.render(); });

  // Houdt de server op de hoogte als de telefoon een nieuw adres kreeg (bijv. na een update van de browser)
  CC.pushVernieuw = async () => {
    const nu = lees(); if (!nu || !CC.live || !kan() || Notification.permission !== 'granted') return;
    try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); if (!sub || sub.endpoint !== nu.endpoint) await aanmelden(nu.voorkeur || {}); } catch (e) { console.warn(e); }
  };
})();
