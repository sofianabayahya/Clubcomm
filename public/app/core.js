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
  CC.rolNaam = (r) => ({ ouder: 'Ouder', trainer: 'Trainer', teamleider: 'Teamleider', hjo: S.club.labels.hjo, beheerder: 'Clubmanager', coordinator: S.club.labels.coordinator }[r.rol]);
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
  // Naar een andere pagina vanuit een venster (sheet): eerst het venster sluiten, anders ligt het over de nieuwe pagina heen
  const sluitVenster = () => { const sh = document.getElementById('sheet'); if (sh && !sh.hidden) CC.closeSheet(); };
  CC.go = (tab) => { sluitVenster(); ui.tab = tab; ui.view = null; ui.stack = []; CC.render(); window.scrollTo(0, 0); };
  // Een gesprek opent onderaan, bij het nieuwste bericht en het reactievak (zoals WhatsApp)
  CC.open = (view, params = {}) => { sluitVenster(); ui.stack.push(ui.view); ui.view = { naam: view, ...params }; CC.render(); window.scrollTo(0, view === 'bericht' && document.querySelector('.reageer') ? document.body.scrollHeight : 0); };
  CC.terug = () => { ui.view = ui.stack.pop() || null; CC.render(); };
  CC.on('tab', (el) => CC.go(el.dataset.tab));
  CC.on('open', (el) => CC.open(el.dataset.view, { ...el.dataset }));
  CC.on('terug', () => CC.terug());
  CC.on('seg', (el) => { ui.seg[el.dataset.key] = el.dataset.val; CC.render(); });

  CC.rollen = {}; CC.views = {};

  // ---------- Gedeelde bouwstenen ----------
  CC.vpunt = (a) => String(a.verzamelpunt || '').trim().replace(/^bij\s+/i, '');
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
    // Besluit 81: lange lijsten tonen eerst wat nu speelt (de eerste n), de rest ingeklapt onder "Toon alles"
    eerst: (rijen, n = 3, klas = 'lijst compact') => `<div class="${klas}">${rijen.slice(0, n).join('')}</div>${rijen.length > n ? `<details class="uitklap"><summary>Toon alles (${rijen.length})</summary><div class="${klas}">${rijen.slice(n).join('')}</div></details>` : ''}`,
    // Besluit 81: per maand ingeklapt (nieuwste eerst); items = [{ tijd, html }]
    perMaand: (items, klas = 'lijst compact') => { const g = []; items.forEach((x) => { const d = new Date(x.tijd); const k = `${d.getFullYear()}-${d.getMonth()}`; let m = g.find((y) => y.k === k);
      if (!m) { m = { k, naam: d.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' }), r: [] }; g.push(m); } m.r.push(x.html); });
      return g.map((m) => `<details class="uitklap blok maandblok"><summary>${esc(m.naam.charAt(0).toUpperCase() + m.naam.slice(1))} <span class="zacht">(${m.r.length})</span></summary><div class="${klas}">${m.r.join('')}</div></details>`).join(''); },
    // Besluit 86: de fase met datums in plaats van "deze fase", bijv. "Fase 1 · 19 aug – 30 okt"
    faseLabel: (S) => { const b = CC.m.blok(S, CC.date.vandaag()); const k = (x) => { const d = CC.date.parse(x); return `${d.getDate()} ${CC.date.MAAND[d.getMonth()]}`; }; return `${b.naam} · ${k(b.van)} – ${k(b.tot)}`; },
    sectie: (titel, rechts = '') => `<div class="sectie-kop"><h3>${titel}</h3>${rechts}</div>`,
    actTitel(S, a) {
      if (a.soort === 'training') return 'Training';
      if (a.soort === 'activiteit') return esc(a.naam || 'Activiteit');
      if (a.soort === 'oefen') return `Oefenwedstrijd${a.tegen ? ` · ${a.thuis === false ? 'uit bij ' : ''}${esc(a.tegen)}` : a.thuis === false ? ' · uit' : ''}`;
      return `${a.thuis ? 'Thuis' : 'Uit'} · ${esc(a.tegen)}`;
    },
    actSub(S, a) {
      if (a.afgelast) return 'Afgelast';
      if (a.soort === 'training') return `${a.tijd}–${a.eind} · ${esc(a.veld)}`;
      if (a.soort === 'activiteit') return `${h.verzamelTekst(a) ? `${h.verzamelTekst(a)} · ` : ''}${a.tijd}–${a.eind}${a.plaats ? ' · ' + esc(a.plaats) : ''}`;
      return `${h.verzamelTekst(a) || `Verzamelen ${a.verzamel}`} · aftrap ${a.tijd}${a.thuis ? ' · ' + esc(a.veld || '') : ''}`;
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
    // Besluit 90: adres met speldje, tikken = route (op het kaartje van een activiteit of uitwedstrijd)
    adresRegel: (adres) => (adres ? `<a class="act-adres" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(adres)}" target="_blank" rel="noopener">${icon('map-pin')}<span>${esc(adres)}</span><small>Route</small></a>` : ''),
    // "Verzamelen 09:45 bij de trap naast paviljoen Zuid" (typt iemand zelf "bij …", dan niet dubbel)
    verzamelTekst: (a) => { const vp = CC.vpunt(a); return a.verzamel ? `Verzamelen ${a.verzamel}${vp ? ` bij ${esc(vp)}` : ''}` : vp ? `Verzamelen bij ${esc(vp)}` : ''; },
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
    let kop, kopSub = null, inhoud, terug = false;
    try {
      if (ui.view && CC.views[ui.view.naam]) { const v = CC.views[ui.view.naam](S, ui.view); kop = v.titel; kopSub = v.sub == null ? null : v.sub; inhoud = v.html; terug = true; }
      else inhoud = R.schermen[ui.tab](S);
    } catch (err) { console.error(err); if (CC.meldFout) CC.meldFout(err, 'scherm'); inhoud = h.leeg(`Er ging iets mis op dit scherm: ${esc(err.message)}`, 'circle-alert'); }
    const ctx = R.context(S);
    const me = CC.me();
    app.innerHTML = `
      <header class="kop">
        ${terug ? `<button class="icoonknop" data-act="terug" aria-label="Terug">${icon('chevron-left')}</button>` : `<img class="kop-logo" src="assets/clubcomm-icon.png" alt="">`}
        <div class="kop-tekst" ${!terug && ctx.act ? `data-act="${ctx.act}" role="button" tabindex="0"` : ''}>
          <b>${terug ? esc(kop) : esc(ctx.titel)}${!terug && ctx.act ? icon('chevron-down', 'klein') : ''}</b>
          <small>${terug ? esc(kopSub != null ? kopSub : ctx.titel) : esc(ctx.sub)}</small>
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
    const demo = [[S.demo.sanne, 'Ouder', 'moeder van Jesse (O10-1) en Mila (O8-2)'], [S.demo.mark, 'Trainer + ouder', 'trainer O10-1, vader van Daan'], [S.demo.linda, 'Teamleider + ouder', 'teamleider O10-1, moeder van Noah'], [S.demo.peter, `${S.club.labels.hjo} + clubmanager`, 'hoofd jeugdopleiding'], ...(S.demo.esther ? [[S.demo.esther, S.club.labels.coordinator, 'coördinator O10–O12']] : [])];
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
    <h3>Welke gegevens?</h3><ul><li><b>Van jou:</b> naam, e-mailadres en (als je dat invult) telefoonnummer.</li><li><b>Van je kind:</b> voor- en achternaam en team.</li><li><b>Wat er in de app gebeurt:</b> afmeldingen met reden, aanwezigheid, herinneringen en kaarten over afmelden, taken, vervoer en berichten.</li><li><b>Ontwikkelgesprekken:</b> jij en je kind zien jullie eigen voorbereiding en wat in het gesprek samen is afgesproken (wapen, werkpunt, doelen). De eigen kijk en notities van de trainer zijn alleen voor de trainer en de club.</li></ul>
    <h3>Waarvoor?</h3><p>Alleen om trainingen, wedstrijden en activiteiten te regelen en de spelers goed te begeleiden. Nooit voor reclame, en we verkopen niets.</p>
    <h3>Wie ziet wat?</h3><ul><li>Jij ziet alleen je eigen kind.</li><li>De trainer en teamleider zien hun eigen team, volgens de taken die de club hun geeft. De jeugdcoördinator en het hoofd jeugdopleiding alleen als het bij hun taak hoort.</li><li>Andere ouders van het team zien alleen de voornaam van je kind (bijvoorbeeld bij vervoer of taken). Nooit afmeldredenen, kaarten of jouw contactgegevens.</li></ul>
    <h3>Waar staan de gegevens?</h3><p>In de Europese Unie: de database en het inloggen bij Supabase (Frankfurt, Duitsland), de e-mails via Brevo (Frankrijk). Vercel levert alleen de app zelf, zonder persoonsgegevens. De verbinding is altijd versleuteld.</p>
    <h3>Hoe lang?</h3><p>Zolang je kind bij de club in ClubComm staat. Details over aanwezigheid, kaarten en contactmomenten worden verwijderd na de teamindeling van het volgende seizoen. De ontwikkelgesprekken (voorbereiding, wapen, doelen en afspraken) blijven bewaard zolang je kind lid is, ook in een volgend seizoen of een ander team, zodat je kind kan zien hoe het groeit. Schrijf je je kind uit of verwijder je je account, dan worden de gegevens gewist; in de wekelijkse back-up staan ze nog hooguit 8 weken.</p>
    <h3>Cookies</h3><p>Geen reclame- of volgcookies. ClubComm onthoudt alleen op je telefoon dat je bent ingelogd.</p>
    <h3>Jouw rechten</h3><p>Je mag je gegevens inzien, laten aanpassen of laten verwijderen, en bezwaar maken. Neem daarvoor contact op met ${contact}. Ben je het er niet mee eens hoe de club met je gegevens omgaat, dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens.</p></div>`; };
  CC.on('privacy', () => CC.sheet('Privacyverklaring', CC.privacyHtml(CC.me() ? S.club : CC.privacyClub || S.club), { groot: true }));

  // ---------- Feedback (Besluit 37): komt als persoonlijk bericht (en e-mail) bij de clubmanager ----------
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
    S.msgs.push({ id: 'b' + Date.now(), van: me.id, vanRol: (CC.rol() || {}).rol, soort: 'persoonlijk', bereik: 'Feedback', onderwerp: `Feedback: ${f.s.value.toLowerCase()}`, tekst: f.t.value + context, tijd: new Date().toISOString(), ontvangers: ontv, gelezen: [me.id], antw: [], urgent: false, gepland: null, mail: true });
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
        ${S.teams.length > 1 ? h.rij({ ic: 'user-plus', titel: 'Nog een kind aanmelden', sub: 'Speelt je andere kind in een ander team?', act: 'demoMelding', attrs: 'data-tekst="Vraag de teamleider van het andere team om de uitnodiging (link of QR-code) en meld je daar aan met hetzelfde e-mailadres. Dan staan beide kinderen onder jouw account."' }) : ''}
        ${h.rij({ ic: 'users', titel: 'Tweede ouder uitnodigen', sub: 'Ieder een eigen account, jullie zien elkaars e-mail niet', act: 'tweedeOuder' })}` : ''}
      <h3 class="klein-kop">Instellingen</h3>
      ${CC.agendaRij ? CC.agendaRij() : ''}
      ${h.rij({ ic: 'bell', titel: 'Meldingen', sub: CC.meldingenSub ? CC.meldingenSub() : 'In de app, en per e-mail bij belangrijke berichten', act: 'meldingen' })}
      ${CC.live ? '' : h.rij({ ic: 'globe', titel: 'Taal', sub: 'Nederlands (Engels komt in versie 2)', act: 'taalEN' })}
      ${h.rij({ ic: 'lock', titel: 'Privacyverklaring', act: 'privacy' })}
      ${h.rij({ ic: 'message-circle', titel: 'Feedback of een probleem melden', sub: 'Er klopt iets niet, of je hebt een idee', act: 'feedback' })}
      ${h.rij({ ic: 'smartphone', titel: 'App op je beginscherm zetten', act: 'beginscherm' })}
      <h3 class="klein-kop">Uitschrijven</h3>
      ${kids.length ? h.rij({ ic: 'user-cog', titel: 'Kind uitschrijven', sub: 'Stopt je kind of gaat het naar een andere club?', act: 'uitschrijfSheet' }) : ''}
      ${CC.live ? h.rij({ ic: 'trash-2', titel: 'Account laten verwijderen', sub: 'De clubmanager wist je gegevens', act: 'verwijderVerzoek' }) : h.rij({ ic: 'trash-2', titel: 'Mijn account verwijderen', sub: 'Al je gegevens worden gewist', act: 'verwijderSheet' })}
      <h3 class="klein-kop">Uitloggen</h3>
      ${h.rij({ ic: 'log-out', titel: 'Uitloggen', sub: CC.live ? 'Je wordt op al je apparaten uitgelogd' : '', act: 'logout', chevron: false })}
      ${CC.live ? '' : `<div class="demo-blok"><h3 class="klein-kop">Demo</h3>
        ${h.rij({ ic: 'users', titel: 'Ander demo-account kiezen', act: 'logout', chevron: false })}
        ${h.rij({ ic: 'refresh-cw', titel: 'Demo opnieuw beginnen', sub: 'Zet alle demodata terug', act: 'resetDemo', chevron: false })}
      </div>`}`);
  });
  // Echte versie: verzoek aan de clubmanager om het account te verwijderen (Besluit 54). Later automatisch vanaf de server.
  CC.on('verwijderVerzoek', () => CC.sheet('Account laten verwijderen', `<p>De clubmanager krijgt een verzoek en wist daarna je naam, e-mailadres, telefoonnummer en koppelingen. Je hoort het binnen een week.</p>
    <p class="zacht klein">Stopt je kind bij de club? Gebruik dan eerst <b>Kind uitschrijven</b>. Het lidmaatschap zeg je apart op bij de ledenadministratie.</p>
    <div class="knoppen kolom"><button class="knop rood" data-act="verwijderVerzoekOk">Verzoek versturen</button><button class="knop licht" data-act="sluit">Annuleren</button></div>`));
  CC.on('verwijderVerzoekOk', () => {
    const me = CC.me(); const ontv = S.people.filter((p) => p.id !== me.id && p.rollen.some((r) => r.rol === 'beheerder')).map((p) => p.id);
    if (!ontv.length) { CC.closeSheet(); return CC.toast('Er is nog geen clubmanager. Vraag het de trainer of teamleider.', 'fout'); }
    const kids = CC.kinderen().map((k) => `${k.voornaam} (${CC.tn(k.teamId)})`).join(', ');
    S.msgs.push({ id: 'b' + Date.now(), van: me.id, vanRol: (CC.rol() || {}).rol, soort: 'persoonlijk', bereik: 'Clubbeheer', onderwerp: `Verzoek: account van ${me.naam} verwijderen`, tekst: `${me.naam} (${me.email}) vraagt om het account te verwijderen.${kids ? ` Kinderen: ${kids}.` : ''}\n\nVerwijder de persoon via HJO → Teams → Ouders of Staf, en laat het weten als het gedaan is.`, tijd: new Date().toISOString(), ontvangers: ontv, gelezen: [me.id], antw: [], urgent: false, gepland: null, mail: true });
    CC.save(); CC.closeSheet(); CC.toast('Verzoek verstuurd naar de clubmanager');
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
    // Besluit 72: ontwikkelgegevens bewaren we zolang het kind lid is; bij uitschrijven weg (de database ruimt ook op)
    ['ontwVoorb', 'ontwVerslag', 'ontwNotitie'].forEach((k) => { Object.keys(S[k] || {}).forEach((x) => { if (x.split('|')[0] === pl.id) delete S[k][x]; }); });
    delete S.beoord[pl.id]; Object.keys(S.beoordGezien || {}).forEach((x) => { if (x.replace(/(\d{4}-)?m\d+$/, '') === pl.id) delete S.beoordGezien[x]; });
    (S.ontwGesprek || []).forEach((g) => { if (g.spelerId === pl.id) g.spelerId = null; });
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
  CC.on('resetDemo', () => { CC.reset(); CC.closeSheet(); CC.logout(); CC.toast('Demo staat weer aan het begin'); });
  CC.on('demoMelding', (el) => CC.toast(el.dataset.tekst));
  CC.on('meldingen', () => CC.sheet('Meldingen', `<p>Alles staat in de app bij <b>Berichten</b>. Daarnaast krijg je een <b>e-mail</b> bij:</p>
    <ul><li>afgelastingen, wijzigingen en noodberichten (urgent)</li><li>persoonlijke berichten en antwoorden op je vraag</li><li>herinneringen over afmelden en kaarten</li><li>nieuwe activiteiten, opgave en belangrijke clubberichten</li></ul>
    <p class="zacht klein">Pushmeldingen op je telefoon komen later. Zet ClubComm alvast op je beginscherm (Profiel → App op je beginscherm).</p>`));
  // Drie stappen voor de iPhone (ook gebruikt in het welkomstscherm voor meldingen)
  CC.beginStappen = () => {
    const stap = (n, ic, tekst) => `<div class="beginstap"><span class="beginnr">${n}</span><span class="beginic">${icon(ic)}</span><span>${tekst}</span></div>`;
    return `${stap(1, 'share', 'Tik in Safari op <b>Delen</b> (het vierkantje met het pijltje omhoog). Zie je dat niet? Tik dan eerst op de <b>drie puntjes (•••)</b> en daarna op <b>Deel</b>.')}${stap(2, 'square-plus', 'Scrol een stukje naar beneden en kies <b>Zet op beginscherm</b>. Staat het er niet? Tik eerst op <b>Bekijk meer</b>.')}${stap(3, 'check', 'Tik rechtsboven op <b>Voeg toe</b>. Open ClubComm voortaan via het icoon.')}
      <p class="zacht klein">Een knop die dit voor je doet, staat Apple niet toe. Gebruik je Chrome op de iPhone? Dan zit Delen rechtsboven.</p>`;
  };
  // App op je beginscherm (Besluit 54): Android met één knop als Chrome het aanbiedt; iPhone kan alleen via Delen (regel van Apple)
  CC.on('beginscherm', () => {
    const al = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent); const android = /Android/.test(navigator.userAgent);
    const stap = (n, ic, tekst) => `<div class="beginstap"><span class="beginnr">${n}</span><span class="beginic">${icon(ic)}</span><span>${tekst}</span></div>`;
    const iphone = CC.beginStappen();
    const droid = `${stap(1, 'ellipsis', 'Tik in Chrome rechtsboven op de <b>drie puntjes</b>.')}${stap(2, 'square-plus', 'Kies <b>App installeren</b> of <b>Toevoegen aan startscherm</b>.')}`;
    CC.sheet('App op je beginscherm', al ? '<p>ClubComm staat al op je beginscherm. Top!</p>'
      : CC.installPrompt ? `<button class="knop vol" data-act="installeren">${icon('smartphone')}ClubComm installeren</button><p class="zacht klein">Eén tik, dan staat ClubComm op je beginscherm.</p>`
      : `${ios ? iphone : android ? droid : `<h3 class="klein-kop">iPhone</h3>${iphone}<h3 class="klein-kop">Android</h3>${droid}`}<p class="zacht">Daarna open je ClubComm met één tik, net als een gewone app, en blijf je ingelogd.</p>`);
  });
  CC.on('installeren', async () => { const p = CC.installPrompt; if (!p) return; p.prompt(); const r = await p.userChoice.catch(() => ({})); CC.installPrompt = null; CC.closeSheet(); if (r.outcome === 'accepted') CC.toast('ClubComm staat op je beginscherm'); });
  CC.on('tweedeOuder', () => { const k = CC.kind(); if (!k) return; const link = `${location.origin}${location.pathname}#uitnodiging-${k.teamId}`;
    CC.sheet('Tweede ouder uitnodigen', `<p>Stuur de andere ouder de uitnodiging van ${esc(CC.tn(k.teamId))}. Die meldt zich aan met een eigen e-mailadres en vult de naam van ${esc(k.voornaam)} in. De teamleider koppelt jullie dan aan hetzelfde kind.</p><p class="klein zacht">Jullie zien elkaars e-mailadres niet.</p><div class="knoppen kolom"><button class="knop" data-act="tweedeOuderDeel" data-link="${esc(link)}">${icon('share-2')}Uitnodiging delen</button></div>`); });
  CC.on('tweedeOuderDeel', (el) => CC.deel(`Je kunt je aanmelden bij ClubComm voor ${CC.kind().voornaam} (${CC.kind().teamId}): ${el.dataset.link}`));

  // ---------- Berichten (voor alle rollen) — Besluit 57 ----------
  // Twee tabbladen voor iedereen: Persoonlijk (gesprekken, wie ook begon) en Nieuws (groepsberichten en meldingen, alleen lezen).
  // Indeling: Vastgezet · Wacht op jou (staf) · Nieuw · Deze week · Eerder (ingeklapt) · Ter informatie (ingeklapt) · Archief.
  // Nieuws gaat na 14 dagen vanzelf naar het Archief; een gesprek alleen als jij het archiveert (nieuw antwoord = terug).
  const vanNaam = (m) => (m.van === 'systeem' ? 'ClubComm' : (M.persoon(S, m.van) || { naam: 'Verwijderd account' }).naam);
  const pNaam = (id) => (id === 'systeem' ? 'ClubComm' : (M.persoon(S, id) || { naam: 'Verwijderd account' }).naam);
  const voornaam = (id) => pNaam(id).split(' ')[0];
  // Bereik bevat teamcodes (nodig voor de rechten); toon de teamnaam
  const bereikNaam = (m) => String(m.bereik || '').split(', ').map((x) => (S.teams.some((t) => t.id === x) ? CC.tn(x) : x)).join(', ');
  // Berichten van de club (HJO/clubmanager) zijn herkenbaar; vastgezette berichten blijven tijdelijk bovenaan (Besluit 19)
  CC.isClub = (m) => { const p = m.van !== 'systeem' && M.persoon(S, m.van); return !!(p && p.rollen.some((r) => ['hjo', 'beheerder'].includes(r.rol))); };
  CC.isVast = (m) => !!(m.vastTot && new Date(m.vastTot) > new Date());
  const afzenderIc = (m, naam) => (m.van === 'systeem' ? `<span class="avatar sys">${icon('bell')}</span>` : CC.isClub(m) ? `<span class="avatar club">${icon('shield')}</span>` : h.avatar(naam));
  const ARCHIEF_DAGEN = 14;
  const laatstTijd = (m) => M.laatste(m).tijd || m.tijd;
  const dagenOud = (m) => (Date.now() - new Date(laatstTijd(m))) / 864e5;
  const isStaf = () => CC.rol().rol !== 'ouder';
  const terInfo = (m) => M.terInfo(m);
  // Besluit 80: nieuws over een activiteit (herinnering, wijziging, afgelast, uitslag) vervalt de dag na die activiteit
  const nieuwsArchief = (m, pid) => M.gearchiveerd(m, pid) || (!CC.isVast(m) && (dagenOud(m) > ARCHIEF_DAGEN || (m.verloopt && m.verloopt < D.vandaag())));
  CC.nieuwsVerlopen = (m, pid) => m.soort !== 'persoonlijk' && nieuwsArchief(m, pid);
  const kanIntrekken = (m, me) => m.van === me.id && !m.ingetrokken && Date.now() - new Date(m.tijd) < 24 * 3600e3;
  const nieuwst = (a, b) => laatstTijd(b).localeCompare(laatstTijd(a));

  // Besluit 79: in de ouderrol alleen berichten over je kind. Wat je als trainer/beheerder stuurt of ontvangt (welkomst-
  // berichten, vragen van andere ouders, meldingen ter informatie) staat alleen in je stafrol.
  const ouderRol = () => (CC.rol() || {}).rol === 'ouder';
  const ouderStaf = () => { const s = new Set(); CC.kinderen().forEach((k) => M.stafVan(S, k.teamId).forEach((x) => s.add(x)));
    S.people.filter((p) => p.rollen.some((r) => ['hjo', 'beheerder', 'coordinator'].includes(r.rol))).forEach((p) => s.add(p.id)); return s; };
  CC.voorRol = (m, me, staf) => {
    if (!ouderRol()) return true;
    if (m.van === me.id && m.vanRol) return m.vanRol === 'ouder';
    if (m.van !== me.id && m.vanRol === 'ouder' && m.soort === 'persoonlijk') return false; // een ouder die jou als staf iets vraagt
    staf = staf || ouderStaf();
    if (m.soort === 'persoonlijk') {
      if (m.van === me.id) return m.ontvangers.length > 0 && m.ontvangers.every((x) => staf.has(x));
      return m.van === 'systeem' || staf.has(m.van);
    }
    if (m.van === me.id) return false;
    return !M.terInfo(m);
  };
  // Ongelezen voor de rol waarin je nu werkt (voor het getal bij Berichten)
  CC.ongelezenRol = (S2) => { const me = CC.me(); const staf = ouderRol() ? ouderStaf() : null; return S2.msgs.filter((m) => M.isOngelezen(S2, m, me.id) && !M.terInfo(m) && CC.voorRol(m, me, staf)).length; };
  // Alle berichten per tabblad voor deze persoon
  const perTab = (me) => {
    const staf = ouderRol() ? ouderStaf() : null;
    const pers = S.msgs.filter((m) => m.soort === 'persoonlijk' && M.zichtbaar(S, m, me.id) && CC.voorRol(m, me, staf));
    const nws = S.msgs.filter((m) => m.soort !== 'persoonlijk' && (m.van === me.id || M.zichtbaar(S, m, me.id)) && CC.voorRol(m, me, staf));
    return { pers, nws };
  };
  // Besluit 79: een gesprek gaat vanzelf naar het archief na 7 dagen zonder nieuw bericht, behalve als het op jou wacht,
  // je het nog niet las of jouw laatste bericht een vraag is. Een nieuw bericht haalt het terug.
  const AUTO_DAGEN = 7;
  const vraagOpen = (m, me) => { const l = M.laatste(m); return l.van === me.id && /\?/.test(String(l.tekst || '')); };
  // Besluit 82: een welkomstbericht (zonder antwoorden) gaat 3 dagen nadat je het las vanzelf naar het archief
  const WELKOM_DAGEN = 3;
  const welkomTot = (m, pid) => (m.welkom && !(m.antw || []).length && (m.gelezenOp || {})[pid] ? new Date(m.gelezenOp[pid]).getTime() + WELKOM_DAGEN * 864e5 : null);
  // Lezen: onthoud ook wanneer (Besluit 82)
  const leesMarkeer = (m, pid) => { m.gelezen.push(pid); m.gelezenOp = { ...(m.gelezenOp || {}), [pid]: new Date().toISOString() }; };
  // Besluit 82: wanneer gaat dit bericht vanzelf naar het archief? (null = niet vanzelf)
  const verdwijntOp = (m, me) => {
    if (m.soort === 'persoonlijk') return welkomTot(m, me.id);
    if (CC.isVast(m)) return null;
    const t = [new Date(laatstTijd(m)).getTime() + ARCHIEF_DAGEN * 864e5]; if (m.verloopt) t.push(D.parse(D.addDays(m.verloopt, 1)).getTime());
    return Math.min(...t); };
  const verdwijntRegel = (m, me, arch) => { const t = !arch && verdwijntOp(m, me); if (!t) return '';
    const n = D.dagen(D.vandaag(), D.iso(new Date(t))); if (n > 3) return '';
    return `<p class="zacht klein midden">${icon('archive')}${n <= 0 ? 'Dit bericht gaat vandaag naar het archief' : n === 1 ? 'Dit bericht verdwijnt morgen naar het archief' : `Dit bericht verdwijnt over ${n} dagen naar het archief`}</p>`; };
  const gespArchief = (m, me) => M.gearchiveerd(m, me.id) || (welkomTot(m, me.id) != null && welkomTot(m, me.id) < Date.now()) || (!M.isOngelezen(S, m, me.id) && !M.wachtOpMij(m, me.id) && !vraagOpen(m, me) && dagenOud(m) > AUTO_DAGEN);
  // Beperk een lijst tot 10, met "Toon meer"
  const meer = (sleutel, ms, render) => {
    const n = Number(h.segVal('meer-' + sleutel, 10));
    return `<div class="lijst">${ms.slice(0, n).map(render).join('')}</div>${ms.length > n ? `<button class="linkknop vol" data-act="seg" data-key="meer-${sleutel}" data-val="${n + 10}">Toon meer (${ms.length - n})</button>` : ''}`;
  };
  const blok = (titel, ms, render, sleutel) => (ms.length ? `${h.sectie(titel)}${meer(sleutel, ms, render)}` : '');
  const inklap = (titel, ms, render, sleutel) => (ms.length ? `<details class="uitklap blok"><summary>${titel} (${ms.length})</summary>${meer(sleutel, ms, render)}</details>` : '');

  CC.berichtenScherm = (S, opties = {}) => {
    const me = CC.me(); const staf = isStaf();
    const tab = h.segVal('berichten', 'persoonlijk');
    const { pers, nws } = perTab(me);
    const actiefPers = pers.filter((m) => !gespArchief(m, me));
    const actiefNws = nws.filter((m) => !nieuwsArchief(m, me.id));
    const n = (ms) => ms.filter((m) => M.isOngelezen(S, m, me.id) && !terInfo(m)).length;
    const knop = staf && opties.nieuw ? `<button class="knop vol" data-act="nieuwBericht">${icon('plus')}Nieuw bericht</button>`
      : tab === 'persoonlijk' && CC.kinderen().length ? `<button class="knop licht vol" data-act="vraagStaf">${icon('message-circle')}Vraag aan trainer of teamleider</button>` : '';
    const lijst = tab === 'persoonlijk' ? actiefPers : actiefNws;
    const ongelezen = lijst.filter((m) => M.isOngelezen(S, m, me.id) && !terInfo(m));
    const allesGelezen = ongelezen.length > 3 ? `<button class="linkknop" data-act="allesGelezen" data-tab="${tab}">${icon('check')}Alles gelezen</button>` : '';
    const archiefLink = (aantal) => `<button class="rij klikbaar archieflink" data-act="open" data-view="archief" data-tab="${tab}">${icon('archive')}<span class="rij-tekst"><b>Archief</b><small>${aantal ? `${aantal} ${aantal === 1 ? 'bericht' : 'berichten'}` : 'Leeg'}</small></span>${icon('chevron-right', 'chev')}</button>`;
    let inhoud;
    if (tab === 'persoonlijk') {
      const wacht = staf ? actiefPers.filter((m) => M.wachtOpMij(m, me.id)).sort(nieuwst) : [];
      const nieuw = actiefPers.filter((m) => !wacht.includes(m) && M.isOngelezen(S, m, me.id)).sort(nieuwst);
      const rest = actiefPers.filter((m) => !wacht.includes(m) && !nieuw.includes(m)).sort(nieuwst);
      inhoud = actiefPers.length
        ? `${blok('Wacht op jou', wacht, (m) => gesprek(m, me), 'wacht')}${blok('Nieuw', nieuw, (m) => gesprek(m, me), 'pnieuw')}${blok(wacht.length || nieuw.length ? 'Gesprekken' : '', rest, (m) => gesprek(m, me), 'prest')}`
        : h.leeg(staf ? 'Nog geen gesprekken' : 'Nog geen persoonlijke berichten', 'message-circle');
      inhoud += archiefLink(pers.length - actiefPers.length);
    } else {
      const vast = actiefNws.filter(CC.isVast).sort(nieuwst);
      const info = staf ? actiefNws.filter((m) => !vast.includes(m) && terInfo(m)) : [];
      const gewoon = actiefNws.filter((m) => !vast.includes(m) && !info.includes(m));
      const nieuw = gewoon.filter((m) => M.isOngelezen(S, m, me.id)).sort(nieuwst);
      const week = gewoon.filter((m) => !nieuw.includes(m) && dagenOud(m) <= 7).sort(nieuwst);
      const eerder = gewoon.filter((m) => !nieuw.includes(m) && dagenOud(m) > 7).sort(nieuwst);
      inhoud = actiefNws.length
        ? `${blok(`${icon('pin', 'klein')} Vastgezet`, vast, (m) => nieuwsRij(m, me), 'vast')}${blok('Nieuw', nieuw, (m) => nieuwsRij(m, me), 'nnieuw')}${blok('Deze week', week, (m) => nieuwsRij(m, me), 'week')}${inklap('Eerder', eerder, (m) => nieuwsRij(m, me), 'eerder')}${inklap('Ter informatie', info.sort(nieuwst), (m) => nieuwsRij(m, me), 'info')}`
        : h.leeg('Geen nieuws van de laatste twee weken', 'megaphone');
      inhoud += archiefLink(nws.length - actiefNws.length);
    }
    return `${knop}${h.seg('berichten', [['persoonlijk', 'Persoonlijk', n(actiefPers)], ['nieuws', 'Nieuws', n(actiefNws)]], 'persoonlijk')}${allesGelezen ? `<div class="rechts">${allesGelezen}</div>` : ''}${inhoud}`;
  };

  // Eén gesprek in de lijst: onderwerp, met wie, laatste regel ("Jij: …"), wacht op jou / beantwoord door
  const gesprek = (m, me) => {
    const l = M.laatste(m); const ong = M.isOngelezen(S, m, me.id);
    const anderen = M.deelnemers(m).filter((x) => x !== me.id);
    const met = m.van === me.id ? (bereikNaam(m) || anderen.map(voornaam).join(', ')) : pNaam(m.van);
    const collega = m.van !== me.id && m.ontvangers.includes(l.van) && l.van !== me.id;
    const gezien = l.van === me.id && (m.gelezen || []).some((x) => x !== me.id);
    const regel = m.ingetrokken ? `<i>Ingetrokken door ${esc(pNaam(m.ingetrokken.door))}</i>` : `${l.van === me.id ? `<span class="vinkje ${gezien ? 'gelezen' : ''}">${gezien ? '✓✓' : '✓'}</span> Jij` : esc(voornaam(l.van))}: ${esc(String(l.tekst || '').split('\n')[0])}`;
    // Status (Besluit 59/79): "Wacht op jou" (staf, de ander heeft het laatste woord) of "Wacht op antwoord" (jouw laatste bericht is een vraag)
    const wachtAntw = !m.ingetrokken && vraagOpen(m, me) && m.van !== 'systeem' && (m.antw.length > 0 || (m.van === me.id && !isStaf()));
    return `<button class="bericht ${ong ? 'nieuw' : ''} ${m.ingetrokken ? 'ingetrokken' : ''}" data-act="open" data-view="bericht" data-id="${m.id}">
      ${m.van === me.id ? h.avatar(anderen.length === 1 ? pNaam(anderen[0]) : (bereikNaam(m) || '?')) : afzenderIc(m, pNaam(m.van))}
      <span class="b-tekst"><b>${isStaf() && M.wachtOpMij(m, me.id) ? '<span class="chip oranje mini">Wacht op jou</span> ' : wachtAntw ? '<span class="chip grijs mini">Wacht op antwoord</span> ' : ''}${esc(m.onderwerp)}</b><small>${esc(met)}${collega ? ` · beantwoord door ${esc(voornaam(l.van))}` : ''}</small><span class="b-voorbeeld">${regel}</span></span>
      <span class="b-tijd">${D.tijdstip(laatstTijd(m))}${ong ? '<i class="nieuwstip"></i>' : ''}</span></button>`;
  };
  // Eén nieuwsbericht in de lijst; eigen berichten met "gelezen door x van y"
  const nieuwsRij = (m, me) => {
    const eigen = m.van === me.id; const ong = M.isOngelezen(S, m, me.id);
    const gepland = m.gepland && new Date(m.gepland) > new Date();
    const urgentRood = m.urgent && (ong || eigen && dagenOud(m) < 1);
    const sub = eigen ? (gepland ? `Jij · gepland voor ${D.tijdstip(m.gepland)}` : `Jij · gelezen door ${m.gelezen.filter((x) => x !== me.id).length} van ${m.ontvangers.length}`) : `${esc(vanNaam(m))}${m.bereik ? ` · ${esc(bereikNaam(m))}` : ''}`;
    return `<button class="bericht ${ong ? 'nieuw' : ''} ${m.ingetrokken ? 'ingetrokken' : ''}" data-act="open" data-view="bericht" data-id="${m.id}">
      ${eigen ? `<span class="avatar sys">${icon('send')}</span>` : afzenderIc(m, vanNaam(m))}
      <span class="b-tekst"><b>${m.urgent ? `<span class="chip ${urgentRood ? 'rood' : 'grijs'} mini">Urgent</span> ` : ''}${CC.isClub(m) && !eigen ? '<span class="chip blauw mini">Club</span> ' : ''}${esc(m.onderwerp)}</b><small>${sub}</small><span class="b-voorbeeld">${m.ingetrokken ? `<i>Ingetrokken door ${esc(pNaam(m.ingetrokken.door))}</i>` : esc(m.tekst.split('\n')[0])}</span></span>
      <span class="b-tijd">${gepland ? icon('clock') : D.tijdstip(m.tijd)}${CC.isVast(m) ? icon('pin', 'klein') : ''}${ong ? '<i class="nieuwstip"></i>' : ''}</span></button>`;
  };
  // Archief: nieuws ouder dan 14 dagen en wat je zelf archiveerde
  CC.views.archief = (S, p) => {
    const me = CC.me(); const { pers, nws } = perTab(me);
    const ms = (p.tab === 'nieuws' ? nws.filter((m) => nieuwsArchief(m, me.id)) : pers.filter((m) => gespArchief(m, me))).sort(nieuwst);
    // Besluit 80: per maand (nieuwste open, oudere ingeklapt) en een zoekbalk (onderwerp, tekst, antwoorden, namen)
    const zoektekst = (m) => [m.onderwerp, m.tekst, ...(m.antw || []).map((a) => a.tekst), pNaam(m.van), ...M.deelnemers(m).map(pNaam), bereikNaam(m)].join(' ').toLowerCase();
    const rij = (m) => (p.tab === 'nieuws' ? nieuwsRij(m, me) : gesprek(m, me)).replace('<button class="bericht', `<button data-zoek="${esc(zoektekst(m))}" class="bericht`);
    const maanden = []; ms.forEach((m) => { const d = new Date(laatstTijd(m)); const k = `${d.getFullYear()}-${d.getMonth()}`; let g = maanden.find((x) => x.k === k);
      if (!g) { g = { k, naam: d.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' }), ms: [] }; maanden.push(g); } g.ms.push(m); });
    return { titel: p.tab === 'nieuws' ? 'Archief · Nieuws' : 'Archief · Persoonlijk',
      html: `<p class="zacht klein">${p.tab === 'nieuws' ? `Nieuws gaat na ${ARCHIEF_DAGEN} dagen vanzelf hierheen, en nieuws over een activiteit de dag erna.` : 'Gesprekken die je afrondde, en gesprekken waarin 7 dagen niets gebeurde. Komt er een nieuw bericht, dan staat het gesprek weer bij Persoonlijk.'} Aan het eind van het seizoen worden oude berichten gewist.</p>
        ${ms.length ? `<input type="search" class="zoekveld" placeholder="Zoek op woord of naam" aria-label="Zoek in het archief" data-input="archiefZoek">
        ${maanden.map((g, i) => `<details class="uitklap blok maandblok" data-open="${i === 0 ? 1 : 0}" ${i === 0 ? 'open' : ''}><summary>${esc(g.naam.charAt(0).toUpperCase() + g.naam.slice(1))} <span class="zacht">(${g.ms.length})</span></summary><div class="lijst">${g.ms.map(rij).join('')}</div></details>`).join('')}
        <p class="zacht klein midden" data-niets hidden>Niets gevonden.</p>` : h.leeg('Het archief is leeg', 'archive')}` };
  };
  // Zoeken in het archief: meteen filteren zonder het scherm opnieuw te tekenen (zo blijft het toetsenbord open)
  CC.on('archiefZoek', (el) => { const q = el.value.trim().toLowerCase(); let totaal = 0;
    document.querySelectorAll('.maandblok').forEach((d) => { let n = 0; d.querySelectorAll('[data-zoek]').forEach((b) => { const ja = !q || b.dataset.zoek.includes(q); b.hidden = !ja; if (ja) n++; });
      d.hidden = !n; d.open = q ? n > 0 : d.dataset.open === '1'; totaal += n; });
    const niets = document.querySelector('[data-niets]'); if (niets) niets.hidden = totaal > 0; });
  // Regel voor Home (Besluit 57): gesprekken die op jou wachten
  CC.wachtRij = () => { const me = CC.me(); const n = S.msgs.filter((m) => M.zichtbaar(S, m, me.id) && M.wachtOpMij(m, me.id)).length;
    return n ? h.rij({ ic: 'message-circle', titel: `${n} ${n === 1 ? 'gesprek wacht' : 'gesprekken wachten'} op jou`, sub: 'Een vraag die nog niemand van de staf beantwoordde', act: 'wachtOpen', kleur: 'oranje' }) : ''; };
  CC.on('wachtOpen', () => { CC.ui.seg.berichten = 'persoonlijk'; CC.go('berichten'); });
  CC.on('allesGelezen', (el) => {
    const me = CC.me(); const { pers, nws } = perTab(me);
    (el.dataset.tab === 'nieuws' ? nws : pers).forEach((m) => { if (M.isOngelezen(S, m, me.id)) leesMarkeer(m, me.id); });
    CC.save(); CC.render(); CC.toast('Alles gelezen');
  });

  CC.views.bericht = (S, p) => {
    const m = S.msgs.find((x) => x.id === p.id); const me = CC.me();
    if (!m) return { titel: 'Bericht', html: h.leeg('Dit bericht bestaat niet meer', 'message-circle') };
    if (M.isOngelezen(S, m, me.id)) { leesMarkeer(m, me.id); CC.save(); }
    const eigen = m.van === me.id; const pers = m.soort === 'persoonlijk';
    const arch = pers ? gespArchief(m, me) : nieuwsArchief(m, me.id);
    const gelezenLijst = eigen && !pers ? `<details class="uitklap"><summary>Gelezen door ${m.gelezen.filter((x) => x !== me.id).length} van ${m.ontvangers.length}</summary><p class="zacht klein">${m.ontvangers.map((id) => { const pp = M.persoon(S, id); return pp ? `${m.gelezen.includes(id) ? '✓' : '·'} ${esc(pp.naam)}` : ''; }).slice(0, 40).join('<br>')}</p></details>` : '';
    // Gesprek: onder je eigen laatste bericht wie het gelezen heeft (zoals WhatsApp)
    const l = M.laatste(m);
    const gezienDoor = pers && l.van === me.id ? m.gelezen.filter((x) => x !== me.id).map(voornaam) : [];
    const gezien = pers && l.van === me.id ? `<p class="zacht klein rechts">${gezienDoor.length ? `${icon('check')}Gelezen door ${esc(gezienDoor.join(', '))}` : 'Nog niet gelezen'}</p>` : '';
    const acties = [
      pers || !CC.isVast(m) ? (arch && M.gearchiveerd(m, me.id) ? `<button class="knop licht klein" data-act="archiefUit" data-id="${m.id}">${icon('archive-restore')}${pers ? 'Weer openen' : 'Terugzetten'}</button>` : !arch ? `<button class="knop licht klein" data-act="archiveer" data-id="${m.id}">${pers ? `${icon('check')}Gesprek afronden` : `${icon('archive')}Archiveren`}</button>` : '') : '',
      kanIntrekken(m, me) ? `<button class="knop licht klein rood-tekst" data-act="berichtIntrekken" data-id="${m.id}">${icon('undo-2')}Intrekken</button>` : '',
    ].filter(Boolean).join('');
    if (m.ingetrokken) return { titel: pers ? 'Gesprek' : 'Nieuws', html: `<article class="kaartje"><h2>${esc(m.onderwerp)}</h2><p class="zacht"><i>Dit bericht is ingetrokken door ${esc(pNaam(m.ingetrokken.door))} (${D.tijdstip(m.ingetrokken.tijd)}).</i></p>${acties ? `<div class="knoppen">${acties}</div>` : ''}</article>` };
    // Gesprek als tekstballonnen (Besluit 59): ook het eerste bericht; jij rechts in blauw, de ander links met initialen;
    // dagscheiding; berichten achter elkaar van dezelfde persoon samengevoegd; vinkjes: ✓ verstuurd, ✓✓ blauw gelezen.
    if (pers) {
      const alle = [{ van: m.van, tekst: m.tekst, tijd: m.gepland || m.tijd }, ...m.antw];
      const anderen = M.deelnemers(m).filter((x) => x !== me.id);
      const gelezenDoor = m.gelezen.filter((x) => x !== me.id);
      const dagLabel = (t) => { const d = new Date(t); const v = new Date(); const g = new Date(Date.now() - 864e5);
        const zelfde = (a, b) => a.toDateString() === b.toDateString();
        return zelfde(d, v) ? 'Vandaag' : zelfde(d, g) ? 'Gisteren' : d.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'short' }); };
      const uur = (t) => new Date(t).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
      let vorigeDag = '', vorigeVan = '';
      const ballonnen = alle.map((b, i) => {
        const dag = dagLabel(b.tijd); const mijn = b.van === me.id;
        const scheiding = dag !== vorigeDag ? `<div class="dagscheiding"><span>${esc(dag)}</span></div>` : '';
        const nieuweGroep = scheiding || b.van !== vorigeVan; vorigeDag = dag; vorigeVan = b.van;
        const volgendeZelfde = alle[i + 1] && alle[i + 1].van === b.van && dagLabel(alle[i + 1].tijd) === dag;
        // Vinkjes: gelezen als er daarna iemand anders iets zei, of (laatste bericht) als iemand het gelezen heeft
        const laterAnder = alle.slice(i + 1).some((x) => x.van !== me.id);
        const gezien = laterAnder || gelezenDoor.length > 0; // 'gelezen' wordt bij elk nieuw bericht opnieuw gevuld, dus wie erin staat las alles
        const vink = mijn ? `<span class="vinkje ${gezien ? 'gelezen' : ''}" title="${gezien ? 'Gelezen' : 'Verstuurd'}">${gezien ? '✓✓' : '✓'}</span>` : '';
        const ic = !mijn ? `<span class="bubbel-ic">${!volgendeZelfde ? (b.van === 'systeem' ? `<span class="avatar sys klein">${icon('bell')}</span>` : h.avatar(pNaam(b.van), 'klein')) : ''}</span>` : '';
        return `${scheiding}<div class="bubbel-rij ${mijn ? 'mijn' : 'ander'} ${nieuweGroep ? 'begin' : ''}">${ic}<div class="bubbel ${mijn ? 'mijn' : 'ander'}">${!mijn && nieuweGroep && anderen.length > 1 ? `<b class="bubbel-naam">${esc(pNaam(b.van))}</b>` : !mijn && nieuweGroep ? `<b class="bubbel-naam">${esc(voornaam(b.van))}</b>` : ''}<p>${esc(b.tekst).replace(/\n/g, '<br>')}</p><small>${uur(b.tijd)}${vink}</small></div></div>`;
      }).join('');
      const l2 = alle[alle.length - 1];
      const status = l2.van === me.id ? `<p class="zacht klein rechts">${gelezenDoor.length ? `Gelezen door ${esc(gelezenDoor.map(voornaam).join(', '))}` : 'Nog niet gelezen'}</p>` : '';
      // Besluit 79: wie het gesprek afrondde (de lijst wordt leeg bij een nieuw bericht)
      const afgerond = (m.archief || []).filter((x) => x !== me.id && anderen.includes(x));
      const afrondRegel = afgerond.length ? `<p class="zacht klein midden">${icon('check')}${esc(afgerond.map(voornaam).join(' en '))} ${afgerond.length === 1 ? 'heeft' : 'hebben'} het gesprek afgerond.</p>` : '';
      return {
        titel: 'Gesprek',
        html: `<article class="kaartje gesprek-kop"><h2>${esc(m.onderwerp)}</h2><small class="zacht">Met ${esc(anderen.map(pNaam).join(', ') || bereikNaam(m))}${m.urgent ? ' · <span class="chip rood mini">Urgent</span>' : ''}</small>${acties ? `<div class="knoppen">${acties}</div>` : ''}</article>
          <div class="bubbels">${ballonnen}</div>${status}${afrondRegel}${verdwijntRegel(m, me, arch)}
          ${m.van !== 'systeem' ? `<form class="reageer" data-submit="reageer" data-id="${m.id}"><textarea name="t" rows="1" placeholder="Reageer… (Enter = nieuwe regel)" required aria-label="Reactie" data-input="groei"></textarea><button class="icoonknop blauw" aria-label="Versturen">${icon('send')}</button></form>` : ''}`,
      };
    }
    const vraagOver = !pers && !eigen && m.van !== 'systeem' ? `<button class="knop licht vol" data-act="vraagOver" data-id="${m.id}">${icon('message-circle')}Stel een vraag hierover</button>` : '';
    return {
      titel: pers ? 'Gesprek' : m.soort === 'melding' ? 'Melding' : 'Nieuws',
      html: `<article class="kaartje">
        <div class="b-kop">${afzenderIc(m, vanNaam(m))}<div><b>${esc(vanNaam(m))}${CC.isClub(m) ? ' <span class="chip blauw mini">Club</span>' : ''}</b><small>aan ${esc(bereikNaam(m))} · ${D.tijdstip(m.gepland || m.tijd)}</small></div></div>
        ${m.urgent || CC.isVast(m) ? `<p class="klein">${m.urgent ? '<span class="chip rood mini">Urgent</span> ' : ''}${CC.isVast(m) ? `<span class="chip grijs mini">${icon('pin', 'klein')}Vastgezet tot ${D.kort(m.vastTot.slice(0, 10))}</span>` : ''}</p>` : ''}
        <h2>${esc(m.onderwerp)}</h2><p class="brief">${esc(m.tekst).replace(/\n/g, '<br>')}</p>${(() => { const ma = m.actId && M.act(S, m.actId); return ma && ma.adres && !ma.afgelast ? `<div class="knoppen">${h.adresRegel(ma.adres)}</div>` : ''; })()}${gelezenLijst}
        ${eigen && !pers ? `<div class="knoppen">${CC.isVast(m) ? `<button class="knop licht klein" data-act="losmaken" data-id="${m.id}">${icon('pin-off')}Losmaken</button>` : `<button class="knop licht klein" data-act="vastzetten" data-id="${m.id}" data-d="7">${icon('pin')}1 week vastzetten</button><button class="knop licht klein" data-act="vastzetten" data-id="${m.id}" data-d="14">${icon('pin')}2 weken</button>`}</div>` : ''}
        ${acties ? `<div class="knoppen">${acties}</div>` : ''}</article>
        ${m.antw.map((a) => `<div class="antwoord ${a.van === me.id ? 'mijn' : ''}"><small>${esc(pNaam(a.van))} · ${D.tijdstip(a.tijd)}</small><p>${esc(a.tekst).replace(/\n/g, '<br>')}</p></div>`).join('')}
        ${pers && m.antw.length ? gezien : ''}
        ${pers && m.van !== 'systeem' ? `<form class="reageer" data-submit="reageer" data-id="${m.id}"><textarea name="t" rows="1" placeholder="Reageer… (Enter = nieuwe regel)" required aria-label="Reactie" data-input="groei"></textarea><button class="icoonknop blauw" aria-label="Versturen">${icon('send')}</button></form>`
          : !pers ? `${verdwijntRegel(m, me, arch)}${vraagOver}<p class="zacht klein midden">Nieuws is alleen-lezen${vraagOver ? '; een vraag wordt een persoonlijk gesprek met de afzender' : ''}.</p>` : ''}`,
    };
  };
  CC.on('archiveer', (el) => { const m = S.msgs.find((x) => x.id === el.dataset.id); const me = CC.me(); m.archief = [...new Set([...(m.archief || []), me.id])]; if (!m.gelezen.includes(me.id)) m.gelezen.push(me.id); CC.save(); CC.terug(); CC.toast(m.soort === 'persoonlijk' ? 'Gesprek afgerond. Stuurt de ander nog iets, dan komt het terug.' : 'Gearchiveerd'); });
  CC.on('archiefUit', (el) => { const m = S.msgs.find((x) => x.id === el.dataset.id); const me = CC.me(); m.archief = (m.archief || []).filter((x) => x !== me.id); CC.save(); CC.render(); CC.toast('Teruggezet'); });
  // Intrekken (alleen de afzender, binnen 24 uur): ontvangers zien "ingetrokken door …"; een verstuurde push of e-mail kan niet terug
  CC.on('berichtIntrekken', (el) => CC.sheet('Bericht intrekken?', `<p>Ontvangers zien daarna alleen: <i>"Dit bericht is ingetrokken door ${esc(CC.me().naam)}"</i>.</p><p class="zacht klein">Een pushmelding of e-mail die al is verstuurd, kan niet meer terug. Stuur zo nodig een nieuw bericht met de juiste informatie.</p>
    <div class="knoppen kolom"><button class="knop rood" data-act="berichtIntrekkenOk" data-id="${el.dataset.id}">Ja, intrekken</button><button class="knop licht" data-act="sluit">Annuleren</button></div>`));
  CC.on('berichtIntrekkenOk', (el) => { const m = S.msgs.find((x) => x.id === el.dataset.id); m.ingetrokken = { door: CC.me().id, tijd: new Date().toISOString() }; m.vastTot = null; CC.save(); CC.closeSheet(); CC.render(); CC.toast('Ingetrokken'); });
  // Vraag over een nieuwsbericht: een persoonlijk gesprek met de afzender
  CC.on('vraagOver', (el) => { const m = S.msgs.find((x) => x.id === el.dataset.id);
    CC.sheet(`Vraag aan ${esc(pNaam(m.van))}`, `<form data-submit="vraagOverOk" data-id="${m.id}" class="codeform"><label for="vo-o">Onderwerp</label><input id="vo-o" name="o" required maxlength="80" value="${esc(('Vraag over: ' + m.onderwerp).slice(0, 80))}">
      <label for="vo-t">Je vraag</label><textarea id="vo-t" name="t" rows="4" required></textarea><button class="knop vol">${icon('send')}Versturen</button><p class="zacht klein">Alleen ${esc(pNaam(m.van))} ziet dit.</p></form>`); });
  CC.on('vraagOverOk', (f) => { const m = S.msgs.find((x) => x.id === f.dataset.id); const me = CC.me();
    S.msgs.push({ id: 'b' + Date.now(), van: me.id, vanRol: (CC.rol() || {}).rol, soort: 'persoonlijk', bereik: pNaam(m.van), onderwerp: f.o.value.trim(), tekst: f.t.value.trim(), tijd: new Date().toISOString(), ontvangers: [m.van], gelezen: [me.id], antw: [], urgent: false, gepland: null, vastTot: null });
    CC.save(); CC.closeSheet(); CC.ui.seg.berichten = 'persoonlijk'; CC.render(); CC.toast(`Verstuurd naar ${pNaam(m.van)}`); });
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
    S.msgs.push({ id: 'b' + Date.now(), van: me.id, vanRol: (CC.rol() || {}).rol, soort: 'persoonlijk', bereik: `${pl.voornaam} (${CC.tn(pl.teamId)})`, onderwerp: f.o.value.trim(), tekst: f.t.value.trim(), tijd: new Date().toISOString(), ontvangers: [...new Set(ontv)], gelezen: [me.id], antw: [], urgent: false, gepland: null, vastTot: null });
    CC.save(); CC.closeSheet(); CC.render(); CC.toast('Verstuurd naar de trainer en teamleider');
  });
  // Reactievak groeit mee met de tekst; Enter = nieuwe regel, versturen met de blauwe knop (Besluit 58)
  CC.on('groei', (el) => { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 200) + 'px'; window.scrollTo(0, document.body.scrollHeight); });
  // Antwoord (Besluit 57): het gesprek is weer ongelezen voor de anderen en komt uit ieders archief
  CC.on('reageer', (f) => { const t = f.t.value.replace(/\s+$/, '').replace(/^\s*\n/, ''); if (!t.trim()) return; const m = S.msgs.find((x) => x.id === f.dataset.id); const me = CC.me(); m.antw.push({ van: me.id, tekst: t, tijd: new Date().toISOString() }); m.gelezen = [me.id]; m.archief = []; CC.save(); CC.render(); CC.toast('Verstuurd'); });

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
      <label class="vink"><input type="checkbox" name="urgent"> Urgent: alleen voor iets van vandaag of morgen (ook 's nachts een pushmelding, en altijd per e-mail)</label>
      <label class="vink"><input type="checkbox" name="mail" checked> Per e-mail naar wie geen pushmeldingen heeft (zet uit voor iets wat niet belangrijk is)</label>` : ''}
      <button class="knop">${soort === 'gepland' ? 'Inplannen' : 'Versturen'}</button>
      ${t ? `<p class="zacht klein">Wordt verstuurd aan ${soort === 'persoon' ? 'één persoon: in de app, met een pushmelding of anders één e-mail' : `alle ouders van ${esc(t.naam)}`}.</p>` : ''}</form>`);
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
    CC.save(); CC.closeSheet(); ui.seg.berichten = ms === 'persoonlijk' ? 'persoonlijk' : 'nieuws'; CC.render(); CC.toast(soort === 'gepland' ? 'Bericht ingepland' : `Verstuurd aan ${ontvangers.length} ${ontvangers.length === 1 ? 'persoon' : 'personen'}`);
  });

  // Trainingswijziging / planning aanpassen (Besluit 7): past de planning aan + melding HJO en teamleider
  CC.wijzigingSheet = (actId) => {
    const tid = CC.teamId();
    const komend = M.komend(S, tid, 12).filter((a) => !a.afgelast);
    CC.sheet('Planning aanpassen', `<form data-submit="wijzigPlanning" class="codeform">
      <label for="w-wat">Wat wil je doen?</label>
      <select id="w-wat" name="wat" data-change="wijzigWat"><option value="verplaats">Training verplaatsen of veld wijzigen</option><option value="afgelast">Training afgelasten</option><option value="extra">Extra training toevoegen</option><option value="oefen">Oefenwedstrijd toevoegen</option><option value="activiteit">Activiteit toevoegen (zaalvoetbal, toernooi, uitje)</option></select>
      <div id="w-bestaand"><label for="w-act">Welke training?</label><select id="w-act" name="act">${komend.filter((a) => a.soort === 'training').map((a) => `<option value="${a.id}" ${a.id === actId ? 'selected' : ''}>${D.kort(a.datum)} · ${a.tijd} · ${esc(a.veld)}</option>`).join('')}</select>
        <div id="w-afg" hidden><label for="w-at">Toelichting voor de ouders (mag leeg)</label><textarea id="w-at" name="afgToel" rows="4" placeholder="Bijv. door blessures en ziekte; zo is er extra rust voor het weekend"></textarea></div></div>
      <div id="w-nieuw"><label for="w-dat">Datum</label><input id="w-dat" name="datum" type="date" value="${D.addDays(D.vandaag(), 1)}">
      <div class="twee"><div><label for="w-tijd">Tijd</label><input id="w-tijd" name="tijd" type="time" value="17:30"></div><div><label for="w-veld">Veld</label><input id="w-veld" name="veld" value="Veld 2"></div></div>
      <div id="w-tegen" hidden><label for="w-t">Tegenstander</label><input id="w-t" name="tegen" placeholder="Bijv. FC Waterkant O10-3">
        <fieldset class="vinkjes rij-vinkjes"><legend>Waar spelen we?</legend><label><input type="radio" name="oefThuis" value="1" checked data-change="wijzigOefThuis"> Thuis</label><label><input type="radio" name="oefThuis" value="0" data-change="wijzigOefThuis"> Uit</label></fieldset>
        <div class="twee"><div><label for="w-ovz">Verzamelen</label><input id="w-ovz" name="oefVz" type="time"></div><div><label for="w-ovp">Verzamelpunt (mag leeg)</label><input id="w-ovp" name="oefVp" placeholder="Bijv. de kantine"></div></div>
        <p class="zacht klein">Verzamelen leeg = een half uur voor de aftrap (thuis) of een uur (uit).</p>
        <div id="w-oefadres" hidden><label for="w-oad">Adres van de tegenstander (voor de routeknop)</label><input id="w-oad" name="oefAdres" placeholder="Begin te typen: straat of sportpark" data-adres autocomplete="off"></div></div>
      <div id="w-activ" hidden><label for="w-n">Wat gaan we doen?</label><input id="w-n" name="naam" placeholder="Bijv. Pleintjesvoetbal"><div class="twee"><div><label for="w-vz">Verzamelen (mag leeg)</label><input id="w-vz" name="verzamel" type="time"></div><div><label for="w-e">Tot</label><input id="w-e" name="eind" type="time"></div></div><label for="w-vp">Verzamelpunt (mag leeg)</label><input id="w-vp" name="verzamelpunt" placeholder="Bijv. de trap naast paviljoen Zuid"><label for="w-p">Waar?</label><input id="w-p" name="plaats" placeholder="Bijv. Cruyff Court Osdorp"><label for="w-ad">Adres (voor de routeknop, mag leeg)</label><input id="w-ad" name="adres" placeholder="Begin te typen, bijv. Louis de Visserplein" data-adres autocomplete="off"><label for="w-tl">Toelichting (mag leeg)</label><input id="w-tl" name="toelichting" placeholder="Bijv. neem gymschoenen en een bidon mee">
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
    f.querySelector('#w-nieuw').hidden = v === 'afgelast'; f.querySelector('#w-afg').hidden = v !== 'afgelast';
    f.querySelector('#w-tegen').hidden = v !== 'oefen';
    f.querySelector('#w-activ').hidden = v !== 'activiteit'; f.querySelector('#w-veld').closest('div').hidden = v === 'activiteit' || (v === 'oefen' && f.oefThuis.value === '0');
    f.querySelector('label[for="w-tijd"]').textContent = v === 'oefen' ? 'Aftrap' : 'Tijd';
  });
  // Besluit 92: oefenwedstrijd thuis of uit; uit = adres, geen veld
  CC.on('wijzigOefThuis', (el) => { const f = el.form; const uit = f.oefThuis.value === '0'; f.querySelector('#w-oefadres').hidden = !uit; f.querySelector('#w-veld').closest('div').hidden = uit; });
  // Besluit 90: waar en wanneer verzamelen, en het adres, in berichten (platte tekst)
  CC.actWaar = (a) => `${a.verzamel || a.verzamelpunt ? ` Verzamelen${a.verzamel ? ` om ${a.verzamel}` : ''}${CC.vpunt(a) ? ` bij ${CC.vpunt(a)}` : ''}.` : ''}${a.adres ? `\nAdres: ${a.adres}` + '\n' : ''}`;
  CC.oefenTekst = (a) => `Oefenwedstrijd ${a.thuis === false ? 'uit' : 'thuis'}${a.tegen ? ` tegen ${a.tegen}` : ''} op ${D.lang(a.datum)}, aftrap ${a.tijd}${a.thuis !== false && a.veld ? ` (${a.veld})` : ''}.${CC.actWaar(a.thuis === false ? a : { ...a, adres: '' })} Kan je kind niet? Meld af in ClubComm.`;
  CC.on('wijzigPlanning', (f) => {
    const tid = CC.teamId(); const t = M.team(S, tid); const me = CC.me(); const wat = f.wat.value;
    let tekst = ''; let toel = ''; let verloopt = null; let actId = null; // Besluit 80: het bericht vervalt na de dag van de activiteit
    if (wat === 'afgelast' || wat === 'verplaats') {
      const a = M.act(S, f.act.value); if (!a) return CC.toast('Kies een training', 'fout');
      if (wat === 'afgelast') { a.afgelast = true; tekst = `Training van ${D.lang(a.datum)} gaat niet door.`; toel = f.afgToel.value.trim(); } // eigen toelichting in hetzelfde bericht
      else { const oud = `${D.kort(a.datum)} ${a.tijd}`; if (!a.origDatum) a.origDatum = a.datum; a.verplaatst = true; a.datum = f.datum.value; a.tijd = f.tijd.value; a.veld = f.veld.value; a.eind = CC.plusMin(a.tijd, 75); tekst = `Training van ${oud} is verplaatst naar ${D.lang(a.datum)} ${a.tijd} op ${a.veld}.`; }
      verloopt = a.datum;
    } else {
      if (wat === 'activiteit' && !f.naam.value.trim()) return CC.toast('Vul in wat jullie gaan doen', 'fout');
      const a = wat === 'activiteit'
        ? { id: 'a' + Date.now(), teamId: tid, soort: 'activiteit', naam: f.naam.value.trim(), datum: f.datum.value, tijd: f.tijd.value, eind: f.eind.value || CC.plusMin(f.tijd.value, 90), verzamel: f.verzamel.value || '', verzamelpunt: f.verzamelpunt.value.trim(), plaats: f.plaats.value.trim(), adres: f.adres.value.trim(), toelichting: f.toelichting.value.trim(), veld: '', afgelast: false, opgave: f.opgave.checked, opgaveTot: f.opgave.checked ? (f.opgaveTot.value || f.datum.value) : null, herinneringen: [...f.querySelectorAll('[name=hr]:checked')].map((x) => Number(x.value)), herinnerd: [] }
        : wat === 'oefen' ? (() => { const thuis = f.oefThuis.value !== '0'; // Besluit 92
          return { id: 'a' + Date.now(), teamId: tid, soort: 'oefen', extra: true, datum: f.datum.value, tijd: f.tijd.value, eind: CC.plusMin(f.tijd.value, CC.categorie(t.cat).duur + 15), veld: thuis ? f.veld.value : '', tegen: f.tegen.value.trim(), thuis,
            verzamel: f.oefVz.value || CC.plusMin(f.tijd.value, thuis ? -30 : -60), verzamelpunt: f.oefVp.value.trim(), adres: thuis ? (S.club.sportpark || '') : f.oefAdres.value.trim(), afgelast: false }; })()
        : { id: 'a' + Date.now(), teamId: tid, soort: 'training', extra: true, datum: f.datum.value, tijd: f.tijd.value, eind: CC.plusMin(f.tijd.value, 75), veld: f.veld.value, tegen: f.tegen.value, thuis: true, verzamel: f.tijd.value, adres: S.club.sportpark || '', afgelast: false };
      S.acts.push(a); S.acts.sort((x, y) => (x.datum + x.tijd).localeCompare(y.datum + y.tijd)); verloopt = a.datum; actId = a.id;
      tekst = wat === 'activiteit' ? `${a.naam} op ${D.lang(a.datum)} van ${a.tijd} tot ${a.eind}${a.plaats ? ` bij ${a.plaats}` : ''}.${CC.actWaar(a)}${a.toelichting ? ` ${a.toelichting}` : ''}${a.opgave ? ` Geef je kind vóór ${D.lang(a.opgaveTot)} op in ClubComm: ja of nee.` : ' Kan je kind niet? Meld af in ClubComm.'}` : wat === 'oefen' ? CC.oefenTekst(a) : `Extra training op ${D.lang(a.datum)} om ${a.tijd} (${a.veld}).`;
    }
    const now = new Date().toISOString();
    S.msgs.push({ id: 'b' + Date.now(), van: me.id, vanRol: (CC.rol() || {}).rol, soort: 'nieuws', verloopt, actId, bereik: tid, onderwerp: wat === 'activiteit' ? `Nieuw: ${f.naam.value.trim()}` : wat === 'afgelast' ? `Training ${D.kort(verloopt)} gaat niet door` : wat === 'oefen' ? `Oefenwedstrijd ${D.kort(f.datum.value)}${f.tegen.value.trim() ? ` tegen ${f.tegen.value.trim()}` : ''}` : 'Wijziging in de planning', tekst: toel ? `${tekst}\n\n${toel}` : tekst, tijd: now, ontvangers: M.oudersVan(S, tid), gelezen: [], antw: [], urgent: ['afgelast', 'verplaats'].includes(wat) || (wat !== 'activiteit' && !!verloopt && verloopt <= D.addDays(D.vandaag(), 1)) /* Besluit 92: urgent alleen bij afgelasten/verplaatsen of iets voor vandaag of morgen */, gepland: null });
    const hjo = S.people.filter((p) => p.rollen.some((r) => r.rol === 'hjo')).map((p) => p.id);
    const info = [...new Set([...hjo, ...M.stafVan(S, tid)])].filter((x) => x && x !== me.id);
    S.msgs.push({ id: 'b' + Date.now() + 1, van: 'systeem', soort: 'melding', bereik: 'Ter informatie', onderwerp: `Planning ${CC.tn(tid)} gewijzigd`, tekst: `${me.naam}: ${tekst} Je hoeft niets te doen.`, tijd: now, ontvangers: info, gelezen: [], antw: [], urgent: false, gepland: null });
    S.wijzigingen.push({ id: 'w' + Date.now(), teamId: tid, door: me.id, tekst, tijd: now });
    if (CC.ogAfgelast) CC.ogAfgelast(S); // gesprekken rond een afgelaste of verplaatste training (Besluit 71)
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
  // Besluit 85: rijdt het kind met iemand anders mee, dan hoort die chauffeur dat meteen (persoonlijk bericht, dus ook een pushmelding)
  CC.ritVervalt = (S, a, pl, waarom) => { const v = S.vervoer[a.id]; const ch = v && v.plek[pl.id]; const me = CC.me();
    if (!ch || ch === me.id || pl.ouders.includes(ch) || !M.persoon(S, ch)) return;
    S.msgs.push({ id: 'b' + Date.now() + pl.id + a.id, van: me.id, vanRol: (CC.rol() || {}).rol, soort: 'persoonlijk', bereik: M.persoon(S, ch).naam, onderwerp: `${pl.voornaam} rijdt ${D.kort(a.datum)} niet mee`,
      tekst: `${pl.voornaam} rijdt ${D.lang(a.datum)} niet met je mee naar ${h.actTitel(S, a).replace(/<[^>]*>/g, '')}: ${waarom}. Je hoeft ${pl.voornaam} dus niet op te halen.`, tijd: new Date().toISOString(), gepland: null, ontvangers: [ch], gelezen: [], antw: [], urgent: false }); };
  CC.on('bevestigAfmelden', (f) => {
    const a = M.act(S, f.dataset.act2); const pl = M.speler(S, f.dataset.speler);
    S.afm.push({ id: 'f' + Date.now(), spelerId: pl.id, actId: a.id, reden: f.reden.value, opm: f.opm.value, tijd: new Date().toISOString(), door: CC.me().id });
    if (M.isWed(a) || a.soort === 'activiteit') CC.ritVervalt(S, a, pl, `${pl.voornaam} is afgemeld`);
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
  // Spelerpagina (Besluit 61): actie eerst. Info in de kop bij de naam (team · speeltijd · beoordeling), dan ouders
  // (bellen/appen), cijfers, beoordeling, gesprekken + "Contact vastleggen", geschiedenis (laatste 5, "Toon meer").
  // Langdurig afwezig melden doet de ouder, niet de staf.
  CC.views.speler = (S, p) => {
    const pl = M.speler(S, p.id); const t = M.team(S, pl.teamId);
    const per = M.periode(S, h.segVal('spPer', 'blok'));
    const st = M.stats(S, pl, per); const k = M.kaarten(S, pl); const z = M.zone(S, st.pct, t.id);
    const lang = S.lang.find((l) => l.spelerId === pl.id && l.tot >= D.vandaag());
    const rol = CC.rol().rol; const staf = rol !== 'ouder';
    const ouders = pl.ouders.map((o) => M.persoon(S, o)).filter(Boolean);
    const b = CC.beoordLaatste && CC.beoordLaatste(S, pl.id);
    const gespr = S.gesprekken.filter((g) => g.spelerId === pl.id).sort((a, b) => String(b.datum).localeCompare(String(a.datum))); // nieuwste eerst (Besluit 81)
    const sp = M.speeltijdStand ? M.speeltijdStand(S, pl) : null;
    const dp = staf && M.doelpuntenSeizoen ? M.doelpuntenSeizoen(S, pl.id) : 0;
    const kopSub = [CC.tn(pl.teamId), sp && sp.pct != null ? `${sp.pct}% speeltijd` : '', dp ? `${dp} ${dp === 1 ? 'doelpunt' : 'doelpunten'}` : '', staf && CC.zicht('beoordeling') ? (CC.laatsteVerslag && CC.laatsteVerslag(S, pl.id) ? `gesprek gehad (${CC.laatsteVerslag(S, pl.id).m.naam.toLowerCase()})` : '') : ''].filter(Boolean).join(' · ');
    const oudersBlok = staf && ouders.length ? `${h.sectie(ouders.length > 1 ? 'Ouders' : 'Ouder')}<div class="lijst">${ouders.map((o) => CC.contactRij(o)).join('')}</div>` : '';
    // Positie (Besluit 71): keeper of veldspeler. Bepaalt de vaardigheden in het ontwikkelgesprek en wie op doel staat.
    const posBlok = staf ? `<div class="zelfrij posrij"><span><b>Positie</b></span><span class="niveaus">${[['', 'Veldspeler'], ['keeper', 'Keeper']].map(([k, l]) => `<button type="button" class="${(pl.positie || '') === k ? 'aan' : ''}" data-act="zetPositie" data-id="${pl.id}" data-v="${k}" aria-pressed="${(pl.positie || '') === k}">${l}</button>`).join('')}</span></div>` : '';
    const langBlok = (kort) => (lang ? `<div class="info">${icon('hospital')}<span><b>Langdurig afwezig</b>${kort ? '' : ` (${esc(lang.reden.toLowerCase())})`} tot ongeveer ${D.kort(lang.tot)}.${!kort && CC.zicht('toelichting') ? ' ' + esc(lang.opm || '') : ''}</span></div>` : '');
    // Teamleider die geen spelerszaken volgt: alleen de volgende activiteit en de ouders
    if (!CC.volgtSpelers(t.id)) {
      const v = M.komend(S, t.id, 6).find((x) => !x.afgelast);
      return { titel: M.naam(S, pl), sub: kopSub, html: `${v ? `<p class="klein">${D.relatief(v.datum)} · ${h.actTitel(S, v)}: ${h.chip(M.status(S, pl, v))}</p>` : ''}${langBlok(true)}${oudersBlok}` };
    }
    // Besluit 86: alleen de uitzonderingen (afgemeld, te laat, niet afgemeld, langdurig). "Aanwezig" is de norm en vult de lijst niet.
    // Kaarten staan als label bij de activiteit waar ze bij horen; de redenen in één zin erboven.
    const kaartVan = {}; k.ev.forEach((e) => { (kaartVan[e.act.id] || (kaartVan[e.act.id] = [])).push(e); });
    const kaartChip = (e) => { const tt = CC.kaartTitel(e).replace(/<[^>]*>/g, ''); return `<span class="chip ${/rode/i.test(tt) ? 'rood' : /gele/i.test(tt) ? 'geel' : 'grijs'} mini">${esc(tt)}${e.geaccepteerd ? ' · geaccepteerd' : ''}</span>`; };
    const uitz = st.lijst.slice().reverse().filter(({ st: s }) => s.code !== 'aanwezig');
    const redenTekst = Object.entries(st.redenen).sort((a, b2) => b2[1] - a[1]).map(([r, c]) => `${c}× ${esc(r.toLowerCase())}`).join(', ');
    const uitzBlok = `${h.sectie('Uitzonderingen')}<p class="klein zacht">${st.totaal ? `${st.aanwezig} van de ${st.totaal} keer er${redenTekst ? ` · ${redenTekst}` : ''}${st.telaat ? ` · ${st.telaat}× te laat` : ''}` : 'Nog geen aanwezigheid bijgehouden.'}</p>
      ${uitz.length ? h.eerst(uitz.map(({ act, st: s }) => h.rij({ ic: h.datumBlok(act), titel: h.actTitel(S, act), sub: [s.afm && s.afm.opm && CC.zicht('toelichting') ? esc(s.afm.opm) : '', (s.laat ? '<span class="chip geel mini">te laat afgemeld</span>' : '') + (kaartVan[act.id] || []).map(kaartChip).join(' ')].filter(Boolean).join('<br>'), rechts: h.chip(s) })), 5) : st.totaal ? `<p class="klein">${icon('circle-check')} Altijd aanwezig. Top!</p>` : ''}`;
    const beoBlok = staf && CC.zicht('beoordeling') && (b || CC.mag('beoordelen'))
      ? `${h.sectie(b ? `Ontwikkeling · jouw kijk (${esc(b.m.naam.toLowerCase())}, alleen staf)` : 'Ontwikkeling')}${b ? `<div class="scores">${Object.entries(b.x.scores).map(([v, s]) => `<span>${esc(v)} ${CC.scoreTekst(t, s)}</span>`).join('')}</div>` : '<p class="zacht klein">Nog geen eigen kijk ingevuld (hoeft pas voor het voorjaar).</p>'}${CC.mag('beoordelen') ? `<div class="knoppen"><button class="knop licht klein" data-act="open" data-view="beoordelen">${icon('eye-off')}Jouw kijk</button>${CC.views.gesprekVerslag && CC.actiefMoment ? `<button class="knop licht klein" data-act="open" data-view="gesprekVerslag" data-id="${pl.id}" data-m="${CC.actiefMoment(S).id}">${icon('users')}Gesprekspagina</button>` : ''}${CC.gesprekkenGehad && CC.gesprekkenGehad(S, pl.id).length ? `<button class="knop licht klein" data-act="open" data-view="beoordelingKind" data-id="${pl.id}">${icon('flag')}Alle gesprekken (${CC.gesprekkenGehad(S, pl.id).length})</button>` : ''}</div>` : ''}`
      // Ouder (Besluit 67): nooit de kijk van de trainer, wel wat in het gesprek samen is afgesproken
      : !staf && CC.laatsteVerslag && CC.laatsteVerslag(S, pl.id) ? `${h.sectie('Wapen en doelen')}<div class="kaartje">${CC.verslagVoorOuder(S, pl, CC.laatsteVerslag(S, pl.id).m.id)}</div><button class="linkknop" data-act="open" data-view="beoordelingKind" data-id="${pl.id}">Alle gesprekken</button>` : '';
    const gesprBlok = staf && CC.zicht('gesprekken') ? `${h.sectie('Gesprekken')}${gespr.length ? h.eerst(gespr.map((g) => h.rij({ ic: g.soort === 'gesprek' ? 'users' : g.soort === 'geappt' ? 'message-circle' : g.soort === 'geaccepteerd' ? 'circle-check' : 'phone', titel: `${D.kort(g.datum)} · ${CC.gesprekLabel(g)} · ${esc((M.persoon(S, g.door) || { naam: '' }).naam)}`, sub: esc(g.notitie) + (g.afspraak ? `<br><b>Afspraak:</b> ${esc(g.afspraak)}` : '') })), 3, 'lijst') : '<p class="zacht klein">Nog geen gesprekken vastgelegd.</p>'}${CC.zicht('contact') ? `<button class="knop licht klein" data-act="gesprekVastleggen" data-id="${pl.id}">${icon('phone')}Contact vastleggen</button>` : ''}` : '';
    return {
      titel: M.naam(S, pl), sub: kopSub,
      html: `${oudersBlok}${posBlok}
      ${h.seg('spPer', [['blok', h.faseLabel(S)], ['seizoen', 'Heel seizoen']], 'blok')}
      <div class="cijfers"><div class="cijfer ${z}"><b>${st.pct == null ? '–' : st.pct + '%'}</b><small>aanwezig</small></div><div class="cijfer"><b>${st.telaat}×</b><small>te laat</small></div><div class="cijfer"><b>${h.kaartjes(k) || '–'}</b><small>kaarten seizoen</small></div></div>
      <p class="klein zacht">${h.split(st)}</p>
      ${langBlok(false)}
      ${beoBlok}
      ${gesprBlok}
      ${uitzBlok}`,
    };
  };
  CC.on('zetPositie', (el) => { const pl = M.speler(S, el.dataset.id); if (el.dataset.v) pl.positie = el.dataset.v; else delete pl.positie; CC.save(); CC.render(); CC.toast(el.dataset.v ? `${pl.voornaam} staat nu als keeper` : `${pl.voornaam} staat nu als veldspeler`); });
  CC.kaartIc = (e) => (e.kaart === 'herinnering' ? 'mail' : `<span class="kaart ${e.kaart}${e.geaccepteerd ? ' vaag' : ''}">${e.tweedeGeel ? '2' : '1'}</span>`);
  CC.kaartTitel = (e) => (e.kaart === 'herinnering' ? 'Vriendelijke herinnering' : e.kaart === 'geel' ? 'Gele kaart' : e.tweedeGeel ? 'Rode kaart (tweede gele)' : 'Rode kaart');
  CC.gesprekLabel = (g) => ({ gesprek: 'Persoonlijk gesprek', geappt: 'Geappt', geaccepteerd: 'Begrijpelijk, geaccepteerd' }[g.soort] || 'Gebeld');
  // Besluit 67: woorden in plaats van cijfers (sterk / goed / werkpunt); oude cijfers worden omgezet
  CC.scoreTekst = (t, s) => { const n = CC.niveau(s); return n ? `<span class="niveau n${n}">${CC.NIVEAU_TRAINER[n]}</span>` : '–'; };
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
