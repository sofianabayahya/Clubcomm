// ClubComm — schermafbeeldingen voor het document voor clubs (maak.js clubs), uit de demo met verzonnen gegevens
// ("VV De Voorbeeldclub"). Start eerst de app lokaal: PORT=5070 node server.js; dan: node docs/presentaties/shots-clubs.js
const { chromium } = require('@playwright/test');
const path = require('path');
const UIT = (n) => path.join(__dirname, 'beelden', `club-${n}.jpg`);

(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 })).newPage();
  await p.goto('http://localhost:5070/?demo'); await p.evaluate(() => localStorage.clear()); await p.goto('http://localhost:5070/?demo');
  // Zelfde hulp als de rondleiding (demo.js): als persoon, rol en tabblad
  const als = (wie, rol, tab) => p.evaluate(([wie, rol, tab]) => {
    CC.zetSessie(CC.S().demo[wie]); const i = CC.me().rollen.findIndex((r) => r.rol === rol); CC.wisselRol(i < 0 ? 0 : i);
    if (tab && tab !== 'home') CC.go(tab); window.scrollTo(0, 0);
  }, [wie, rol, tab]);
  const foto = async (n, voor) => { if (voor) await p.evaluate(voor); await p.waitForTimeout(300); await p.screenshot({ path: UIT(n), type: 'jpeg', quality: 88 }); console.log('klaar:', n); };
  await als('sanne', 'ouder'); await foto('ou-home');
  await p.click('#app button[data-act="afmelden"]'); await foto('ou-afmelden');
  await als('sanne', 'ouder', 'vervoer'); await foto('ou-vervoer');
  await als('mark', 'trainer'); await foto('tr-home');
  await als('mark', 'trainer', 'aanwezigheid'); await foto('tr-aanwezigheid');
  await als('mark', 'trainer', 'speeltijd'); await foto('tr-wedstrijd', () => { const k = document.querySelector('#app button[data-act="uitslagKlaar"]'); if (k) window.scrollTo(0, window.scrollY + (k.closest('.kaart') || k.parentElement).getBoundingClientRect().top - 120); });
  await als('linda', 'teamleider', 'wedstrijd'); await foto('tl-wedstrijd', () => { const k = [...document.querySelectorAll('#app .sectie-kop')].find((x) => x.innerText.startsWith('TAKEN') || x.innerText.startsWith('Taken')); if (k) window.scrollTo(0, window.scrollY + k.getBoundingClientRect().top - 330); });
  await als('peter', 'hjo'); await foto('hjo-home');
  await als('peter', 'hjo', 'inzicht'); await foto('hjo-inzicht');
  await als('peter', 'beheerder', 'regels'); await foto('beh-regels');
  await b.close();
})();
