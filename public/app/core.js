// ClubComm prototype — raamwerk: opslag, inloggen, kop, navigatie, profiel, berichten en gedeelde onderdelen.
(function () {
  const CC = window.CC;
  const D = CC.date, M = CC.m;
  const KEY = 'clubcomm-demo-v1', SESSIE = 'clubcomm-sessie-v1';

  // ---------- Hulpjes ----------
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;
  const initialen = (naam) => naam.split(' ').filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).slice(0, 2).join('') || naam[0];
  CC.esc = esc; CC.icon = icon; CC.initialen = initialen;
  CC.plusMin = (tijd, n) => { const [hh, mm] = tijd.split(':').map(Number); const t = (hh * 60 + mm + n) % 1440; return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; };

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* preview zonder opslag */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* */ } },
  };
  let S = store.get(KEY, null);
  if (!S || S.gen !== D.vandaag() || S.v !== 8) { S = CC.generate(); store.set(KEY, S); }
  CC.S = () => S;
  CC.save = () => store.set(KEY, S);
  CC.reset = () => { S = CC.generate(); store.set(KEY, S); };
  // Live-versie (live.js): gegevens uit de database in plaats van de demo
  CC.zetS = (nieuw) => { S = nieuw; };

  // ---------- Sessie en rol ----------
  let sessie = store.get(SESSIE, null);
  const ui = { tab: 'home', view: null, stack: [], seg: {}, login: { stap: 'mail', email: '' } };
  CC.ui = ui;
  CC.sessie = () => sessie;
  CC.me = () => sessie && M.persoon(S, sessie.pid);
  CC.rol = () => { const me = CC.me(); return me && me.rollen[sessie.rolIdx || 0]; };
  CC.teamId = () => { const r = CC.rol(); return r && r.teamId; };
  CC.kind = () => {
    const me = CC.me(); const kids = S.players.filter((p) => p.teamId && p.ouders.includes(me.id));
    return kids.find((k) => k.id === sessie.kindId) || kids[0];
  };
  CC.kinderen = () => { const me = CC.me(); return S.players.filter((p) => p.teamId && p.ouders.includes(me.id)); };
  CC.rolNaam = (r) => ({ ouder: 'Ouder', trainer: 'Trainer', teamleider: 'Teamleider', hjo: S.club.labels.hjo, beheerder: 'Clubbeheerder', coordinator: S.club.labels.coordinator }[r.rol]);
  CC.login = (pid) => { const me = M.persoon(S, pid); sessie = { pid, rolIdx: 0, kindId: null }; store.set(SESSIE, sessie); ui.tab = 'home'; ui.view = null; ui.stack = []; CC.toast(`Welkom, ${me.naam.split(' ')[0]}!`); CC.render(); };
  CC.zetSessie = (pid) => { const oud = store.get(SESSIE, null); sessie = { pid, rolIdx: oud && oud.pid === pid ? oud.rolIdx || 0 : 0, kindId: oud && oud.pid === pid ? oud.kindId : null }; store.set(SESSIE, sessie); };
  CC.logout = () => { sessie = null; store.del(SESSIE); ui.login = { stap: 'mail', email: '' }; CC.closeSheet(); CC.render(); };
  CC.wisselRol = (idx) => { sessie.rolIdx = idx; store.set(SESSIE, sessie); ui.tab = 'home'; ui.view = null; ui.stack = []; CC.closeSheet(); CC.render(); window.scrollTo(0, 0); };

  // ---------- Acties (event delegation) ----------
  const acties = {};
  CC.on = (naam, fn) => { acties[naam] = fn; };
  const handle = (type) => (e) => {
    const el = e.target.closest(`[data-${type}]`);
    if (!el) return;
    const link = e.target.closest('a[href]'); if (link && link !== el && el.contains(link)) return;
    const fn = acties[el.dataset[type]];
    if (fn) { if (type === 'act' && el.tagName === 'A' && !el.getAttribute('target')) e.preventDefault(); fn(el, e); }
  };
  document.addEventListener('click', handle('act'));
  document.addEventListener('change', handle('change'));
  document.addEventListener('input', handle('input'));
  document.addEventListener('submit', (e) => { const f = e.target.closest('[data-submit]'); if (f) { e.preventDefault(); const fn = acties[f.dataset.submit]; if (fn) fn(f, e); } });

  // ---------- Toast en sheet ----------
  CC.toast = (tekst, soort = '') => {
    const t = document.getElementById('toast');
    t.className = `toast show ${soort}`; t.innerHTML = `${icon(soort === 'fout' ? 'circle-alert' : 'circle-check')}<span>${esc(tekst)}</span>`;
    clearTimeout(CC._tt); CC._tt = setTimeout(() => { t.className = 'toast'; }, 2600);
  };
  CC.sheet = (titel, html, opts = {}) => {
    const el = document.getElementById('sheet');
    el.innerHTML = `<div class="sheet-bg" data-act="sluit"></div><div class="sheet ${opts.groot ? 'groot' : ''}" role="dialog" aria-modal="true" aria-label="${esc(titel)}">
      <div class="sheet-kop"><h2>${esc(titel)}</h2><button class="icoonknop" data-act="sluit" aria-label="Sluiten">${icon('x')}</button></div>
      <div class="sheet-body">${html}</div></div>`;
    el.hidden = false; document.body.classList.add('sheet-open');
    const f = el.querySelector('[autofocus]'); if (f) setTimeout(() => f.focus(), 50);
  };
  CC.closeSheet = () => { const el = document.getElementById('sheet'); el.hidden = true; el.innerHTML = ''; document.body.classList.remove('sheet-open'); };
  CC.on('sluit', () => CC.closeSheet());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') CC.closeSheet();
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role=button][data-act]')) { e.preventDefault(); e.target.click(); }
  });

  // ---------- Navigatie ----------
  CC.go = (tab) => { ui.tab = tab; ui.view = null; ui.stack = []; CC.render(); window.scrollTo(0, 0); };
  CC.open = (view, params = {}) => { ui.stack.push(ui.view); ui.view = { naam: view, ...params }; CC.render(); window.scrollTo(0, 0); };
  CC.terug = () => { ui.view = ui.stack.pop() || null; CC.render(); };
  CC.on('tab', (el) => CC.go(el.dataset.tab));
  CC.on('open', (el) => CC.open(el.dataset.view, { ...el.dataset }));
  CC.on('terug', () => CC.terug());
  CC.on('seg', (el) => { ui.seg[el.dataset.key] = el.dataset.val; CC.render(); });

  CC.rollen = {}; CC.views = {};

  // ---------- Gedeelde bouwstenen ----------
  CC.h = {
    seg(key, opties, standaard) {
      const cur = ui.seg[key] || standaard;
      return `<div class="seg" role="tablist">${opties.map(([v, l, n]) => `<button role="tab" aria-selected="${cur === v}" class="${cur === v ? 'aan' : ''}" data-act="seg" data-key="${key}" data-val="${v}">${esc(l)}${n ? ` <span class="tel">${n}</span>` : ''}</button>`).join('')}</div>`;
    },
    segVal: (key, standaard) => ui.seg[key] || standaard,
    // Blok "Actie nodig": altijd zichtbaar, ook als het leeg is, zodat je weet waar acties straks verschijnen (Besluit 50)
    actieBlok: (acties0, wat) => { const p = CC.pushRij ? CC.pushRij() : ''; const acties = p ? [...acties0, p] : acties0; return `${h.sectie('Actie nodig')}${acties.length ? `<div class="lijst">${acties.join('')}</div>` : `<p class="zacht klein">Niets te doen 👍 Hier verschijnen je acties, bijvoorbeeld ${wat}.</p>`}`; },
    rij({ ic, titel, sub, rechts, act, attrs = '', kleur = '', chevron = true }) {
      const tag = 'div';
      return `<${tag} class="rij ${kleur} ${act ? 'klikbaar' : ''}" ${act ? `data-act="${act}" role="button" tabindex="0"` : ''} ${attrs}>${ic ? `<span class="rij-ic">${ic.startsWith('<') ? ic : icon(ic)}</span>` : ''}<span class="rij-tekst"><b>${titel}</b>${sub ? `<small>${sub}</small>` : ''}</span>${rechts ? `<span class="rij-r">${rechts}</span>` : ''}${act && chevron ? icon('chevron-right', 'chev') : ''}</${tag}>`;
    },
    stip: (zone) => `<span class="stip ${zone}" aria-label="${zone}"></span>`,
    avatar: (naam, cls = '') => `<span class="avatar ${cls}">${esc(initialen(naam))}</span>`,
    leeg: (tekst, ic = 'circle-check') => `<div class="leeg">${icon(ic)}<p>${tekst}</p></div>`,
    sectie: (titel, rechts = '') => `<div class="sectie-kop"><h3>${titel}</h3>${rechts}</div>`,
    actTitel(S, a) {
      if (a.soort === 'training') return 'Training';
      if (a.soort === 'activiteit') return esc(a.naam || 'Activiteit');
      if (a.soort === 'oefen') return `Oefenwedstrijd${a.tegen ? ' · ' + esc(a.tegen) : ''}`;
      return `${a.thuis ? 'Thuis' : 'Uit'} · ${esc(a.tegen)}`;
    },
    actSub(S, a) {
      if (a.afgelast) return 'Afgelast';
      if (a.soort === 'training') return `${a.tijd}–${a.eind} · ${esc(a.veld)}`;
      if (a.soort === 'activiteit') return `${a.verzamel ? `Verzamelen ${a.verzamel} · ` : ''}${a.tijd}–${a.eind}${a.plaats ? ' · ' + esc(a.plaats) : ''}`;
      return `Verzamelen ${a.verzamel} · aftrap ${a.tijd}${a.thuis ? ' · ' + esc(a.veld || '') : ''}`;
    },
    datumBlok(a) { const d = D.parse(a.datum); return `<span class="datum ${a.afgelast ? 'afg' : ''}"><small>${D.DAG_KORT[d.getDay()]}</small><b>${d.getDate()}</b><small>${D.MAAND[d.getMonth()]}</small></span>`; },
    reden: (r) => { const f = CC.REDENEN.find((x) => x[0] === r); return f ? icon(f[1]) : icon('ellipsis'); },
    chip(st) {
      switch (st.code) {
        case 'aanwezig': return `<span class="chip groen">${icon('check')}Aanwezig</span>`;
        case 'telaat': return `<span class="chip oranje">${icon('clock')}Te laat</span>`;
        case 'afgemeld': return `<span class="chip grijs">${icon('x')}Afgemeld · ${esc(st.afm.reden)}</span>`;
        case 'langdurig': return `<span class="chip grijs">${icon('hospital')}Langdurig afwezig</span>`;
        case 'nietafgemeld': return `<span class="chip rood">${icon('circle-alert')}Niet afgemeld</span>`;
        case 'afgelast': return `<span class="chip grijs">${icon('ban')}Afgelast</span>`;
        case 'open': return `<span class="chip oranje">${icon('circle-help')}Nog niet opgegeven</span>`;
        default: return `<span class="chip blauw">${icon('circle-check')}Komt</span>`;
      }
    },
    // Kaarten voor de ouder (Besluit 32): aantal gele en rode kaarten dit seizoen
    kaartjes(k) {
      if (!k.geel && !k.rood) return '';
      return `${k.geel ? `<span class="kaart geel" title="Gele kaart">${k.geel}</span>` : ''}${k.rood ? `<span class="kaart rood" title="Rode kaart">${k.rood}</span>` : ''}`;
    },
    // Voor trainer en HJO: geen kaartjes, alleen een teken als er iets is (📞 actie nodig, ⚠️ let op)
    let(S, pl, k) {
      k = k || M.kaarten(S, pl);
      if (M.stap(S, pl, k)) return `<span class="let actie" title="Actie nodig: contact met de ouders">${icon('phone')}</span>`;
      if (k.geel || k.ev.some((e) => e.kaart === 'rood' && !e.geaccepteerd) || M.teLaat(S, pl).signaal) return `<span class="let" title="Let op">${icon('triangle-alert')}</span>`;
      return '';
    },
    // Routeknop (Besluit 33): opent de route in kaarten, vanaf waar je bent
    route: (adres, klein) => (adres ? `<a class="knop licht${klein ? ' klein' : ''}" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(adres)}" target="_blank" rel="noopener">${icon('navigation')}Route</a>` : ''),
    // Aanwezigheid apart: trainingen en wedstrijden (Besluit 34)
    split: (st) => `Trainingen ${st.pctTr == null ? '–' : st.pctTr + '%'} · wedstrijden ${st.pctWed == null ? '–' : st.pctWed + '%'}`,
    badge: (n) => (n ? `<span class="badge">${n > 99 ? '99+' : n}</span>` : ''),
    knop: (tekst, act, attrs = '', cls = '') => `<button class="knop ${cls}" data-act="${act}" ${attrs}>${tekst}</button>`,
  };
  const h = CC.h;

  // ---------- Render ----------
  CC.render = () => {
    const app = document.getElementById('app');
    if (!sessie || !CC.me()) { app.innerHTML = CC.loginScherm(); document.title = 'ClubComm'; return; }
    if (M.vulVasteTaken) M.vulVasteTaken(S);
    const rol = CC.rol();
    const R = CC.rollen[rol.rol];
    const tabs = R.tabs(S).filter(Boolean);
    if (!tabs.find((t) => t[0] === ui.tab)) ui.tab = 'home';
    let kop, inhoud, terug = false;
    try {
      if (ui.view && CC.views[ui.view.naam]) { const v = CC.views[ui.view.naam](S, ui.view); kop = v.titel; inhoud = v.html; terug = true; }
      else inhoud = R.schermen[ui.tab](S);
    } catch (err) { console.error(err); inhoud = h.leeg(`Er ging iets mis op dit scherm: ${esc(err.message)}`, 'circle-alert'); }
    const ctx = R.context(S);
    const me = CC.me();
    app.innerHTML = `
      <header class="kop">
        ${terug ? `<button class="icoonknop" data-act="terug" aria-label="Terug">${icon('chevron-left')}</button>` : `<img class="kop-logo" src="assets/clubcomm-icon.png" alt="">`}
        <div class="kop-tekst" ${!terug && ctx.act ? `data-act="${ctx.act}" role="button" tabindex="0"` : ''}>
          <b>${terug ? esc(kop) : esc(ctx.titel)}${!terug && ctx.act ? icon('chevron-down', 'klein') : ''}</b>
          <small>${terug ? esc(ctx.titel) : esc(ctx.sub)}</small>
        </div>
        <button class="profielknop" data-act="profiel" aria-label="Profiel">${h.avatar(me.naam)}${me.rollen.length > 1 ? `<span class="rolstip">${esc(CC.rolNaam(rol)[0])}</span>` : ''}</button>
      </header>
      <main class="inhoud">${inhoud}</main>
      <nav class="nav" aria-label="Hoofdmenu">${tabs.map(([id, label, ic, n]) => `<button class="${ui.tab === id ? 'aan' : ''}" data-act="tab" data-tab="${id}" ${ui.tab === id ? 'aria-current="page"' : ''}>${icon(ic)}<span>${label}</span>${h.badge(n)}</button>`).join('')}</nav>`;
    document.title = 'ClubComm';
  };

  // ---------- Inloggen (Besluit 1) ----------
  CC.loginScherm = () => {
    const L = ui.login;
    const hash = (location.hash || '').replace('#', '');
    if (hash.startsWith('uitnodiging-')) return CC.uitnodigingScherm(hash.slice(12));
    const taal = `<div class="taal"><button class="aan" aria-pressed="true">NL</button><button data-act="taalEN" aria-pressed="false">EN</button></div>`;
    if (L.stap === 'code') {
      return `<div class="login">${taal}
        <img src="assets/clubcomm-icon.png" class="login-logo" alt="ClubComm">
        <h1>Check je mail</h1>
        <p class="zacht">We hebben een mail gestuurd naar <b>${esc(L.email)}</b>. Tik op de link in de mail, of typ de code van 6 cijfers over.</p>
        <div class="mailvoorbeeld" aria-label="Voorbeeld van de inlogmail">
          <div class="mv-kop">${icon('mail')}<span><b>ClubComm</b> · Je inloglink</span><small>demo</small></div>
          <p>Hoi! Tik op de knop om in te loggen bij ClubComm.</p>
          <button class="knop" data-act="magischeLink">Inloggen bij ClubComm</button>
          <p class="zacht klein">Of typ deze code over: <b class="code">${L.code}</b> · geldig 15 minuten</p>
        </div>
        <form data-submit="checkCode" class="codeform">
          <label for="code">Code uit de mail</label>
          <input id="code" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000" autofocus>
          <button class="knop" type="submit">Inloggen</button>
        </form>
        <button class="linkknop" data-act="loginTerug">Ander e-mailadres</button>
      </div>`;
    }
    const demo = [[S.demo.sanne, 'Ouder', 'moeder van Jesse (O10-1) en Mila (O8-2)'], [S.demo.mark, 'Trainer + ouder', 'trainer O10-1, vader van Daan'], [S.demo.linda, 'Teamleider + ouder', 'teamleider O10-1, moeder van Noah'], [S.demo.peter, `${S.club.labels.hjo} + clubbeheerder`, 'hoofd jeugdopleiding'], ...(S.demo.esther ? [[S.demo.esther, S.club.labels.coordinator, 'coördinator O10–O12']] : [])];
    return `<div class="login">${taal}
      <img src="assets/clubcomm-icon.png" class="login-logo" alt="ClubComm">
      <h1>ClubComm</h1>
      <p class="zacht">${esc(S.club.naam)}</p>
      <form data-submit="stuurLink" class="codeform">
        <label for="email">Je e-mailadres</label>
        <input id="email" name="email" type="email" autocomplete="email" placeholder="naam@voorbeeld.nl" value="${esc(L.email)}" required>
        <button class="knop" type="submit">Stuur mij een inloglink</button>
      </form>
      <p class="zacht klein">Geen wachtwoord nodig. Je blijft ingelogd op dit apparaat.</p>
      <div class="demo">
        <h3>Demo: kies een account</h3>
        ${demo.filter(([pid]) => M.persoon(S, pid)).map(([pid, rol, sub]) => { const p = M.persoon(S, pid); return h.rij({ ic: h.avatar(p.naam), titel: `${esc(p.naam)} <span class="label">${esc(rol)}</span>`, sub: esc(sub), act: 'demoLogin', attrs: `data-pid="${pid}"` }); }).join('')}
        ${h.rij({ ic: 'qr-code', titel: 'Nieuwe ouder: open de team-uitnodiging', sub: 'Zo meldt een ouder zich aan via de QR-code of link van O10-1', act: 'openUitnodiging', attrs: 'data-team="O10-1"' })}
        ${demo.some(([pid]) => !M.persoon(S, pid)) ? h.rij({ ic: 'refresh-cw', titel: 'Demo opnieuw beginnen', sub: 'Een demo-account is verwijderd; zet alles terug', act: 'resetDemo', chevron: false }) : ''}
        <p class="zacht klein">De demo begint elke dag opnieuw, zodat "vandaag" klopt. Wat je verandert, blijft tot morgen bewaard op dit apparaat.</p>
      </div>
    </div>`;
  };
  CC.on('taalEN', () => CC.toast('Engels komt in versie 2 (Besluit 3)'));
  CC.on('stuurLink', (f) => {
    const email = f.email.value.trim().toLowerCase();
    const p = S.people.find((x) => x.email.toLowerCase() === email);
    ui.login = { stap: 'code', email, pid: p && p.id, code: String(100000 + Math.floor(Math.random() * 899999)) };
    CC.render();
  });
  CC.on('demoLogin', (el) => { const p = M.persoon(S, el.dataset.pid); ui.login = { stap: 'code', email: p.email, pid: p.id, code: String(100000 + Math.floor(Math.random() * 899999)) }; CC.render(); });
  const inloggenMet = () => {
    if (!ui.login.pid) { CC.toast('Dit e-mailadres is nog niet aangemeld. Vraag je teamleider om de uitnodiging.', 'fout'); return; }
    CC.login(ui.login.pid);
  };
  CC.on('magischeLink', inloggenMet);
  CC.on('checkCode', (f) => { if (f.code.value.trim() === ui.login.code) inloggenMet(); else CC.toast('Deze code klopt niet. Kijk nog eens in de mail.', 'fout'); });
  CC.on('loginTerug', () => { ui.login = { stap: 'mail', email: '' }; CC.render(); });

  // ---------- Aanmelden via uitnodiging (Besluit 2) ----------
  CC.uitnodigingScherm = (teamId) => {
    const t = M.team(S, teamId);
    if (!t) return `<div class="login">${h.leeg('Deze uitnodiging bestaat niet (meer).', 'circle-alert')}<button class="knop" data-act="sluitUitnodiging">Naar inloggen</button></div>`;
    if (ui.login.aangemeld) return `<div class="login"><img src="assets/clubcomm-icon.png" class="login-logo" alt="">
      <h1>Bijna klaar!</h1><p class="zacht">We hebben je een inlogmail gestuurd. De teamleider van <b>${esc(t.naam)}</b> keurt je aanmelding goed; daarna zie je de gegevens van <b>${esc(ui.login.aangemeld)}</b>.</p>
      <div class="info">${icon('info')}<span>Demo: log in als <b>Linda (teamleider)</b> en keur de aanmelding goed bij <b>Team</b>.</span></div>
      <button class="knop" data-act="sluitUitnodiging">Naar inloggen</button></div>`;
    return `<div class="login"><img src="assets/clubcomm-icon.png" class="login-logo" alt="">
      <h1>Aanmelden bij ${esc(t.naam)}</h1><p class="zacht">${esc(S.club.naam)} gebruikt ClubComm voor afmelden, planning en berichten.</p>
      <form data-submit="aanmelden" class="codeform" data-team="${esc(teamId)}">
        <label for="a-mail">Jouw e-mailadres</label><input id="a-mail" name="email" type="email" required placeholder="naam@voorbeeld.nl">
        <label for="a-ouder">Jouw naam</label><input id="a-ouder" name="ouder" required placeholder="Voor- en achternaam">
        <label for="a-kind">Voornaam van je kind</label><input id="a-kind" name="voor" required>
        <label for="a-kind2">Achternaam van je kind</label><input id="a-kind2" name="achter" required>
        <label class="vink"><input type="checkbox" name="ok" required><span>Ik heb de <a href="#" data-act="privacy">privacyverklaring</a> gelezen en geef toestemming dat de club de gegevens van mijn kind in ClubComm gebruikt.</span></label>
        <button class="knop" type="submit">Aanmelden</button>
      </form></div>`;
  };
  CC.on('openUitnodiging', (el) => { location.hash = `uitnodiging-${el.dataset.team}`; CC.render(); });
  CC.on('sluitUitnodiging', () => { history.replaceState(null, '', location.pathname); ui.login = { stap: 'mail', email: '' }; CC.render(); });
  CC.on('aanmelden', (f) => {
    S.aanm.push({ id: 'm' + Date.now(), teamId: f.dataset.team, email: f.email.value.trim(), ouderNaam: f.ouder.value.trim(), kindVoor: f.voor.value.trim(), kindAchter: f.achter.value.trim(), tijd: new Date().toISOString(), status: 'open', privacyAkkoord: new Date().toISOString() });
    CC.save(); ui.login.aangemeld = f.voor.value.trim(); CC.render();
  });
  // Privacyverklaring (Besluit 37). De club is verantwoordelijk; ClubComm verwerkt de gegevens in opdracht van de club.
  CC.privacyHtml = (club) => { const c = club || {}; const naam = esc(c.naam || 'de club'); const contact = c.privacyContact ? `<b>${esc(c.privacyContact)}</b>` : `het bestuur van ${naam}`;
    return `<div class="privacy">
    <p class="zacht klein">Versie 25 september 2026${c.pilot !== false ? ' · ClubComm is bij deze club in de proeffase' : ''}</p>
    <h3>Wie is verantwoordelijk?</h3><p>${naam} gebruikt ClubComm voor afmelden, planning, taken, vervoer en berichten. De club is verantwoordelijk voor jouw gegevens en die van je kind. ClubComm verwerkt ze alleen in opdracht van de club.</p>
    <h3>Welke gegevens?</h3><ul><li><b>Van jou:</b> naam, e-mailadres en (als je dat invult) telefoonnummer.</li><li><b>Van je kind:</b> voor- en achternaam en team.</li><li><b>Wat er in de app gebeurt:</b> afmeldingen met reden, aanwezigheid, herinneringen en kaarten over afmelden, taken, vervoer en berichten.</li><li><b>Van de trainer:</b> beoordelingen en afspraken uit gesprekken. Die zijn alleen voor de trainer en de club, en de beoordeling bespreekt de trainer met jou.</li></ul>
    <h3>Waarvoor?</h3><p>Alleen om trainingen, wedstrijden en activiteiten te regelen en de spelers goed te begeleiden. Nooit voor reclame, en we verkopen niets.</p>
    <h3>Wie ziet wat?</h3><ul><li>Jij ziet alleen je eigen kind.</li><li>De trainer en teamleider zien hun eigen team, volgens de taken die de club hun geeft. De jeugdcoördinator en het hoofd jeugdopleiding alleen als het bij hun taak hoort.</li><li>Andere ouders van het team zien alleen de voornaam van je kind (bijvoorbeeld bij vervoer of taken). Nooit afmeldredenen, kaarten of jouw contactgegevens.</li></ul>
    <h3>Waar staan de gegevens?</h3><p>In de Europese Unie: de database en het inloggen bij Supabase (Frankfurt, Duitsland), de e-mails via Brevo (Frankrijk). Vercel levert alleen de app zelf, zonder persoonsgegevens. De verbinding is altijd versleuteld.</p>
    <h3>Hoe lang?</h3><p>Zolang je kind bij de club in ClubComm staat. Details over aanwezigheid, kaarten en gesprekken worden verwijderd na de teamindeling van het volgende seizoen. Schrijf je je kind uit of verwijder je je account, dan worden de gegevens gewist; in de wekelijkse back-up staan ze nog hooguit 8 weken.</p>
    <h3>Cookies</h3><p>Geen reclame- of volgcookies. ClubComm onthoudt alleen op je telefoon dat je bent ingelogd.</p>
    <h3>Jouw rechten</h3><p>Je mag je gegevens inzien, laten aanpassen of laten verwijderen, en bezwaar maken. Neem daarvoor contact op met ${contact}. Ben je het er niet mee eens hoe de club met je gegevens omgaat, dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens.</p></div>`; };
  CC.on('privacy', () => CC.sheet('Privacyverklaring', CC.privacyHtml(CC.me() ? S.club : CC.privacyClub || S.club), { groot: true }));

  // ---------- Feedback (Besluit 37): komt als persoonlijk bericht (en e-mail) bij de clubbeheerder ----------
  CC.on('feedback', () => CC.sheet('Feedback of een probleem', `<form data-submit="feedbackOk" class="codeform">
      <label for="fb-s">Waar gaat het over?</label><select id="fb-s" name="s"><option>Er klopt iets niet</option><option>Ik heb een idee</option><option>Ik heb een vraag</option></select>
      <label for="fb-t">Vertel het kort</label><textarea id="fb-t" name="t" rows="5" required placeholder="Wat deed je, wat gebeurde er, wat had je verwacht?"></textarea>
      <p class="zacht klein">We sturen automatisch mee op welk scherm je was en welke telefoon je gebruikt, zodat we het kunnen nazoeken.</p>
      <button class="knop vol">${icon('send')}Versturen</button></form>`));
  CC.on('feedbackOk', (f) => {
    const me = CC.me(); const r = CC.rol(); const beheer = S.people.filter((p) => p.rollen.some((x) => x.rol === 'beheerder')).map((p) => p.id).filter((x) => x !== me.id);
    const ontv = beheer.length ? beheer : S.people.filter((p) => p.rollen.some((x) => x.rol === 'hjo')).map((p) => p.id).filter((x) => x !== me.id);
    const context = `\n\n— Rol: ${r.rol}${r.teamId ? ' ' + r.teamId : ''} · scherm: ${ui.view ? ui.view.naam : ui.tab} · ${navigator.userAgent.replace(/\s*\(KHTML.*$/, '').slice(0, 120)}`;
    if (!ontv.length) { CC.closeSheet(); return CC.toast('Dank je! (er is nog geen beheerder om het naartoe te sturen)'); }
    S.msgs.push({ id: 'b' + Date.now(), van: me.id, soort: 'persoonlijk', bereik: 'Feedback', onderwerp: `Feedback: ${f.s.value.toLowerCase()}`, tekst: f.t.value + context, tijd: new Date().toISOString(), ontvangers: ontv, gelezen: [me.id], antw: [], urgent: false, gepland: null, mail: true });
    CC.save(); CC.closeSheet(); CC.render(); CC.toast('Dank je wel! We kijken ernaar.');
  });

  // ---------- Profiel (Besluit 4 en 8) ----------
  CC.on('profiel', () => {
    const me = CC.me(); const rol = CC.rol();
    const kids = CC.kinderen();
    const rollen = me.rollen.map((r, i) => `<button class="rolkeuze ${i === (sessie.rolIdx || 0) ? 'aan' : ''}" data-act="wisselRol" data-idx="${i}">${icon({ ouder: 'heart', trainer: 'clipboard-check', teamleider: 'hand-helping', hjo: 'shield', beheerder: 'building-2', coordinator: 'users' }[r.rol])}<span><b>${esc(CC.rolNaam(r))}</b><small>${r.teamId ? esc(CC.tn(r.teamId)) : r.groep ? esc(r.groep) : r.rol === 'ouder' ? kids.map((k) => esc(k.voornaam)).join(', ') : esc(S.club.naam)}</small></span>${i === (sessie.rolIdx || 0) ? icon('check') : ''}</button>`).join('');
    CC.sheet('Profiel', `
      <div class="profiel-kop">${h.avatar(me.naam, 'groot')}<div><b>${esc(me.naam)}</b><small>${esc(me.email)}${me.tel ? ` · ${esc(me.tel)}` : ''}</small></div></div>
      ${h.rij({ ic: 'phone', titel: me.tel ? 'Telefoonnummer wijzigen' : 'Telefoonnummer toevoegen', sub: me.tel ? esc(me.tel) : 'Zodat trainer en teamleider je kunnen bellen of appen', act: 'telSheet', kleur: me.tel ? '' : 'blauw' })}
      ${me.rollen.length > 1 ? `<h3 class="klein-kop">Wissel van rol</h3><div class="rollen">${rollen}</div>` : ''}
      ${rol.rol === 'ouder' || kids.length ? `<h3 class="klein-kop">Mijn kinderen</h3>${kids.map((k) => h.rij({ ic: h.avatar(k.voornaam), titel: esc(M.naam(S, k)), sub: esc(CC.tn(k.teamId)) })).join('')}
        ${h.rij({ ic: 'user-plus', titel: 'Kind toevoegen', sub: 'Via de uitnodiging van het andere team', act: 'demoMelding', attrs: 'data-tekst="Vraag de teamleider van het andere team om de uitnodiging (link of QR-code) en meld je daar aan met hetzelfde e-mailadres."' })}
        ${h.rij({ ic: 'users', titel: 'Tweede ouder uitnodigen', sub: 'Ieder een eigen account, jullie zien elkaars e-mail niet', act: 'tweedeOuder' })}` : ''}
      <h3 class="klein-kop">Instellingen</h3>
      ${CC.agendaRij ? CC.agendaRij() : ''}
      ${CC.trainerEigenRij ? CC.trainerEigenRij() : ''}
      ${h.rij({ ic: 'bell', titel: 'Meldingen', sub: CC.meldingenSub ? CC.meldingenSub() : 'In de app, en per e-mail bij belangrijke berichten', act: 'meldingen' })}
      ${CC.live ? '' : h.rij({ ic: 'globe', titel: 'Taal', sub: 'Nederlands (Engels komt in versie 2)', act: 'taalEN' })}
      ${h.rij({ ic: 'lock', titel: 'Privacyverklaring', act: 'privacy' })}
      ${h.rij({ ic: 'message-circle', titel: 'Feedback of een probleem melden', sub: 'Er klopt iets niet, of je hebt een idee', act: 'feedback' })}
      ${h.rij({ ic: 'smartphone', titel: 'App op je beginscherm zetten', act: 'beginscherm' })}
      ${kids.length ? `<h3 class="klein-kop">Uitschrijven</h3>${h.rij({ ic: 'user-cog', titel: 'Kind uitschrijven', sub: 'Stopt je kind of gaat het naar een andere club?', act: 'uitschrijfSheet' })}` : ''}
      <h3 class="klein-kop">Uitloggen</h3>
      ${h.rij({ ic: 'log-out', titel: 'Uitloggen', act: 'logout', chevron: false })}
      ${h.rij({ ic: 'log-out', titel: 'Uitloggen op alle apparaten', sub: 'Telefoon kwijt? Hiermee sluit je overal af.', act: 'logoutAlles', chevron: false })}
      <div class="demo-blok"><h3 class="klein-kop">Demo</h3>
        ${h.rij({ ic: 'trash-2', titel: 'Mijn account verwijderen', sub: 'Al je gegevens worden gewist', act: 'verwijderSheet', kleur: 'rood' })}
        ${h.rij({ ic: 'users', titel: 'Ander demo-account kiezen', act: 'logout', chevron: false })}
        ${h.rij({ ic: 'refresh-cw', titel: 'Demo opnieuw beginnen', sub: 'Zet alle demodata terug', act: 'resetDemo', chevron: false })}
      </div>`);
  });
  CC.on('wisselRol', (el) => CC.wisselRol(Number(el.dataset.idx)));
  // Eigen telefoonnummer (alleen trainer, teamleider en staf van het team zien het; Besluit 40)
  CC.on('telSheet', () => { const me = CC.me(); CC.sheet('Telefoonnummer', `<form data-submit="telOk" class="codeform"><label for="tn">Je mobiele nummer</label><input id="tn" name="t" type="tel" inputmode="tel" autocomplete="tel" value="${esc(me.tel || '')}" placeholder="06 12345678"><button class="knop">Opslaan</button><p class="zacht klein">Alleen de trainer en teamleider van het team van je kind en de jeugdleiding zien dit nummer, om je te bellen of te appen. Andere ouders zien het niet.</p></form>`); });
  CC.on('telOk', (f) => { const t = f.t.value.replace(/[^0-9+]/g, ''); if (t && !/^(\+\d{10,14}|0\d{9})$/.test(t)) return CC.toast('Vul een geldig nummer in, bijv. 0612345678', 'fout'); CC.me().tel = t; CC.save(); CC.closeSheet(); CC.toast(t ? 'Telefoonnummer opgeslagen' : 'Telefoonnummer verwijderd'); });

  // ---------- Uitschrijven en account verwijderen (Besluit 14) ----------
  CC.tn = (id) => M.tn(CC.S(), id);
  const hjoIds = () => S.people.filter((p) => p.rollen.some((r) => r.rol === 'hjo')).map((p) => p.id);
  const meldStaf = (teamId, onderwerp, tekst) => {
    const ontv = [...new Set([...M.stafVan(S, teamId), ...hjoIds()].filter(Boolean))];
    S.msgs.push({ id: 'b' + Date.now() + Math.random(), van: 'systeem', soort: 'melding', bereik: teamId, onderwerp, tekst, tijd: new Date().toISOString(), ontvangers: ontv, gelezen: [], antw: [], urgent: false, gepland: null });
  };
  // Kind uit het team halen. De aanwezigheid blijft alleen als anonieme telling in de teamcijfers bewaard.
  const schrijfUit = (pl, reden) => {
    const team = pl.teamId;
    meldStaf(team, `${pl.voornaam} is uitgeschreven`, `${pl.voornaam} ${pl.achternaam} is uitgeschreven uit ${team}. Reden: ${reden}. Je hoeft niets te doen; ${pl.voornaam} staat niet meer in de teamlijst.`);
    S.afm = S.afm.filter((f) => !(f.spelerId === pl.id && (M.act(S, f.actId) || {}).datum >= D.vandaag()));
    Object.values(S.vervoer).forEach((v) => { delete v.plek[pl.id]; if (v.vraag) delete v.vraag[pl.id]; });
    pl.teamId = null; pl.uitgeschreven = { datum: D.vandaag(), reden }; pl.voornaam = 'Oud-lid'; pl.achternaam = ''; pl.ouders = [];
  };
  CC.on('uitschrijfSheet', () => {
    const kids = CC.kinderen();
    CC.sheet('Kind uitschrijven', `<form data-submit="uitschrijvenOk" class="codeform">
      <label for="us-k">Welk kind?</label><select id="us-k" name="k">${kids.map((k) => `<option value="${k.id}">${esc(M.naam(S, k))} (${esc(CC.tn(k.teamId))})</option>`).join('')}</select>
      <label for="us-r">Reden</label><select id="us-r" name="r"><option>Stopt met voetbal</option><option>Naar een andere club</option><option>Verhuisd</option><option>Anders</option></select>
      <div class="info oranje">${icon('info')}<span>Hiermee verdwijnt je kind uit het team en uit ClubComm. De trainer, teamleider en ${esc(S.club.labels.hjo)} krijgen een melding. <b>Let op:</b> het lidmaatschap zeg je apart op bij de ledenadministratie (vóór 31 mei, per mail). De contributie loopt tot het einde van het seizoen.</span></div>
      <button class="knop rood vol">Uitschrijven</button></form>`);
  });
  CC.on('uitschrijvenOk', (f) => {
    const pl = M.speler(S, f.k.value); const naam = pl.voornaam;
    CC.sheet('Weet je het zeker?', `<p><b>${esc(naam)}</b> wordt uitgeschreven. Dit kun je niet ongedaan maken; opnieuw aanmelden kan wel via de uitnodiging van het team.</p>
      <div class="knoppen kolom"><button class="knop rood" data-act="uitschrijvenDef" data-id="${pl.id}" data-r="${esc(f.r.value)}">Ja, schrijf ${esc(naam)} uit</button><button class="knop licht" data-act="sluit">Annuleren</button></div>`);
  });
  CC.on('uitschrijvenDef', (el) => {
    const pl = M.speler(S, el.dataset.id); const naam = pl.voornaam;
    schrijfUit(pl, el.dataset.r); sessie.kindId = null; store.set(SESSIE, sessie);
    CC.save(); CC.closeSheet(); ui.tab = 'home'; ui.view = null; CC.render(); CC.toast(`${naam} is uitgeschreven`);
  });
  CC.on('verwijderSheet', () => {
    const me = CC.me(); const kids = CC.kinderen();
    const alleen = kids.filter((k) => k.ouders.length === 1);
    const staf = me.rollen.filter((r) => ['trainer', 'teamleider'].includes(r.rol));
    CC.sheet('Account verwijderen', `<p>We wissen je naam, e-mailadres, telefoonnummer en al je koppelingen. Je kunt daarna niet meer inloggen.</p>
      ${alleen.length ? `<div class="info oranje">${icon('info')}<span>${alleen.map((k) => esc(k.voornaam)).join(' en ')} ${alleen.length > 1 ? 'hebben' : 'heeft'} geen andere ouder in ClubComm en ${alleen.length > 1 ? 'worden' : 'wordt'} dus ook uitgeschreven.</span></div>` : ''}
      ${kids.some((k) => k.ouders.length > 1) ? `<p class="klein">${kids.filter((k) => k.ouders.length > 1).map((k) => esc(k.voornaam)).join(' en ')} blijft gekoppeld aan de andere ouder.</p>` : ''}
      ${staf.length ? `<div class="info oranje">${icon('user-cog')}<span>Je bent ook ${staf.map((r) => `${r.rol} van ${esc(CC.tn(r.teamId))}`).join(' en ')}. De ${esc(S.club.labels.hjo)} krijgt een melding om een vervanger te zoeken.</span></div>` : ''}
      <p class="zacht klein">Aanwezigheid blijft alleen als anonieme telling in de teamcijfers bewaard. Het lidmaatschap zeg je apart op bij de ledenadministratie.</p>
      <div class="knoppen kolom"><button class="knop rood" data-act="verwijderDef">Ja, verwijder mijn account</button><button class="knop licht" data-act="sluit">Annuleren</button></div>`);
  });
  CC.on('verwijderDef', () => {
    const me = CC.me();
    CC.kinderen().forEach((k) => { if (k.ouders.length === 1) schrijfUit(k, 'Ouder heeft account verwijderd'); else k.ouders = k.ouders.filter((o) => o !== me.id); });
    S.players.forEach((p) => { p.ouders = p.ouders.filter((o) => o !== me.id); });
    S.teams.forEach((t) => {
      ['trainerId', 'teamleiderId'].forEach((v) => { if (t[v] === me.id) { t[v] = null; meldStaf(t.id, `${t.naam} heeft geen ${v === 'trainerId' ? 'trainer' : 'teamleider'} meer`, `${me.naam} heeft het account verwijderd. Zoek een vervanger via Teams.`); } });
    });
    Object.values(S.vervoer).forEach((v) => { v.aanbod = v.aanbod.filter((x) => x.personId !== me.id); Object.keys(v.plek).forEach((k) => { if (v.plek[k] === me.id) delete v.plek[k]; }); });
    S.taken.forEach((t) => { if (t.personId === me.id) t.personId = null; });
    S.acts.forEach((a) => { if (a.begeleiderId === me.id) a.begeleiderId = null; });
    S.msgs.forEach((m) => { m.ontvangers = m.ontvangers.filter((x) => x !== me.id); m.gelezen = m.gelezen.filter((x) => x !== me.id); });
    S.people = S.people.filter((p) => p.id !== me.id);
    CC.save(); CC.logout(); CC.toast('Je account is verwijderd. Tot ziens!');
  });
  CC.on('logout', () => CC.logout());
  CC.on('logoutAlles', () => { CC.toast('Je bent op alle apparaten uitgelogd'); setTimeout(CC.logout, 600); });
  CC.on('resetDemo', () => { CC.reset(); CC.closeSheet(); CC.logout(); CC.toast('Demo staat weer aan het begin'); });
  CC.on('demoMelding', (el) => CC.toast(el.dataset.tekst));
  CC.on('meldingen', () => CC.sheet('Meldingen', `<p>Alles staat in de app bij <b>Berichten</b>. Daarnaast krijg je een <b>e-mail</b> bij:</p>
    <ul><li>afgelastingen, wijzigingen en noodberichten (urgent)</li><li>persoonlijke berichten en antwoorden op je vraag</li><li>herinneringen over afmelden en kaarten</li><li>nieuwe activiteiten, opgave en belangrijke clubberichten</li></ul>
    <p class="zacht klein">Pushmeldingen op je telefoon komen later. Zet ClubComm alvast op je beginscherm (Profiel → App op je beginscherm).</p>`));
  CC.on('beginscherm', () => {
    const al = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    CC.sheet('App op je beginscherm', al ? '<p>ClubComm staat al op je beginscherm. Top!</p>' : `${CC.installPrompt ? `<button class="knop vol" data-act="installeren">${icon('smartphone')}ClubComm installeren</button><p class="zacht klein">Of doe het zelf:</p>` : ''}<ol class="stappen"><li><b>iPhone:</b> open ClubComm in <b>Safari</b>, tik op ${icon('share-2')} <b>Delen</b> en kies <b>Zet op beginscherm</b>.</li><li><b>Android:</b> open ClubComm in <b>Chrome</b>, tik op de drie puntjes en kies <b>App installeren</b> of <b>Toevoegen aan startscherm</b>.</li></ol><p class="zacht">Daarna open je ClubComm met één tik, net als een gewone app. Je blijft ingelogd.</p>`);
  });
  CC.on('installeren', async () => { const p = CC.installPrompt; if (!p) return; p.prompt(); const r = await p.userChoice.catch(() => ({})); CC.installPrompt = null; CC.closeSheet(); if (r.outcome === 'accepted') CC.toast('ClubComm staat op je beginscherm'); });
  CC.on('tweedeOuder', () => { const k = CC.kind(); if (!k) return; const link = `${location.origin}${location.pathname}#uitnodiging-${k.teamId}`;
    CC.sheet('Tweede ouder uitnodigen', `<p>Stuur de andere ouder de uitnodiging van ${esc(CC.tn(k.teamId))}. Die meldt zich aan met een eigen e-mailadres en vult de naam van ${esc(k.voornaam)} in. De teamleider koppelt jullie dan aan hetzelfde kind.</p><p class="klein zacht">Jullie zien elkaars e-mailadres niet.</p><div class="knoppen kolom"><button class="knop" data-act="tweedeOuderDeel" data-link="${esc(link)}">${icon('share-2')}Uitnodiging delen</button></div>`); });
  CC.on('tweedeOuderDeel', (el) => CC.deel(`Je kunt je aanmelden bij ClubComm voor ${CC.kind().voornaam} (${CC.kind().teamId}): ${el.dataset.link}`));

  // ---------- Berichten (voor alle rollen) ----------
  const vanNaam = (m) => (m.van === 'systeem' ? 'ClubComm' : (M.persoon(S, m.van) || { naam: 'Verwijderd account' }).naam);
  // Berichten van de club (HJO/clubbeheerder) zijn herkenbaar; vastgezette berichten blijven tijdelijk bovenaan (Besluit 19)
  CC.isClub = (m) => { const p = m.van !== 'systeem' && M.persoon(S, m.van); return !!(p && p.rollen.some((r) => ['hjo', 'beheerder'].includes(r.rol))); };
  CC.isVast = (m) => !!(m.vastTot && new Date(m.vastTot) > new Date());
  const volgorde = (me) => (a, b) => (a.gelezen.includes(me.id) - b.gelezen.includes(me.id)) || ((b.urgent ? 1 : 0) - (a.urgent ? 1 : 0)) || b.tijd.localeCompare(a.tijd);
  const afzenderIc = (m, naam) => (m.van === 'systeem' ? `<span class="avatar sys">${icon('bell')}</span>` : CC.isClub(m) ? `<span class="avatar club">${icon('shield')}</span>` : h.avatar(naam));
  CC.berichtenScherm = (S, opties = {}) => {
    const me = CC.me();
    const mijn = S.msgs.filter((m) => M.zichtbaar(S, m, me.id) && m.van !== me.id);
    const lijst = (ms) => ms.length ? `<div class="lijst">${ms.sort(volgorde(me)).map((m) => bericht(m, me)).join('')}</div>` : h.leeg('Geen berichten', 'message-circle');
    const vast = mijn.filter(CC.isVast).sort((a, b) => b.tijd.localeCompare(a.tijd));
    const vastBlok = vast.length ? `${h.sectie(`${icon('pin', 'klein')} Vastgezet`)}<div class="lijst vast">${vast.map((m) => bericht(m, me)).join('')}</div>` : '';
    const zonderVast = (ms) => ms.filter((m) => !CC.isVast(m));
    const nieuw = opties.nieuw ? `<button class="knop vol" data-act="nieuwBericht">${icon('plus')}Nieuw bericht</button>` : '';
    if (opties.ouder) {
      const tab = h.segVal('berichten', 'persoonlijk');
      // Eigen vragen aan trainer/teamleider staan ook bij Persoonlijk (met de antwoorden)
      const pers = [...mijn.filter((m) => m.soort === 'persoonlijk'), ...S.msgs.filter((m) => m.van === me.id && m.soort === 'persoonlijk')], nws = mijn.filter((m) => m.soort !== 'persoonlijk');
      const n = (ms) => ms.filter((m) => m.van !== me.id && !m.gelezen.includes(me.id)).length;
      const vraag = tab === 'persoonlijk' && CC.kinderen().length ? `<button class="knop licht vol" data-act="vraagStaf">${icon('message-circle')}Vraag aan trainer of teamleider</button>` : '';
      // Tabbladen altijd bovenaan; vastgezette berichten onder het tabblad waar ze bij horen
      const hier = tab === 'persoonlijk' ? pers : nws; const vastHier = vast.filter((m) => hier.includes(m));
      const vastBlokHier = vastHier.length ? `${h.sectie(`${icon('pin', 'klein')} Vastgezet`)}<div class="lijst vast">${vastHier.map((m) => bericht(m, me)).join('')}</div>` : '';
      return `${h.seg('berichten', [['persoonlijk', 'Persoonlijk', n(pers)], ['nieuws', 'Nieuws', n(nws)]], 'persoonlijk')}${vraag}${vastBlokHier}${lijst(zonderVast(hier))}`;
    }
    const tab = h.segVal('berichtenStaf', 'inbox');
    const verstuurd = S.msgs.filter((m) => m.van === me.id).sort((a, b) => b.tijd.localeCompare(a.tijd));
    return `${nieuw}${h.seg('berichtenStaf', [['inbox', 'Inbox', M.ongelezen(S, me.id)], ['verstuurd', 'Verstuurd']], 'inbox')}
      ${tab === 'inbox' ? vastBlok + lijst(zonderVast(mijn)) : verstuurd.length ? `<div class="lijst">${verstuurd.map((m) => bericht(m, me, true)).join('')}</div>` : h.leeg('Nog niets verstuurd', 'send')}`;
  };
  const bericht = (m, me, eigen) => {
    const ongelezen = !eigen && m.ontvangers.includes(me.id) && !m.gelezen.includes(me.id);
    const gepland = m.gepland && new Date(m.gepland) > new Date();
    const sub = eigen ? (gepland ? `Gepland voor ${D.tijdstip(m.gepland)}` : `Gelezen door ${m.gelezen.length} van ${m.ontvangers.length}`) : `${esc(vanNaam(m))} · ${esc(m.bereik || '')}`;
    return `<button class="bericht ${ongelezen ? 'nieuw' : ''}" data-act="open" data-view="bericht" data-id="${m.id}">
      ${eigen ? h.avatar(m.bereik || '?') : afzenderIc(m, vanNaam(m))}
      <span class="b-tekst"><b>${m.urgent ? `<span class="chip rood mini">Urgent</span> ` : ''}${CC.isClub(m) && !eigen ? `<span class="chip blauw mini">Club</span> ` : ''}${esc(m.onderwerp)}</b><small>${sub}</small><span class="b-voorbeeld">${esc(m.tekst.split('\n')[0])}</span></span>
      <span class="b-tijd">${gepland ? icon('clock') : D.tijdstip(m.tijd)}${CC.isVast(m) ? icon('pin', 'klein') : ''}${ongelezen ? '<i class="nieuwstip"></i>' : ''}</span></button>`;
  };
  CC.views.bericht = (S, p) => {
    const m = S.msgs.find((x) => x.id === p.id); const me = CC.me();
    if (!m.gelezen.includes(me.id) && m.ontvangers.includes(me.id)) { m.gelezen.push(me.id); CC.save(); }
    const eigen = m.van === me.id;
    const gelezenLijst = eigen ? `<details class="uitklap"><summary>Gelezen door ${m.gelezen.length} van ${m.ontvangers.length}</summary><p class="zacht klein">${m.ontvangers.map((id) => { const pp = M.persoon(S, id); return pp ? `${m.gelezen.includes(id) ? '✓' : '·'} ${esc(pp.naam)}` : ''; }).slice(0, 40).join('<br>')}</p></details>` : '';
    const kanReageren = m.soort === 'persoonlijk' && !eigen;
    return {
      titel: m.soort === 'persoonlijk' ? 'Persoonlijk bericht' : m.soort === 'melding' ? 'Melding' : 'Nieuws',
      html: `<article class="kaartje">
        <div class="b-kop">${afzenderIc(m, vanNaam(m))}<div><b>${esc(vanNaam(m))}${CC.isClub(m) ? ' <span class="chip blauw mini">Club</span>' : ''}</b><small>aan ${esc(m.bereik || '')} · ${D.tijdstip(m.gepland || m.tijd)}</small></div></div>
        ${m.urgent || CC.isVast(m) ? `<p class="klein">${m.urgent ? '<span class="chip rood mini">Urgent</span> ' : ''}${CC.isVast(m) ? `<span class="chip grijs mini">${icon('pin', 'klein')}Vastgezet tot ${D.kort(m.vastTot.slice(0, 10))}</span>` : ''}</p>` : ''}
        <h2>${esc(m.onderwerp)}</h2><p class="brief">${esc(m.tekst).replace(/\n/g, '<br>')}</p>${gelezenLijst}
        ${eigen && m.soort !== 'persoonlijk' ? `<div class="knoppen">${CC.isVast(m) ? `<button class="knop licht klein" data-act="losmaken" data-id="${m.id}">${icon('pin-off')}Losmaken</button>` : `<button class="knop licht klein" data-act="vastzetten" data-id="${m.id}" data-d="7">${icon('pin')}1 week vastzetten</button><button class="knop licht klein" data-act="vastzetten" data-id="${m.id}" data-d="14">${icon('pin')}2 weken</button>`}</div>` : ''}</article>
        ${m.antw.map((a) => `<div class="antwoord ${a.van === me.id ? 'mijn' : ''}"><small>${esc((M.persoon(S, a.van) || {}).naam || '')} · ${D.tijdstip(a.tijd)}</small><p>${esc(a.tekst)}</p></div>`).join('')}
        ${kanReageren || (eigen && m.soort === 'persoonlijk') ? `<form class="reageer" data-submit="reageer" data-id="${m.id}"><input name="t" placeholder="Reageer…" required aria-label="Reactie"><button class="icoonknop blauw" aria-label="Versturen">${icon('send')}</button></form>` : m.soort !== 'persoonlijk' ? `<p class="zacht klein midden">Nieuws is alleen-lezen. Vragen? Stuur een persoonlijk bericht.</p>` : ''}`,
    };
  };
  // Maximaal 2 vastgezette berichten per bereik: het oudste gaat eruit
  CC.zetVast = (m, dagen) => {
    const actief = S.msgs.filter((x) => x !== m && x.bereik === m.bereik && CC.isVast(x)).sort((a, b) => a.tijd.localeCompare(b.tijd));
    let weg = null; while (actief.length >= 2) { weg = actief.shift(); weg.vastTot = null; }
    m.vastTot = new Date(Date.now() + dagen * 864e5).toISOString();
    return weg;
  };
  CC.on('vastzetten', (el) => { const m = S.msgs.find((x) => x.id === el.dataset.id); const weg = CC.zetVast(m, Number(el.dataset.d)); CC.save(); CC.render(); CC.toast(weg ? `Vastgezet; "${weg.onderwerp}" is losgemaakt (max. 2)` : 'Vastgezet bovenaan'); });
  CC.on('losmaken', (el) => { const m = S.msgs.find((x) => x.id === el.dataset.id); m.vastTot = null; CC.save(); CC.render(); CC.toast('Losgemaakt'); });
  // Ouder: vraag aan de trainer en teamleider van het eigen team (geen groepschat, geen andere ouders)
  CC.on('vraagStaf', () => {
    const kids = CC.kinderen(); const k = CC.kind();
    CC.sheet('Vraag aan trainer of teamleider', `<form data-submit="vraagStafOk" class="codeform">
      ${kids.length > 1 ? `<label for="vs-k">Over</label><select id="vs-k" name="k">${kids.map((x) => `<option value="${x.id}" ${x.id === k.id ? 'selected' : ''}>${esc(x.voornaam)} (${esc(CC.tn(x.teamId))})</option>`).join('')}</select>` : `<input type="hidden" name="k" value="${k.id}">`}
      <label for="vs-o">Onderwerp</label><input id="vs-o" name="o" required maxlength="80" placeholder="Bijv. schoenen laten liggen">
      <label for="vs-t">Je vraag</label><textarea id="vs-t" name="t" rows="4" required></textarea>
      <button class="knop vol">${icon('send')}Versturen</button>
      <p class="zacht klein">Alleen de trainer en teamleider van het team zien dit. Afmelden gaat via de knop Afmelden, niet via een bericht.</p></form>`);
  });
  CC.on('vraagStafOk', (f) => {
    const me = CC.me(); const pl = M.speler(S, f.k.value); const t = M.team(S, pl.teamId);
    const ontv = M.stafVan(S, t.id).filter((x) => x !== me.id);
    if (!ontv.length) return CC.toast('Dit team heeft nog geen trainer of teamleider', 'fout');
    S.msgs.push({ id: 'b' + Date.now(), van: me.id, soort: 'persoonlijk', bereik: `${pl.voornaam} (${CC.tn(pl.teamId)})`, onderwerp: f.o.value.trim(), tekst: f.t.value.trim(), tijd: new Date().toISOString(), ontvangers: [...new Set(ontv)], gelezen: [me.id], antw: [], urgent: false, gepland: null, vastTot: null });
    CC.save(); CC.closeSheet(); CC.render(); CC.toast('Verstuurd naar de trainer en teamleider');
  });
  CC.on('reageer', (f) => { const m = S.msgs.find((x) => x.id === f.dataset.id); m.antw.push({ van: CC.me().id, tekst: f.t.value, tijd: new Date().toISOString() }); CC.save(); CC.render(); CC.toast('Verstuurd'); });

  // Nieuw bericht (trainer, teamleider, HJO) — Besluit 7 en 11
  CC.on('nieuwBericht', () => {
    const rol = CC.rol().rol;
    const soorten = ['hjo', 'coordinator'].includes(rol)
      ? [['club', 'megaphone', 'Bericht aan club', 'Aan alle ouders en staf'], ['teams', 'users', 'Aan teams', 'Kies één of meer teams'], ['persoon', 'user', 'Persoonlijk', 'Aan één ouder of stafslid'], ['gepland', 'clock', 'Gepland bericht', 'Schrijf nu, verstuur later']]
      : [['groep', 'users', 'Groepsbericht', 'Aan alle ouders van het team'], ['persoon', 'user', 'Persoonlijk', 'Aan één ouder'], ['wijziging', 'calendar-x', 'Trainingswijziging', 'Past ook de planning aan'], ['herinnering', 'bell', 'Herinnering', 'Met ingevuld sjabloon']];
    CC.sheet('Nieuw bericht', `<div class="lijst">${soorten.map(([v, ic, t, s]) => h.rij({ ic, titel: t, sub: s, act: 'berichtSoort', attrs: `data-soort="${v}"` })).join('')}</div>`);
  });
  CC.on('berichtSoort', (el) => CC.berichtForm(el.dataset.soort));
  CC.berichtForm = (soort) => {
    const tid = CC.teamId(); const t = tid && M.team(S, tid);
    if (soort === 'wijziging') return CC.wijzigingSheet();
    let extra = '', onderwerp = '', tekst = '';
    if (soort === 'persoon') {
      const lijst = tid ? M.spelers(S, tid).map((pl) => pl.ouders.map((o) => `<option value="${o}">${esc(M.persoon(S, o).naam)} (${esc(pl.voornaam)})</option>`).join('')).join('') : S.people.slice(0, 60).map((p) => `<option value="${p.id}">${esc(p.naam)}</option>`).join('');
      extra = `<label for="m-aan">Aan</label><select id="m-aan" name="aan">${lijst}</select>`;
    }
    if (soort === 'teams') extra = `<fieldset class="vinkjes"><legend>Teams</legend>${S.teams.map((x) => `<label><input type="checkbox" name="teams" value="${x.id}"> ${x.naam}</label>`).join('')}</fieldset>`;
    if (soort === 'gepland') extra = `<label for="m-op">Versturen op</label><input id="m-op" name="op" type="datetime-local" required value="${D.addDays(D.vandaag(), 7)}T09:00">`;
    if (soort === 'herinnering') { const a = M.komend(S, tid, 1)[0]; onderwerp = 'Herinnering'; tekst = a ? `Vergeet niet: ${M.isWed(a) ? 'wedstrijd' : a.soort === 'activiteit' ? esc(a.naam || 'activiteit').toLowerCase() : 'training'} ${D.lang(a.datum)} om ${a.tijd}. Kan je kind niet? Meld af in ClubComm.` : ''; }
    CC.sheet('Nieuw bericht', `<form data-submit="verstuurBericht" data-soort="${soort}" class="codeform">
      ${extra}
      <label for="m-ond">Onderwerp</label><input id="m-ond" name="ond" required value="${esc(onderwerp)}">
      <label for="m-tekst">Bericht</label><textarea id="m-tekst" name="tekst" rows="5" required>${esc(tekst)}</textarea>
      ${soort !== 'persoon' ? `<label for="m-vast">Vastzetten bovenaan</label><select id="m-vast" name="vast"><option value="0">Nee</option><option value="7">1 week</option><option value="14">2 weken</option></select>
      <label class="vink"><input type="checkbox" name="urgent"> Urgent: alleen voor iets van vandaag of morgen (bovenaan, altijd ook per e-mail)</label>
      <label class="vink"><input type="checkbox" name="mail" checked> Ook per e-mail (zet uit voor iets wat niet belangrijk is)</label>` : ''}
      <button class="knop">${soort === 'gepland' ? 'Inplannen' : 'Versturen'}</button>
      ${t ? `<p class="zacht klein">Wordt verstuurd aan ${soort === 'persoon' ? 'één ouder, in de app en per e-mail' : `alle ouders van ${esc(t.naam)}`}.</p>` : ''}</form>`);
  };
  CC.on('verstuurBericht', (f) => {
    const soort = f.dataset.soort; const me = CC.me(); const tid = CC.teamId();
    let ontvangers = [], bereik = '', ms = 'nieuws';
    if (soort === 'persoon') { ontvangers = [f.aan.value]; bereik = M.persoon(S, f.aan.value).naam; ms = 'persoonlijk'; }
    else if (soort === 'teams') { const ts = [...f.querySelectorAll('[name=teams]:checked')].map((x) => x.value); if (!ts.length) return CC.toast('Kies minstens één team', 'fout'); ontvangers = [...new Set(ts.flatMap((x) => M.oudersVan(S, x)))]; bereik = ts.join(', '); }
    else if (soort === 'club' || soort === 'gepland') { ontvangers = S.people.map((p) => p.id).filter((x) => x !== me.id); bereik = 'Hele club'; }
    else { ontvangers = M.oudersVan(S, tid); M.stafVan(S, tid).forEach((x) => { if (x !== me.id) ontvangers.push(x); }); bereik = tid; }
    const nieuwM = { id: 'b' + Date.now(), van: me.id, soort: ms, bereik, onderwerp: f.ond.value, tekst: f.tekst.value, tijd: new Date().toISOString(), gepland: soort === 'gepland' ? new Date(f.op.value).toISOString() : null, ontvangers: [...new Set(ontvangers)], gelezen: [], antw: [], urgent: !!(f.urgent && f.urgent.checked), vastTot: null, mail: !f.mail || f.mail.checked || !!(f.urgent && f.urgent.checked) };
    S.msgs.push(nieuwM); if (f.vast && Number(f.vast.value)) CC.zetVast(nieuwM, Number(f.vast.value));
    CC.save(); CC.closeSheet(); ui.seg.berichtenStaf = 'verstuurd'; CC.render(); CC.toast(soort === 'gepland' ? 'Bericht ingepland' : `Verstuurd aan ${ontvangers.length} ${ontvangers.length === 1 ? 'persoon' : 'personen'}`);
  });

  // Trainingswijziging / planning aanpassen (Besluit 7): past de planning aan + melding HJO en teamleider
  CC.wijzigingSheet = (actId) => {
    const tid = CC.teamId();
    const komend = M.komend(S, tid, 12).filter((a) => !a.afgelast);
    CC.sheet('Planning aanpassen', `<form data-submit="wijzigPlanning" class="codeform">
      <label for="w-wat">Wat wil je doen?</label>
      <select id="w-wat" name="wat" data-change="wijzigWat"><option value="verplaats">Training verplaatsen of veld wijzigen</option><option value="afgelast">Training afgelasten</option><option value="extra">Extra training toevoegen</option><option value="oefen">Oefenwedstrijd toevoegen</option><option value="activiteit">Activiteit toevoegen (zaalvoetbal, toernooi, uitje)</option></select>
      <div id="w-bestaand"><label for="w-act">Welke training?</label><select id="w-act" name="act">${komend.filter((a) => a.soort === 'training').map((a) => `<option value="${a.id}" ${a.id === actId ? 'selected' : ''}>${D.kort(a.datum)} · ${a.tijd} · ${esc(a.veld)}</option>`).join('')}</select></div>
      <div id="w-nieuw"><label for="w-dat">Datum</label><input id="w-dat" name="datum" type="date" value="${D.addDays(D.vandaag(), 1)}">
      <div class="twee"><div><label for="w-tijd">Tijd</label><input id="w-tijd" name="tijd" type="time" value="17:30"></div><div><label for="w-veld">Veld</label><input id="w-veld" name="veld" value="Veld 2"></div></div>
      <div id="w-tegen" hidden><label for="w-t">Tegenstander</label><input id="w-t" name="tegen" placeholder="Bijv. FC Amstelland O10-3"></div>
      <div id="w-activ" hidden><label for="w-n">Wat gaan we doen?</label><input id="w-n" name="naam" placeholder="Bijv. Pleintjesvoetbal"><div class="twee"><div><label for="w-vz">Verzamelen (mag leeg)</label><input id="w-vz" name="verzamel" type="time"></div><div><label for="w-e">Tot</label><input id="w-e" name="eind" type="time"></div></div><label for="w-p">Waar?</label><input id="w-p" name="plaats" placeholder="Bijv. Cruyff Court Osdorp"><label for="w-ad">Adres (voor de routeknop, mag leeg)</label><input id="w-ad" name="adres" placeholder="Begin te typen, bijv. Louis de Visserplein" data-adres autocomplete="off"><label for="w-tl">Toelichting (mag leeg)</label><input id="w-tl" name="toelichting" placeholder="Bijv. neem gymschoenen en een bidon mee">
      <label class="vink"><input type="checkbox" name="opgave" data-change="wijzigOpgave"> Opgave nodig (ouders geven ja of nee door, bijv. voor een reservering)</label>
      <div id="w-opg" hidden><label for="w-ot">Opgeven tot</label><input id="w-ot" name="opgaveTot" type="date"></div>
      <fieldset class="vinkjes rij-vinkjes"><legend>Herinneringen (bij opgave alleen aan wie nog niet reageerde)</legend>${[14, 7, 3, 2, 1].map((d) => `<label><input type="checkbox" name="hr" value="${d}" ${[7, 2].includes(d) ? 'checked' : ''}> ${d} ${d === 1 ? 'dag' : 'dagen'} voor</label>`).join('')}</fieldset></div></div>
      <button class="knop">Opslaan en ouders informeren</button>
      <p class="zacht klein">Ouders krijgen direct een bericht. De teamleider en de ${esc(S.club.labels.hjo)} krijgen een niet-urgente melding.</p></form>`);
  };
  CC.on('wijzigOpgave', (el) => { el.form.querySelector('#w-opg').hidden = !el.checked; if (el.checked && !el.form.opgaveTot.value) el.form.opgaveTot.value = D.addDays(el.form.datum.value, -3); });
  CC.on('wijzigWat', (el) => {
    const f = el.form; const v = el.value;
    f.querySelector('#w-bestaand').hidden = !(v === 'verplaats' || v === 'afgelast');
    f.querySelector('#w-nieuw').hidden = v === 'afgelast';
    f.querySelector('#w-tegen').hidden = v !== 'oefen';
    f.querySelector('#w-activ').hidden = v !== 'activiteit'; f.querySelector('#w-veld').closest('div').hidden = v === 'activiteit';
  });
  CC.on('wijzigPlanning', (f) => {
    const tid = CC.teamId(); const t = M.team(S, tid); const me = CC.me(); const wat = f.wat.value;
    let tekst = '';
    if (wat === 'afgelast' || wat === 'verplaats') {
      const a = M.act(S, f.act.value); if (!a) return CC.toast('Kies een training', 'fout');
      if (wat === 'afgelast') { a.afgelast = true; tekst = `Training van ${D.lang(a.datum)} gaat niet door.`; }
      else { const oud = `${D.kort(a.datum)} ${a.tijd}`; a.datum = f.datum.value; a.tijd = f.tijd.value; a.veld = f.veld.value; a.eind = CC.plusMin(a.tijd, 75); tekst = `Training van ${oud} is verplaatst naar ${D.lang(a.datum)} ${a.tijd} op ${a.veld}.`; }
    } else {
      if (wat === 'activiteit' && !f.naam.value.trim()) return CC.toast('Vul in wat jullie gaan doen', 'fout');
      const a = wat === 'activiteit'
        ? { id: 'a' + Date.now(), teamId: tid, soort: 'activiteit', naam: f.naam.value.trim(), datum: f.datum.value, tijd: f.tijd.value, eind: f.eind.value || CC.plusMin(f.tijd.value, 90), verzamel: f.verzamel.value || '', plaats: f.plaats.value.trim(), adres: f.adres.value.trim(), toelichting: f.toelichting.value.trim(), veld: '', afgelast: false, opgave: f.opgave.checked, opgaveTot: f.opgave.checked ? (f.opgaveTot.value || f.datum.value) : null, herinneringen: [...f.querySelectorAll('[name=hr]:checked')].map((x) => Number(x.value)), herinnerd: [] }
        : { id: 'a' + Date.now(), teamId: tid, soort: wat === 'oefen' ? 'oefen' : 'training', datum: f.datum.value, tijd: f.tijd.value, eind: CC.plusMin(f.tijd.value, wat === 'oefen' ? 60 : 75), veld: f.veld.value, tegen: f.tegen.value, thuis: true, verzamel: f.tijd.value, adres: S.club.sportpark || '', afgelast: false };
      S.acts.push(a); S.acts.sort((x, y) => (x.datum + x.tijd).localeCompare(y.datum + y.tijd));
      tekst = wat === 'activiteit' ? `${a.naam} op ${D.lang(a.datum)} van ${a.tijd} tot ${a.eind}${a.plaats ? ` bij ${a.plaats}` : ''}.${a.verzamel ? ` Verzamelen om ${a.verzamel}.` : ''}${a.toelichting ? ` ${a.toelichting}` : ''}${a.opgave ? ` Geef je kind vóór ${D.lang(a.opgaveTot)} op in ClubComm: ja of nee.` : ' Kan je kind niet? Meld af in ClubComm.'}` : `${wat === 'oefen' ? 'Oefenwedstrijd' : 'Extra training'} op ${D.lang(a.datum)} om ${a.tijd} (${a.veld}).`;
    }
    const now = new Date().toISOString();
    S.msgs.push({ id: 'b' + Date.now(), van: me.id, soort: 'nieuws', bereik: tid, onderwerp: wat === 'activiteit' ? `Nieuw: ${f.naam.value.trim()}` : 'Wijziging in de planning', tekst, tijd: now, ontvangers: M.oudersVan(S, tid), gelezen: [], antw: [], urgent: wat !== 'activiteit', gepland: null });
    const hjo = S.people.filter((p) => p.rollen.some((r) => r.rol === 'hjo')).map((p) => p.id);
    const info = [...new Set([...hjo, ...M.stafVan(S, tid)])].filter((x) => x && x !== me.id);
    S.msgs.push({ id: 'b' + Date.now() + 1, van: 'systeem', soort: 'melding', bereik: 'Ter informatie', onderwerp: `Planning ${CC.tn(tid)} gewijzigd`, tekst: `${me.naam}: ${tekst} Je hoeft niets te doen.`, tijd: now, ontvangers: info, gelezen: [], antw: [], urgent: false, gepland: null });
    S.wijzigingen.push({ id: 'w' + Date.now(), teamId: tid, door: me.id, tekst, tijd: now });
    CC.save(); CC.closeSheet(); CC.render(); CC.toast('Planning aangepast, ouders zijn ingelicht');
  });

  // ---------- Ouders uitnodigen: Delen / QR tonen / QR printen (Besluit 2) ----------
  CC.uitnodigLink = (teamId) => `${location.origin}${location.pathname}#uitnodiging-${teamId}`;
  CC.qrSvg = (tekst, grootte = 6) => { const q = qrcode(0, 'M'); q.addData(tekst); q.make(); return q.createSvgTag({ cellSize: grootte, margin: 2, scalable: true }); };
  CC.uitnodigBlok = (teamId) => `<div class="drie">
      <button class="tegel" data-act="deelUitnodiging" data-team="${teamId}">${icon('share-2')}<span>Delen</span></button>
      <button class="tegel" data-act="toonQR" data-team="${teamId}">${icon('qr-code')}<span>QR tonen</span></button>
      <button class="tegel" data-act="printQR" data-team="${teamId}">${icon('printer')}<span>QR printen</span></button></div>
      <p class="zacht klein">De uitnodiging verloopt over 14 dagen. <button class="linkknop" data-act="vernieuwUitnodiging">Nu vernieuwen</button></p>`;
  CC.deel = async (tekst, titel) => {
    if (navigator.share) { try { await navigator.share({ title: titel, text: tekst }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    try { await navigator.clipboard.writeText(tekst); CC.toast('Tekst gekopieerd: plak hem in WhatsApp'); }
    catch (e) { CC.sheet('Kopieer deze tekst', `<textarea rows="6" class="kopieer" readonly>${esc(tekst)}</textarea><p class="zacht klein">Selecteer en kopieer de tekst, en plak hem in de teamgroep.</p>`); }
  };
  CC.on('deelUitnodiging', (el) => CC.deel(`Hoi ouders van ${CC.tn(el.dataset.team)}! Meld je kind aan in ClubComm (afmelden, planning en berichten): ${CC.uitnodigLink(el.dataset.team)}`, `Uitnodiging ${el.dataset.team}`));
  CC.on('toonQR', (el) => CC.sheet(`Scan om aan te melden · ${el.dataset.team}`, `<div class="qr">${CC.qrSvg(CC.uitnodigLink(el.dataset.team), 8)}</div><p class="midden">Open de camera van je telefoon en richt hem op de code.</p>`, { groot: true }));
  CC.on('printQR', (el) => {
    const t = M.team(S, el.dataset.team);
    CC.sheet('QR printen', `<div class="printvel" id="printvel"><img src="assets/clubcomm-icon.png" alt="" class="pv-logo"><h2>Ouders van ${esc(t.naam)}</h2><p>Meld je kind aan in ClubComm: afmelden, planning en berichten van ${esc(S.club.naam)}.</p><div class="qr">${CC.qrSvg(CC.uitnodigLink(t.id), 8)}</div><p><b>1.</b> Scan de code met je camera &nbsp; <b>2.</b> Vul je e-mail en de naam van je kind in &nbsp; <b>3.</b> Klaar!</p></div>
      <button class="knop vol" data-act="doePrint">${icon('printer')}Printen (A4)</button><p class="zacht klein">In de voorbeeldweergave kan printen geblokkeerd zijn; in de echte app opent het printvenster.</p>`, { groot: true });
  });
  CC.on('doePrint', () => { document.body.classList.add('print-qr'); window.print(); setTimeout(() => document.body.classList.remove('print-qr'), 500); });
  CC.on('vernieuwUitnodiging', () => CC.toast('Nieuwe uitnodiging gemaakt; de oude link werkt niet meer'));

  // ---------- Afmelden (Besluit 4) ----------
  CC.on('afmelden', (el) => {
    const a = M.act(S, el.dataset.act2); const pl = M.speler(S, el.dataset.speler);
    const laat = new Date() > M.deadline(S, a);
    CC.sheet(`${pl.voornaam} afmelden`, `<p class="zacht">${h.actTitel(S, a)} · ${D.lang(a.datum)} ${a.tijd}</p>
      ${laat ? `<div class="info oranje">${icon('clock')}<span>De afmeldtermijn is voorbij (tot ${M.deadlineTekst(S, a)}). Afmelden kan nog wel, maar telt als <b>te laat afgemeld</b>. <a href="#" data-act="uitlegKaarten">Wat betekent dit?</a></span></div>` : ''}
      <form data-submit="bevestigAfmelden" data-act2="${a.id}" data-speler="${pl.id}">
      <fieldset class="redenen"><legend>Waarom kan ${esc(pl.voornaam)} niet?</legend>
      ${CC.REDENEN.map(([r, ic], i) => `<label class="reden"><input type="radio" name="reden" value="${r}" ${i === 0 ? 'required' : ''}>${icon(ic)}<span>${r}</span></label>`).join('')}</fieldset>
      <label for="af-opm">Opmerking (mag leeg)</label><input id="af-opm" name="opm" placeholder="Bijv. terug na de vakantie">
      <button class="knop vol">Afmelden</button></form>
      <p class="zacht klein">De trainer en teamleider zien je afmelding direct. Langer weg? <button class="linkknop" data-act="periodeSheet" data-id="${pl.id}">Meld een hele periode af</button></p>`);
  });
  CC.on('bevestigAfmelden', (f) => {
    const a = M.act(S, f.dataset.act2); const pl = M.speler(S, f.dataset.speler);
    S.afm.push({ id: 'f' + Date.now(), spelerId: pl.id, actId: a.id, reden: f.reden.value, opm: f.opm.value, tijd: new Date().toISOString(), door: CC.me().id });
    const v = S.vervoer[a.id]; if (v) { delete v.plek[pl.id]; if (v.vraag) delete v.vraag[pl.id]; }
    CC.save(); CC.closeSheet(); CC.render(); CC.toast(`${pl.voornaam} is afgemeld`);
  });
  CC.on('intrekken', (el) => {
    const i = S.afm.findIndex((f) => f.spelerId === el.dataset.speler && f.actId === el.dataset.act2);
    if (i >= 0) S.afm.splice(i, 1); CC.save(); CC.render(); CC.toast('Afmelding ingetrokken: fijn dat je kind toch komt!');
  });
  CC.on('uitlegKaarten', () => { const r = M.kaartRegels(S, (CC.kind && CC.kind() || {}).teamId); const i = S.club.inst; CC.sheet('Wat betekenen de kaarten?', `
    <p>De kaarten gaan over <b>afmelden</b>: zo weten trainer en teamleider op tijd wie er komt. Een kaart is <b>een registratie, geen straf</b>.</p>
    <div class="uitleg"><span class="kaart geel">1</span><span><b>Geel: te laat afgemeld</b><small>Na de afmeldtermijn (training ${i.deadlineTraining} uur, wedstrijd ${i.deadlineWedstrijd} uur van tevoren). Ziek geworden op de dag zelf telt niet.</small></span></div>
    <div class="uitleg"><span class="kaart geel">2</span><span><b>Twee keer geel is rood</b><small>Net als op het veld.</small></span></div>
    <div class="uitleg"><span class="kaart rood">1</span><span><b>Rood: niet afgemeld en niet gekomen</b><small>Dit is voor het team het lastigst.</small></span></div>
    <h3 class="klein-kop">Zo gaat het (per seizoen)</h3>
    <ol class="stappen">
      <li><b>Herinneren:</b> de eerste ${r.waarschuwingen === 1 ? 'keer' : `${r.waarschuwingen} keer`} per seizoen krijg je een vriendelijke herinnering, zonder kaart.</li>
      <li><b>Kaart:</b> daarna volgt een gele of rode kaart, met uitleg.</li>
      <li><b>Bij rood</b> neemt de trainer of de ${esc(S.club.labels.hjo)} contact met je op: <i>"Kunnen we je ergens mee helpen?"</i> Is er een goede reden, dan kan de trainer de kaart accepteren.</li>
      <li><b>Persoonlijk gesprek</b> met de ${esc(S.club.labels.hjo)} als het daarna opnieuw gebeurt.</li>
      <li>Gebeurt het na dat gesprek nog eens, dan kan de club besluiten afscheid te nemen. Dat beslissen altijd mensen, nooit de app.</li>
    </ol>
    <p class="zacht klein">Te laat komen is geen kaart. Gebeurt het vaak, dan praat de trainer er even over. Kaarten en stappen tellen over het hele seizoen.</p>`); });

  // Contactkaart: een ouder met bellen, WhatsApp en mail (Besluit 34)
  // Bellen en WhatsApp (Besluit 40): altijd zichtbaar; zonder nummer grijs, en een tik legt uit hoe het nummer erin komt
  CC.waNummer = (t) => { const d = String(t || '').replace(/\D/g, ''); return d.startsWith('00') ? d.slice(2) : d.startsWith('0') ? '31' + d.slice(1) : d; };
  CC.belKnoppen = (o, extra = '') => o && o.tel
    ? `<a class="icoonknop" href="tel:${esc(o.tel)}" aria-label="Bel ${esc(o.naam)}" ${extra}>${icon('phone')}</a><a class="icoonknop groen" href="https://wa.me/${CC.waNummer(o.tel)}" target="_blank" rel="noopener" aria-label="WhatsApp ${esc(o.naam)}" ${extra}>${icon('message-circle')}</a>`
    : `<button class="icoonknop uit" data-act="geenTel" data-naam="${esc(o ? o.naam : '')}" aria-label="Nog geen telefoonnummer" ${extra}>${icon('phone')}</button><button class="icoonknop uit" data-act="geenTel" data-naam="${esc(o ? o.naam : '')}" aria-label="Nog geen telefoonnummer" ${extra}>${icon('message-circle')}</button>`;
  CC.on('geenTel', (el) => CC.toast(`${(el.dataset.naam || 'Deze ouder').split(' ')[0]} heeft nog geen telefoonnummer ingevuld. Vraag het via een bericht: ouders vullen het zelf in bij Profiel.`));
  CC.contactRij = (o) => h.rij({ ic: h.avatar(o.naam), titel: esc(o.naam), sub: esc(o.tel || 'Nog geen telefoonnummer'), rechts: `<span class="contactknoppen">${CC.belKnoppen(o)}${o.email && !/\.invalid$/.test(o.email) ? `<a class="icoonknop" href="mailto:${esc(o.email)}" aria-label="Mail ${esc(o.naam)}">${icon('mail')}</a>` : ''}</span>` });

  // Volgt deze rol spelers op (aanwezigheid, kaarten, signalen)? De teamleider standaard niet (Besluit 33); de club kan het aanzetten.
  CC.volgtSpelers = (tid) => CC.rol().rol !== 'teamleider' || CC.mag('afdoen', null, tid) || CC.mag('bellen', null, tid);

  // ---------- Speler-detail (trainer, teamleider, HJO) ----------
  CC.views.speler = (S, p) => {
    const pl = M.speler(S, p.id); const t = M.team(S, pl.teamId);
    const per = M.periode(S, h.segVal('spPer', 'blok'));
    const st = M.stats(S, pl, per); const k = M.kaarten(S, pl); const z = M.zone(S, st.pct, t.id);
    const lang = S.lang.find((l) => l.spelerId === pl.id && l.tot >= D.vandaag());
    const rol = CC.rol().rol;
    const ouders = pl.ouders.map((o) => M.persoon(S, o));
    const b = CC.beoordLaatste && CC.beoordLaatste(S, pl.id);
    const gespr = S.gesprekken.filter((g) => g.spelerId === pl.id);
    return {
      titel: M.naam(S, pl),
      html: `${!CC.volgtSpelers(t.id) ? `${(() => { const v = M.komend(S, t.id, 6).find((x) => !x.afgelast); return v ? `<p class="klein">${D.relatief(v.datum)} · ${h.actTitel(S, v)}: ${h.chip(M.status(S, pl, v))}</p>` : ''; })()}${lang ? `<div class="info">${icon('hospital')}<span><b>Langdurig afwezig</b> tot ongeveer ${D.kort(lang.tot)}.</span></div>` : ''}` : `${h.seg('spPer', [['blok', 'Deze fase'], ['seizoen', 'Heel seizoen']], 'blok')}
      <div class="cijfers"><div class="cijfer ${z}"><b>${st.pct == null ? '–' : st.pct + '%'}</b><small>aanwezig</small></div><div class="cijfer"><b>${st.telaat}×</b><small>te laat</small></div><div class="cijfer"><b>${h.kaartjes(k) || '–'}</b><small>kaarten seizoen</small></div></div>
      <p class="klein zacht">${h.split(st)}</p>
      ${lang ? `<div class="info">${icon('hospital')}<span><b>Langdurig afwezig</b> (${esc(lang.reden.toLowerCase())}) tot ongeveer ${D.kort(lang.tot)}. ${CC.zicht('toelichting') ? esc(lang.opm || '') : ''}</span></div>` : ''}
      ${Object.keys(st.redenen).length ? `${h.sectie('Redenen van afwezigheid')}<div class="balkjes">${Object.entries(st.redenen).sort((a, b) => b[1] - a[1]).map(([r, n]) => `<div class="balkje"><span>${esc(r)}</span><i style="--w:${(100 * n) / st.afwezig}%"></i><b>${n}</b></div>`).join('')}</div>` : ''}
      ${h.sectie('Geschiedenis')}<div class="lijst compact">${st.lijst.slice().reverse().map(({ act, st: s }) => h.rij({ ic: h.datumBlok(act), titel: h.actTitel(S, act), sub: s.afm && s.afm.opm && CC.zicht('toelichting') ? esc(s.afm.opm) : '', rechts: h.chip(s) + (s.laat ? '<span class="chip geel mini">te laat afgemeld</span>' : '') })).join('') || h.leeg('Nog geen activiteiten')}</div>
      ${k.ev.length ? `${h.sectie('Afmelden: herinneringen en kaarten dit seizoen')}<div class="lijst compact">${k.ev.slice().reverse().map((e) => h.rij({ ic: CC.kaartIc(e), titel: CC.kaartTitel(e), sub: `${D.kort(e.act.datum)} · ${e.wat.toLowerCase()}${e.geaccepteerd ? ' · <b>geaccepteerd</b>' : ''}` })).join('')}</div>` : ''}`}
      ${rol !== 'ouder' ? `${h.sectie('Ouders')}<div class="lijst">${ouders.map((o) => CC.contactRij(o)).join('')}</div>` : ''}
      ${CC.zicht('beoordeling') && b ? `${h.sectie(`Beoordeling · ${esc(b.m.naam.toLowerCase())}`)}<div class="scores">${Object.entries(b.x.scores).map(([v, s]) => `<span>${esc(v)} ${CC.scoreTekst(t, s)}</span>`).join('')}</div>` : ''}
      ${rol !== 'ouder' ? `${CC.zicht('gesprekken') ? `${h.sectie('Gesprekken')}${gespr.map((g) => h.rij({ ic: g.soort === 'gesprek' ? 'users' : g.soort === 'geappt' ? 'message-circle' : g.soort === 'geaccepteerd' ? 'circle-check' : 'phone', titel: `${D.kort(g.datum)} · ${CC.gesprekLabel(g)} · ${esc((M.persoon(S, g.door) || { naam: '' }).naam)}`, sub: esc(g.notitie) + (g.afspraak ? `<br><b>Afspraak:</b> ${esc(g.afspraak)}` : '') })).join('') || '<p class="zacht klein">Nog geen gesprekken vastgelegd.</p>'}` : ''}
        <div class="knoppen">${CC.zicht('contact') ? `<button class="knop licht" data-act="gesprekVastleggen" data-id="${pl.id}">${icon('phone')}Contact vastleggen</button>` : ''}${CC.mag('langdurig') ? `<button class="knop licht" data-act="langdurigSheet" data-id="${pl.id}">${icon('hospital')}Langdurig afwezig</button>` : ''}</div>` : ''}`,
    };
  };
  CC.kaartIc = (e) => (e.kaart === 'herinnering' ? 'mail' : `<span class="kaart ${e.kaart}${e.geaccepteerd ? ' vaag' : ''}">${e.tweedeGeel ? '2' : '1'}</span>`);
  CC.kaartTitel = (e) => (e.kaart === 'herinnering' ? 'Vriendelijke herinnering' : e.kaart === 'geel' ? 'Gele kaart' : e.tweedeGeel ? 'Rode kaart (tweede gele)' : 'Rode kaart');
  CC.gesprekLabel = (g) => ({ gesprek: 'Persoonlijk gesprek', geappt: 'Geappt', geaccepteerd: 'Begrijpelijk, geaccepteerd' }[g.soort] || 'Gebeld');
  CC.scoreTekst = (t, s) => { const c = CC.categorie(t.cat); if (c.schaal === 'smiley' || c.schaal === 'mini') return ['', '<span class="smiley">😐</span>', '<span class="smiley">🙂</span>', '<span class="smiley">😃</span>'][s] || '–'; return `<b>${s}</b>/5`; };
  CC.on('gesprekVastleggen', (el) => {
    const pl = M.speler(S, el.dataset.id); const stap = M.stap(S, pl); const hjo = CC.mag ? CC.mag('gesprek') : CC.rol().rol === 'hjo';
    const std = stap && stap.soort === 'gesprekHjo' ? 'gesprek' : 'gebeld';
    CC.sheet('Contact vastleggen', `<form data-submit="gesprekOpslaan" data-id="${pl.id}" class="codeform">
      <label for="g-s">Soort contact</label><select id="g-s" name="s"><option value="gebeld" ${std === 'gebeld' ? 'selected' : ''}>Gebeld</option><option value="geappt">Geappt</option><option value="gesprek" ${std === 'gesprek' ? 'selected' : ''}>Persoonlijk gesprek${hjo ? '' : ` (${esc(CC.wie ? CC.wie('gesprek', pl.teamId) : S.club.labels.hjo)})`}</option><option value="geaccepteerd">Begrijpelijk, geaccepteerd (goede reden)</option></select>
      <label for="g-d">Datum</label><input id="g-d" name="d" type="date" value="${D.vandaag()}">
      <label for="g-n">Wat speelt er?</label><textarea id="g-n" name="n" rows="3" required placeholder="Bijv. zwemles op vrijdag; oma ziek."></textarea>
      <label for="g-a">Afspraak (mag leeg)</label><input id="g-a" name="a" placeholder="Bijv. altijd via de app afmelden, ook als het laat wordt">
      <button class="knop">Opslaan</button><p class="zacht klein">Alleen trainer, teamleider en ${esc(S.club.labels.hjo)} zien dit. Gebeurt het daarna opnieuw, dan stelt de app de volgende stap voor. Kies "geaccepteerd" als er een goede reden was: de kaart blijft zichtbaar, maar telt niet mee.</p></form>`);
  });
  CC.on('gesprekOpslaan', (f) => { S.gesprekken.push({ id: 'g' + Date.now(), spelerId: f.dataset.id, soort: f.s.value, datum: f.d.value, door: CC.me().id, notitie: f.n.value, afspraak: f.a.value }); CC.save(); CC.closeSheet(); CC.render(); CC.toast('Vastgelegd'); });

  // Langdurig afwezig melden (Besluit 10) — ouder of teamleider
  CC.on('langdurigSheet', (el) => {
    const pl = M.speler(S, el.dataset.id);
    CC.sheet(`${pl.voornaam} langdurig afwezig`, `<form data-submit="langdurigOpslaan" data-id="${pl.id}" class="codeform">
      <label for="l-r">Reden</label><select id="l-r" name="reden"><option>Blessure</option><option>Ziek</option><option>Overig</option></select>
      <div class="twee"><div><label for="l-v">Vanaf</label><input id="l-v" name="van" type="date" value="${D.vandaag()}"></div><div><label for="l-t">Terug rond</label><input id="l-t" name="tot" type="date" value="${D.addDays(D.vandaag(), 28)}"></div></div>
      <label for="l-o">Toelichting (mag leeg)</label><input id="l-o" name="opm" placeholder="Bijv. enkelblessure, fysio 2× per week">
      <button class="knop vol">Melden</button>
      <p class="zacht klein">Trainer, teamleider en ${esc(S.club.labels.hjo)} krijgen een melding. In deze periode hoef je niet per training af te melden en komen er geen kaarten. De afwezigheid blijft wel zichtbaar in het percentage.</p></form>`);
  });
  CC.on('langdurigOpslaan', (f) => {
    const pl = M.speler(S, f.dataset.id); const t = M.team(S, pl.teamId);
    S.lang.push({ id: 'l' + Date.now(), spelerId: pl.id, reden: f.reden.value, van: f.van.value, tot: f.tot.value, opm: f.opm.value, door: CC.me().id, gemeld: new Date().toISOString() });
    const hjo = S.people.filter((p) => p.rollen.some((r) => r.rol === 'hjo')).map((p) => p.id);
    S.msgs.push({ id: 'b' + Date.now(), van: 'systeem', soort: 'melding', bereik: t.id, onderwerp: `${pl.voornaam} langdurig afwezig`, tekst: `${M.naam(S, pl)} is langdurig afwezig (${f.reden.value.toLowerCase()}) tot ongeveer ${D.lang(f.tot.value)}. ${f.opm.value}`, tijd: new Date().toISOString(), ontvangers: [t.trainerId, t.teamleiderId, ...hjo].filter(Boolean), gelezen: [], antw: [], urgent: false, gepland: null });
    // Besluit 24: wie de toelichting niet mag zien, krijgt de melding zonder toelichting
    if (f.opm.value && CC.metToelichting) { const m = S.msgs[S.msgs.length - 1]; const v = CC.metToelichting(m.ontvangers, (id) => (id === t.teamleiderId ? 'teamleider' : id === t.trainerId ? 'trainer' : 'hjo')); if (v.zonder.length) { m.ontvangers = v.met; S.msgs.push({ ...m, id: m.id + 'z', tekst: `${M.naam(S, pl)} is langdurig afwezig (${f.reden.value.toLowerCase()}) tot ongeveer ${D.lang(f.tot.value)}.`, ontvangers: v.zonder, gelezen: [], antw: [] }); } }
    CC.save(); CC.closeSheet(); CC.render(); CC.toast('Gemeld. Beterschap!');
  });

  // ---------- Start ----------
  window.addEventListener('hashchange', () => { if (!sessie) CC.render(); });
  CC.start = () => CC.render();
})();
