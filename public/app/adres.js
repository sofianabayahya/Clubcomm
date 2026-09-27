// ClubComm — adres aanvullen tijdens het typen (Besluit 43).
// Bron: PDOK Locatieserver (Nederlandse overheid, gratis, geen sleutel): adressen, straten, pleinen en postcodes.
// Daarnaast eigen suggesties: het sportpark van de club en adressen die al eerder bij activiteiten zijn gebruikt.
// Werkt op elk invoerveld met data-adres; de lijst verschijnt onder het veld.
(function () {
  const CC = window.CC;
  const PDOK = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest';
  let timer = null, vraag = 0, lijst = null, veld = null;

  const eigen = (q) => {
    const S = CC.S && CC.S(); if (!S) return [];
    const bekend = [S.club && S.club.sportpark, ...(S.acts || []).map((a) => a.adres)].filter(Boolean);
    const k = q.toLowerCase();
    return [...new Set(bekend)].filter((a) => a.toLowerCase().includes(k)).slice(0, 3);
  };
  const sluit = () => { if (lijst) lijst.remove(); lijst = null; };
  const toon = (el, items) => {
    sluit(); if (!items.length) return;
    lijst = document.createElement('div'); lijst.className = 'adreslijst'; lijst.setAttribute('role', 'listbox');
    items.forEach((tekst) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'adreskeuze'; b.setAttribute('role', 'option'); b.textContent = tekst;
      // mousedown i.p.v. click: het veld verliest anders eerst de focus en de lijst verdwijnt
      b.addEventListener('mousedown', (e) => { e.preventDefault(); kies(el, tekst); });
      b.addEventListener('touchend', (e) => { e.preventDefault(); kies(el, tekst); });
      lijst.appendChild(b);
    });
    el.insertAdjacentElement('afterend', lijst);
  };
  const kies = (el, tekst) => { el.value = tekst; sluit(); el.dispatchEvent(new Event('change', { bubbles: true })); };

  const zoek = async (el) => {
    const q = el.value.trim(); const nr = ++vraag;
    if (q.length < 3) return sluit();
    const lokaal = eigen(q);
    toon(el, lokaal);
    try {
      const url = `${PDOK}?q=${encodeURIComponent(q)}&fq=${encodeURIComponent('type:(adres OR weg OR postcode OR woonplaats)')}&rows=6`;
      const r = await fetch(url); if (!r.ok) return;
      const j = await r.json(); if (nr !== vraag || document.activeElement !== el) return;
      const pdok = ((j.response && j.response.docs) || []).map((d) => d.weergavenaam).filter(Boolean);
      toon(el, [...new Set([...lokaal, ...pdok])].slice(0, 7));
    } catch (e) { /* geen internet of PDOK even niet bereikbaar: dan alleen eigen suggesties */ }
  };

  document.addEventListener('input', (e) => {
    const el = e.target; if (!el.matches || !el.matches('input[data-adres]')) return;
    veld = el; clearTimeout(timer); timer = setTimeout(() => zoek(el), 250);
  });
  document.addEventListener('focusout', (e) => { if (e.target === veld) setTimeout(sluit, 150); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') sluit(); });
})();
