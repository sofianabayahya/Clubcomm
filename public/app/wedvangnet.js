// ClubComm — Besluit 181: wedstrijd bijhouden zonder iets kwijt te raken.
// Gevonden 07-11: de database weigerde de timekeeper (upsert, zie migratie 035) en de app ververste daarna elke 30 seconden
// met de stand van de server, waardoor ingevoerde doelpunten steeds weer verdwenen.
// 1. Reservekopie: doelpunten en uitslag van een wedstrijd van vandaag (of gisteren/morgen) staan ook op deze telefoon.
// 2. Terugzetten: haalt het verversen ze weg terwijl de kopie er meer heeft, dan zet de app ze terug en probeert opnieuw
//    op te slaan (lukt dat niet, dan gaat het als voorstel naar de trainer, Besluit 117).
// 3. Scherm aan: zolang het scorebord van een lopende wedstrijd open staat, gaat het scherm niet op slot (Wake Lock).
(function () {
  const CC = window.CC; if (!CC) return; const D = CC.date, M = CC.m;
  const SLEUTEL = 'clubcomm-wed-';
  const VELDEN = ['goals', 'uitslag', 'uitslagKlaar', 'uitslagVerstuurd', 'uitslagStuur'];
  const lees = (id) => { try { return JSON.parse(localStorage.getItem(SLEUTEL + id) || 'null'); } catch (e) { return null; } };
  const schrijf = (id, v) => { try { if (v) localStorage.setItem(SLEUTEL + id, JSON.stringify(v)); else localStorage.removeItem(SLEUTEL + id); } catch (e) { /* privévenster: geen kopie */ } };
  const binnen = (a) => M.isWed(a) && !a.afgelast && a.datum >= D.addDays(D.vandaag(), -1) && a.datum <= D.addDays(D.vandaag(), 1);
  const ids = (a) => (a.goals || []).map((g) => g.id);
  const deel = (a) => Object.fromEntries(VELDEN.filter((k) => a[k] !== undefined && a[k] !== null).map((k) => [k, a[k]]));

  // Kopie bijwerken na elke wijziging (render volgt op elke actie); oude kopieën (> 2 dagen) opruimen
  const bewaar = (S) => {
    S.acts.filter(binnen).forEach((a) => { if (!(a.goals || []).length && !a.uitslag) return;
      const k = lees(a.id); const nu = deel(a);
      if (!k || JSON.stringify(k.d) !== JSON.stringify(nu)) schrijf(a.id, { t: Date.now(), d: nu }); });
    try { Object.keys(localStorage).filter((x) => x.startsWith(SLEUTEL)).forEach((x) => { const k = lees(x.slice(SLEUTEL.length)); if (!k || Date.now() - k.t > 2 * 864e5) localStorage.removeItem(x); }); } catch (e) { /* */ }
  };
  // Terugzetten: alleen als de server (na verversen) een deel mist en niets heeft wat de kopie niet heeft
  const herstel = (S) => { let n = 0;
    S.acts.filter(binnen).forEach((a) => { const k = lees(a.id); if (!k) return; const kop = k.d.goals || []; const nu = ids(a);
      const mist = kop.filter((g) => !nu.includes(g.id)); const vreemd = nu.filter((g) => !kop.some((x) => x.id === g));
      const uitslagWeg = k.d.uitslagKlaar && !a.uitslagKlaar;
      if ((!mist.length && !uitslagWeg) || vreemd.length) return;
      VELDEN.forEach((v) => { if (k.d[v] !== undefined) a[v] = JSON.parse(JSON.stringify(k.d[v])); }); n += mist.length || 1; });
    return n; };
  CC.wedHerstel = () => { const S = CC.S && CC.S(); if (!S || !S.acts) return 0; const n = herstel(S);
    if (n) { CC.save(); CC.toast(`${n === 1 ? 'Eén wijziging' : `${n} doelpunten`} van vandaag teruggezet van deze telefoon`); }
    return n; };

  // Scherm aan zolang het scorebord van een lopende wedstrijd zichtbaar is
  let slot = null; let wil = false;
  const scherm = async () => {
    wil = !!document.querySelector('[data-live-scorebord]');
    try {
      if (wil && !slot && navigator.wakeLock && document.visibilityState === 'visible') { slot = await navigator.wakeLock.request('screen'); slot.addEventListener('release', () => { slot = null; }); }
      if (!wil && slot) { await slot.release(); slot = null; }
    } catch (e) { slot = null; /* niet ondersteund of geweigerd: geen probleem */ }
  };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { if (CC.wedHerstel() ) CC.render(); else scherm(); } });

  const render0 = CC.render;
  CC.render = (...x) => {
    const S = CC.S && CC.S();
    if (S && S.acts) { try { if (herstel(S)) { CC.save(); CC.toast('Doelpunten van vandaag teruggezet van deze telefoon'); } bewaar(S); } catch (e) { console.warn(e); } }
    const uit = render0(...x); scherm(); return uit;
  };
  // Na verversen zonder nieuw scherm (verversen tekent alleen opnieuw als de server iets anders heeft)
  setInterval(() => { if (document.visibilityState === 'visible' && CC.wedHerstel()) CC.render(); }, 10000);
})();
