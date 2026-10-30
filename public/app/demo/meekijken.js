// ClubComm — DEMO (simulatie), branch demo/swift-trainer. CONCEPT van voorstel 032 / Besluit 134: de begeleider (HO of TC)
// kijkt mee met de trainingen van een trainer met een traject. Alleen lezen. Bestaat NIET in de echte app; de rechten hiervoor
// (scope 'trainerplan') bootst app/vendor/supabase.js na, en supabase/tests/demo-rechten.sh vergelijkt ze met migratie 032.
(function () {
  const CC = window.CC; const esc = CC.esc, icon = CC.icon, h = CC.h, D = CC.date, M = CC.m;
  const LABEL = '<span class="demo-concept">CONCEPT · voorstel 032 · bestaat nog niet in de echte app</span>';
  const actVan = (S, p) => S.acts.find((a) => a.id === p.actId) || { datum: p.datum || '', tijd: '' };
  const vormNaam = (S, id) => ((S.vormen || []).find((v) => v.id === id) || {}).naam || 'Vorm';
  const BLOK = { start: 'Start', S: 'Spacing', P: 'Partij' };
  const blokNaam = (b) => BLOK[b] || (b ? `Blok ${b}` : '');
  const minuten = (p) => (p.onderdelen || []).reduce((t, o) => t + (Number(o.min) || 0), 0) + (p.overig ? Number(p.overig.min) || 0 : 0);
  const plannenVan = (S, pid) => (S.trainingsplannen || []).filter((p) => p.eigenaar === pid && !p.week)
    .sort((x, y) => (actVan(S, y).datum + actVan(S, y).tijd).localeCompare(actVan(S, x).datum + actVan(S, x).tijd));

  const origDetail = CC.views.trainerDetail;
  CC.views.trainerDetail = (S, p) => {
    const basis = origDetail(S, p); const rol = (CC.rol() || {}).rol;
    if (!['hjo', 'tc'].includes(rol) || !basis || typeof basis.html !== 'string') return basis;
    const lijst = plannenVan(S, p.id);
    const blok = `${h.sectie('Trainingen van de trainer')}<div class="kaartje demo-meekijk">${LABEL}
      ${lijst.length ? `<div class="lijst compact">${lijst.map((x) => { const a = actVan(S, x); const vormen = (x.onderdelen || []).filter((o) => o.vormId).map((o) => vormNaam(S, o.vormId));
        return h.rij({ ic: 'list-checks', titel: `${esc(a.datum ? D.kort(a.datum) : 'Zonder datum')}${a.tijd ? ` · ${esc(a.tijd)}` : ''} · ${esc(x.thema || 'Training')}`,
          sub: `${minuten(x)} min · ${vormen.length ? esc(vormen.join(', ')) : 'nog geen vormen'}${x.gegeven ? ' · gegeven' : ''}`, act: 'demoMeekijk', attrs: `data-id="${esc(x.id)}"` }); }).join('')}</div>`
        : '<p class="zacht">De trainer heeft nog geen training voorbereid.</p>'}
      <p class="zacht klein">Alleen lezen. Je ziet dit omdat de trainer een traject heeft en de club meekijken heeft aangezet (in deze simulatie altijd aan).</p></div>`;
    return { ...basis, html: basis.html + blok };
  };

  CC.on('demoMeekijk', (el) => {
    const S = CC.S(); const x = (S.trainingsplannen || []).find((p) => p.id === el.dataset.id); if (!x) return;
    const a = actVan(S, x); const tr = M.persoon(S, x.eigenaar) || { naam: '' };
    const rijen = (x.onderdelen || []).map((o) => `<li><b>${esc(blokNaam(o.blok))}</b> · ${o.spacing ? 'spacing' : o.vormId ? esc(vormNaam(S, o.vormId)) : esc(o.naam || 'lege plek')} · ${Number(o.min) || 0} min</li>`).join('');
    CC.sheet(`Training ${a.datum ? D.kort(a.datum) : ''} · ${esc(tr.naam)}`, `${LABEL}
      <p><b>${esc(x.thema || 'Training')}</b> · ${minuten(x)} min${a.tijd ? ` · ${esc(a.tijd)}${a.eind ? `–${esc(a.eind)}` : ''}` : ''}</p>
      ${rijen ? `<ol class="demo-blokken">${rijen}</ol>` : '<p class="zacht">Nog geen onderdelen.</p>'}
      ${x.overig ? `<p class="zacht klein">${esc(x.overig.naam || 'Organisatie')}: ${Number(x.overig.min) || 0} min</p>` : ''}
      ${x.anders ? `<p><b>Na de training (notitie van de trainer)</b><br>${esc(x.anders)}</p>` : ''}
      <p class="zacht klein">Alleen lezen: alleen de trainer kan zijn training wijzigen.</p>`);
  });
})();
