// ClubComm — Ontwikkelgesprek: voorbereiding, gesprekspagina en terugkijken (Besluit 66)
// 1. Voorbereiding (ouder + kind, thuis): zelfbeoordeling per vaardigheid (1–10, onderbouw drie smileys), droom,
//    wat is leuk, wat is lastig. Opgeslagen per speler en moment (ontwVoorb).
// 2. Gesprekspagina (trainer, tijdens het gesprek): scores van kind en trainer naast elkaar (groot verschil uitgelicht),
//    droom, max. 3 doelen (wat ga je doen, hoe helpt de trainer, hoe helpen ouders), afspraken, notitie (alleen staf).
//    Alles wordt meteen opgeslagen tijdens het typen (ontwVerslag, ontwNotitie, beoord).
// 3. Terugkijken: bij het volgende gesprek de droom en doelen van toen, per doel bereikt / deels / nog niet, en de groei.
// Ouders zien het verslag (zonder notitie) een dag na het gesprek, net als de beoordeling (Besluit 23).
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;
  const sl = (pl, mid) => `${pl}|${mid}`;
  const leeg = { voorb: () => ({ zelf: {}, droom: '', leuk: '', lastig: '' }), verslag: () => ({ droom: '', doelen: [], afspraken: '', gehad: false }) };
  const voorb = (S, pl, mid) => (S.ontwVoorb || {})[sl(pl, mid)] || null;
  const verslag = (S, pl, mid) => (S.ontwVerslag || {})[sl(pl, mid)] || null;
  const maakVoorb = (S, pl, mid) => { const o = S.ontwVoorb || (S.ontwVoorb = {}); return o[sl(pl, mid)] || (o[sl(pl, mid)] = leeg.voorb()); };
  const maakVerslag = (S, pl, mid) => { const o = S.ontwVerslag || (S.ontwVerslag = {}); return o[sl(pl, mid)] || (o[sl(pl, mid)] = leeg.verslag()); };
  const tienSchaal = (S, pl) => CC.categorie(M.team(S, M.speler(S, pl).teamId).cat).schaal === '1-10';
  const smiley = (n) => ['', '😐', '🙂', '😃'][n] || '–';
  const zelfTekst = (S, pl, n) => (n == null ? '–' : tienSchaal(S, pl) ? `<b>${n}</b>` : smiley(n));
  const vorigMoment = (S, mid) => { const ms = CC.momenten(S); const i = ms.findIndex((m) => m.id === mid); return i > 0 ? ms[i - 1] : null; };
  const gesprekVan = (S, pl, mid) => (S.ontwGesprek || []).find((g) => g.spelerId === pl && g.moment === mid);
  const STATUS = [['', 'Nog niet besproken'], ['bereikt', 'Bereikt'], ['deels', 'Deels'], ['niet', 'Nog niet']];

  // ---------- 1. Voorbereiding (ouder + kind) ----------
  CC.views.gesprekVoorb = (S, p) => {
    const pl = M.speler(S, p.id); const mid = p.m; const m = CC.momenten(S).find((x) => x.id === mid); const v = voorb(S, pl.id, mid) || leeg.voorb();
    const tien = tienSchaal(S, pl.id); const vaardig = CC.vaardigheden(S, pl.teamId); const g = gesprekVan(S, pl.id, mid);
    const rij = (x) => tien
      ? `<div class="zelfrij"><label for="z-${esc(x)}">${esc(x)}</label><input id="z-${esc(x)}" type="range" min="1" max="10" step="1" value="${v.zelf[x] || 5}" data-input="ogZelf" data-id="${pl.id}" data-m="${mid}" data-v="${esc(x)}" class="${v.zelf[x] ? '' : 'onaangeraakt'}"><output>${v.zelf[x] || '–'}</output></div>`
      : `<div class="zelfrij"><span>${esc(x)}</span><span class="score">${[1, 2, 3].map((n) => `<button type="button" class="${v.zelf[x] === n ? 'aan' : ''}" data-act="ogZelfSmiley" data-id="${pl.id}" data-m="${mid}" data-v="${esc(x)}" data-s="${n}">${smiley(n)}</button>`).join('')}</span></div>`;
    const tekstVeld = (k, label, ph) => `<label class="klein-kop" for="vb-${k}">${label}</label><textarea id="vb-${k}" rows="2" data-input="ogVoorbTekst" data-id="${pl.id}" data-m="${mid}" data-k="${k}" placeholder="${ph}">${esc(v[k] || '')}</textarea>`;
    return { titel: `Voorbereiding ${pl.voornaam}`, sub: g ? `Gesprek ${D.lang(g.datum)} om ${g.tijd}` : `${m ? m.naam : ''}gesprek`,
      html: `<div class="info">${icon('info')}<span>Vul dit samen met ${esc(pl.voornaam)} in, het duurt ongeveer 5 minuten. De trainer bespreekt het in het gesprek. Alles wordt meteen bewaard.</span></div>
        ${h.sectie(tien ? `Hoe goed ben je in… (1 = nog lastig, 10 = heel goed)` : 'Hoe vind je dat het gaat?')}<div class="kaartje zelf">${vaardig.map(rij).join('')}</div>
        ${tekstVeld('droom', 'Wat is je droom?', 'Bijv. ooit in het eerste van de club spelen')}
        ${tekstVeld('leuk', 'Wat vind je het leukst aan voetbal?', 'Bijv. scoren, samenspelen')}
        ${tekstVeld('lastig', 'Wat vind je nog lastig?', 'Bijv. koppen, mijn linkerbeen')}
        <button class="knop vol" data-act="ogVoorbKlaar" data-id="${pl.id}" data-m="${mid}">${icon('check')}Klaar</button>` };
  };
  CC.on('ogZelf', (el) => { const S = CC.S(); const v = maakVoorb(S, el.dataset.id, el.dataset.m); v.zelf[el.dataset.v] = Number(el.value); el.classList.remove('onaangeraakt'); const o = el.parentNode.querySelector('output'); if (o) o.textContent = el.value; CC.save(); });
  CC.on('ogZelfSmiley', (el) => { const S = CC.S(); maakVoorb(S, el.dataset.id, el.dataset.m).zelf[el.dataset.v] = Number(el.dataset.s); CC.save(); CC.render(); });
  CC.on('ogVoorbTekst', (el) => { const S = CC.S(); maakVoorb(S, el.dataset.id, el.dataset.m)[el.dataset.k] = el.value; CC.save(); });
  CC.on('ogVoorbKlaar', (el) => { const S = CC.S(); const v = maakVoorb(S, el.dataset.id, el.dataset.m); v.klaar = new Date().toISOString(); CC.save(); CC.terug(); CC.toast('Dank je wel! De trainer kijkt ernaar in het gesprek.'); });

  // ---------- 2. Gesprekspagina (trainer) ----------
  CC.views.gesprekVerslag = (S, p) => {
    const pl = M.speler(S, p.id); const t = M.team(S, pl.teamId); const mid = p.m; const m = CC.momenten(S).find((x) => x.id === mid);
    const v = voorb(S, pl.id, mid) || leeg.voorb(); const vs = verslag(S, pl.id, mid) || leeg.verslag(); const noti = ((S.ontwNotitie || {})[sl(pl.id, mid)] || {}).tekst || '';
    const tien = tienSchaal(S, pl.id); const vaardig = CC.vaardigheden(S, pl.teamId); const g = gesprekVan(S, pl.id, mid);
    const bo = (S.beoord[pl.id] || {})[mid] || { scores: {} };
    const opties = tien ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : [1, 2, 3];
    const scores = `<div class="tabelvak"><table class="tabel vergelijk"><thead><tr><th>Vaardigheid</th><th>${esc(pl.voornaam)}</th><th>Trainer</th></tr></thead><tbody>${vaardig.map((x) => {
      const k = v.zelf[x]; const tr = bo.scores[x]; const verschil = tien && k && tr && Math.abs(k - tr) >= 3;
      return `<tr class="${verschil ? 'verschil' : ''}"><td>${esc(x)}${verschil ? ` <span class="chip oranje mini">bespreken</span>` : ''}</td><td class="midden">${zelfTekst(S, pl.id, k)}</td><td><select class="kort" data-change="ogTrScore" data-id="${pl.id}" data-m="${mid}" data-v="${esc(x)}" aria-label="Score trainer ${esc(x)}"><option value="">–</option>${opties.map((o) => `<option value="${o}" ${tr === o ? 'selected' : ''}>${tien ? o : smiley(o)}</option>`).join('')}</select></td></tr>`; }).join('')}</tbody></table></div>`;
    const doelen = vs.doelen.length ? vs.doelen : [{ wat: '', trainer: '', ouders: '' }];
    const veld = (k, label, waarde, ph, rows = 2) => `<label class="klein-kop">${label}</label><textarea rows="${rows}" data-input="ogVeld" data-id="${pl.id}" data-m="${mid}" data-k="${k}" placeholder="${ph}">${esc(waarde || '')}</textarea>`;
    const doelBlok = doelen.map((d, i) => `<div class="kaartje doel"><h4>${icon('flag')}Doel ${i + 1}</h4>
      ${veld(`doel.${i}.wat`, 'Wat ga je doen?', d.wat, 'Bijv. elke week 10 minuten tegen de muur met links')}
      <div class="twee"><div>${veld(`doel.${i}.trainer`, 'Hoe helpt de trainer?', d.trainer, 'Bijv. extra oefening op vrijdag', 1)}</div><div>${veld(`doel.${i}.ouders`, 'Hoe helpen ouders?', d.ouders, 'Bijv. samen oefenen in het park', 1)}</div></div></div>`).join('');
    // Terugkijken naar het vorige gesprek
    const vm = vorigMoment(S, mid); const vvs = vm && verslag(S, pl.id, vm.id); const vv = vm && voorb(S, pl.id, vm.id); const vbo = vm && (S.beoord[pl.id] || {})[vm.id];
    const terug = vm && (vvs || vv || vbo) ? `<details class="uitklap blok" open><summary>Terugkijken: ${esc(vm.naam.toLowerCase())}gesprek</summary>
      ${(vvs && vvs.droom) || (vv && vv.droom) ? `<p><b>Droom toen:</b> ${esc((vv && vv.droom) || '')}${vvs && vvs.droom ? ` · ${esc(vvs.droom)}` : ''}</p>` : ''}
      ${vvs && vvs.doelen.length ? `<div class="lijst compact">${vvs.doelen.map((d, i) => h.rij({ ic: 'flag', titel: esc(d.wat || `Doel ${i + 1}`), sub: [d.trainer && `Trainer: ${esc(d.trainer)}`, d.ouders && `Ouders: ${esc(d.ouders)}`].filter(Boolean).join(' · '),
        rechts: `<select class="kort" data-change="ogDoelStatus" data-id="${pl.id}" data-m="${vm.id}" data-i="${i}" aria-label="Is dit doel bereikt?">${STATUS.map(([k, l]) => `<option value="${k}" ${(d.status || '') === k ? 'selected' : ''}>${l}</option>`).join('')}</select>` })).join('')}</div>` : ''}
      ${vbo || vv ? `<p class="klein"><b>Groei:</b> ${vaardig.map((x) => { const a = vv && vv.zelf[x], b2 = v.zelf[x], c = vbo && vbo.scores[x], d = bo.scores[x]; return (a || c) ? `${esc(x)} ${a || b2 ? `kind ${a || '–'}→${b2 || '–'}` : ''}${(a || b2) && (c || d) ? ', ' : ''}${c || d ? `trainer ${c || '–'}→${d || '–'}` : ''}` : ''; }).filter(Boolean).join(' · ') || 'nog geen cijfers van toen'}</p>` : ''}</details>` : '';
    return { titel: `Gesprek ${pl.voornaam}`, sub: `${m.naam}${g ? ` · ${D.kort(g.datum)} ${g.tijd}` : ''} · ${CC.tn(pl.teamId)}`,
      html: `${v.klaar ? '' : `<div class="info oranje">${icon('info')}<span>${esc(pl.voornaam)} heeft de voorbereiding ${Object.keys(v.zelf).length ? 'nog niet helemaal' : 'nog niet'} ingevuld. Je kunt het samen in het gesprek doen.</span></div>`}
        ${terug}
        ${h.sectie(tien ? 'Scores (1–10): kind en trainer' : 'Hoe gaat het: kind en trainer')}${scores}
        ${h.sectie('Droom')}<p>${v.droom ? `"${esc(v.droom)}"` : '<span class="zacht">Nog niet ingevuld.</span>'}</p>${v.leuk || v.lastig ? `<p class="klein">${v.leuk ? `<b>Leuk:</b> ${esc(v.leuk)}` : ''}${v.leuk && v.lastig ? '<br>' : ''}${v.lastig ? `<b>Lastig:</b> ${esc(v.lastig)}` : ''}</p>` : ''}
        ${veld('droom', 'Aanvulling op de droom (trainer)', vs.droom, 'Bijv. wat heb je nodig om daar te komen?')}
        ${h.sectie('Doelen voor de komende periode')}${doelBlok}${doelen.length < 3 ? `<button class="linkknop" data-act="ogDoelErbij" data-id="${pl.id}" data-m="${mid}">${icon('plus')}Doel toevoegen</button>` : ''}
        ${h.sectie('Afspraken')}${veld('afspraken', 'Wat spreken we af?', vs.afspraken, 'Bijv. we kijken in maart samen hoe het gaat', 2)}
        ${h.sectie('Notitie trainer')}<textarea rows="2" data-input="ogNotitie" data-id="${pl.id}" data-m="${mid}" placeholder="Alleen voor de staf, niet voor ouders">${esc(noti)}</textarea><p class="zacht klein">Deze notitie zien alleen trainer, teamleider en jeugdleiding.</p>
        <button class="knop ${vs.gehad ? 'licht' : ''} vol" data-act="ogGehad" data-id="${pl.id}" data-m="${mid}">${icon('circle-check')}${vs.gehad ? 'Gesprek gehad ✓ (tik om terug te zetten)' : 'Gesprek gehad'}</button>
        <p class="zacht klein">Alles wordt meteen bewaard. Ouder en ${esc(pl.voornaam)} zien de scores, doelen en afspraken een dag na het gesprek (niet de notitie).</p>` };
  };
  CC.on('ogVeld', (el) => { const S = CC.S(); const vs = maakVerslag(S, el.dataset.id, el.dataset.m); if (el.dataset.k.startsWith('doel.')) { const [, i, k] = el.dataset.k.split('.'); while (vs.doelen.length <= Number(i)) vs.doelen.push({ wat: '', trainer: '', ouders: '' }); vs.doelen[Number(i)][k] = el.value; } else vs[el.dataset.k] = el.value;
    vs.bijgewerkt = new Date().toISOString(); CC.save(); });
  CC.on('ogNotitie', (el) => { const S = CC.S(); const o = S.ontwNotitie || (S.ontwNotitie = {}); o[sl(el.dataset.id, el.dataset.m)] = { tekst: el.value, door: CC.me().id, tijd: new Date().toISOString() }; CC.save(); });
  CC.on('ogTrScore', (el) => { const S = CC.S(); const x = S.beoord[el.dataset.id] || (S.beoord[el.dataset.id] = {}); const b = x[el.dataset.m] || (x[el.dataset.m] = { scores: {}, goed: '', werken: '' }); if (el.value) b.scores[el.dataset.v] = Number(el.value); else delete b.scores[el.dataset.v]; CC.save(); CC.render(); });
  CC.on('ogDoelErbij', (el) => { const S = CC.S(); const vs = maakVerslag(S, el.dataset.id, el.dataset.m); if (!vs.doelen.length) vs.doelen.push({ wat: '', trainer: '', ouders: '' }); if (vs.doelen.length < 3) vs.doelen.push({ wat: '', trainer: '', ouders: '' }); CC.save(); CC.render(); });
  CC.on('ogDoelStatus', (el) => { const S = CC.S(); const vs = maakVerslag(S, el.dataset.id, el.dataset.m); const d = vs.doelen[Number(el.dataset.i)]; if (d) d.status = el.value; CC.save(); CC.toast('Bewaard'); });
  CC.on('ogGehad', (el) => { const S = CC.S(); const vs = maakVerslag(S, el.dataset.id, el.dataset.m); vs.gehad = !vs.gehad; vs.gehadOp = vs.gehad ? D.vandaag() : null; CC.save(); CC.render(); CC.toast(vs.gehad ? 'Genoteerd: gesprek gehad' : 'Teruggezet'); });

  // ---------- 3. Voor de ouder: wat er is afgesproken (samen met de beoordeling) ----------
  CC.verslagVoorOuder = (S, pl, mid) => {
    const v = voorb(S, pl.id, mid); const vs = verslag(S, pl.id, mid); if (!v && !vs) return '';
    const doelen = vs ? vs.doelen.filter((d) => d.wat) : [];
    return `${v && Object.keys(v.zelf).length ? `<p class="klein"><b>Jullie eigen scores:</b> ${Object.entries(v.zelf).map(([x, n]) => `${esc(x)} ${zelfTekst(S, pl.id, n)}`).join(' · ')}</p>` : ''}
      ${v && v.droom ? `<p><b>Droom:</b> "${esc(v.droom)}"${vs && vs.droom ? ` · ${esc(vs.droom)}` : ''}</p>` : ''}
      ${doelen.length ? `<p><b>Doelen:</b></p><ol class="doelen">${doelen.map((d) => `<li>${esc(d.wat)}${d.trainer ? `<br><small>Trainer: ${esc(d.trainer)}</small>` : ''}${d.ouders ? `<br><small>Thuis: ${esc(d.ouders)}</small>` : ''}${d.status ? ` <span class="chip ${d.status === 'bereikt' ? 'groen' : d.status === 'deels' ? 'oranje' : 'grijs'} mini">${{ bereikt: 'bereikt', deels: 'deels', niet: 'nog niet' }[d.status]}</span>` : ''}</li>`).join('')}</ol>` : ''}
      ${vs && vs.afspraken ? `<p><b>Afspraken:</b> ${esc(vs.afspraken).replace(/\n/g, '<br>')}</p>` : ''}`;
  };
  CC.voorbKlaar = (S, pl, mid) => !!(voorb(S, pl, mid) || {}).klaar;

  // ---------- Vaardigheden toevoegen (trainer) ----------
  CC.on('vaardigToevoegen', () => { const S = CC.S(); const tid = CC.teamId(); const c = CC.categorie(M.team(S, tid).cat); const extra = ((S.teamVaardig || {})[tid] || {}).extra || [];
    CC.sheet('Vaardigheden van je team', `<p class="zacht klein">Standaard voor ${esc(c.naam.toLowerCase())}: ${c.vaardig.map(esc).join(', ')}. Voeg er zelf aan toe, bijvoorbeeld "Koppen" of "Coachbaarheid". Kinderen en ouders zien ze ook bij de voorbereiding.</p>
      ${extra.length ? `<div class="lijst compact">${extra.map((x, i) => h.rij({ ic: 'star', titel: esc(x), rechts: `<button class="icoonknop" data-act="vaardigWeg" data-i="${i}" aria-label="Weghalen">${icon('trash-2')}</button>` })).join('')}</div>` : ''}
      <form data-submit="vaardigOk" class="codeform"><label for="va-n">Nieuwe vaardigheid</label><input id="va-n" name="n" required maxlength="30" placeholder="Bijv. Koppen"><button class="knop">Toevoegen</button></form>`); });
  CC.on('vaardigOk', (f) => { const S = CC.S(); const tid = CC.teamId(); const o = S.teamVaardig || (S.teamVaardig = {}); const x = o[tid] || (o[tid] = { extra: [] }); const n = f.n.value.trim(); if (n && !CC.vaardigheden(S, tid).includes(n)) x.extra.push(n); CC.save(); CC.closeSheet(); CC.render(); CC.toast(`"${n}" toegevoegd`); });
  CC.on('vaardigWeg', (el) => { const S = CC.S(); const tid = CC.teamId(); const x = (S.teamVaardig || {})[tid]; if (x) x.extra.splice(Number(el.dataset.i), 1); CC.save(); CC.closeSheet(); CC.render(); CC.toast('Weggehaald'); });
})();
