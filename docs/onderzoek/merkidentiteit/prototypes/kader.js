// Kader rond elk prototype (hoort NIET bij het ontwerp): navigatie tussen onderdelen, clubwissel, ?toon=onderdeel voor schermafbeeldingen.
(() => {
  const CLUBS = { voorbeeld: ['VV De Voorbeeldclub', 'VDV', '#B3122E', '#FFFFFF'], blauwvoet: ['SV Blauwvoet', 'SVB', '#0B4EA2', '#FFFFFF'], geel: ['FC Zonnedorp', 'FCZ', '#1A1A1A', '#F2C200'] };
  window.zetClub = (k) => { const c = CLUBS[k]; const r = document.documentElement.style;
    r.setProperty('--club', c[2]); r.setProperty('--club-op', c[3]);
    document.querySelectorAll('[data-clubnaam]').forEach((e) => { e.textContent = c[0]; });
    document.querySelectorAll('[data-clubkort]').forEach((e) => { e.textContent = c[1]; }); };
  const q = new URLSearchParams(location.search);
  addEventListener('DOMContentLoaded', () => {
    const toon = q.get('toon'); if (toon) { document.body.classList.add('los');
      document.querySelectorAll('[data-deel]').forEach((s) => { s.hidden = s.dataset.deel !== toon; }); }
    zetClub(q.get('club') || 'voorbeeld');
    const k = document.createElement('nav'); k.className = 'kader';
    k.innerHTML = `<b>${document.title}</b> ${[...document.querySelectorAll('[data-deel]')].map((s) => `<a href="#${s.id}">${s.dataset.naam}</a>`).join('')}
      <span>Club: ${Object.keys(CLUBS).map((c) => `<button onclick="zetClub('${c}')">${CLUBS[c][0]}</button>`).join('')}</span> <a href="index.html">Alle richtingen</a>`;
    if (!toon) document.body.prepend(k);
  });
})();
