// ClubComm — periodisering en methodiek bij trainingen (Besluit 133). Alleen actief als het opleidingsprofiel van de club
// voetbalproblemen en leerniveaus heeft (DCG); andere clubs (KNVB-standaard) merken er niets van.
// - Methodiekblok per training (weekformat uit het kerndocument), compact met uitklap; status Gepland/Uitgewerkt/Gegeven (berekend).
// - Periodisering laden uit een CSV (Excel) met voorbeeld vooraf: alleen echte trainingen van het team, niets overschrijven,
//   terugdraaien alleen voor concepten die niet zijn aangepast.
// - Observatiepunten bij de wedstrijd (max. 3), uitkomst Gezien/Deels/Niet gezien/Niet beoordeeld, als bespreekpunt in de week erna.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;
  const T = () => CC.tr;
  const actief = (S) => { const t = T(); return !!(t && t.ond(S, 'voetbalproblemen') && t.niveaus(S).length); };
  const problemen = (S) => (T().ond(S, 'voetbalproblemen') || {}).items || [];
  const ketens = (S) => (T().ond(S, 'handelingsketens') || {}).items || [];
  const probleem = (S, id) => problemen(S).find((x) => x.id === id) || null;
  const teamfuncties = (S) => (T().ond(S, 'teamfuncties') || {}).items || [];
  // Handelingsketen is vrije tekst (combinatie van gereedschappen); de ketens uit het profiel zijn alleen voorbeelden
  const ketenVan = (S, m) => m.ketenTekst || (ketens(S).find((k) => k.id === m.keten) || {}).naam || '';
  // Contrathema: gekoppeld probleem (+ eventueel een ondersteunend probleem) met de eigen omschrijving erbij.
  // Telt niet mee in de minuten: minuten gaan alleen naar het hoofdleerdoel van de vorm (CC.minutenPerLeerdoel), dus nooit dubbel.
  const contraLabel = (S, m) => { const p1 = probleem(S, m.contra), p2 = probleem(S, m.contra2); const t = String(m.contraTekst || '').trim();
    const eigen = t && !/^\d+$/.test(t) && (!p1 || t.toLowerCase() !== p1.naam.toLowerCase()) ? t : '';
    // Kort: de eigen omschrijving met het nummer van het probleem; zonder eigen tekst de naam van het probleem
    return [eigen ? `${eigen}${p1 ? ` (probleem ${p1.id.slice(3)})` : ''}` : p1 ? p1.naam : '', p2 ? `· ook ${p2.id.slice(3)} ${p2.naam}` : ''].filter(Boolean).join(' '); };
  const ondersteunendVan = (S, m) => m.ondersteunendTekst || (m.ondersteunend || []).map((x) => T().ldNaam(S, x)).filter(Boolean).join(', ');
  const tfNaam = (S, m) => (teamfuncties(S).find((x) => x.id === m.teamfunctie) || {}).naam || m.teamfunctieTekst || '';
  const maandag = (datum) => { const x = D.parse(datum); return D.addDays(datum, -((x.getDay() + 6) % 7)); };
  const weekId = (tid, datum) => `wk-${tid || 'los'}-${maandag(datum)}`;
  const weekPlan = (S, tid, datum) => T().plannen(S).find((p) => p.week && p.id === weekId(tid, datum) && p.eigenaar === T().ik()) || null;
  const nieuwWeek = (S, tid, datum, bron) => { const p = { id: weekId(tid, datum), week: true, teamId: tid, datum: maandag(datum), eigenaar: T().ik(), methodiek: {}, wedstrijd: null, ...(bron ? { bron } : {}) }; T().plannen(S).push(p); return p; };
  // Methodiek van een training: eerst wat bij de training zelf staat, aangevuld met het weekplan
  const methodiek = (S, p) => { if (!p) return {}; const a = T().actVan(S, p); const w = a.datum ? weekPlan(S, p.teamId || a.teamId, a.datum) : null; const wm = (w && w.methodiek) || {}, pm = p.methodiek || {}; const m = { ...wm, ...pm };
    // Contrathema (optioneel): hoort bij de week en verschijnt als voorstel, tenzij bij deze training zelf gekozen
    if (!pm.contraGekozen && !pm.contra && !pm.contraTekst) { m.contra = wm.contra || null; m.contra2 = wm.contra2 || null; m.contraTekst = wm.contraTekst || ''; }
    return m; };

  // ---------- Status: berekend, nooit ingevuld ----------
  // Gegeven = training is gegeven; Uitgewerkt = elke plek heeft een vorm (spacing: een naam of vorm) en elke vorm een tekening of organisatie; anders Gepland
  CC.trStatusVan = (S, p) => { if (!p || p.week) return null; if (p.gegeven) return 'gegeven';
    const o = p.onderdelen || []; const vol = o.length && o.every((x) => { if (x.spacing && !x.vormId) return !!String(x.naam || '').trim(); const v = x.vormId && T().vorm(S, x.vormId); return v && (v.tekening || String(v.organisatie || '').trim()); });
    return vol ? 'uitgewerkt' : 'gepland'; };
  const STAT = { gepland: ['Gepland', 'g'], uitgewerkt: ['Uitgewerkt', 'u'], gegeven: ['Gegeven', 'v'] };
  CC.trStatus = (S, p) => { if (!actief(S)) return ''; const s = CC.trStatusVan(S, p); return s ? ` <span class="tr-stat ${STAT[s][1]}">${STAT[s][0]}</span>` : ''; };

  // ---------- Methodiekblok (compact; de rest van het weekformat klapt uit) ----------
  const nv = (S, ids) => (ids || []).map((x) => T().niveauNaam(S, x)).filter(Boolean).join(' → ');
  // ---------- Trainingskaart (Besluit 144): vijf vaste regels, elke waarde met zijn herkomst ----------
  // Eigen = jouw voorbereiding · Periodisering = geladen voor deze dag (zolang je het niet hebt aangepast) ·
  // Weekvoorstel = hoort bij de week en wordt nooit in de training gezet. Een training zonder eigen methodiek wordt niet aangevuld.
  // Alleen wat echt voor de hele week geldt (in de DCG-periodisering 8 van 8 weken gelijk); dagwaarden (hoofdthema, leerniveau,
  // leerroute) uit een weekplan zijn van één dag en tellen niet als weekvoorstel.
  const WEEKVELDEN = ['probleem', 'probleemTekst', 'teamfunctie', 'teamfunctieTekst', 'contra', 'contra2', 'contraTekst', 'hg1', 'hg2', 'ondersteunend', 'ondersteunendTekst', 'gedrag', 'informatie', 'keten', 'ketenTekst', 'transfer', 'fase', 'week', 'thema'];
  const gevuld = (x) => x != null && x !== '' && !(Array.isArray(x) && !x.length);
  const weekVoorstelVan = (S, p, a) => { const w = a && a.datum ? weekPlan(S, p.teamId || a.teamId, a.datum) : null; const m = (w && w.methodiek) || {};
    return Object.fromEntries(WEEKVELDEN.filter((k) => gevuld(m[k])).map((k) => [k, m[k]])); };
  CC.trWeekVoorstel = (S, p) => (p && !p.week ? weekVoorstelVan(S, p, T().actVan(S, p)) : {});
  const eigenM = (p) => p.methodiek || {};
  const heeftEigen = (p) => { const m = eigenM(p); return ['probleem', 'probleemTekst', 'hoofdthema', 'gedrag', 'niveaus', 'teamfunctie', 'informatie', 'route'].some((k) => gevuld(m[k])); };
  const isConcept = (p) => !!(p.concept && p.bron);
  const onveranderd = (p) => isConcept(p) && p.stempel === stempel(p);
  // Herkomst van een waarde bij de training: periodisering zolang hij gelijk is aan wat geladen is, anders eigen
  const bronVan = (p, pad) => { if (!isConcept(p)) return 'eigen'; if (onveranderd(p)) return 'periodisering'; if (!p.origineel) return 'eigen';
    return JSON.stringify(geordend(pad(p) ?? null)) === JSON.stringify(geordend(pad(p.origineel) ?? null)) ? 'periodisering' : 'eigen'; };
  const LAB = { eigen: ['Eigen', 'e'], periodisering: ['Periodisering', 'p'], week: ['Weekvoorstel', 'w'] };
  const lab = (k) => ` <span class="tr-her ${LAB[k][1]}">${LAB[k][0]}</span>`;
  // Accenten en gereedschap staan bij de oefenvormen, niet bij de trainingsplek: daarom "in gekozen vormen" (nog geen trainingsaccent)
  const inVormen = (S, p) => { const vs = (p.onderdelen || []).filter((o) => o.vormId && !o.spacing).map((o) => T().vorm(S, o.vormId)).filter(Boolean);
    const vh = [...new Set(vs.flatMap((v) => v.vaardigheden || []))].map((x) => T().vhNaam(S, x)).filter(Boolean);
    const gs = [...new Set(vs.map((v) => T().koppeling(S, v).primair).filter(Boolean))].map((x) => T().ldNaam(S, x)).filter(Boolean);
    const tel = {}; (p.onderdelen || []).forEach((o) => { if (!o.spacing && o.niveau) tel[o.niveau] = (tel[o.niveau] || 0) + 1; });
    const niv = T().niveaus(S).filter((n) => tel[n.id]).map((n) => `${n.naam} ${tel[n.id]}×`);
    return { vh, gs, niv }; };
  // Mee uit vorige: de vorige gegeven training van het team. Alleen een zin die begint met "Afspraak" of "Concrete afspraak"
  // (letterlijk), daarnaast het gekozen antwoord bij "Volgende training" uit de evaluatie; verder alleen een verwijzing. Nooit een samenvatting.
  const vorigeTraining = (S, p, a) => T().plannen(S).filter((x) => x !== p && !x.week && x.eigenaar === T().ik() && x.gegeven && (x.teamId || '') === (p.teamId || a.teamId || '')
    && String(T().actVan(S, x).datum || '') < String(a.datum || '')).sort((x, y) => String(T().actVan(S, y).datum).localeCompare(String(T().actVan(S, x).datum)))[0] || null;
  CC.trAfspraak = (tekst) => { const zinnen = String(tekst || '').split(/\n+|(?<=[.!?])\s+/).map((z) => z.trim()).filter(Boolean);
    const z = zinnen.find((x) => /^(concrete\s+)?afspraak\b/i.test(x)); return z ? z.replace(/^(concrete\s+)?afspraak[^:]*:\s*/i, '') : ''; };
  const meeUitVorige = (S, p, a) => { const v = vorigeTraining(S, p, a); if (!v) return '';
    const va = T().actVan(S, v); const dag = esc(T().dagNaam(va)); const af = CC.trAfspraak(v.anders); const vk = (v.evaluatie || {})['ev-volgende'];
    const link = `<button type="button" class="tr-link" data-act="trNaarWeek" data-id="${esc(va.id)}">${af || vk ? 'Hele evaluatie' : 'Evaluatie'} van ${dag} ›</button>`;
    if (!af && !vk && !v.anders) return `<small class="zacht">Geen evaluatie bij ${dag}.</small>`;
    return `<div class="tr-mee">${af ? `<b>Afspraak ${dag}:</b> ${esc(af)}` : `<span class="zacht">Geen afspraak herkend bij ${dag}.</span>`}${vk ? `<small>Evaluatie ${dag}, volgende training: ${esc(vk)}</small>` : ''}${link}</div>`; };
  // Besluit 144: de oorspronkelijke planning van een geladen concept, één keer bewaard wanneer je het voor het eerst aanpast.
  // Zolang een concept nog precies is zoals geladen, staat een kopie alleen in het geheugen; geen versiebeheer.
  const ORIG = {};
  const momentopname = (p) => JSON.parse(JSON.stringify({ thema: p.thema || '', methodiek: p.methodiek || {}, blokDoel: p.blokDoel || {}, bron: p.bron }));
  CC.trBorgOrigineel = (S) => { T().plannen(S).forEach((p) => { if (p.week || !isConcept(p) || p.origineel) return;
    if (p.stempel === stempel(p)) ORIG[p.id] = momentopname(p); else if (ORIG[p.id]) { p.origineel = { ...ORIG[p.id], bewaard: D.vandaag() }; delete ORIG[p.id]; } }); };
  CC.on('trOrigineel', (el) => { const S = CC.S(); const p = T().plan(S, el.dataset.id); const o = p && p.origineel; if (!o) return; const m = o.methodiek || {}; const pr = probleem(S, m.probleem);
    const r = (n, x) => (x ? `<dt>${n}</dt><dd>${esc(x)}</dd>` : '');
    CC.sheet('Oorspronkelijke planning', `<p class="zacht klein">Zoals geladen uit ${esc(o.bron || 'de periodisering')}. Bewaard op ${esc(D.kort(o.bewaard))}, toen je deze training voor het eerst aanpaste. Alleen ter informatie.</p>
      <dl class="antwoorden">${r('Titel', o.thema)}${r('Voetbalprobleem', pr ? `${pr.id.slice(3)} · ${pr.naam}` : m.probleemTekst)}${r('Dagthema', m.hoofdthema)}${r('Gereedschap A', T().ldNaam(S, (o.blokDoel || {}).A))}${r('Gereedschap B', T().ldNaam(S, (o.blokDoel || {}).B))}${r('Leerniveau', nv(S, m.niveaus))}${r('Leerroute', m.route)}${r('Gewenst gedrag', m.gedrag)}</dl>`); });
  CC.trMethodiek = (S, p, a, tel) => { if (!p || p.week) return ''; const pa = actief(S); if (pa) CC.trBorgOrigineel(S);
    const m = eigenM(p), wv = weekVoorstelVan(S, p, a), w = a.datum ? weekPlan(S, p.teamId || a.teamId, a.datum) : null; const iv = inVormen(S, p);
    const wbox = (x) => (x ? `<div class="tr-wv">${lab('week')}<span class="tr-wvt">${x}</span></div>` : '');
    const AB = (x, b) => [x[b === 'A' ? 'A' : 'hg1'], x[b === 'A' ? 'B' : 'hg2']];
    const abTekst = (A, B) => [A ? `<b>A</b> ${esc(T().ldNaam(S, A))}` : '', B ? `<b>B</b> ${esc(T().ldNaam(S, B))}` : ''].filter(Boolean).join(' · ');
    const eA = (p.blokDoel || {}).A || null, eB = (p.blokDoel || {}).B || null;
    const stand = isConcept(p) ? (onveranderd(p) ? 'Concept uit de periodisering · nog niet aangepast' : 'Concept uit de periodisering · door jou aangepast')
      : heeftEigen(p) || !pa ? 'Eigen voorbereiding' : w && w.bron ? 'Eigen voorbereiding – periodisering niet toegepast' : 'Eigen voorbereiding';
    const rijen = [];
    if (pa) {
      const pr = probleem(S, m.probleem); const wpr = probleem(S, wv.probleem);
      const contra = m.contra || m.contraTekst ? `<small class="tr-contra">Contrathema (andere partij): ${esc(contraLabel(S, m))}${m.contraGekozen ? '' : ' · <i>voorstel</i>'}</small>` : '';
      rijen.push(['Wat', pr || m.probleemTekst ? `${pr ? `Voetbalprobleem ${esc(pr.id.slice(3))} · <b>${esc(pr.naam)}</b>` : `<b>${esc(m.probleemTekst)}</b>`}${lab(bronVan(p, (x) => (x.methodiek || {}).probleem))}${tfNaam(S, m) ? `<small>Teamfunctie ${esc(tfNaam(S, m))}</small>` : ''}${contra}`
        : `<span class="zacht">Niet vastgelegd</span>${wbox([wpr ? `Voetbalprobleem ${esc(wpr.id.slice(3))} · ${esc(wpr.naam)}` : esc(wv.probleemTekst || ''), esc(tfNaam(S, wv))].filter(Boolean).join(' · '))}`]);
      const dag = m.hoofdthema ? `Dagthema: <b>${esc(m.hoofdthema)}</b>${lab(bronVan(p, (x) => (x.methodiek || {}).hoofdthema))}` : !isConcept(p) && p.thema ? `Dagthema: <b>${esc(p.thema)}</b>${lab('eigen')}` : '<span class="zacht">Geen dagthema</span>';
      const dg = w && w.dagen && a.datum && w.dagen[a.datum];
      const wd = w && w.wedstrijd; const wa = wd && M.act(S, wd.actId);
      const wed = wa ? `<small>Wedstrijdsituatie ${esc(T().dagNaam(wa))}: ${wd.context ? `${esc(wd.context)}${lab('periodisering')}` : 'nog niet uit de periodisering geladen'}${(wd.punten || []).length ? ` · ${wd.punten.length} observatiepunten` : ''}</small>` : '';
      rijen.push(['Waar', `${dag}${m.informatie ? `<small>Relevante informatie: ${esc(m.informatie)}</small>` : ''}${wed}${!heeftEigen(p) && dg ? `<small class="zacht">Periodisering voor deze dag (niet toegepast): ${esc([dg.hoofdthema, nv(S, dg.niveaus)].filter(Boolean).join(' · '))}</small>` : ''}`]);
      const [wA, wB] = AB(wv, 'w');
      rijen.push(['Welke', `${eA || eB ? `${abTekst(eA, eB)}${lab(bronVan(p, (x) => x.blokDoel || {}))}` : ''}${ondersteunendVan(S, m) ? `<small>Ondersteunend: ${esc(ondersteunendVan(S, m))}</small>` : ''}`
        + `${m.gedrag ? `<small class="tr-gedrag">Gewenst gedrag: ${esc(m.gedrag)}${lab(bronVan(p, (x) => (x.methodiek || {}).gedrag))}</small>` : ''}`
        + `<small>Accenten in gekozen vormen: ${iv.vh.length ? `<b>${esc(iv.vh.join(' · '))}</b>${lab('eigen')}` : (p.onderdelen || []).some((o) => o.vormId) ? 'geen vastgelegd' : 'nog geen vormen gekozen'}</small>`
        + `${!eA && !eB && iv.gs.length ? `<small>Gereedschap in gekozen vormen: ${esc(iv.gs.join(' · '))}${lab('eigen')}</small>` : ''}${!eA && !eB ? wbox(abTekst(wA, wB) + (wv.gedrag && !m.gedrag ? `<small>Gewenst gedrag: ${esc(wv.gedrag)}</small>` : '')) : !m.gedrag && wv.gedrag ? wbox(`Gewenst gedrag: ${esc(wv.gedrag)}`) : ''}`]);
      rijen.push(['Niveau', (m.niveaus || []).length ? `<span class="tr-niv">${esc(nv(S, m.niveaus))}</span>${lab(bronVan(p, (x) => (x.methodiek || {}).niveaus || []))}${m.route ? `<small>Leerroute: ${esc(m.route)}</small>` : ''}`
        : `<span class="zacht">Niet gekozen voor de training</span>${iv.niv.length ? `<small>In gekozen vormen: ${esc(iv.niv.join(' · '))}${lab('eigen')}</small>` : ''}`]);
    } else {
      // Club zonder opleidingsprofiel: alleen wat er is (thema en A/B, eventueel uit het weekthema van Besluit 135)
      const [wA, wB] = AB(wv, 'w');
      // De eigen titel staat al bovenaan; hier alleen het weekvoorstel als je zelf nog niets koos
      if (!p.thema && wv.thema) rijen.push(['Wat', `<span class="zacht">Nog geen thema</span>${wbox(`Weekthema: ${esc(wv.thema)}`)}`]);
      if (!eA && !eB && (wA || wB)) rijen.push(['Welke', wbox(abTekst(wA, wB))]);
    }
    const mee = meeUitVorige(S, p, a); if (mee) rijen.push(['Mee uit vorige', mee]);
    if (!pa && !rijen.length) return '';
    if (!pa) return `<div class="tr-tkaart tr-tkaart-los">${rijen.map(([n, x]) => `<div class="tr-kr"><span class="tr-kn">${n}</span><div>${x}</div></div>`).join('')}</div>`;
    const rij = (n, x) => (x ? `<span>${n}</span><b>${esc(x)}</b>` : '');
    const rest = pa ? [rij('Handelingsketen', ketenVan(S, m)), rij('Transfermoment', m.transfer), rij('Technische onderbouw', m.onderbouw), rij('Observatie', m.observatie)].join('') : '';
    const fw = w && w.methodiek && w.methodiek.week ? rij('Fase · week', `${w.methodiek.fase || ''} ${w.methodiek.week}`.trim()) : '';
    return `<div class="tr-meth tr-tkaart">
      <div class="tr-meth-kop"><small class="tr-stand">${esc(stand)}</small>${tel || !pa ? '' : `<button class="icoonknop" data-act="tpMethodiek" data-id="${esc(a.id)}" aria-label="Methodiek van deze training aanpassen">${icon('pencil')}</button>`}</div>
      ${rijen.map(([n, x]) => `<div class="tr-kr"><span class="tr-kn">${n}</span><div>${x}</div></div>`).join('')}
      ${rest || fw ? `<details class="tr-meth-meer"><summary>Onderbouwing (weekformat)</summary><div class="tr-meth-r">${fw}${rest}</div></details>` : ''}
      ${p.origineel && !tel ? `<button type="button" class="tr-link" data-act="trOrigineel" data-id="${esc(a.id)}">Oorspronkelijke planning ›</button>` : ''}
    </div>`; };
  // Venster om de methodiek van deze training aan te passen (blijft bij deze training; het weekplan blijft zoals het is)
  const sel = (naam, opties, w, leegTekst) => `<select name="${naam}"><option value="">${leegTekst || '—'}</option>${opties.map(([v, n]) => `<option value="${esc(v)}" ${v === w ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>`;
  CC.on('tpMethodiek', (el) => { const S = CC.S(); const p = T().plan(S, el.dataset.id); if (!p) return; const m = p.methodiek || {}; const wv = CC.trWeekVoorstel(S, p);
    const lds = T().leerdoelen(S).map((l) => [l.id, l.naam]); const prs = problemen(S).map((x) => [x.id, `${x.id.slice(3)} · ${x.naam}`]);
    const ll = ((T().ond(S, 'leerlijnen') || {}).items || []).filter((x) => x.naam);
    const wvPr = probleem(S, wv.probleem); const wvTekst = [wvPr ? `${wvPr.id.slice(3)} · ${wvPr.naam}` : wv.probleemTekst, wv.hg1 && `A ${T().ldNaam(S, wv.hg1)}`, wv.hg2 && `B ${T().ldNaam(S, wv.hg2)}`].filter(Boolean).join(' · ');
    CC.sheet('Methodiek van deze training', `${wvTekst ? `<div class="tr-wv"><span class="tr-her w">Weekvoorstel</span> ${esc(wvTekst)}<button type="button" class="knop licht klein" data-act="tpWeekOver" data-id="${esc(el.dataset.id)}">Weekvoorstel overnemen</button><small class="zacht">Alleen als je het voor deze training kiest; lege velden worden aangevuld.</small></div>` : ''}<form class="codeform" data-autosave="tpMeth" data-id="${esc(el.dataset.id)}">
      <label for="pm-h">Hoofdthema</label><input id="pm-h" name="hoofdthema" value="${esc(m.hoofdthema || '')}" placeholder="Bijv. opbouwen tegen twee jagers">
      <label>Centraal voetbalprobleem</label>${sel('probleem', prs, m.probleem)}
      <details class="uitklap tr-precies" ${m.contra || m.contraTekst ? 'open' : ''}><summary>Contrathema (optioneel, voor de andere partij)</summary>
        <label>Contraprobleem</label>${sel('contra', prs, m.contra, 'Geen')}
        <label for="pm-ct">Eigen omschrijving</label><input id="pm-ct" name="contraTekst" value="${esc(/^\d+$/.test(m.contraTekst || '') ? '' : m.contraTekst || '')}" placeholder="Bijv. passlijn door as sluiten">
        <label>Ook (ondersteunend, optioneel)</label>${sel('contra2', prs, m.contra2, 'Geen')}<p></p></details>
      <div class="twee"><div><label>Hoofdgereedschap A</label>${sel('hg1', lds, (p.blokDoel || {}).A || null)}</div><div><label>Hoofdgereedschap B</label>${sel('hg2', lds, (p.blokDoel || {}).B || null)}</div></div>
      ${ll.length ? `<fieldset class="tr-chips"><legend>Ondersteunend gereedschap (optioneel)</legend>${ll.map((x) => `<label class="tr-chip"><input type="checkbox" name="ond" value="${esc(x.id)}" ${(m.ondersteunend || []).includes(x.id) ? 'checked' : ''}><span>${esc(x.naam)}</span></label>`).join('')}</fieldset>` : ''}
      <fieldset class="tr-chips"><legend>Beoogd leerniveau (één of twee)</legend>${T().niveaus(S).map((x) => `<label class="tr-chip"><input type="checkbox" name="niv" value="${esc(x.id)}" ${(m.niveaus || []).includes(x.id) ? 'checked' : ''}><span>${esc(x.naam)}</span></label>`).join('')}</fieldset>
      <label for="pm-g">Gewenst gedrag (één zin)</label><textarea id="pm-g" name="gedrag" rows="2">${esc(m.gedrag || '')}</textarea>
      <details class="uitklap tr-precies"><summary>Onderbouwing (weekformat)</summary>
        ${teamfuncties(S).length ? `<label>Teamfunctie</label>${sel('teamfunctie', teamfuncties(S).map((x) => [x.id, x.naam]), m.teamfunctie)}` : ''}
        <label for="pm-k">Handelingsketen (vrije tekst)</label><input id="pm-k" name="keten" list="pm-kl" value="${esc(ketenVan(S, m))}" placeholder="Bijv. waarnemen → voorbereiden → helpen"><datalist id="pm-kl">${ketens(S).map((k) => `<option value="${esc(k.naam)}">`).join('')}</datalist>
        <label for="pm-i">Relevante informatie</label><input id="pm-i" name="informatie" value="${esc(m.informatie || '')}">
        <label for="pm-r">Leerroute</label><input id="pm-r" name="route" value="${esc(m.route || '')}" placeholder="Bijv. gerichte vorm → 3v2 → SSG">
        <label for="pm-t">Transfermoment</label><input id="pm-t" name="transfer" value="${esc(m.transfer || '')}">
        <label for="pm-o">Technische onderbouw</label><input id="pm-o" name="onderbouw" value="${esc(m.onderbouw || '')}">
        <label for="pm-b">Observatiecriteria</label><input id="pm-b" name="observatie" value="${esc(m.observatie || '')}"><p></p></details>
      <button type="button" class="knop vol" data-act="sluitRender">Klaar</button></form>`, { groot: true }); });
  CC.on('tpWeekOver', (el) => { const S = CC.S(); const p = T().plan(S, el.dataset.id); if (!p) return; const wv = CC.trWeekVoorstel(S, p); const m = p.methodiek = { ...(p.methodiek || {}) };
    WEEKVELDEN.filter((k) => k !== 'thema' && !gevuld(m[k]) && gevuld(wv[k])).forEach((k) => { m[k] = JSON.parse(JSON.stringify(wv[k])); });
    p.blokDoel = { ...(p.blokDoel || {}) }; if (!p.blokDoel.A && wv.hg1) p.blokDoel.A = wv.hg1; if (!p.blokDoel.B && wv.hg2) p.blokDoel.B = wv.hg2;
    CC.save(); CC.closeSheet(); CC.render(); CC.toast('Weekvoorstel overgenomen voor deze training'); });
  CC.autosave.tpMeth = (f) => { const S = CC.S(); const p = T().plan(S, f.dataset.id); if (!p) return;
    const m = p.methodiek = { ...(p.methodiek || {}) };
    const nu = p.methodiek || {}; m.probleem = f.elements.probleem.value || null;
    const kt = f.elements.keten.value.trim(); m.ketenTekst = kt; m.keten = (ketens(S).find((k) => k.naam.toLowerCase() === kt.toLowerCase()) || {}).id || null;
    if (f.elements.teamfunctie) { m.teamfunctie = f.elements.teamfunctie.value || null; m.teamfunctieTekst = ''; }
    // Contra: alleen bij deze training vastzetten als er iets verandert (anders blijft het weekvoorstel staan)
    const c = f.elements.contra.value || null, c2 = f.elements.contra2.value || null, oudT = /^\d+$/.test(nu.contraTekst || '') ? '' : nu.contraTekst || '', ct = f.elements.contraTekst.value.trim();
    if (m.contraGekozen || c !== (nu.contra || null) || c2 !== (nu.contra2 || null) || ct !== oudT) { m.contra = c; m.contra2 = c2; m.contraTekst = ct; m.contraGekozen = true; }
    const ond = [...f.querySelectorAll('input[name="ond"]:checked')].map((x) => x.value);
    if (f.querySelector('input[name="ond"]') && ond.join() !== (nu.ondersteunend || []).join()) { m.ondersteunend = ond; m.ondersteunendTekst = ''; }
    ['hoofdthema', 'gedrag', 'informatie', 'route', 'transfer', 'onderbouw', 'observatie'].forEach((k) => { m[k] = f.elements[k].value.trim(); });
    m.niveaus = [...f.querySelectorAll('input[name="niv"]:checked')].map((x) => x.value);
    p.blokDoel = { ...(p.blokDoel || {}), A: f.elements.hg1.value || null, B: f.elements.hg2.value || null };
    // Titel van de training = het hoofdthema (anders het probleem), zolang je de titel niet zelf hebt veranderd
    const t = m.hoofdthema || (probleem(S, m.probleem) || {}).naam; if (t && (!p.thema || p.thema === (p.importThema || ''))) { p.thema = t; p.importThema = t; } };

  // ---------- Observatiepunten bij de wedstrijd (max. 3) en bespreekpunten in de week erna ----------
  const UITKOMST = ['Gezien', 'Deels', 'Niet gezien', 'Niet beoordeeld'];
  CC.trObservatie = (S, a) => { if (!actief(S)) return ''; const w = weekPlan(S, a.teamId, a.datum); const wd = w && w.wedstrijd && w.wedstrijd.actId === a.id ? w.wedstrijd : null; const pun = (wd && wd.punten) || [];
    const pr = probleem(S, (w && w.methodiek && w.methodiek.probleem) || null);
    return `<div class="kaartje tr-obsw"><b>Observatiepunten${pr ? ` · ${esc(pr.naam)}` : ''}</b><small class="zacht">Concept, gekoppeld aan het weekprobleem. Geen conclusie over beheersing; bespreekpunt voor de week erna.</small>
      ${pun.map((x, i) => `<div class="tr-ev"><b>${esc(x.tekst)}</b><div class="chips">${UITKOMST.map((u) => `<button type="button" class="chipknop ${x.uitkomst === u ? 'aan' : ''}" aria-pressed="${x.uitkomst === u}" data-act="obsUitkomst" data-id="${esc(a.id)}" data-i="${i}" data-w="${u}">${u}</button>`).join('')}<button type="button" class="icoonknop" data-act="obsPuntWeg" data-id="${esc(a.id)}" data-i="${i}" aria-label="Weghalen">${icon('trash-2')}</button></div></div>`).join('')}
      ${pun.length < 3 ? `<button class="knop licht vol" data-act="obsPuntNieuw" data-id="${esc(a.id)}">${icon('plus')}Observatiepunt (${pun.length} van max. 3)</button>` : ''}</div>`; };
  const wedVan = (S, a, maken) => { let w = weekPlan(S, a.teamId, a.datum); if (!w && maken) w = nieuwWeek(S, a.teamId, a.datum); if (!w) return null; if (!w.wedstrijd || w.wedstrijd.actId !== a.id) { if (!maken) return null; w.wedstrijd = { actId: a.id, punten: [] }; } return w.wedstrijd; };
  CC.on('obsPuntNieuw', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.id); if (!a) return; const w = weekPlan(S, a.teamId, a.datum); const pr = probleem(S, (w && w.methodiek && w.methodiek.probleem) || null);
    CC.sheet('Observatiepunt', `<form data-submit="obsPuntOk" data-id="${esc(a.id)}" class="codeform"><label for="ob-t">Wat wil je zien?</label><input id="ob-t" name="tekst" required maxlength="120" placeholder="${esc(pr ? pr.centraleVraag : 'Bijv. speelt na de aanname vooruit')}">${pr ? `<small class="zacht">Weekprobleem: ${esc(pr.naam)}</small>` : ''}<button class="knop vol">Toevoegen</button></form>`); });
  CC.on('obsPuntOk', (f) => { const S = CC.S(); const a = M.act(S, f.dataset.id); if (!a) return; const wd = wedVan(S, a, true); if (wd.punten.length >= 3) return;
    wd.punten.push({ id: T().nieuwId('ob'), tekst: f.tekst.value.trim(), uitkomst: null }); CC.save(); CC.closeSheet(); CC.render(); });
  CC.on('obsUitkomst', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.id); const wd = a && wedVan(S, a, false); const x = wd && wd.punten[Number(el.dataset.i)]; if (!x) return;
    x.uitkomst = x.uitkomst === el.dataset.w ? null : el.dataset.w; CC.save(); CC.render(); });
  CC.on('obsPuntWeg', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.id); const wd = a && wedVan(S, a, false); if (!wd) return; wd.punten.splice(Number(el.dataset.i), 1); CC.save(); CC.render(); });
  // Bespreekpunten: de uitkomsten van de laatste wedstrijd vóór deze training (de week ervoor of deze week)
  CC.trBespreek = (S, a) => { if (!actief(S) || !a || !a.datum) return '';
    const w = T().plannen(S).filter((p) => p.week && p.eigenaar === T().ik() && p.wedstrijd && (p.wedstrijd.punten || []).some((x) => x.uitkomst)).map((p) => ({ p, wa: M.act(S, p.wedstrijd.actId) }))
      .filter((x) => x.wa && x.wa.datum < a.datum && x.wa.datum >= D.addDays(a.datum, -9)).sort((x, y) => y.wa.datum.localeCompare(x.wa.datum))[0];
    if (!w) return ''; const d = D.parse(w.wa.datum);
    return `<div class="kaartje tr-bespreek"><b>Bespreekpunten van ${D.DAG_KORT[d.getDay()]} ${d.getDate()} ${D.MAAND[d.getMonth()]}</b>${w.p.wedstrijd.punten.filter((x) => x.uitkomst).map((x) => `<p class="klein">${esc(x.tekst)} — <b>${esc(x.uitkomst)}</b></p>`).join('')}<small class="zacht">Om te bespreken; ClubComm trekt hier geen conclusie uit.</small></div>`; };

  // ---------- Lijn: fase-overzicht per week, periodisering laden en terugdraaien ----------
  // ---------- Besluit 135: "Je zit in" en het weekthema (voor elke club; met periodisering komt de week uit Excel) ----------
  const weekVoorstel = (S, tid, datum) => { const w = datum ? weekPlan(S, tid, datum) : null; return (w && w.methodiek) || {}; };
  CC.trWeekDoel = (S, p, b) => { if (!p || p.week) return null; const a = T().actVan(S, p); const m = weekVoorstel(S, p.teamId || a.teamId, a.datum); return (b === 'A' ? m.hg1 : m.hg2) || null; };
  CC.trJeZitIn = (S, a) => { if (!a || !a.datum) return ''; const m = weekVoorstel(S, a.teamId || (CC.teamId && CC.teamId()), a.datum);
    const pr = probleem(S, m.probleem); const thema = pr ? pr.naam : m.probleemTekst || m.thema || '';
    const ab = [m.hg1 && `A ${T().ldNaam(S, m.hg1) || ''}`, m.hg2 && `B ${T().ldNaam(S, m.hg2) || ''}`].filter(Boolean).join(' · ');
    return `<button type="button" class="tr-zitin" data-act="trNaarLijn">${icon('flag')}<span><b>Week ${D.weeknr(a.datum)}${m.fase ? ` · ${esc(m.fase)}` : ''}</b> · ${thema || ab ? `${esc(thema)}${thema && ab ? ' · ' : ''}${esc(ab)}` : '<i>nog geen weekthema</i>'}</span><small>Lijn ›</small></button>`; };
  CC.on('trNaarLijn', () => { (CC.ui.seg = CC.ui.seg || {}).trSeg = 'lijn'; CC.render(); window.scrollTo(0, 0); });
  // Weekthema met A en B (clubs zonder periodisering): niet verplicht; komt als voorstel bij de trainingen van die week
  CC.trWeekthema = (S) => { if (actief(S)) return ''; const tid = CC.teamId && CC.teamId(); const nu = maandag(D.vandaag());
    const weken = Array.from({ length: 7 }, (_, i) => D.addDays(nu, (i - 1) * 7));
    const rijen = weken.map((w) => { const m = weekVoorstel(S, tid, w); const d = D.parse(w); const ab = [m.hg1, m.hg2].filter(Boolean).map((x) => esc(T().ldNaam(S, x) || '')).join(' · ');
      return `<button type="button" class="tr-rij ${w === nu ? 'aan' : ''}" data-act="trWeekBewerk" data-w="${w}"><span class="tr-code">wk ${D.weeknr(w)}</span><span class="tr-t"><b>${esc(m.thema || (ab ? 'Geen thema' : 'Nog leeg'))}</b><small>${d.getDate()} ${D.MAAND[d.getMonth()]}${ab ? ` · ${ab}` : ''}</small></span>${icon('pencil')}</button>`; }).join('');
    return `<div class="kaartje tr-weken"><b>Weekthema</b><small class="zacht">Niet verplicht. Wat je hier per week kiest, staat bovenaan bij Plannen en Week${T().leerdoelen(S).length ? '; A en B komen als voorstel bij de trainingen van die week' : ''}.</small><div class="tr-lijst">${rijen}</div></div>`; };
  CC.on('trWeekBewerk', (el) => { const S = CC.S(); const w = el.dataset.w; const tid = CC.teamId && CC.teamId(); const m = weekVoorstel(S, tid, w); const lds = T().leerdoelen(S).map((l) => [l.id, l.naam]);
    CC.sheet(`Week ${D.weeknr(w)}`, `<form class="codeform" data-autosave="trWeek" data-w="${w}">
      <label for="tw-t">Thema van de week</label><input id="tw-t" name="thema" value="${esc(m.thema || '')}" placeholder="Bijv. opbouwen onder druk">
      ${lds.length ? `<div class="twee"><div><label>Hoofdleerdoel A</label>${sel('hg1', lds, m.hg1)}</div><div><label>Hoofdleerdoel B</label>${sel('hg2', lds, m.hg2)}</div></div>
      <p class="zacht klein">Een training die zelf al A of B heeft, houdt die.</p>` : ''}<button type="button" class="knop vol" data-act="sluitRender">Klaar</button></form>`); });
  CC.autosave.trWeek = (f) => { const S = CC.S(); const tid = CC.teamId && CC.teamId(); const w = weekPlan(S, tid, f.dataset.w) || nieuwWeek(S, tid, f.dataset.w);
    w.methodiek = { ...(w.methodiek || {}), thema: f.elements.thema.value.trim(), hg1: f.elements.hg1 ? f.elements.hg1.value || null : null, hg2: f.elements.hg2 ? f.elements.hg2.value || null : null }; };

  // CSV (Excel: Opslaan als → CSV, puntkomma of komma). Eén regel per training of wedstrijd.
  // Kolommen gaan op naam; de kolomnamen uit het Excel-spoorboekje van DCG werken ook (ALIAS). Andere kolommen worden genegeerd.
  const KOLOMMEN = ['datum', 'soort', 'fase', 'week', 'hoofdthema', 'teamfunctie', 'probleem', 'contrathema', 'contraprobleem', 'contraondersteunend', 'gereedschapA', 'gereedschapB', 'ondersteunend', 'keten', 'leerniveau', 'gedrag', 'informatie', 'leerroute', 'transfer', 'onderbouw', 'observatie', 'model'];
  const ALIAS = { soort: ['type'], probleem: ['centraalvoetbalprobleem'], keten: ['handelingsketen'], leerniveau: ['beoogdleerniveau'], gedrag: ['gewenstgedrag'], informatie: ['relevanteinformatie'], transfer: ['transfermoment'],
    observatie: ['wedstrijdobservatie1', 'wedstrijdobservatie2', 'wedstrijdobservatie3'] };
  const csvLezen = (txt) => { txt = txt.replace(/^﻿/, ''); const eerste = txt.split(/\r?\n/)[0] || ''; const sep = (eerste.match(/;/g) || []).length >= (eerste.match(/,/g) || []).length ? ';' : ',';
    const rijen = []; let r = [], v = '', q = false;
    for (let i = 0; i < txt.length; i++) { const c = txt[i];
      if (q) { if (c === '"' && txt[i + 1] === '"') { v += '"'; i++; } else if (c === '"') q = false; else v += c; }
      else if (c === '"') q = true; else if (c === sep) { r.push(v); v = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && txt[i + 1] === '\n') i++; r.push(v); rijen.push(r); r = []; v = ''; } else v += c; }
    if (v !== '' || r.length) { r.push(v); rijen.push(r); }
    const kop = (rijen.shift() || []).map((x) => x.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    const waarde = (x, k) => { const namen = [k.toLowerCase(), ...(ALIAS[k] || [])]; return kop.map((n, i) => (namen.includes(n) ? String(x[i] || '').trim() : '')).filter(Boolean).join(' | '); };
    return rijen.filter((x) => x.some((y) => String(y).trim())).map((x) => Object.fromEntries(KOLOMMEN.map((k) => [k, waarde(x, k)]))); };
  const datumVan = (s) => { s = String(s || '').trim(); let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/); if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
    m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/); return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : null; };
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const zoekProbleem = (S, s) => { const n = norm(s); if (!n) return null; const nr = n.match(/^(\d)/); if (nr && problemen(S).find((x) => x.id === `vp-${nr[1]}`) && n.length <= 2) return `vp-${nr[1]}`;
    const x = problemen(S).find((p) => norm(p.naam) === n || norm(p.naam).includes(n.replace(/^\d+/, '')) && n.replace(/^\d+/, '').length > 5); return x ? x.id : (nr ? `vp-${nr[1]}` : null); };
  const zoekLd = (S, s) => { const n = norm(s); if (!n) return null; const l = T().leerdoelen(S).find((x) => norm(x.naam) === n || norm(x.naam).startsWith(n) || n.startsWith(norm(x.naam).slice(0, 8)) || (x.kern && norm(x.kern) === n)); return l ? l.id : null; };
  const zoekNiveaus = (S, s) => String(s || '').split(/[-–→>,/]+/).map((x) => (T().niveaus(S).find((n) => norm(n.naam) === norm(x)) || {}).id).filter(Boolean);
  const zoekKeten = (S, s) => { const n = norm(s); return n ? ((ketens(S).find((k) => norm(k.naam) === n) || {}).id || null) : null; };
  const zoekTf = (S, s) => { const n = norm(s); return n ? ((teamfuncties(S).find((x) => norm(x.naam) === n) || {}).id || null) : null; };
  // Ondersteunend: één of meer gereedschappen gescheiden door ; of , (bijv. "Passen – Helpen; Vrijkomen – Timen"); de tekst blijft bewaard
  const zoekOnd = (S, s) => String(s || '').split(/[;,]/).map((x) => x.replace(/\(.*\)/, '').trim()).filter(Boolean).map((x) => ({ x, id: zoekLd(S, x) }));

  // Voorbeeld: welke echte activiteit van het team krijgt wat? Alleen trainingen zonder voorbereiding krijgen een concept.
  const voorbeeld = (S, rows, bestand) => { const tid = CC.teamId && CC.teamId(); const uit = [];
    rows.forEach((r, i) => { const datum = datumVan(r.datum); const soort = /wed/i.test(r.soort) ? 'wedstrijd' : 'training'; const fout = [];
      if (!datum) { uit.push({ i, r, actie: 'fout', reden: `onbekende datum "${r.datum}"` }); return; }
      const acts = M.acts(S, tid, datum, datum).filter((a) => !a.afgelast && (soort === 'wedstrijd' ? M.isWed(a) : a.soort === 'training'));
      if (!acts.length) { uit.push({ i, r, datum, soort, actie: 'overslaan', reden: `geen ${soort} van ${CC.tn(tid)} op deze dag in de kalender` }); return; }
      const a = acts[0];
      const pr = zoekProbleem(S, r.probleem), A = zoekLd(S, r.gereedschapA), B = zoekLd(S, r.gereedschapB), niv = zoekNiveaus(S, r.leerniveau), keten = zoekKeten(S, r.keten);
      // Contra: de kolom contraprobleem (nummer of naam) beslist; zonder die kolom alleen bij een exacte naam of een nummer, nooit op losse woorden
      const contra = r.contraprobleem ? zoekProbleem(S, r.contraprobleem) : zoekProbleem(S, r.contrathema), contra2 = zoekProbleem(S, r.contraondersteunend);
      const ond = zoekOnd(S, r.ondersteunend), tf = zoekTf(S, r.teamfunctie);
      if (r.probleem && !pr) fout.push(`probleem "${r.probleem}" onbekend (tekst blijft staan)`);
      if (r.contraprobleem && !contra) fout.push(`contraprobleem "${r.contraprobleem}" onbekend`); else if (r.contrathema && !contra) fout.push(`contrathema "${r.contrathema}" nog niet gekoppeld aan een probleem (ter controle; tekst blijft staan)`);
      if (r.contraondersteunend && !contra2) fout.push(`contraprobleem (ook) "${r.contraondersteunend}" onbekend`);
      ond.filter((o) => !o.id).forEach((o) => fout.push(`ondersteunend "${o.x}" onbekend (tekst blijft staan)`)); if (r.teamfunctie && !tf) fout.push(`teamfunctie "${r.teamfunctie}" onbekend (tekst blijft staan)`); if (r.gereedschapA && !A) fout.push(`gereedschap A "${r.gereedschapA}" onbekend`); if (r.gereedschapB && !B) fout.push(`gereedschap B "${r.gereedschapB}" onbekend`);
      if (r.leerniveau && !niv.length) fout.push(`leerniveau "${r.leerniveau}" onbekend`);
      const m = { hoofdthema: r.hoofdthema, teamfunctie: tf, teamfunctieTekst: tf ? '' : r.teamfunctie, probleem: pr, probleemTekst: r.probleem, contra, contra2, contraTekst: r.contrathema, hg1: A, hg2: B,
        ondersteunend: ond.map((o) => o.id).filter((x) => x && x !== A && x !== B), ondersteunendTekst: r.ondersteunend, keten, ketenTekst: r.keten, niveaus: niv, gedrag: r.gedrag, informatie: r.informatie, route: r.leerroute, transfer: r.transfer, onderbouw: r.onderbouw,
        observatie: soort === 'training' ? r.observatie.split(' | ').join('; ') : '', fase: r.fase, week: /^\d+$/.test(r.week) ? `wk ${r.week}` : r.week };
      if (soort === 'wedstrijd') { const punten = String(r.observatie || '').split('|').map((x) => x.trim()).filter(Boolean).slice(0, 3); const w = weekPlan(S, tid, datum);
        const al = w && w.wedstrijd && w.wedstrijd.actId === a.id && (w.wedstrijd.punten || []).length;
        uit.push({ i, r, datum, soort, a, m, punten, actie: al ? 'overslaan' : punten.length || r.hoofdthema ? 'observatie' : 'niets', reden: al ? 'heeft al observatiepunten (blijven zoals ze zijn)' : [punten.length ? `${punten.length} observatiepunt${punten.length === 1 ? '' : 'en'}` : '', r.hoofdthema ? 'wedstrijdsituatie' : ''].filter(Boolean).join(' + ') || 'geen observatiepunten', fout }); return; }
      const p = T().plan(S, a.id);
      if (!r.probleem && !r.gereedschapA && !r.gereedschapB && !r.leerniveau && !r.gedrag) { uit.push({ i, r, datum, soort, a, m, actie: 'niets', reden: 'regel is nog leeg', fout }); return; }
      uit.push({ i, r, datum, soort, a, m, actie: p ? 'overslaan' : 'concept', reden: p ? (p.bron === bestand ? 'al geladen' : 'heeft al een voorbereiding (blijft zoals hij is)') : 'krijgt een concept', fout }); });
    // dubbel in het bestand: alleen de eerste regel per activiteit
    const gezien = {}; uit.forEach((x) => { if (!x.a) return; const k = x.a.id; if (gezien[k] && x.actie !== 'fout') { x.actie = 'overslaan'; x.reden = 'staat dubbel in het bestand'; } gezien[k] = true; });
    return uit; };
  // Stempel: zo kunnen we later zien of je een concept hebt aangepast (dan wordt het nooit verwijderd)
  // De database (jsonb) verandert de volgorde van de velden; daarom met gesorteerde sleutels, zodat de stempel na herladen gelijk blijft
  const geordend = (x) => (Array.isArray(x) ? x.map(geordend) : x && typeof x === 'object' ? Object.keys(x).sort().reduce((o, k) => { if (x[k] !== undefined) o[k] = geordend(x[k]); return o; }, {}) : x);
  // Korte controlecode (FNV-1a, 2 × 32 bit) in plaats van de hele tekst: kleinere rijen, zelfde vergelijking
  const code = (t) => { let a = 0x811c9dc5, b = 0x01000193 ^ t.length; for (let i = 0; i < t.length; i++) { const c = t.charCodeAt(i); a = Math.imul(a ^ c, 0x01000193) >>> 0; b = Math.imul(b ^ c, 0x5bd1e995) >>> 0; } return `s${a.toString(36)}${b.toString(36)}`; };
  const stempel = (p) => code(JSON.stringify(geordend([p.thema, p.onderdelen, p.methodiek, p.blokDoel, p.overig, p.sjabloon, !!p.gegeven, p.anders || '', p.evaluatie || null])));
  const toevoegen = (S, lijst, bestand) => { const tid = CC.teamId && CC.teamId(); const sj = T().sjablonen(S); let n = 0, wk = 0, ob = 0;
    lijst.forEach((x) => { if (!x.a) return;
      let w = weekPlan(S, tid, x.datum); if (!w) { w = nieuwWeek(S, tid, x.datum, bestand); w.methodiek = Object.fromEntries(WEEKVELDEN.filter((k) => gevuld(x.m[k])).map((k) => [k, x.m[k]])); w.stempel = stempel(w); wk++; }
      // Besluit 144: dagwaarden van een training die al een eigen voorbereiding had, alleen ter informatie bij die dag (alleen in een nieuw weekplan)
      const eigen = x.actie === 'overslaan' && x.soort === 'training' && T().plan(S, x.a.id) && T().plan(S, x.a.id).bron !== bestand;
      if (eigen && w.bron === bestand && !(w.dagen || {})[x.datum]) w.dagen = { ...(w.dagen || {}), [x.datum]: { hoofdthema: x.m.hoofdthema || '', niveaus: x.m.niveaus || [], route: x.m.route || '' } };
      if (x.actie === 'observatie') { w.wedstrijd = { actId: x.a.id, punten: x.punten.map((t) => ({ id: T().nieuwId('ob'), tekst: t, uitkomst: null })), context: x.m.hoofdthema || '', bron: bestand }; ob++; return; }
      if (x.actie !== 'concept' || T().plan(S, x.a.id)) return;
      const s = sj.find((y) => /afwissel|interleav/i.test(x.r.model) ? y.model === 'interleaving' : y.model !== 'interleaving') || sj[0];
      const nv1 = x.m.niveaus[0] || null, nv2 = x.m.niveaus[1] || nv1;
      const p = { id: `tp-${x.a.id}`, actId: x.a.id, teamId: x.a.teamId, datum: x.a.datum, eigenaar: T().ik(), thema: x.m.hoofdthema || (probleem(S, x.m.probleem) || {}).naam || x.m.probleemTekst || '', leerdoelen: [], spelers: null, keepers: null,
        sjabloon: s ? s.id : null, overig: s && s.overig ? { ...s.overig } : null, blokDoel: { A: x.m.hg1, B: x.m.hg2 }, methodiek: { ...x.m }, bron: bestand, concept: true,
        onderdelen: s ? (s.blokken || []).map((b) => ({ id: T().nieuwId('o'), blok: b.blok, min: Number(b.min) || 0, spacing: b.blok === 'S', naam: b.blok === 'S' ? '' : b.naam || '', sjabloonFase: b.fase || null,
          niveauVoorstel: /1$/.test(b.blok) ? nv1 : /2$/.test(b.blok) ? nv2 : null })) : [] };
      p.importThema = p.thema; p.stempel = stempel(p); T().plannen(S).push(p); n++; });
    return { n, wk, ob }; };
  const PV = () => CC.ui.per || (CC.ui.per = {});
  const voorbeeldHtml = (S) => { const pv = PV(); if (!pv.rows) return '';
    const l = voorbeeld(S, pv.rows, pv.bestand); const c = (a) => l.filter((x) => x.actie === a).length; const fouten = l.filter((x) => (x.fout || []).length);
    return `<div class="kaartje"><b>Wat er gebeurt (${esc(pv.bestand)})</b>
      <p>✓ <b>${c('concept')} training${c('concept') === 1 ? '' : 'en'}</b> krijgen een concept (probleem, gereedschappen, leerniveau, gedrag; plekken leeg)</p>
      <p>✓ <b>${c('observatie')} wedstrijd${c('observatie') === 1 ? '' : 'en'}</b> krijgen observatiepunten</p>
      <p>– <b>0 bestaande trainingen</b> worden gewijzigd of verwijderd · <b>${c('overslaan')}</b> overgeslagen · <b>geen</b> oefenvormen of tekeningen</p>
      ${c('fout') ? `<p style="color:var(--rood)">⚠ ${c('fout')} regel(s) met een fout worden niet geladen.</p>` : ''}${fouten.length ? (() => { const u = [...new Set(fouten.flatMap((x) => x.fout))]; return `<p style="color:#8a4b00">⚠ ${fouten.length} regel(s) ter controle (de tekst blijft staan): ${esc(u.slice(0, 4).join('; '))}${u.length > 4 ? ' …' : ''}</p>`; })() : ''}</div>
      <div class="tr-tabel"><table class="tr-pv"><thead><tr><th>Datum</th><th>Activiteit in de kalender</th><th>Probleem</th><th>Wat</th></tr></thead><tbody>
      ${l.map((x) => `<tr class="${x.actie}"><td>${x.datum ? esc(D.kort(x.datum)) : esc(x.r.datum)}</td><td>${x.a ? `${esc(x.a.soort === 'training' ? 'Training' : 'Wedstrijd')} ${esc(x.a.tijd || '')}${x.a.eind ? `–${esc(x.a.eind)}` : ''}` : '—'}</td><td>${esc(x.m ? (probleem(S, x.m.probleem) || {}).naam || x.m.probleemTekst || '' : '')}</td><td>${esc(x.reden)}</td></tr>`).join('')}</tbody></table></div>
      <div class="knoppen"><button class="knop" data-act="perToevoegen" ${c('concept') + c('observatie') ? '' : 'disabled'}>Toevoegen</button><button class="knop licht" data-act="sluit">Annuleren</button></div>`; };
  CC.on('perLaden', () => { const pv = PV(); pv.rows = null; pv.bestand = '';
    CC.sheet('Periodisering laden', `<p>Kies de planning uit Excel, <b>opgeslagen als CSV</b>. Je ziet eerst wat er gebeurt; pas na <b>Toevoegen</b> verandert er iets.</p>
      <input type="file" id="perBestand" accept=".csv,text/csv" aria-label="CSV-bestand kiezen">
      <button class="knop licht" data-act="perSjabloon">${icon('list-checks')}Leeg sjabloon met de echte data (CSV)</button>
      <div data-per-voorbeeld></div>`, { groot: true }); });
  document.addEventListener('change', (e) => { if (e.target.id !== 'perBestand' || !e.target.files[0]) return; const f = e.target.files[0]; const r = new FileReader();
    r.onload = () => { const pv = PV(); pv.rows = csvLezen(String(r.result)); pv.bestand = f.name.replace(/\.[^.]+$/, ''); const v = document.querySelector('[data-per-voorbeeld]'); if (v) v.innerHTML = voorbeeldHtml(CC.S()); }; r.readAsText(f); });
  CC.on('perToevoegen', () => { const S = CC.S(); const pv = PV(); if (!pv.rows) return; const r = toevoegen(S, voorbeeld(S, pv.rows, pv.bestand), pv.bestand);
    CC.save(); CC.closeSheet(); CC.render(); CC.toast(`${r.n} concepttraining${r.n === 1 ? '' : 'en'}, ${r.wk} weekplan${r.wk === 1 ? '' : 'nen'} en ${r.ob} wedstrijd${r.ob === 1 ? '' : 'en'} toegevoegd`); });
  // Leeg sjabloon: de echte trainingen en wedstrijden van het team (vanaf vandaag, 12 weken), om in Excel in te vullen
  CC.on('perSjabloon', () => { const S = CC.S(); const tid = CC.teamId && CC.teamId(); const acts = M.acts(S, tid, D.vandaag(), D.addDays(D.vandaag(), 84)).filter((a) => !a.afgelast && (a.soort === 'training' || M.isWed(a)));
    const csv = [KOLOMMEN.join(';'), ...acts.map((a) => [a.datum, a.soort === 'training' ? 'training' : 'wedstrijd', '', `wk ${D.weeknr(a.datum)}`, ...Array(KOLOMMEN.length - 4).fill('')].join(';'))].join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })); const l = document.createElement('a'); l.href = url; l.download = `periodisering-${CC.tn(tid) || 'team'}.csv`; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); });
  // Terugdraaien: alleen concepten die niet zijn aangepast (stempel gelijk, niet gegeven); de rest blijft en wordt gemeld
  const terugLijst = (S) => { const l = T().plannen(S).filter((p) => p.bron && p.eigenaar === T().ik()); return { weg: l.filter((p) => p.stempel && p.stempel === stempel(p) && !p.gegeven && !(p.week && p.wedstrijd && (p.wedstrijd.punten || []).some((x) => x.uitkomst))), blijft: l.filter((p) => !(p.stempel && p.stempel === stempel(p)) || p.gegeven) }; };
  CC.on('perTerug', () => { const S = CC.S(); const t = terugLijst(S);
    CC.sheet('Geladen concepten verwijderen', `<p><b>${t.weg.length}</b> concept(en) worden verwijderd: niet aangepast en niet gegeven.</p><p><b>${t.blijft.length}</b> blijven staan, omdat je ze hebt aangepast of gegeven.</p>
      <div class="knoppen"><button class="knop rood" data-act="perTerugOk" ${t.weg.length ? '' : 'disabled'}>Verwijderen</button><button class="knop licht" data-act="sluit">Annuleren</button></div>`); });
  CC.on('perTerugOk', () => { const S = CC.S(); const weg = new Set(terugLijst(S).weg); S.trainingsplannen = T().plannen(S).filter((p) => !weg.has(p)); CC.save(); CC.closeSheet(); CC.render(); CC.toast(`${weg.size} concept(en) verwijderd`); });
  // ---------- Besluit 138: Mijn lijn (één overzicht), vaststellen, afgelaste training ----------
  CC.trMethodiekActief = actief;
  const teamActs = (S, tid, van, tot) => M.acts(S, tid, van, tot).filter((a) => a.soort === 'training').sort((x, y) => `${x.datum}${x.tijd || ''}`.localeCompare(`${y.datum}${y.tijd || ''}`));
  const mijnWeken = (S, tid) => T().plannen(S).filter((p) => p.week && p.eigenaar === T().ik() && (p.teamId || '') === (tid || '')).sort((x, y) => String(x.datum).localeCompare(String(y.datum)));
  const uitMin = (S, p) => (p.gegeven ? (p.onderdelen || []).filter((o) => o.vormId && !o.spacing && o.blok !== 'start').reduce((t, o) => t + (o.minUit != null ? Number(o.minUit) : Number(o.min) || 0), 0) : 0);
  const bol = (S, a) => { const p = T().plan(S, a.id); const d = D.parse(a.datum); const dag = `${D.DAG_KORT[d.getDay()]} ${d.getDate()}`;
    if (a.afgelast) return `<span class="tr-bol x" title="${dag}: afgelast">✕<i class="sr">${dag} afgelast</i></span>`;
    const st = p ? CC.trStatusVan(S, p) : null; const k = st === 'gegeven' ? 'gegeven' : st === 'uitgewerkt' ? 'uitgewerkt' : p ? 'gepland' : 'nog niet voorbereid';
    return `<span class="tr-bol ${st || ''}" title="${dag}: ${k}"><i class="sr">${dag} ${k}</i></span>`; };
  // Stap x van y (Besluit 141): de plaats van deze training in de week, met het leerniveau uit de methodiek
  CC.trStap = (S, p, a) => { if (!actief(S) || !p || p.week || !a || !a.datum) return ''; const ma = maandag(a.datum);
    const tr = teamActs(S, p.teamId || a.teamId, ma, D.addDays(ma, 6)).filter((x) => !x.afgelast); const i = tr.findIndex((x) => x.id === a.id); if (i < 0 || tr.length < 2) return '';
    const n = nv(S, (p.methodiek || {}).niveaus); return `<small class="tr-stap"><b>Stap ${i + 1} van ${tr.length}</b>${n ? ` · <span class="tr-niv">${esc(n)}</span>` : ''}</small>`; };
  // Besluit 144: alleen wat bij de training zelf staat; het weekvoorstel apart (CC.trWeekVoorstel)
  CC.trMethodiekVan = (S, p) => (p && p.methodiek) || {};
  // Minuten van een week (optie A): uitgevoerd in oefenvormen en toegerekend aan een gereedschap (zelfde regels als in Week)
  const weekMin = (S, ps) => ps.filter((p) => p.gegeven && CC.trMinuten).map((p) => CC.trMinuten(S, p)).reduce((t, m) => { t.vormen += m.vormen; t.open += m.vormenNc; t.gsTotaal += m.gsTotaal; Object.entries(m.gs).forEach(([k, n]) => { t.gs[k] = (t.gs[k] || 0) + n; }); return t; }, { vormen: 0, open: 0, gsTotaal: 0, gs: {} });
  const LW = () => CC.ui.lijnWeek;
  CC.trMijnLijn = (S) => { const tid = CC.teamId && CC.teamId(); const nu = maandag(D.vandaag());
    // Weken uit de periodisering, aangevuld met weken waarin je zelf een training hebt voorbereid (ook zonder periodisering)
    const wp = mijnWeken(S, tid); const extra = [...new Set(T().plannen(S).filter((p) => !p.week && p.eigenaar === T().ik() && (p.teamId || '') === (tid || '') && T().actVan(S, p).datum).map((p) => maandag(T().actVan(S, p).datum)))]
      .filter((d) => !wp.some((w) => w.datum === d)).map((d) => ({ datum: d, methodiek: null }));
    const weken = wp.concat(extra).sort((x, y) => String(x.datum).localeCompare(String(y.datum)));
    const vast = wp.find((w) => w.vastgesteld); const vd = vast && D.parse(vast.vastgesteld);
    const openW = LW() !== undefined ? LW() : (weken.find((w) => w.datum === nu) || {}).datum || null;
    const rijen = weken.map((w) => { const acts = teamActs(S, tid, w.datum, D.addDays(w.datum, 6)); const ps = acts.map((a) => T().plan(S, a.id)).filter(Boolean);
      const m = w.methodiek || methodiek(S, ps[0]) || {}; const pr = probleem(S, m.probleem); if (!w.methodiek && !pr && ps[0]) m.probleemTekst = ps[0].thema;
      if (!w.methodiek && ps[0]) { m.hg1 = m.hg1 || T().blokDoel(S, ps[0], 'A'); m.hg2 = m.hg2 || T().blokDoel(S, ps[0], 'B'); } // Leerniveau van de week: van het begin van de eerste training tot het eind van de laatste
      const nl = ps.map((p) => (p.methodiek || {}).niveaus || []).filter((x) => x.length); const niv = nl.length ? [...new Set([nl[0][0], nl[nl.length - 1][nl[nl.length - 1].length - 1]])] : [];
      const wd = w.wedstrijd && (w.wedstrijd.punten || []); const mn = weekMin(S, ps);
      const ab = [m.hg1 && `A ${T().ldNaam(S, m.hg1)}`, m.hg2 && `B ${T().ldNaam(S, m.hg2)}`].filter(Boolean).join(' · ');
      const open = w.datum === openW;
      return `<button type="button" class="tr-rij tr-wk ${w.datum === nu ? 'aan' : ''} ${open ? 'open' : ''}" data-act="perWeekOpen" data-w="${esc(w.datum)}" aria-expanded="${open}"><span class="tr-code">wk ${D.weeknr(w.datum)}</span>
        <span class="tr-t"><b>${esc(pr ? pr.naam : m.probleemTekst || '—')}</b><small>${esc(ab)}</small>${niv.length ? `<small><span class="tr-niv">${esc(nv(S, niv))}</span></small>` : ''}</span>
        <span class="tr-wkst">${acts.map((a) => bol(S, a)).join('')}${wd && wd.length ? `<small>W ${wd.filter((x) => x.uitkomst).length}/${wd.length}</small>` : ''}${mn.vormen ? `<small>${mn.vormen} min uitgevoerd${mn.open ? ', deels niet gecontroleerd' : ''}</small>` : ''}</span></button>
        ${open ? weekDetail(S, w, m, acts, mn) : ''}`; }).join('');
    const kop = `<b>Mijn lijn${weken.length ? ` · ${weken.length} weken` : ''}${vast ? ` <span class="tr-stat v">Vastgelegd ${vd.getDate()} ${D.MAAND[vd.getMonth()]}</span>` : wp.length ? ' <span class="tr-stat g">Concept</span>' : ''}</b>`;
    return `<div class="kaartje tr-per"><div class="tr-kop">${kop}<div class="knoppen"><button class="knop ${wp.length ? 'licht' : ''}" data-act="perBeheer">${icon('list-checks')}Beheer ▾</button></div></div>
      ${rijen ? `<div class="tr-lijst">${rijen}</div><small class="zacht tr-legenda2"><span class="tr-bol"></span> gepland · <span class="tr-bol uitgewerkt"></span> uitgewerkt · <span class="tr-bol gegeven"></span> gegeven · <span class="tr-bol x">✕</span> afgelast. Tik op een week voor de opbouw; tik op een training om te plannen.</small>`
        : '<small class="zacht">Nog geen periodisering. Laad je planning uit Excel via Beheer, of vul per training de methodiek in.</small>'}</div>`; };
  // Weekdetail: opbouw van de week (training voor training), de wedstrijd en de minuten met hun echte naam
  const weekDetail = (S, w, m, acts, mn) => { const ond = ondersteunendVan(S, m); const wd = w.wedstrijd && (w.wedstrijd.punten || []); const wa = w.wedstrijd && M.act(S, w.wedstrijd.actId);
    const stappen = acts.map((a) => { const p = T().plan(S, a.id); const d = D.parse(a.datum); const n = p ? nv(S, (p.methodiek || {}).niveaus) : '';
      const st = a.afgelast ? 'afgelast' : p ? ({ gegeven: 'gegeven', uitgewerkt: 'uitgewerkt', gepland: 'gepland' })[CC.trStatusVan(S, p)] : 'nog niet voorbereid';
            // Besluit 141: zolang er bij een gegeven training oefenvormen zijn zonder echte minuten; verdwijnt vanzelf na controleren
      const nc = p && p.gegeven && (p.onderdelen || []).some((o) => o.vormId && !o.spacing && o.minUit == null);
      return `<button type="button" class="tr-rij tr-stapknop" data-act="perNaarWeek" data-id="${esc(a.id)}">${bol(S, a)}<span class="tr-t"><b>${D.DAG_KORT[d.getDay()]} ${d.getDate()} ${D.MAAND[d.getMonth()]}${n ? ` · ${esc(n)}` : ''}</b><small>${esc([p && p.thema, st].filter(Boolean).join(' · '))}</small>${nc ? '<small><span class="tr-stat g tr-nc">Minuten nog niet gecontroleerd</span></small>' : ''}</span>${icon('chevron-right')}</button>`; }).join('');
    const gs = Object.entries(mn.gs).sort((x, y) => y[1] - x[1]).map(([x, n]) => `${esc(T().ldNaam(S, x) || 'onbekend')} ${n}`).join(' · ');
    return `<div class="tr-wdet">${ond ? `<small class="zacht">Ondersteunend: ${esc(ond)}</small>` : ''}
      <b class="tr-wdkop">Opbouw van de week</b>${stappen ? `<div class="tr-lijst">${stappen}</div>` : '<small class="zacht">Geen trainingen in de kalender.</small>'}
      ${wd && wd.length ? `<small>Wedstrijd${wa ? ` ${D.DAG_KORT[D.parse(wa.datum).getDay()]} ${D.parse(wa.datum).getDate()}` : ''}: ${wd.filter((x) => x.uitkomst).length} van ${wd.length} observatiepunten beoordeeld</small>` : ''}
      ${mn.vormen ? `<small>Uitgevoerd in oefenvormen: <b>${mn.vormen} min</b>${mn.open ? ` (inclusief ${mn.open} nog niet gecontroleerde minuten)` : ''} · toegerekend aan een gereedschap: <b>${mn.gsTotaal} min</b>${gs ? ` (${gs})` : ''}</small>` : ''}</div>`; };
  CC.on('perWeekOpen', (el) => { CC.ui.lijnWeek = LW() === el.dataset.w || (LW() === undefined && el.classList.contains('open')) ? null : el.dataset.w; CC.render(); });
  // Beheer: wat je zelden doet, met wat het echt doet
  CC.on('perBeheer', () => { const S = CC.S(); const tid = CC.teamId && CC.teamId(); const wp = mijnWeken(S, tid); const vast = wp.find((w) => w.vastgesteld);
    const geladen = T().plannen(S).some((p) => p.bron && p.eigenaar === T().ik());
    const rij = (act, tekst, uitleg, extra) => `<button class="knop licht vol" data-act="${act}" ${extra || ''}>${tekst}</button><small class="zacht">${uitleg}</small>`;
    CC.sheet('Beheer periodisering', `<div class="knoppen kolom tr-beheer">
      ${rij('perLaden', `${icon('list-checks')}Periodisering laden…`, 'Vult alleen trainingen zonder voorbereiding. Overschrijft nooit iets.')}
      ${wp.length ? (vast ? rij('perConcept', 'Weer op concept zetten', `Vastgelegd op ${D.kort(vast.vastgesteld)}. Haalt die datum weg; daarna kun je geladen concepten weer verwijderen.`)
        : rij('perVast', 'Periodeplanning vastleggen', 'Zet de datum van vandaag op de weekplannen. Trainingen worden <b>niet</b> vergrendeld: je kunt elke training blijven aanpassen. Geladen concepten verwijderen kan daarna niet meer.')) : ''}
      ${geladen && !vast ? rij('perTerug', 'Geladen concepten verwijderen…', 'Alleen concepten die je niet hebt aangepast en die niet zijn gegeven. Je ziet eerst hoeveel.') : ''}</div>`); });
  CC.on('perNaarWeek', (el) => { const g = (CC.ui.seg = CC.ui.seg || {}); g.trSeg = 'plannen'; g.aanwAct = el.dataset.id; CC.render(); window.scrollTo(0, 0); });
  // Periodeplanning vastleggen (Besluit 138, naam Besluit 141): datum op de weekplannen; geen verwijderen meer; per training blijft alles aan te passen
  CC.on('perVast', () => { const S = CC.S(); const tid = CC.teamId && CC.teamId(); mijnWeken(S, tid).forEach((w) => { w.vastgesteld = D.vandaag(); }); CC.save(); CC.closeSheet(); CC.render(); CC.toast('Periodeplanning vastgelegd; trainingen blijven aan te passen'); });
  CC.on('perConcept', () => { const S = CC.S(); const tid = CC.teamId && CC.teamId(); mijnWeken(S, tid).forEach((w) => { delete w.vastgesteld; }); CC.save(); CC.closeSheet(); CC.render(); });
  // Afgelaste training met een concept: één keer signaleren; jij kiest doorschuiven of laten vervallen
  const afgelast = (S) => { const tid = CC.teamId && CC.teamId(); return T().plannen(S).filter((p) => !p.week && p.eigenaar === T().ik() && p.methodiek && !p.gegeven && !p.afgelastKeuze && (p.teamId || '') === (tid || ''))
    .map((p) => ({ p, a: M.act(S, p.actId) })).filter((x) => x.a && x.a.afgelast).sort((x, y) => x.a.datum.localeCompare(y.a.datum)); };
  const doelTekst = (S, p) => { const m = p.methodiek || {}; return [p.thema || (probleem(S, m.probleem) || {}).naam, [p.blokDoel && p.blokDoel.A && `A ${T().ldNaam(S, p.blokDoel.A)}`, p.blokDoel && p.blokDoel.B && `B ${T().ldNaam(S, p.blokDoel.B)}`].filter(Boolean).join(' · '), nv(S, m.niveaus)].filter(Boolean).join(' · '); };
  CC.trAfgelast = (S) => { if (!actief(S)) return ''; const x = afgelast(S)[0]; if (!x) return ''; const d = D.parse(x.a.datum);
    return `<div class="kaartje tr-afg"><b>Training van ${D.DAG_KORT[d.getDay()]} ${d.getDate()} ${D.MAAND[d.getMonth()]} is afgelast</b><small>Doel: ${esc(doelTekst(S, x.p))}</small>
      <div class="knoppen"><button class="knop" data-act="perDoor" data-id="${esc(x.p.id)}">Doorschuiven</button><button class="knop licht" data-act="perVerval" data-id="${esc(x.p.id)}">Laten vervallen</button></div>
      <small class="zacht">Doorschuiven: de volgende trainingen krijgen elk het doel van de training ervoor, tot een training die je al hebt aangepast of gegeven.</small></div>`; };
  const DOEL = ['thema', 'importThema', 'methodiek', 'blokDoel'];
  CC.on('perDoor', (el) => { const S = CC.S(); CC.trBorgOrigineel(S); const p0 = T().plannen(S).find((p) => p.id === el.dataset.id); if (!p0) return; const a0 = M.act(S, p0.actId);
    const volgend = teamActs(S, p0.teamId, D.addDays(a0.datum, 1), '2999-12-31').filter((a) => !a.afgelast).map((a) => T().plan(S, a.id)).filter(Boolean);
    let mee = Object.fromEntries(DOEL.map((k) => [k, p0[k]])); let n = 0, stop = null;
    for (const q of volgend) { if (q.gegeven || !q.concept || q.stempel !== stempel(q)) { stop = q; break; }
      const was = Object.fromEntries(DOEL.map((k) => [k, q[k]])); DOEL.forEach((k) => { q[k] = mee[k]; });
      const nv1 = (q.methodiek.niveaus || [])[0] || null, nv2 = (q.methodiek.niveaus || [])[1] || nv1; (q.onderdelen || []).forEach((o) => { if (!o.niveau && o.blok) o.niveauVoorstel = /1$/.test(o.blok) ? nv1 : /2$/.test(o.blok) ? nv2 : o.niveauVoorstel; });
      q.stempel = stempel(q); mee = was; n++; }
    p0.afgelastKeuze = 'doorgeschoven'; CC.save(); CC.render();
    CC.toast(`${n} training${n === 1 ? '' : 'en'} doorgeschoven${stop ? ` tot ${T().dagNaam(T().actVan(S, stop))}` : ''}; het doel "${mee.thema || ''}" valt weg`); });
  CC.on('perVerval', (el) => { const S = CC.S(); const p = T().plannen(S).find((x) => x.id === el.dataset.id); if (!p) return; p.afgelastKeuze = 'vervallen'; CC.save(); CC.render(); });
  CC.periodisering = { csvLezen, voorbeeld, toevoegen, stempel, weekId };
})();
