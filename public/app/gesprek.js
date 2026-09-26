// ClubComm — Ontwikkelgesprek (Besluit 66, vernieuwd in Besluit 67 en 68)
// Drie stukken, drie plekken, elk met eigen rechten:
// 1. Opdracht voor het kind (ontwVoorb, scope speler): het kind vult thuis in, de ouder helpt lezen. Per vaardigheid
//    sterk / gaat goed / wil ik beter in worden, een wapen (1–2) met "wanneer zie je dat?", trots, droom, leuk, lastig,
//    en in het voorjaar: hoe ging het met je doelen? Ouder en staf zien dit.
// 2. Kijk van de trainer (beoord, scope beoord): kort, wapen en werkpunt (lijst per vaardigheid ingeklapt). Startgesprek:
//    optioneel, het kind is aan zet. Voorjaar: vooraf invullen (Besluit 68). Alleen voor de staf (migratie 016).
//    In het gesprek stuurt de trainer door te vragen: bij verschil geeft de app een vraag om door te vragen.
// 3. Samen (ontwVerslag, scope spelerlees): wat in het gesprek is afgesproken: wapen, werkpunt, twee doelen,
//    "wat neem je mee?" en afspraken. De staf schrijft; de ouder ziet het zodra de trainer "Gesprek gehad" aantikt.
// Plus de notitie van de trainer (ontwNotitie, scope notitie): alleen de staf.
// Gesprek van 15 minuten: 12 minuten praten + 3 minuten wisselen, met een klok en leidraad op de gesprekspagina.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;
  const sl = (pl, mid) => `${pl}|${mid}`;
  const leeg = { voorb: () => ({ zelf: {}, wapens: [], wapenWanneer: '', trots: '', droom: '', leuk: '', lastig: '', doelTerug: {} }), verslag: () => ({ wapen: [], werkpunt: '', doelen: [], meenemen: '', afspraken: '', gehad: false }) };
  const voorb = (S, pl, mid) => (S.ontwVoorb || {})[sl(pl, mid)] || null;
  const verslag = (S, pl, mid) => (S.ontwVerslag || {})[sl(pl, mid)] || null;
  const kijk = (S, pl, mid) => (S.beoord[pl] || {})[mid] || null;
  const maakVoorb = (S, pl, mid) => { const o = S.ontwVoorb || (S.ontwVoorb = {}); return o[sl(pl, mid)] || (o[sl(pl, mid)] = leeg.voorb()); };
  const maakVerslag = (S, pl, mid) => { const o = S.ontwVerslag || (S.ontwVerslag = {}); return o[sl(pl, mid)] || (o[sl(pl, mid)] = leeg.verslag()); };
  const maakKijk = (S, pl, mid) => { const x = S.beoord[pl] || (S.beoord[pl] = {}); return x[mid] || (x[mid] = { scores: {}, wapens: [], goed: '', werken: '' }); };
  // Alle gespreksmomenten van een kind, ook uit eerdere seizoenen en bij een ander team (Besluit 71), oud → nieuw
  const momentenVan = (S, pl) => { const ids = new Set(CC.momenten(S).map((m) => m.id)); [S.ontwVoorb, S.ontwVerslag].forEach((o) => Object.keys(o || {}).forEach((k) => { const [p2, mid] = k.split('|'); if (p2 === pl) ids.add(mid); }));
    return [...ids].sort().map((id) => ({ id, naam: CC.momentNaam(S, id), label: CC.momentNaam(S, id, true) })); };
  const vorigMoment = (S, pl, mid) => { const l = momentenVan(S, pl).filter((m) => m.id < mid && (voorb(S, pl, m.id) || verslag(S, pl, m.id))); return l[l.length - 1] || null; };
  const gesprekVan = (S, pl, mid) => (S.ontwGesprek || []).find((g) => g.spelerId === pl && g.moment === mid);
  const STATUS = [['', 'Nog niet besproken'], ['bereikt', 'Bereikt'], ['deels', 'Deels'], ['niet', 'Nog niet']];
  const STATUS_KIND = [['bereikt', 'Gelukt'], ['deels', 'Een beetje'], ['niet', 'Nog niet']];
  const KORT_KIND = { 3: 'Sterk', 2: 'Gaat goed', 1: 'Beter worden' };
  const MAX_WAPEN = 2;
  // Kijk klaar (Besluit 68) = wapen én werkpunt gekozen; de lijst per vaardigheid is extra
  const kijkKlaar = (S, pl, mid) => { const k = kijk(S, pl, mid); return !!(k && wapensVan(k).length && k.werkpunt); };
  const niv = (o, x) => CC.niveau(o && o.scores ? o.scores[x] : o && o.zelf ? o.zelf[x] : null);
  const wapensVan = (o) => (o && Array.isArray(o.wapens) ? o.wapens : []);
  const vaardigNaam = (x) => `${esc(x)}${CC.VAARDIG_UITLEG[x] ? `<small class="zacht">${esc(CC.VAARDIG_UITLEG[x])}</small>` : ''}`;

  // Drie knoppen per vaardigheid (kind of trainer). Wordt meteen in de pagina bijgewerkt, zonder te verspringen.
  const niveauKnoppen = (act, attrs, cur, labels) => `<span class="niveaus" role="group">${[3, 2, 1].map((n) => `<button type="button" class="n${n} ${cur === n ? 'aan' : ''}" data-act="${act}" ${attrs} data-s="${n}" aria-pressed="${cur === n}">${labels[n]}</button>`).join('')}</span>`;
  const zetKnop = (el) => { el.parentNode.querySelectorAll('button').forEach((b) => { const aan = b === el; b.classList.toggle('aan', aan); b.setAttribute('aria-pressed', String(aan)); }); };

  // ---------- 1. Opdracht voor het kind (thuis, samen met een ouder) ----------
  CC.views.gesprekVoorb = (S, p) => {
    const pl = M.speler(S, p.id); const mid = p.m; const m = CC.momenten(S).find((x) => x.id === mid); const v = voorb(S, pl.id, mid) || leeg.voorb();
    const vaardig = CC.vaardighedenVan(S, pl); const g = gesprekVan(S, pl.id, mid); const at = `data-id="${pl.id}" data-m="${mid}"`;
    const tekstVeld = (k, label, ph) => `<label class="klein-kop" for="vb-${k}">${label}</label><textarea id="vb-${k}" rows="2" data-input="ogVoorbTekst" ${at} data-k="${k}" placeholder="${ph}">${esc(v[k] || '')}</textarea>`;
    const vm = vorigMoment(S, pl.id, mid); const vvs = vm && verslag(S, pl.id, vm.id); const oudeDoelen = vvs && vvs.gehad ? vvs.doelen.filter((d) => d.wat) : [];
    const terug = oudeDoelen.length ? `${h.sectie('Hoe ging het met je doelen?')}<div class="kaartje">${oudeDoelen.map((d, i) => `<div class="zelfrij"><span>${esc(d.wat)}</span>${`<span class="niveaus">${STATUS_KIND.map(([k, l]) => `<button type="button" class="${(v.doelTerug || {})[i] === k ? 'aan' : ''}" data-act="ogDoelTerug" ${at} data-i="${i}" data-s="${k}">${l}</button>`).join('')}</span>`}</div>`).join('')}</div>` : '';
    const sterk = vaardig.filter((x) => niv(v, x) === 3); const keuze = sterk.length ? sterk : vaardig; const w = wapensVan(v);
    return { titel: `Voorbereiding ${pl.voornaam}`, sub: g ? `Gesprek ${D.lang(g.datum)} om ${g.tijd}` : `${m ? m.naam : ''}gesprek`,
      html: `<div class="info">${icon('info')}<span>Dit is de opdracht voor <b>${esc(pl.voornaam)}</b> (ongeveer 10 minuten). Laat ${esc(pl.voornaam)} zelf kiezen en in eigen woorden schrijven; jij helpt met lezen. Er is geen goed of fout. De trainer vult apart zijn eigen kijk in; in het gesprek leggen jullie het naast elkaar. Alles wordt meteen bewaard.</span></div>
        ${tekstVeld('trots', 'Waar ben je trots op bij het voetballen?', 'Bijv. mijn eerste doelpunt met links')}
        ${terug}
        ${h.sectie('Hoe gaat het met…')}<p class="zacht klein">Kies bij elke vaardigheid: <b>Sterk</b>, <b>Gaat goed</b> of <b>Beter worden</b> (dat wil ik beter leren).</p>
        ${CC.vaardigBlokken(vaardig).map(([naam, l]) => `<div class="kaartje zelf"><h4>${esc(naam)}</h4>${l.map((x) => `<div class="zelfrij"><span>${vaardigNaam(x)}</span>${niveauKnoppen('ogZelf', `${at} data-v="${esc(x)}"`, niv(v, x), KORT_KIND)}</div>`).join('')}</div>`).join('')}
        ${h.sectie('Wat is je wapen? ⭐')}<p class="zacht klein">Je wapen is waar je écht goed in bent, waar tegenstanders last van hebben. Kies er 1, hooguit ${MAX_WAPEN}.${sterk.length ? '' : ' (Tip: kies eerst hierboven wat je sterk vindt.)'}</p>
        <div class="chips wapenkeuze">${keuze.map((x) => `<button type="button" class="chipknop ${w.includes(x) ? 'aan' : ''}" data-act="ogWapen" ${at} data-v="${esc(x)}">${w.includes(x) ? '⭐ ' : ''}${esc(x)}</button>`).join('')}</div>
        ${tekstVeld('wapenWanneer', 'Wanneer zie je je wapen in een wedstrijd?', 'Bijv. als ik op links sta en er ruimte is, ga ik er altijd langs')}
        ${h.sectie('Nog drie vragen')}
        ${tekstVeld('droom', 'Wat is je droom?', 'Bijv. ooit in het eerste van de club spelen')}
        ${tekstVeld('leuk', 'Wat vind je het leukst aan voetbal?', 'Bijv. scoren, samenspelen')}
        ${tekstVeld('lastig', 'Wat wil je graag beter leren?', 'Bijv. koppen, mijn linkerbeen')}
        <button class="knop vol" data-act="ogVoorbKlaar" ${at}>${icon('check')}${v.klaar ? 'Bewaard' : 'Klaar'}</button>` };
  };
  CC.on('ogZelf', (el) => { const S = CC.S(); maakVoorb(S, el.dataset.id, el.dataset.m).zelf[el.dataset.v] = Number(el.dataset.s); zetKnop(el); CC.save(); });
  CC.on('ogWapen', (el) => { const S = CC.S(); const v = maakVoorb(S, el.dataset.id, el.dataset.m); if (!Array.isArray(v.wapens)) v.wapens = []; const x = el.dataset.v; const i = v.wapens.indexOf(x);
    if (i >= 0) v.wapens.splice(i, 1); else { if (v.wapens.length >= MAX_WAPEN) return CC.toast(`Kies er hooguit ${MAX_WAPEN}. Tik eerst een ander weg.`, 'fout'); v.wapens.push(x); } CC.save(); CC.render(); });
  CC.on('ogDoelTerug', (el) => { const S = CC.S(); const v = maakVoorb(S, el.dataset.id, el.dataset.m); (v.doelTerug || (v.doelTerug = {}))[el.dataset.i] = el.dataset.s; zetKnop(el); CC.save(); });
  CC.on('ogVoorbTekst', (el) => { const S = CC.S(); maakVoorb(S, el.dataset.id, el.dataset.m)[el.dataset.k] = el.value; CC.save(); });
  CC.on('ogVoorbKlaar', (el) => { const S = CC.S(); const v = maakVoorb(S, el.dataset.id, el.dataset.m); v.klaar = v.klaar || new Date().toISOString(); CC.save(); CC.terug(); CC.toast('Dank je wel! De trainer kijkt ernaar in het gesprek.'); });

  // ---------- Klok en leidraad (15 minuten: 12 praten + 3 wisselen) ----------
  const FASEN = [
    [0, 'Welkom', '"Dit is geen rapport. We kijken samen hoe het gaat en wat jij wilt leren." Praat vooral met het kind.'],
    [1, 'Kind aan het woord', 'Waar ben je trots op? Wat is leuk, wat wil je leren? Laat het kind praten (80%), jij vraagt door.'],
    [4, 'Wapen en werkpunt', 'Begin met het wapen: "Wanneer zie je dat in de wedstrijd?" Dan het werkpunt: "Wanneer lukt het wel, wanneer niet?" Stuur door te vragen, niet door te oordelen.'],
    [7, 'Twee doelen', 'Doel 1 maakt het wapen scherper, doel 2 gaat over het werkpunt. Het kind verwoordt: wat, hoe vaak, tot wanneer, wie helpt?'],
    [10, 'Ouder en afronden', '"Wilt u iets aanvullen?" Dan het kind: "Wat neem je mee?"'],
    [12, 'Wisselen', 'Tijd om af te ronden: tik op Gesprek gehad, vul je notitie aan. De volgende ouder komt eraan.'],
  ];
  const klokStart = () => CC.ui.ogKlok || (CC.ui.ogKlok = {});
  const faseNu = (min) => FASEN.reduce((a, f) => (min >= f[0] ? f : a), FASEN[0]);
  const klokHtml = (key) => {
    const st = klokStart()[key];
    if (!st) return `<div class="ogklok uit"><button class="knop vol" data-act="ogStart" data-k="${esc(key)}">${icon('timer')}Start gesprek (15 minuten)</button>
      <details class="uitklap"><summary>Leidraad</summary><ol class="leidraad">${FASEN.map(([m, n, t]) => `<li><b>${m}–${(FASEN.find((f) => f[0] > m) || [15])[0]} min · ${n}</b><br><small>${esc(t)}</small></li>`).join('')}</ol></details></div>`;
    return `<div class="ogklok" data-start="${st}" role="status" aria-live="polite">${klokBinnen(st)}</div>`;
  };
  const klokBinnen = (st) => { const s = Math.max(0, Math.floor((Date.now() - st) / 1000)); const min = Math.floor(s / 60); const f = faseNu(min);
    return `<div class="ogklok-kop ${min >= 12 ? 'laat' : ''}"><b>${min}:${String(s % 60).padStart(2, '0')}</b><span>${esc(f[1])}</span><button class="linkknop" data-act="ogStop">Stop</button></div><p class="klein">${esc(f[2])}</p>`; };
  setInterval(() => { document.querySelectorAll('.ogklok[data-start]').forEach((el) => { el.innerHTML = klokBinnen(Number(el.dataset.start)); }); }, 5000);
  CC.on('ogStart', (el) => { klokStart()[el.dataset.k] = Date.now(); CC.render(); });
  CC.on('ogStop', () => { CC.ui.ogKlok = {}; CC.render(); });

  // ---------- 2. Gesprekspagina (trainer) ----------
  CC.views.gesprekVerslag = (S, p) => {
    const pl = M.speler(S, p.id); const mid = p.m; const m = CC.momenten(S).find((x) => x.id === mid); const at = `data-id="${pl.id}" data-m="${mid}"`;
    const v = voorb(S, pl.id, mid) || leeg.voorb(); const vs = verslag(S, pl.id, mid) || leeg.verslag(); const noti = ((S.ontwNotitie || {})[sl(pl.id, mid)] || {}).tekst || '';
    const vaardig = CC.vaardighedenVan(S, pl); const g = gesprekVan(S, pl.id, mid); const k = kijk(S, pl.id, mid) || { scores: {}, wapens: [] };
    const voorjaar = CC.momenten(S).slice(-1)[0].id === mid; const klaar = kijkKlaar(S, pl.id, mid);
    const veld = (key, label, waarde, ph, rows = 2) => `<label class="klein-kop">${label}</label><textarea rows="${rows}" data-input="ogVeld" ${at} data-k="${key}" placeholder="${ph}">${esc(waarde || '')}</textarea>`;

    // Jouw kijk (Besluit 68): kort, alleen wapen en werkpunt. Startgesprek: optioneel. Voorjaar: vooraf invullen.
    // De lijst per vaardigheid is er ook, maar ingeklapt. Alleen voor de staf.
    const kijkChips = (act, gekozen, ster) => `<div class="chips">${vaardig.map((x) => `<button type="button" class="chipknop ${gekozen.includes(x) ? 'aan' : ''}" data-act="${act}" ${at} data-v="${esc(x)}">${ster && gekozen.includes(x) ? '⭐ ' : ''}${esc(x)}</button>`).join('')}</div>`;
    const kijkBlok = `<details class="uitklap blok" ${voorjaar && !klaar ? 'open' : ''}><summary>${icon('eye-off')}Jouw kijk${voorjaar ? (klaar ? ' ✓' : ' (vóór het gesprek)') : ' (mag, hoeft niet)'}</summary>
      <p class="zacht klein">${voorjaar ? 'Kies vóór het voorjaarsgesprek per kind een wapen en een werkpunt.' : 'Bij het startgesprek hoef je vooraf niets in te vullen; het kind is aan zet.'} Alleen de staf ziet dit, ouder en kind niet.</p>
      <p class="klein-kop">Wapen volgens jou ⭐ (1–${MAX_WAPEN})</p>${kijkChips('ogKijkWapen', wapensVan(k), true)}
      <p class="klein-kop">Werkpunt volgens jou</p>${kijkChips('ogKijkWerk', k.werkpunt ? [k.werkpunt] : [], false)}
      <details class="uitklap"><summary>Uitgebreid: per vaardigheid</summary>
      ${CC.vaardigBlokken(vaardig).map(([naam, l]) => `<div class="kaartje zelf"><h4>${esc(naam)}</h4>${l.map((x) => `<div class="zelfrij"><span>${esc(x)}</span>${niveauKnoppen('ogKijk', `${at} data-v="${esc(x)}"`, niv(k, x), CC.NIVEAU_TRAINER)}</div>`).join('')}</div>`).join('')}</details></details>`;

    // Wat zegt het kind: gegroepeerd, met vragen om door te vragen (Besluit 68: sturen door te vragen, niet door te oordelen)
    const groep = (n) => vaardig.filter((x) => niv(v, x) === n);
    const regel = (label, l) => (l.length ? `<p class="klein"><b>${label}:</b> ${l.map(esc).join(', ')}</p>` : '');
    const vraag = (t) => `<p class="klein vraag">${icon('message-circle')}<span>${t}</span></p>`;
    const doorvragen = [];
    wapensVan(k).forEach((x) => { if (!wapensVan(v).includes(x) && niv(v, x) !== 3) doorvragen.push(`Jij ziet <b>${esc(x)}</b> als wapen, ${esc(pl.voornaam)} zegt "${esc(KORT_KIND[niv(v, x)] || 'niets')}". Vraag: <i>"Hoe gaat ${esc(x.toLowerCase())} in de wedstrijd? Vertel eens een moment."</i>`); });
    if (k.werkpunt && niv(v, k.werkpunt) === 3) doorvragen.push(`Jij ziet <b>${esc(k.werkpunt)}</b> als werkpunt, ${esc(pl.voornaam)} zegt "Sterk". Vraag: <i>"Wanneer lukt ${esc(k.werkpunt.toLowerCase())} wel, en wanneer niet?"</i>`);
    const ingevuld = Object.keys(v.zelf || {}).length || wapensVan(v).length;
    const watKind = ingevuld ? `<div class="kaartje">
        ${wapensVan(v).length ? `<p><b>Wapen ⭐</b> ${wapensVan(v).map(esc).join(', ')}${v.wapenWanneer ? `<br><small>"${esc(v.wapenWanneer)}"</small>` : ''}</p>${vraag('"Wanneer zie je dat in de wedstrijd? Vertel eens een moment."')}` : ''}
        ${regel('Sterk', groep(3).filter((x) => !wapensVan(v).includes(x)))}
        ${regel('Beter worden', groep(1))}${groep(1).length ? vraag('"Wanneer lukt het wel, en wanneer niet? Wat zou je helpen?"') : ''}
        <details class="uitklap"><summary>Gaat goed (${groep(2).length})</summary><p class="klein">${groep(2).map(esc).join(', ') || '–'}</p></details></div>`
      : `<div class="kaartje">${vraag('"Waar ben je echt goed in? Wanneer zie je dat in de wedstrijd?"')}${vraag('"Wat wil je graag beter kunnen? Wanneer lukt het nog niet?"')}</div>`;
    const doorBlok = doorvragen.length ? `<div class="info">${icon('eye-off')}<span><b>Vraag door (alleen voor jou)</b><br>${doorvragen.join('<br>')}</span></div>` : '';
    // Kandidaten: wat kind of trainer sterk/wapen vindt (wapen), of als werkpunt ziet (werkpunt); de rest achter "Toon alle"
    const alle = (CC.ui.seg || {})[`ogAlle-${pl.id}`];
    const kandidaat = (act, x) => (act === 'ogSamenWapen' ? niv(v, x) === 3 || niv(k, x) === 3 || wapensVan(v).includes(x) || wapensVan(k).includes(x) : niv(v, x) === 1 || niv(k, x) === 1 || k.werkpunt === x);
    const samenChips = (act, gekozen) => { const l = alle ? vaardig : vaardig.filter((x) => kandidaat(act, x) || gekozen.includes(x)); return `<div class="chips">${(l.length ? l : vaardig).map((x) => `<button type="button" class="chipknop ${gekozen.includes(x) ? 'aan' : ''}" data-act="${act}" ${at} data-v="${esc(x)}">${act === 'ogSamenWapen' && gekozen.includes(x) ? '⭐ ' : ''}${esc(x)}</button>`).join('')}${!alle && l.length && l.length < vaardig.length ? `<button type="button" class="linkknop" data-act="seg" data-key="ogAlle-${pl.id}" data-val="1">Toon alle</button>` : ''}</div>`; };

    // Doelen: 1 = wapen scherper maken, 2 = werkpunt, 3 alleen als het echt nodig is
    const doelen = vs.doelen.length >= 2 ? vs.doelen : [...vs.doelen, ...[{}, {}].slice(vs.doelen.length)];
    const doelKop = (i) => (i === 0 ? `Doel 1 · wapen scherper maken${vs.wapen.length ? ` (${vs.wapen.map(esc).join(', ')})` : ''}` : i === 1 ? `Doel 2 · werkpunt${vs.werkpunt ? ` (${esc(vs.werkpunt)})` : ''}` : `Doel ${i + 1}`);
    const doelBlok = doelen.map((d, i) => `<div class="kaartje doel"><h4>${icon('flag')}${doelKop(i)}</h4>
      ${veld(`doel.${i}.wat`, `Wat ga je doen? (in de woorden van ${esc(pl.voornaam)})`, d.wat, i === 0 ? 'Wat, hoe vaak, tot wanneer? Bijv. in elke wedstrijd 3 keer de actie maken als ik ruimte heb' : 'Wat, hoe vaak, tot wanneer? Bijv. tot de winterstop elke training 10 keer aannemen met links')}
      ${veld(`doel.${i}.hulp`, 'Wie helpt je, en hoe?', d.hulp, 'Bijv. trainer: extra oefening op vrijdag; thuis: samen in het park', 1)}</div>`).join('');

    // Terugkijken naar het vorige gesprek
    const vm = vorigMoment(S, pl.id, mid); const vvs = vm && verslag(S, pl.id, vm.id); const vv = vm && voorb(S, pl.id, vm.id); const vk = vm && kijk(S, pl.id, vm.id);
    const groei = vm ? vaardig.map((x) => { const a = niv(vv, x), a2 = niv(v, x), b = niv(vk, x), b2 = niv(k, x);
      const r = [a && a2 && a !== a2 ? `kind ${KORT_KIND[a]} → ${KORT_KIND[a2]}` : '', b && b2 && b !== b2 ? `trainer ${CC.NIVEAU_TRAINER[b]} → ${CC.NIVEAU_TRAINER[b2]}` : ''].filter(Boolean); return r.length ? `${esc(x)}: ${r.join(', ')}` : ''; }).filter(Boolean) : [];
    const terug = vm && (vvs || vv) ? `<details class="uitklap blok" open><summary>Terugkijken: ${esc(vm.label)}</summary>
      ${vvs && (vvs.wapen || []).length ? `<p class="klein"><b>Wapen toen:</b> ⭐ ${vvs.wapen.map(esc).join(', ')}${vvs.werkpunt ? ` · <b>werkpunt:</b> ${esc(vvs.werkpunt)}` : ''}</p>` : ''}
      ${vv && vv.droom ? `<p class="klein"><b>Droom toen:</b> "${esc(vv.droom)}"</p>` : ''}
      ${vvs && vvs.doelen.some((d) => d.wat) ? `<div class="lijst compact">${vvs.doelen.map((d, i) => (d.wat ? h.rij({ ic: 'flag', titel: esc(d.wat), sub: [(v.doelTerug || {})[i] ? `${esc(pl.voornaam)}: ${(STATUS_KIND.find((s) => s[0] === v.doelTerug[i]) || [])[1] || ''}` : '', d.hulp ? `Hulp: ${esc(d.hulp)}` : ''].filter(Boolean).join(' · '),
        rechts: `<select class="kort" data-change="ogDoelStatus" data-id="${pl.id}" data-m="${vm.id}" data-i="${i}" aria-label="Is dit doel bereikt?">${STATUS.map(([s, l]) => `<option value="${s}" ${(d.status || '') === s ? 'selected' : ''}>${l}</option>`).join('')}</select>` }) : '')).join('')}</div>` : ''}
      ${groei.length ? `<p class="klein"><b>Groei:</b> ${groei.join(' · ')}</p>` : ''}</details>` : '';

    return { titel: `Gesprek ${pl.voornaam}`, sub: `${m.naam}${g ? ` · ${D.kort(g.datum)} ${g.tijd}` : ''} · ${CC.tn(pl.teamId)}`,
      html: `${klokHtml(sl(pl.id, mid))}
        ${v.klaar ? '' : `<div class="info oranje">${icon('info')}<span>${esc(pl.voornaam)} heeft de voorbereiding ${Object.keys(v.zelf).length ? 'nog niet helemaal' : 'nog niet'} ingevuld. Je kunt de vragen in het gesprek stellen.</span></div>`}
        ${voorjaar ? kijkBlok : ''}
        ${terug}
        ${h.sectie(`1 · ${esc(pl.voornaam)} aan het woord`)}
        <div class="kaartje">${[['trots', 'Trots op'], ['leuk', 'Leukst'], ['lastig', 'Wil beter leren'], ['droom', 'Droom']].map(([key, l]) => `<p class="klein"><b>${l}:</b> ${v[key] ? `"${esc(v[key])}"` : '<span class="zacht">–</span>'}</p>`).join('')}</div>
        ${h.sectie(`2 · Wat zegt ${esc(pl.voornaam)}?`)}${watKind}${doorBlok}
        <p class="klein-kop">Ons wapen (samen gekozen)</p>${samenChips('ogSamenWapen', vs.wapen || [])}
        <p class="klein-kop">Ons werkpunt</p>${samenChips('ogSamenWerk', vs.werkpunt ? [vs.werkpunt] : [])}
        ${h.sectie('3 · Twee doelen')}${doelBlok}${doelen.length < 3 ? `<button class="linkknop" data-act="ogDoelErbij" ${at}>${icon('plus')}Derde doel (alleen als het echt nodig is)</button>` : ''}
        ${h.sectie('4 · Afronden')}
        ${veld('meenemen', `Wat neem je mee? (in de woorden van ${esc(pl.voornaam)})`, vs.meenemen, 'Bijv. ik ga vaker de bal vragen, want dan kan ik mijn actie maken')}
        ${veld('afspraken', 'Afspraken (ook wat de ouder aanvult)', vs.afspraken, 'Bijv. in maart kijken we samen hoe het gaat')}
        ${voorjaar ? '' : kijkBlok}
        ${h.sectie('Notitie trainer')}<textarea rows="2" data-input="ogNotitie" ${at} placeholder="Alleen voor de staf">${esc(noti)}</textarea>
        <button class="knop ${vs.gehad ? 'licht' : ''} vol" data-act="ogGehad" ${at}>${icon('circle-check')}${vs.gehad ? 'Gesprek gehad ✓ (tik om terug te zetten)' : 'Gesprek gehad'}</button>
        <p class="zacht klein">Alles wordt meteen bewaard. Na "Gesprek gehad" ziet de ouder het wapen, het werkpunt, de doelen, "wat neem je mee" en de afspraken. Jouw kijk en de notitie ziet alleen de staf.</p>` };
  };
  CC.on('ogKijk', (el) => { const S = CC.S(); maakKijk(S, el.dataset.id, el.dataset.m).scores[el.dataset.v] = Number(el.dataset.s); zetKnop(el); CC.save(); });
  CC.on('ogKijkWerk', (el) => { const S = CC.S(); const k = maakKijk(S, el.dataset.id, el.dataset.m); k.werkpunt = k.werkpunt === el.dataset.v ? '' : el.dataset.v; CC.save(); CC.render(); });
  const wissel = (lijst, x, max) => { const i = lijst.indexOf(x); if (i >= 0) { lijst.splice(i, 1); return true; } if (lijst.length >= max) { CC.toast(`Hooguit ${max}. Tik eerst een ander weg.`, 'fout'); return false; } lijst.push(x); return true; };
  CC.on('ogKijkWapen', (el) => { const S = CC.S(); const k = maakKijk(S, el.dataset.id, el.dataset.m); if (!Array.isArray(k.wapens)) k.wapens = []; if (wissel(k.wapens, el.dataset.v, MAX_WAPEN)) { CC.save(); CC.render(); } });
  CC.on('ogSamenWapen', (el) => { const S = CC.S(); const vs = maakVerslag(S, el.dataset.id, el.dataset.m); if (!Array.isArray(vs.wapen)) vs.wapen = []; if (wissel(vs.wapen, el.dataset.v, MAX_WAPEN)) { vs.bijgewerkt = new Date().toISOString(); CC.save(); CC.render(); } });
  CC.on('ogSamenWerk', (el) => { const S = CC.S(); const vs = maakVerslag(S, el.dataset.id, el.dataset.m); vs.werkpunt = vs.werkpunt === el.dataset.v ? '' : el.dataset.v; vs.bijgewerkt = new Date().toISOString(); CC.save(); CC.render(); });
  CC.on('ogVeld', (el) => { const S = CC.S(); const vs = maakVerslag(S, el.dataset.id, el.dataset.m); if (el.dataset.k.startsWith('doel.')) { const [, i, key] = el.dataset.k.split('.'); while (vs.doelen.length <= Number(i)) vs.doelen.push({ wat: '', hulp: '' }); vs.doelen[Number(i)][key] = el.value; } else vs[el.dataset.k] = el.value;
    vs.bijgewerkt = new Date().toISOString(); CC.save(); });
  CC.on('ogNotitie', (el) => { const S = CC.S(); const o = S.ontwNotitie || (S.ontwNotitie = {}); o[sl(el.dataset.id, el.dataset.m)] = { tekst: el.value, door: CC.me().id, tijd: new Date().toISOString() }; CC.save(); });
  CC.on('ogDoelErbij', (el) => { const S = CC.S(); const vs = maakVerslag(S, el.dataset.id, el.dataset.m); while (vs.doelen.length < 3) vs.doelen.push({ wat: '', hulp: '' }); CC.save(); CC.render(); });
  CC.on('ogDoelStatus', (el) => { const S = CC.S(); const vs = maakVerslag(S, el.dataset.id, el.dataset.m); const d = vs.doelen[Number(el.dataset.i)]; if (d) d.status = el.value; CC.save(); CC.toast('Bewaard'); });
  CC.on('ogGehad', (el) => { const S = CC.S(); const vs = maakVerslag(S, el.dataset.id, el.dataset.m); vs.gehad = !vs.gehad; vs.gehadOp = vs.gehad ? D.vandaag() : null; delete (CC.ui.ogKlok || {})[sl(el.dataset.id, el.dataset.m)]; CC.save(); CC.render();
    CC.toast(vs.gehad ? 'Genoteerd: de ouder ziet nu de afspraken' : 'Teruggezet'); });

  // ---------- 3. Voor ouder en kind: wat er samen is afgesproken (nooit de kijk van de trainer) ----------
  CC.ontwZichtbaar = (S, pl, mid) => !!(verslag(S, pl, mid) || {}).gehad;
  CC.verslagVoorOuder = (S, pl, mid) => {
    const v = voorb(S, pl.id, mid); const vs = verslag(S, pl.id, mid); if (!vs || !vs.gehad) return '';
    const doelen = vs.doelen.filter((d) => d.wat);
    return `${(vs.wapen || []).length ? `<p><b>Wapen:</b> ⭐ ${vs.wapen.map(esc).join(', ')}</p>` : ''}${vs.werkpunt ? `<p><b>Werkpunt:</b> ${esc(vs.werkpunt)}</p>` : ''}
      ${doelen.length ? `<p><b>Doelen:</b></p><ol class="doelen">${doelen.map((d) => `<li>${esc(d.wat)}${d.hulp ? `<br><small>Hulp: ${esc(d.hulp)}</small>` : ''}${d.status ? ` <span class="chip ${d.status === 'bereikt' ? 'groen' : d.status === 'deels' ? 'oranje' : 'grijs'} mini">${{ bereikt: 'bereikt', deels: 'deels', niet: 'nog niet' }[d.status]}</span>` : ''}</li>`).join('')}</ol>` : ''}
      ${vs.meenemen ? `<p><b>Wat ${esc(pl.voornaam)} meeneemt:</b> "${esc(vs.meenemen)}"</p>` : ''}
      ${vs.afspraken ? `<p><b>Afspraken:</b> ${esc(vs.afspraken).replace(/\n/g, '<br>')}</p>` : ''}
      ${v && (wapensVan(v).length || v.droom) ? `<p class="zacht klein">Uit jullie voorbereiding: ${wapensVan(v).length ? `wapen ⭐ ${wapensVan(v).map(esc).join(', ')}` : ''}${wapensVan(v).length && v.droom ? ' · ' : ''}${v.droom ? `droom "${esc(v.droom)}"` : ''}</p>` : ''}`;
  };
  // Het laatste gesprek dat is gehad (voor Home en de spelerspagina van de ouder)
  CC.laatsteVerslag = (S, plId) => { const ms = momentenVan(S, plId).filter((m) => CC.ontwZichtbaar(S, plId, m.id)); const m = ms[ms.length - 1]; return m ? { m, vs: verslag(S, plId, m.id) } : null; };
  // Alle gesprekken van een kind die zijn gehad, nieuwste eerst (ook uit eerdere seizoenen)
  CC.gesprekkenGehad = (S, plId) => momentenVan(S, plId).filter((m) => CC.ontwZichtbaar(S, plId, m.id)).reverse();
  CC.voorbKlaar = (S, pl, mid) => !!(voorb(S, pl, mid) || {}).klaar;
  CC.kijkKlaar = kijkKlaar;

  // ---------- Vaardigheden toevoegen (trainer) ----------
  CC.on('vaardigToevoegen', () => { const S = CC.S(); const tid = CC.teamId(); const c = CC.categorie(M.team(S, tid).cat); const extra = ((S.teamVaardig || {})[tid] || {}).extra || [];
    CC.sheet('Vaardigheden van je team', `<p class="zacht klein">Standaard voor ${esc(c.naam.toLowerCase())}: ${c.vaardig.map(esc).join(', ')}. Voeg er zelf aan toe, bijvoorbeeld "Koppen" of "Coachbaarheid". Kinderen en ouders zien ze ook bij de voorbereiding.</p>
      ${extra.length ? `<div class="lijst compact">${extra.map((x, i) => h.rij({ ic: 'star', titel: esc(x), rechts: `<button class="icoonknop" data-act="vaardigWeg" data-i="${i}" aria-label="Weghalen">${icon('trash-2')}</button>` })).join('')}</div>` : ''}
      <form data-submit="vaardigOk" class="codeform"><label for="va-n">Nieuwe vaardigheid</label><input id="va-n" name="n" required maxlength="30" placeholder="Bijv. Koppen"><button class="knop">Toevoegen</button></form>`); });
  CC.on('vaardigOk', (f) => { const S = CC.S(); const tid = CC.teamId(); const o = S.teamVaardig || (S.teamVaardig = {}); const x = o[tid] || (o[tid] = { extra: [] }); const n = f.n.value.trim(); if (n && !CC.vaardigheden(S, tid).includes(n)) x.extra.push(n); CC.save(); CC.closeSheet(); CC.render(); CC.toast(`"${n}" toegevoegd`); });
  CC.on('vaardigWeg', (el) => { const S = CC.S(); const tid = CC.teamId(); const x = (S.teamVaardig || {})[tid]; if (x) x.extra.splice(Number(el.dataset.i), 1); CC.save(); CC.closeSheet(); CC.render(); CC.toast('Weggehaald'); });
})();
