// ClubComm — onderhoud op de achtergrond (Besluit 63)
// 1. Fouten automatisch vastleggen: gaat er bij iemand iets mis, dan komt dat in Supabase (tabel fout), zonder dat de
//    gebruiker het hoeft te melden. Alleen technische gegevens; hooguit 20 per sessie, dezelfde fout maar één keer.
// 2. Zelf verversen bij een nieuwe versie: bij het openen (terugkomen in de app) kijkt de app of er een nieuwere versie
//    online staat (versie.json, gemaakt bij elke publicatie). Zo ja, dan eerst alles opslaan en dan herladen, maar
//    nooit terwijl iemand typt of een venster open heeft.
(function () {
  const CC = window.CC; if (!CC) return;
  const toestel = () => `${/iPhone|iPad/.test(navigator.userAgent) ? 'iPhone' : /Android/.test(navigator.userAgent) ? 'Android' : 'Computer'}${(window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone ? ' · beginscherm' : ''}`;
  const plek = () => { try { const v = CC.ui && CC.ui.view; return `${CC.rol ? CC.rol().rol : '?'} · ${v ? 'scherm ' + v.naam : 'tab ' + (CC.ui ? CC.ui.tab : '?')}`; } catch (e) { return '?'; } };

  // ---------- 1. Fouten ----------
  const gezien = new Set(); let aantal = 0;
  CC.meldFout = (err, waar) => {
    try {
      if (!CC.live || !CC.sb || aantal >= 20) return;
      const bericht = String((err && err.message) || err || 'onbekende fout').slice(0, 500);
      if (gezien.has(bericht)) return; gezien.add(bericht); aantal++;
      CC.sb.rpc('fout_melden', { p_club: CC.clubId ? CC.clubId() : null, p_bericht: bericht, p_stack: String((err && err.stack) || '').slice(0, 2000), p_plek: `${waar ? waar + ' · ' : ''}${plek()}`, p_toestel: toestel(), p_versie: CC.VERSIE || null }).then(() => {}, () => {});
    } catch (e) { /* een fout bij het melden van een fout negeren we */ }
  };
  window.addEventListener('error', (e) => { if (e && (e.error || e.message)) CC.meldFout(e.error || e.message, 'js'); });
  window.addEventListener('unhandledrejection', (e) => CC.meldFout(e && e.reason, 'belofte'));

  // Beheerder: overzicht van de fouten van de laatste 30 dagen
  CC.views.fouten = (S) => {
    if (!CC.foutLijst) { CC.foutLijst = 'laden'; CC.sb.rpc('fouten_lijst').then(({ data, error }) => { CC.foutLijst = error ? [] : data || []; CC.render(); }); }
    const l = Array.isArray(CC.foutLijst) ? CC.foutLijst : null;
    return { titel: 'Foutmeldingen', sub: 'Laatste 30 dagen, automatisch vastgelegd',
      html: l == null ? '<p class="zacht">Even laden…</p>' : l.length ? `<p class="zacht klein">Dezelfde fout staat één keer, met hoe vaak hij voorkwam. Stuur dit door aan de ontwikkelaar als er iets vaak terugkomt.</p><div class="lijst">${l.map((f) => CC.h.rij({ ic: 'circle-alert', titel: CC.esc(f.bericht), sub: `${f.aantal}× · laatst ${CC.date.tijdstip(f.tijd)} · ${CC.esc(f.plek || '')} · ${CC.esc(f.toestel || '')}` })).join('')}</div>` : CC.h.leeg('Geen fouten 👍', 'circle-check') };
  };
  CC.on('foutenOpen', () => { CC.foutLijst = null; CC.open('fouten'); });

  // ---------- 2. Nieuwe versie ----------
  const haalVersie = () => fetch('/versie.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((j) => (j && j.v) || null).catch(() => null);
  let wachtend = false;
  const veilig = () => {
    const a = document.activeElement; const typt = a && /INPUT|TEXTAREA|SELECT/.test(a.tagName);
    const sheet = document.getElementById('sheet'); const open = sheet && !sheet.hidden;
    return !typt && !open && (!CC.allesOpgeslagen || CC.allesOpgeslagen());
  };
  const controleer = async () => {
    if (!CC.live || document.hidden) return;
    const v = await haalVersie(); if (!v) return;
    if (!CC.VERSIE) { CC.VERSIE = v; return; }
    if (v === CC.VERSIE) return;
    if (veilig()) { location.reload(); return; }
    // Niet veilig: eerst opslaan en het straks opnieuw proberen
    wachtend = true; if (CC.save) CC.save();
  };
  if (CC.live) haalVersie().then((v) => { CC.VERSIE = v; });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) controleer(); });
  setInterval(() => { if (wachtend) controleer(); }, 20000);
  setInterval(controleer, 5 * 60000);
})();
