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
  if (!S || S.gen !== D.vandaag() || S.v !== 5) { S = CC.generate(); store.set(KEY, S); }
  CC.S = () => S;
  CC.save = () => store.set(KEY, S);
  CC.reset = () => { S = CC.generate(); store.set(KEY, S); };

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
      if (a.soort === 'oefen') return `Oefenwedstrijd${a.tegen ? ' · ' + esc(a.tegen) : ''}`;
      return `${a.thuis ? 'Thuis' : 'Uit'} · ${esc(a.tegen)}`;
    },
    actSub(S, a) {
      if (a.afgelast) return 'Afgelast';
      if (a.soort === 'training') return `${a.tijd}–${a.eind} · ${esc(a.veld)}`;
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
        default: return `<span class="chip blauw">${icon('circle-check')}Komt</span>`;
      }
    },
    kaartjes(k) {
      const n = (s) => k.ev.filter((e) => e.soort === s && !e.waarschuwing).length;
      const g = n('geel'), o = n('oranje');
      if (!g && !o) return '';
      return `${g ? `<span class="kaart geel" title="Gele kaart">${k.geel}</span>` : ''}${o ? `<span class="kaart oranje" title="Oranje kaart">${k.oranje}</span>` : ''}`;
    },
    badge: (n) => (n ? `<span class="badge">${n > 99 ? '99+' : n}</span>` : ''),
    knop: (tekst, act, attrs = '', cls = '') => `<button class="knop ${cls}" data-act="${act}" ${attrs}>${tekst}</button>`,
  };
  const h = CC.h;

  // ---------- Render ----------
  CC.render = () => {
    const app = document.getElementById('app');
    if (!sessie || !CC.me()) { app.innerHTML = CC.loginScherm(); document.title = 'ClubComm'; return; }
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
    const demo = [[S.demo.sanne, 'Ouder', 'moeder van Jesse (O10-1) en Mila (O8-2)'], [S.demo.mark, 'Trainer + ouder', 'trainer O10-1, vader van Daan'], [S.demo.linda, 'Teamleider + ouder', 'teamleider O10-1, moeder van Noah'], [S.demo.peter, `${S.club.labels.hjo} + clubbeheerder`, 'hoofd jeugdopleiding']];
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
        <label class="vink"><input type="checkbox" name="ok" required> Ik geef toestemming dat ClubComm de gegevens van mijn kind gebruikt voor de club. <a href="#" data-act="privacy">Privacyverklaring</a></label>
        <button class="knop" type="submit">Aanmelden</button>
      </form></div>`;
  };
  CC.on('openUitnodiging', (el) => { location.hash = `uitnodiging-${el.dataset.team}`; CC.render(); });
  CC.on('sluitUitnodiging', () => { history.replaceState(null, '', location.pathname); ui.login = { stap: 'mail', email: '' }; CC.render(); });
  CC.on('aanmelden', (f) => {
    S.aanm.push({ id: 'm' + Date.now(), teamId: f.dataset.team, email: f.email.value.trim(), ouderNaam: f.ouder.value.trim(), kindVoor: f.voor.value.trim(), kindAchter: f.achter.value.trim(), tijd: new Date().toISOString(), status: 'open' });
    CC.save(); ui.login.aangemeld = f.voor.value.trim(); CC.render();
  });
  CC.on('privacy', () => CC.sheet('Privacy', `<p>ClubComm bewaart alleen wat nodig is: naam van je kind, team, jouw naam en e-mailadres, afmeldingen en aanwezigheid.</p><p>Alleen jij, de trainer en teamleider van het team en de ${esc(S.club.labels.hjo)} zien de gegevens van jouw kind. Andere ouders nooit.</p><p class="zacht">In versie 2 staat hier de volledige privacyverklaring van de club.</p>`));

  // ---------- Profiel (Besluit 4 en 8) ----------
  CC.on('profiel', () => {
    const me = CC.me(); const rol = CC.rol();
    const kids = CC.kinderen();
    const rollen = me.rollen.map((r, i) => `<button class="rolkeuze ${i === (sessie.rolIdx || 0) ? 'aan' : ''}" data-act="wisselRol" data-idx="${i}">${icon({ ouder: 'heart', trainer: 'clipboard-check', teamleider: 'hand-helping', hjo: 'shield', beheerder: 'building-2' }[r.rol])}<span><b>${esc(CC.rolNaam(r))}</b><small>${r.teamId ? esc(r.teamId) : r.rol === 'ouder' ? kids.map((k) => esc(k.voornaam)).join(', ') : esc(S.club.naam)}</small></span>${i === (sessie.rolIdx || 0) ? icon('check') : ''}</button>`).join('');
    CC.sheet('Profiel', `
      <div class="profiel-kop">${h.avatar(me.naam, 'groot')}<div><b>${esc(me.naam)}</b><small>${esc(me.email)} · ${esc(me.tel)}</small></div></div>
      ${me.rollen.length > 1 ? `<h3 class="klein-kop">Wissel van rol</h3><div class="rollen">${rollen}</div>` : ''}
      ${rol.rol === 'ouder' || kids.length ? `<h3 class="klein-kop">Mijn kinderen</h3>${kids.map((k) => h.rij({ ic: h.avatar(k.voornaam), titel: esc(M.naam(S, k)), sub: esc(k.teamId) })).join('')}
        ${h.rij({ ic: 'user-plus', titel: 'Kind toevoegen', sub: 'Scan de QR-code van het andere team', act: 'demoMelding', attrs: 'data-tekst="Scan de QR-code of open de uitnodiging van het team van je andere kind."' })}
        ${h.rij({ ic: 'users', titel: 'Tweede ouder uitnodigen', sub: 'Ieder een eigen account, jullie zien elkaars e-mail niet', act: 'tweedeOuder' })}` : ''}
      <h3 class="klein-kop">Instellingen</h3>
      ${CC.agendaRij ? CC.agendaRij() : ''}
      ${CC.trainerEigenRij ? CC.trainerEigenRij() : ''}
      ${h.rij({ ic: 'bell', titel: 'Meldingen', sub: 'Push aan · mail als reserve', act: 'meldingen' })}
      ${h.rij({ ic: 'globe', titel: 'Taal', sub: 'Nederlands (Engels komt in versie 2)', act: 'taalEN' })}
      ${h.rij({ ic: 'lock', titel: 'Privacy en toestemming', act: 'privacy' })}
      ${h.rij({ ic: 'smartphone', titel: 'App op je beginscherm zetten', act: 'beginscherm' })}
      ${kids.length ? `<h3 class="klein-kop">Uitschrijven</h3>${h.rij({ ic: 'user-cog', titel: 'Kind uitschrijven', sub: 'Stopt je kind of gaat het naar een andere club?', act: 'uitschrijfSheet' })}` : ''}
      <h3 class="klein-kop">Uitloggen</h3>
      ${h.rij({ ic: 'log-out', titel: 'Uitloggen', act: 'logout', chevron: false })}
      ${h.rij({ ic: 'log-out', titel: 'Uitloggen op alle apparaten', sub: 'Telefoon kwijt? Hiermee sluit je overal af.', act: 'logoutAlles', chevron: false })}
      <div class="demo-blok"><h3 class="klein-kop">Demo</h3>
        ${h.rij({ ic: 'trash-2', titel: 'Mijn account verwijderen', sub: 'Al je gegevens worden gewist', act: 'verwijderSheet', kleur: 'rood' })}
        ${h.rij({ ic: 'users', titel: 'Ander demo-account kiezen', act: 'logout', chevron: false })}
        ${h.rij({ ic: 'refresh-cw', titel: 'Demo opnieuw beginnen', sub: 'Zet alle demodata terug', act: 'resetDemo', chevron: false })}
        <p class="zacht klein"><a href="oud/index.html">Oude Replit-pagina's bekijken</a></p>
      </div>`);
  });
  CC.on('wisselRol', (el) => CC.wisselRol(Number(el.dataset.idx)));

  // ---------- Uitschrijven en account verwijderen (Besluit 14) ----------
  const hjoIds = () => S.people.filter((p) => p.rollen.some((r) => r.rol === 'hjo')).map((p) => p.id);
  const meldStaf = (teamId, onderwerp, tekst) => {
    const t = M.team(S, teamId); const ontv = [...new Set([t.trainerId, t.teamleiderId, ...hjoIds()].filter(Boolean))];
    S.msgs.push({ id: 'b' + Date.now() + Math.random(), van: 'systeem', soort: 'melding', bereik: teamId, onderwerp, tekst, tijd: new Date().toISOString(), ontvangers: ontv, gelezen: [], antw: [], urgent: false, gepland: null });
  };
  // Kind uit het team halen. De aanwezigheid blijft alleen als anonieme telling in de teamcijfers bewaard.
  const schrijfUit = (pl, reden) => {
    const team = pl.teamId;
    meldStaf(team, `${pl.voornaam} is uitgeschreven`, `${pl.voornaam} ${pl.achternaam} is uitgeschreven uit ${team}. Reden: ${reden}. Je hoeft niets te doen; ${pl.voornaam} staat niet meer in de teamlijst.`);
    S.afm = S.afm.filter((f) => !(f.spelerId === pl.id && (M.act(S, f.actId) || {}).datum >= D.vandaag()));
    Object.values(S.vervoer).forEach((v) => { delete v.plek[pl.id]; });
    pl.teamId = null; pl.uitgeschreven = { datum: D.vandaag(), reden }; pl.voornaam = 'Oud-lid'; pl.achternaam = ''; pl.ouders = [];
  };
  CC.on('uitschrijfSheet', () => {
    const kids = CC.kinderen();
    CC.sheet('Kind uitschrijven', `<form data-submit="uitschrijvenOk" class="codeform">
      <label for="us-k">Welk kind?</label><select id="us-k" name="k">${kids.map((k) => `<option value="${k.id}">${esc(M.naam(S, k))} (${esc(k.teamId)})</option>`).join('')}</select>
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
      ${staf.length ? `<div class="info oranje">${icon('user-cog')}<span>Je bent ook ${staf.map((r) => `${r.rol} van ${esc(r.teamId)}`).join(' en ')}. De ${esc(S.club.labels.hjo)} krijgt een melding om een vervanger te zoeken.</span></div>` : ''}
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
  CC.on('meldingen', () => CC.sheet('Meldingen', `
    ${[['Afmeldingen en wijzigingen in de planning', true], ['Persoonlijke berichten', true], ['Nieuws van team en club', true], ['Oproepen voor taken', true], ['Herinnering om af te melden', false]].map(([t, aan]) => `<label class="schakel"><span>${t}</span><input type="checkbox" ${aan ? 'checked' : ''}><i></i></label>`).join('')}
    <p class="zacht klein">Staat de app niet op je beginscherm of zijn pushmeldingen uit? Dan krijg je dezelfde berichten per mail.</p>`));
  CC.on('beginscherm', () => CC.sheet('App op je beginscherm', `<ol class="stappen"><li><b>iPhone:</b> open ClubComm in Safari, tik op ${icon('share-2')} Delen en kies <b>Zet op beginscherm</b>.</li><li><b>Android:</b> open ClubComm in Chrome, tik op de drie puntjes en kies <b>App installeren</b>.</li></ol><p class="zacht">Daarna opent ClubComm als een gewone app, met meldingen en een rood bolletje op het icoon.</p>`));
  CC.on('tweedeOuder', () => { const k = CC.kind(); CC.sheet('Tweede ouder uitnodigen', `<form data-submit="tweedeOuderStuur" class="codeform"><label for="to">E-mailadres van de andere ouder</label><input id="to" name="email" type="email" required autofocus><p class="zacht klein">Die ouder krijgt een uitnodiging voor ${esc(k ? k.voornaam : 'je kind')}. De teamleider hoeft niet goed te keuren, want jij bent al gekoppeld.</p><button class="knop">Uitnodiging sturen</button></form>`); });
  CC.on('tweedeOuderStuur', () => { CC.closeSheet(); CC.toast('Uitnodiging verstuurd'); });

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
      const pers = mijn.filter((m) => m.soort === 'persoonlijk'), nws = mijn.filter((m) => m.soort !== 'persoonlijk');
      const n = (ms) => ms.filter((m) => !m.gelezen.includes(me.id)).length;
      return `${vastBlok}${h.seg('berichten', [['persoonlijk', 'Persoonlijk', n(pers)], ['nieuws', 'Nieuws', n(nws)]], 'persoonlijk')}${lijst(zonderVast(tab === 'persoonlijk' ? pers : nws))}`;
    }
    const tab = h.segVal('berichtenStaf', 'inbox');
    const verstuurd = S.msgs.filter((m) => m.van === me.id).sort((a, b) => b.tijd.localeCompare(a.tijd));
    return `${nieuw}${h.seg('berichtenStaf', [['inbox', 'Inbox', M.ongelezen(S, me.id)], ['verstuurd', 'Verstuurd']], 'inbox')}
      ${tab === 'inbox' ? vastBlok + lijst(zonderVast(mijn)) : verstuurd.length ? `<div class="lijst">${verstuurd.map((m) => bericht(m, me, true)).join('')}</div>` : h.leeg('Nog niets verstuurd', 'send')}`;
  };
  const bericht = (m, me, eigen) => {
    const ongelezen = !eigen && !m.gelezen.includes(me.id);
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
  CC.on('reageer', (f) => { const m = S.msgs.find((x) => x.id === f.dataset.id); m.antw.push({ van: CC.me().id, tekst: f.t.value, tijd: new Date().toISOString() }); CC.save(); CC.render(); CC.toast('Verstuurd'); });

  // Nieuw bericht (trainer, teamleider, HJO) — Besluit 7 en 11
  CC.on('nieuwBericht', () => {
    const rol = CC.rol().rol;
    const soorten = rol === 'hjo'
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
    if (soort === 'herinnering') { const a = M.komend(S, tid, 1)[0]; onderwerp = 'Herinnering'; tekst = a ? `Vergeet niet: ${a.soort === 'training' ? 'training' : 'wedstrijd'} ${D.lang(a.datum)} om ${a.tijd}. Kan je kind niet? Meld af in ClubComm.` : ''; }
    CC.sheet('Nieuw bericht', `<form data-submit="verstuurBericht" data-soort="${soort}" class="codeform">
      ${extra}
      <label for="m-ond">Onderwerp</label><input id="m-ond" name="ond" required value="${esc(onderwerp)}">
      <label for="m-tekst">Bericht</label><textarea id="m-tekst" name="tekst" rows="5" required>${esc(tekst)}</textarea>
      ${soort !== 'persoon' ? `<label for="m-vast">Vastzetten bovenaan</label><select id="m-vast" name="vast"><option value="0">Nee</option><option value="7">1 week</option><option value="14">2 weken</option></select>
      <label class="vink"><input type="checkbox" name="urgent"> Urgent: alleen voor iets van vandaag of morgen (bovenaan, pushmelding met geluid)</label>` : ''}
      <button class="knop">${soort === 'gepland' ? 'Inplannen' : 'Versturen'}</button>
      ${t ? `<p class="zacht klein">Wordt verstuurd aan ${soort === 'persoon' ? 'één ouder' : `alle ouders van ${esc(t.naam)}`}. Push, met mail als reserve.</p>` : ''}</form>`);
  };
  CC.on('verstuurBericht', (f) => {
    const soort = f.dataset.soort; const me = CC.me(); const tid = CC.teamId();
    let ontvangers = [], bereik = '', ms = 'nieuws';
    if (soort === 'persoon') { ontvangers = [f.aan.value]; bereik = M.persoon(S, f.aan.value).naam; ms = 'persoonlijk'; }
    else if (soort === 'teams') { const ts = [...f.querySelectorAll('[name=teams]:checked')].map((x) => x.value); if (!ts.length) return CC.toast('Kies minstens één team', 'fout'); ontvangers = [...new Set(ts.flatMap((x) => M.oudersVan(S, x)))]; bereik = ts.join(', '); }
    else if (soort === 'club' || soort === 'gepland') { ontvangers = S.people.map((p) => p.id).filter((x) => x !== me.id); bereik = 'Hele club'; }
    else { ontvangers = M.oudersVan(S, tid); const tl = M.team(S, tid); [tl.teamleiderId, tl.trainerId].forEach((x) => { if (x && x !== me.id) ontvangers.push(x); }); bereik = tid; }
    const nieuwM = { id: 'b' + Date.now(), van: me.id, soort: ms, bereik, onderwerp: f.ond.value, tekst: f.tekst.value, tijd: new Date().toISOString(), gepland: soort === 'gepland' ? new Date(f.op.value).toISOString() : null, ontvangers: [...new Set(ontvangers)], gelezen: [], antw: [], urgent: !!(f.urgent && f.urgent.checked), vastTot: null };
    S.msgs.push(nieuwM); if (f.vast && Number(f.vast.value)) CC.zetVast(nieuwM, Number(f.vast.value));
    CC.save(); CC.closeSheet(); ui.seg.berichtenStaf = 'verstuurd'; CC.render(); CC.toast(soort === 'gepland' ? 'Bericht ingepland' : `Verstuurd aan ${ontvangers.length} ${ontvangers.length === 1 ? 'persoon' : 'personen'}`);
  });

  // Trainingswijziging / planning aanpassen (Besluit 7): past de planning aan + melding HJO en teamleider
  CC.wijzigingSheet = (actId) => {
    const tid = CC.teamId();
    const komend = M.komend(S, tid, 12).filter((a) => !a.afgelast);
    CC.sheet('Planning aanpassen', `<form data-submit="wijzigPlanning" class="codeform">
      <label for="w-wat">Wat wil je doen?</label>
      <select id="w-wat" name="wat" data-change="wijzigWat"><option value="verplaats">Training verplaatsen of veld wijzigen</option><option value="afgelast">Training afgelasten</option><option value="extra">Extra training toevoegen</option><option value="oefen">Oefenwedstrijd toevoegen</option></select>
      <div id="w-bestaand"><label for="w-act">Welke training?</label><select id="w-act" name="act">${komend.filter((a) => a.soort === 'training').map((a) => `<option value="${a.id}" ${a.id === actId ? 'selected' : ''}>${D.kort(a.datum)} · ${a.tijd} · ${esc(a.veld)}</option>`).join('')}</select></div>
      <div id="w-nieuw"><label for="w-dat">Datum</label><input id="w-dat" name="datum" type="date" value="${D.addDays(D.vandaag(), 1)}">
      <div class="twee"><div><label for="w-tijd">Tijd</label><input id="w-tijd" name="tijd" type="time" value="17:30"></div><div><label for="w-veld">Veld</label><input id="w-veld" name="veld" value="Veld 2"></div></div>
      <div id="w-tegen" hidden><label for="w-t">Tegenstander</label><input id="w-t" name="tegen" placeholder="Bijv. FC Amstelland O10-3"></div></div>
      <button class="knop">Opslaan en ouders informeren</button>
      <p class="zacht klein">Ouders krijgen direct een pushmelding. De teamleider en de ${esc(S.club.labels.hjo)} krijgen een niet-urgente melding.</p></form>`);
  };
  CC.on('wijzigWat', (el) => {
    const f = el.form; const v = el.value;
    f.querySelector('#w-bestaand').hidden = !(v === 'verplaats' || v === 'afgelast');
    f.querySelector('#w-nieuw').hidden = v === 'afgelast';
    f.querySelector('#w-tegen').hidden = v !== 'oefen';
  });
  CC.on('wijzigPlanning', (f) => {
    const tid = CC.teamId(); const t = M.team(S, tid); const me = CC.me(); const wat = f.wat.value;
    let tekst = '';
    if (wat === 'afgelast' || wat === 'verplaats') {
      const a = M.act(S, f.act.value); if (!a) return CC.toast('Kies een training', 'fout');
      if (wat === 'afgelast') { a.afgelast = true; tekst = `Training van ${D.lang(a.datum)} gaat niet door.`; }
      else { const oud = `${D.kort(a.datum)} ${a.tijd}`; a.datum = f.datum.value; a.tijd = f.tijd.value; a.veld = f.veld.value; a.eind = CC.plusMin(a.tijd, 75); tekst = `Training van ${oud} is verplaatst naar ${D.lang(a.datum)} ${a.tijd} op ${a.veld}.`; }
    } else {
      const a = { id: 'a' + Date.now(), teamId: tid, soort: wat === 'oefen' ? 'oefen' : 'training', datum: f.datum.value, tijd: f.tijd.value, eind: CC.plusMin(f.tijd.value, wat === 'oefen' ? 60 : 75), veld: f.veld.value, tegen: f.tegen.value, thuis: true, verzamel: f.tijd.value, adres: 'Sportpark Buitenveldert', afgelast: false };
      S.acts.push(a); S.acts.sort((x, y) => (x.datum + x.tijd).localeCompare(y.datum + y.tijd));
      tekst = `${wat === 'oefen' ? 'Oefenwedstrijd' : 'Extra training'} op ${D.lang(a.datum)} om ${a.tijd} (${a.veld}).`;
    }
    const now = new Date().toISOString();
    S.msgs.push({ id: 'b' + Date.now(), van: me.id, soort: 'nieuws', bereik: tid, onderwerp: 'Wijziging in de planning', tekst, tijd: now, ontvangers: M.oudersVan(S, tid), gelezen: [], antw: [], urgent: true, gepland: null });
    const hjo = S.people.filter((p) => p.rollen.some((r) => r.rol === 'hjo')).map((p) => p.id);
    const info = [...hjo, t.teamleiderId, t.trainerId].filter((x) => x && x !== me.id);
    S.msgs.push({ id: 'b' + Date.now() + 1, van: 'systeem', soort: 'melding', bereik: 'Ter informatie', onderwerp: `Planning ${tid} gewijzigd`, tekst: `${me.naam}: ${tekst} Je hoeft niets te doen.`, tijd: now, ontvangers: info, gelezen: [], antw: [], urgent: false, gepland: null });
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
  CC.on('deelUitnodiging', (el) => CC.deel(`Hoi ouders van ${el.dataset.team}! Meld je kind aan in ClubComm (afmelden, planning en berichten): ${CC.uitnodigLink(el.dataset.team)}`, `Uitnodiging ${el.dataset.team}`));
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
    const v = S.vervoer[a.id]; if (v) delete v.plek[pl.id];
    CC.save(); CC.closeSheet(); CC.render(); CC.toast(`${pl.voornaam} is afgemeld`);
  });
  CC.on('intrekken', (el) => {
    const i = S.afm.findIndex((f) => f.spelerId === el.dataset.speler && f.actId === el.dataset.act2);
    if (i >= 0) S.afm.splice(i, 1); CC.save(); CC.render(); CC.toast('Afmelding ingetrokken: fijn dat je kind toch komt!');
  });
  CC.on('uitlegKaarten', () => { const i = S.club.inst; CC.sheet('Wat betekenen de kaarten?', `
    <p>Een kaart is <b>een registratie van een feit, geen straf</b>. Zo weten trainer en teamleider wat er speelt.</p>
    <div class="uitleg"><span class="kaart oranje">1</span><span><b>Oranje: te laat gekomen</b><small>De trainer zet je kind op "te laat".</small></span></div>
    <div class="uitleg"><span class="kaart geel">1</span><span><b>Geel: te laat afgemeld</b><small>Afgemeld na de afmeldtermijn (training ${i.deadlineTraining} uur, wedstrijd ${i.deadlineWedstrijd} uur van tevoren).</small></span></div>
    <div class="uitleg"><span class="kaart geel">2</span><span><b>Geel (2 punten): niet afgemeld én niet gekomen</b><small>Dit is voor het team het lastigst.</small></span></div>
    <h3 class="klein-kop">Zo gaat het stap voor stap (per fase)</h3>
    <ol class="stappen">
      <li><b>Herinneren:</b> de eerste keer krijg je een vriendelijke herinnering, zonder kaart.</li>
      <li><b>Waarschuwen:</b> daarna volgt een kaart, met uitleg.</li>
      <li><b>Bellen of appen:</b> bij ${i.geel} punten geel of ${i.oranje}× oranje neemt de trainer of de ${esc(S.club.labels.hjo)} contact met je op: <i>"Kunnen we je ergens mee helpen?"</i></li>
      <li><b>Persoonlijk gesprek</b> met de ${esc(S.club.labels.hjo)} als het daarna opnieuw gebeurt.</li>
      <li>Gebeurt het na dat gesprek nog eens, dan volgt een tweede gele kaart en kan de club besluiten afscheid te nemen. Dat beslissen altijd mensen, nooit de app.</li>
    </ol>
    <p class="zacht klein">Het seizoen heeft 4 fases (volgens de competitie). Bij een nieuwe fase begint de teller opnieuw; de geschiedenis blijft zichtbaar.</p>`); });

  // ---------- Speler-detail (trainer, teamleider, HJO) ----------
  CC.views.speler = (S, p) => {
    const pl = M.speler(S, p.id); const t = M.team(S, pl.teamId);
    const per = M.periode(S, h.segVal('spPer', 'blok'));
    const st = M.stats(S, pl, per); const k = M.kaarten(S, pl); const z = M.zone(S, st.pct, t.id);
    const lang = S.lang.find((l) => l.spelerId === pl.id && l.tot >= D.vandaag());
    const rol = CC.rol().rol;
    const ouders = pl.ouders.map((o) => M.persoon(S, o));
    const b = S.beoord[pl.id];
    const gespr = S.gesprekken.filter((g) => g.spelerId === pl.id);
    return {
      titel: M.naam(S, pl),
      html: `${h.seg('spPer', [['blok', 'Deze fase'], ['seizoen', 'Heel seizoen']], 'blok')}
      <div class="cijfers"><div class="cijfer ${z}"><b>${st.pct == null ? '–' : st.pct + '%'}</b><small>aanwezig</small></div><div class="cijfer"><b>${st.telaat}×</b><small>te laat</small></div><div class="cijfer"><b>${k.geel}/${k.oranje}</b><small>geel / oranje</small></div></div>
      ${lang ? `<div class="info">${icon('hospital')}<span><b>Langdurig afwezig</b> (${esc(lang.reden.toLowerCase())}) tot ongeveer ${D.kort(lang.tot)}. ${esc(lang.opm || '')}</span></div>` : ''}
      ${Object.keys(st.redenen).length ? `${h.sectie('Redenen van afwezigheid')}<div class="balkjes">${Object.entries(st.redenen).sort((a, b) => b[1] - a[1]).map(([r, n]) => `<div class="balkje"><span>${esc(r)}</span><i style="--w:${(100 * n) / st.afwezig}%"></i><b>${n}</b></div>`).join('')}</div>` : ''}
      ${h.sectie('Geschiedenis')}<div class="lijst compact">${st.lijst.slice().reverse().map(({ act, st: s }) => h.rij({ ic: h.datumBlok(act), titel: h.actTitel(S, act), sub: s.afm && s.afm.opm ? esc(s.afm.opm) : '', rechts: h.chip(s) + (s.laat ? '<span class="chip geel mini">te laat afgemeld</span>' : '') })).join('') || h.leeg('Nog geen activiteiten')}</div>
      ${k.ev.length ? `${h.sectie('Kaarten en waarschuwingen deze fase')}<div class="lijst compact">${k.ev.map((e) => h.rij({ ic: e.waarschuwing ? 'mail' : `<span class="kaart ${e.soort}">${e.punten}</span>`, titel: e.waarschuwing ? `Vriendelijke herinnering · ${e.wat.toLowerCase()}` : e.wat, sub: D.kort(e.act.datum) })).join('')}</div>` : ''}
      ${rol !== 'ouder' ? `${h.sectie('Ouders')}<div class="lijst">${ouders.map((o) => h.rij({ ic: h.avatar(o.naam), titel: esc(o.naam), sub: esc(o.email), rechts: `<a class="icoonknop groen" href="https://wa.me/31${o.tel.slice(1)}" target="_blank" rel="noopener" aria-label="WhatsApp ${esc(o.naam)}">${icon('message-circle')}</a>` })).join('')}</div>` : ''}
      ${rol !== 'ouder' && b ? `${h.sectie(`Beoordeling · ${esc(b.fase)}`)}<div class="scores">${Object.entries(b.scores).map(([v, s]) => `<span>${esc(v)} ${CC.scoreTekst(t, s)}</span>`).join('')}</div>` : ''}
      ${rol !== 'ouder' ? `${h.sectie('Gesprekken')}${gespr.map((g) => h.rij({ ic: g.soort === 'gesprek' ? 'users' : g.soort === 'geappt' ? 'message-circle' : 'phone', titel: `${D.kort(g.datum)} · ${g.soort === 'gesprek' ? 'Persoonlijk gesprek' : g.soort === 'geappt' ? 'Geappt' : 'Gebeld'} · ${esc((M.persoon(S, g.door) || { naam: '' }).naam)}`, sub: esc(g.notitie) + (g.afspraak ? `<br><b>Afspraak:</b> ${esc(g.afspraak)}` : '') })).join('') || '<p class="zacht klein">Nog geen gesprekken vastgelegd.</p>'}
        <div class="knoppen"><button class="knop licht" data-act="gesprekVastleggen" data-id="${pl.id}">${icon('phone')}Contact vastleggen</button><button class="knop licht" data-act="langdurigSheet" data-id="${pl.id}">${icon('hospital')}Langdurig afwezig</button></div>` : ''}`,
    };
  };
  CC.scoreTekst = (t, s) => { const c = CC.categorie(t.cat); if (c.schaal === 'smiley' || c.schaal === 'mini') return ['', '<span class="smiley">😐</span>', '<span class="smiley">🙂</span>', '<span class="smiley">😃</span>'][s] || '–'; return `<b>${s}</b>/5`; };
  CC.on('gesprekVastleggen', (el) => {
    const pl = M.speler(S, el.dataset.id); const stap = M.stap(S, pl); const hjo = CC.rol().rol === 'hjo';
    const std = stap && stap.soort === 'gesprekHjo' ? 'gesprek' : 'gebeld';
    CC.sheet('Contact vastleggen', `<form data-submit="gesprekOpslaan" data-id="${pl.id}" class="codeform">
      <label for="g-s">Soort contact</label><select id="g-s" name="s"><option value="gebeld" ${std === 'gebeld' ? 'selected' : ''}>Gebeld</option><option value="geappt">Geappt</option><option value="gesprek" ${std === 'gesprek' ? 'selected' : ''}>Persoonlijk gesprek${hjo ? '' : ` (${esc(S.club.labels.hjo)})`}</option></select>
      <label for="g-d">Datum</label><input id="g-d" name="d" type="date" value="${D.vandaag()}">
      <label for="g-n">Wat speelt er?</label><textarea id="g-n" name="n" rows="3" required placeholder="Bijv. zwemles op vrijdag; oma ziek."></textarea>
      <label for="g-a">Afspraak (mag leeg)</label><input id="g-a" name="a" placeholder="Bijv. altijd via de app afmelden, ook als het laat wordt">
      <button class="knop">Opslaan</button><p class="zacht klein">Alleen trainer, teamleider en ${esc(S.club.labels.hjo)} zien dit. Gebeurt het daarna opnieuw, dan stelt de app de volgende stap voor.</p></form>`);
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
    CC.save(); CC.closeSheet(); CC.render(); CC.toast('Gemeld. Beterschap!');
  });

  // ---------- Start ----------
  window.addEventListener('hashchange', () => { if (!sessie) CC.render(); });
  CC.start = () => CC.render();
})();
