// ClubComm — Eigen wisselschema (Besluit 106): de trainer kiest zelf zijn basiself op posities (1-4-3-3) en zet de wissels erbij,
// vooraf of tijdens de wedstrijd. ClubComm doet geen voorstel; het houdt de minuten en posities bij.
// Het schema wordt omgerekend naar blokken (M.zelfAfleiden), zodat vastleggen, doelpunten en de timekeeper hetzelfde werken.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;
  const naam = (S, id) => (M.speler(S, id) || {}).voornaam || '?';
  const komen = (S, a) => M.spelers(S, a.teamId).filter((pl) => ['verwacht', 'aanwezig', 'telaat'].includes(M.status(S, pl, a).code));
  const opslaan = (S, a, sch) => { sch.spelers = [...new Set([...komen(S, a).map((pl) => pl.id), ...Object.values(sch.opstelling).filter(Boolean)])]; M.zelfAfleiden(sch); CC.save(); CC.render(); };
  const schemaVan = (S, id) => S.speeltijd.schema[id];
  const minNu = (sch) => { const m = M.klokMin(sch); return m == null ? 0 : m; };

  // Keuze per team: eerlijk voorstel van de app of zelf maken (alleen waar de club afwijken toestaat)
  CC.wisselwijzeKeuze = (S, teamId) => {
    if (!M.speeltijdAfwijken(S, teamId)) return '';
    const zelf = M.zelfSchema(S, teamId);
    return `<div class="seg">${[['', 'Eerlijk voorstel'], ['zelf', 'Zelf maken']].map(([k, l]) => `<button class="${(zelf ? 'zelf' : '') === k ? 'aan' : ''}" data-act="zetWisselwijze" data-team="${teamId}" data-val="${k}">${l}</button>`).join('')}</div>`;
  };
  CC.on('zetWisselwijze', (el) => { const S = CC.S(); const k = S.teamKeuze || (S.teamKeuze = {}); k[el.dataset.team] = { ...(k[el.dataset.team] || {}), wisselwijze: el.dataset.val || '' }; CC.save(); CC.render(); });

  // Hulp bij de keuze: trainingen deze week en minuten dit seizoen (geen cijfers voor inzet: dat beoordeelt de trainer zelf)
  const hulpTekst = (S, a, pl) => {
    const week = S.acts.filter((x) => x.teamId === a.teamId && x.soort === 'training' && !x.afgelast && x.datum < D.vandaag() && x.datum >= D.addDays(a.datum, -7) && S.pres[x.id]);
    const er = week.filter((x) => ['aanwezig', 'telaat'].includes(M.status(S, pl, x).code)).length;
    // Besluit 109: waar hij speelde, in procenten van zijn minuten (de twee meest gespeelde posities)
    const pos = M.posVerdeling(S, pl.id).slice(0, 2).map((x) => `${M.posNaam('1-4-3-3', x.pos).toLowerCase()} ${x.pct}%`).join(', ');
    if (!CC.zietMinuten()) return week.length ? `${er} van ${week.length} trainingen deze week` : ''; // Besluit 116: minuten alleen voor de trainer
    return `${week.length ? `${er} van ${week.length} trainingen deze week · ` : ''}${Math.round(M.speeltijdStand(S, pl).min)}' dit seizoen${pos ? ` · ${pos}` : ''}`;
  };

  CC.zelfHtml = (S, a, c, opties) => {
    const sch = schemaVan(S, a.id); const er = komen(S, a);
    if (!sch) {
      return `${opties.alleenSchema ? '' : CC.wisselwijzeKeuze(S, a.teamId)}<div class="kaartje"><p><b>${er.length} spelers</b> komen · ${c.vorm} · ${c.speelduur}.</p>
        <p class="zacht klein">Jij maakt het schema: kies je basiself op het veld en zet de wissels erbij, vooraf of tijdens de wedstrijd. ClubComm houdt de minuten en posities bij.</p>
        ${opties.alleenSchema ? '<p class="zacht klein">De trainer heeft nog geen opstelling gemaakt.</p>' : `<button class="knop vol" data-act="zelfNieuw" data-id="${a.id}">${icon('shirt')}Opstelling maken</button>`}</div>`;
    }
    if (sch.bevestigd) return `<div class="info groen">${icon('circle-check')}<span>Speeltijd en posities van deze wedstrijd zijn vastgelegd.</span></div>${minutenBlok(S, sch)}`;
    const lezen = !!opties.alleenSchema; const vandaag = a.datum === D.vandaag(); const k = sch.klok || {};
    const m = M.klokMin(sch); const st = M.zelfStand(sch, m == null ? 0 : m); const opVeld = Object.values(st).filter(Boolean);
    const bank = er.filter((pl) => !opVeld.includes(pl.id));
    const weg = Object.values(sch.opstelling).filter((id) => id && !er.some((pl) => pl.id === id));
    const klok = vandaag ? `<div class="kaartje klokrij"><span><b>${m == null ? 'Nog niet begonnen' : `Minuut ${m}`}</b>${m != null ? `<small class="zacht"> · ${k.tweede ? '2e helft' : k.rust ? 'rust' : '1e helft'}</small>` : ''}</span>
      ${lezen ? '' : !k.aftrap ? `<button class="knop klein" data-act="zelfKlok" data-a="${a.id}" data-k="aftrap">${icon('play')}Aftrap</button>` : !k.rust ? `<button class="knop klein licht" data-act="zelfKlok" data-a="${a.id}" data-k="rust">${icon('pause')}Rust</button>` : !k.tweede ? `<button class="knop klein" data-act="zelfKlok" data-a="${a.id}" data-k="tweede">${icon('play')}Start 2e helft</button>` : ''}</div>` : '';
    const veld = `<div class="veld">${(M.VELD[sch.systeem] || []).map((rij) => `<div class="veldrij">${rij.map((p) => { const id = st[p];
      return `<button class="plek ${id ? '' : 'leeg'}" ${lezen ? 'disabled' : `data-act="zelfPlek" data-a="${a.id}" data-pos="${p}"`} aria-label="${esc(M.posNaam(sch.systeem, p))}: ${id ? esc(naam(S, id)) : 'leeg'}"><small>${p}</small><b>${id ? esc(naam(S, id)) : '+'}</b></button>`; }).join('')}</div>`).join('')}</div>`;
    const wissels = (sch.wissels || []).slice().sort((x, y) => x.min - y.min);
    const wisselLijst = wissels.length ? `<div class="lijst compact">${wissels.map((w) => { const pos = (sch.pos || []).map((x) => x[w.in]).find(Boolean);
      return h.rij({ ic: 'repeat', titel: `${w.min}' · ${esc(naam(S, w.uit))} eruit, ${esc(naam(S, w.in))} erin`, sub: `${pos ? esc(`${pos} · ${M.posNaam(sch.systeem, pos)}`) : ''}${m != null && w.min > m ? `${pos ? ' · ' : ''}gepland` : ''}`, rechts: lezen ? '' : `<button class="icoonknop" data-act="zelfWisselWeg" data-a="${a.id}" data-w="${w.id}" aria-label="Wissel weghalen">${icon('x')}</button>` }); }).join('')}</div>` : '<p class="zacht klein">Nog geen wissels.</p>';
    // "Einde wedstrijd: uitslag opslaan" staat al op het scorebord; daarna legt deze knop de speeltijd vast (als dat nog niet vanzelf ging)
    const einde = lezen || !a.uitslagKlaar ? '' : `<button class="knop groot vol" data-act="bevestigSchema" data-id="${a.id}">${icon('circle-check')}Speeltijd vastleggen</button>`;
    return `${weg.length ? `<div class="info oranje">${icon('triangle-alert')}<span>${weg.map((id) => esc(naam(S, id))).join(', ')} ${weg.length === 1 ? 'komt' : 'komen'} niet meer. Zet iemand anders op ${weg.length === 1 ? 'die plek' : 'die plekken'}.</span></div>` : ''}
      ${klok}<p class="zacht klein">${m == null ? (lezen ? 'Opstelling van de trainer.' : 'Tik op een plek om je basiself te kiezen.') : 'Zo staat het nu in het veld.'} ${opVeld.length}/${c.opVeld} in het veld.</p>${veld}
      <p class="klein"><b>Bank:</b> ${bank.map((pl) => esc(pl.voornaam)).join(', ') || 'niemand'}</p>
      ${h.sectie('Wissels')}${wisselLijst}${lezen ? '' : `<button class="knop licht vol" data-act="zelfWissel" data-a="${a.id}">${icon('repeat')}Wissel${m == null ? ' plannen' : ''}</button>`}
      ${minutenBlok(S, sch)}${einde}${lezen ? '' : `<button class="linkknop" data-act="zelfOpnieuw" data-id="${a.id}">Opnieuw beginnen</button>`}`;
  };
  // Minuten en posities in deze wedstrijd (volgens opstelling en wissels)
  // Besluit 116: alleen de trainer ziet de minuten
  const minutenBlok = (S, sch) => { if (!CC.zietMinuten()) return ''; M.zelfAfleiden(sch); const mins = M.schemaMinuten(sch);
    const rijen = Object.keys(mins).sort((x, y) => mins[y] - mins[x] || naam(S, x).localeCompare(naam(S, y)));
    if (!rijen.length) return '';
    return `<details class="uitklap"><summary>Minuten deze wedstrijd</summary><div class="lijst compact">${rijen.map((id) => { const pos = [...new Set(sch.pos.map((x) => x[id]).filter(Boolean))];
      return h.rij({ ic: h.avatar(naam(S, id)), titel: esc(naam(S, id)), sub: pos.map((p) => esc(`${p} · ${M.posNaam(sch.systeem, p)}`)).join(', '), rechts: `<b>${M.minTekst(mins[id])}'</b>` }); }).join('')}</div></details>`; };

  // Posities dit seizoen (Speeltijd, onder de minuten)
  CC.posTabel = (S, teamId) => { const rijen = M.spelers(S, teamId).map((pl) => ({ pl, p: M.posVerdeling(S, pl.id) })).filter((x) => x.p.length);
    if (!rijen.length) return '';
    return `<details class="uitklap"><summary>Posities dit seizoen</summary><div class="lijst compact">${rijen.map(({ pl, p }) => h.rij({ ic: h.avatar(pl.voornaam), titel: esc(pl.voornaam),
      sub: p.map((x) => esc(`${M.posNaam('1-4-3-3', x.pos)} ${x.pct}% (${x.min}')`)).join(' · ') })).join('')}</div><p class="zacht klein">Percentage van zijn gespeelde minuten per positie.</p></details>`; };

  CC.on('zelfNieuw', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.id); const c = CC.categorie(M.wedCat(S, a.teamId));
    const sch = { zelf: true, systeem: '1-4-3-3', opstelling: {}, wissels: [], klok: {}, wedMin: c.duur, helft: c.helft, vorm: c.vorm, opVeld: c.opVeld, bevestigd: false };
    S.speeltijd.schema[a.id] = sch; opslaan(S, a, sch); });
  CC.on('zelfOpnieuw', (el) => { const S = CC.S(); delete S.speeltijd.schema[el.dataset.id]; CC.save(); CC.render(); });

  // Een plek kiezen. Voor de aftrap: de basisopstelling. Daarna: een wissel voor wie op die plek staat.
  CC.on('zelfPlek', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.a); const sch = schemaVan(S, a.id); const pos = el.dataset.pos;
    if (M.klokMin(sch) != null) { const st = M.zelfStand(sch, minNu(sch)); return CC.zelfWisselSheet(S, a, st[pos]); }
    const nu = sch.opstelling[pos]; const plekVan = (id) => Object.keys(sch.opstelling).find((p) => sch.opstelling[p] === id);
    CC.sheet(`${pos} · ${M.posNaam(sch.systeem, pos)}`, `<div class="lijst">${komen(S, a).sort((x, y) => (plekVan(x.id) ? 1 : 0) - (plekVan(y.id) ? 1 : 0) || x.voornaam.localeCompare(y.voornaam)).map((pl) => { const p = plekVan(pl.id);
      return h.rij({ ic: h.avatar(pl.voornaam), titel: `${esc(M.naam(S, pl))}${pl.id === nu ? ' ✓' : ''}`, sub: `${p ? `Nu: ${esc(`${p} · ${M.posNaam(sch.systeem, p)}`)} · ` : ''}${hulpTekst(S, a, pl)}`, act: 'zelfKies', attrs: `data-a="${a.id}" data-pos="${pos}" data-s="${pl.id}"` }); }).join('')}</div>
      ${nu ? `<button class="knop licht vol" data-act="zelfKies" data-a="${a.id}" data-pos="${pos}" data-s="">Plek leeg maken</button>` : ''}`); });
  // Staat de gekozen speler al op een andere plek, dan ruilen ze
  CC.on('zelfKies', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.a); const sch = schemaVan(S, a.id); const o = sch.opstelling; const pos = el.dataset.pos; const id = el.dataset.s;
    const oud = Object.keys(o).find((p) => o[p] === id); const hier = o[pos];
    if (id) { o[pos] = id; if (oud && oud !== pos) { if (hier) o[oud] = hier; else delete o[oud]; } } else delete o[pos];
    CC.closeSheet(); opslaan(S, a, sch); });

  CC.zelfWisselSheet = (S, a, uit) => { const sch = schemaVan(S, a.id); const m = M.klokMin(sch); const st = M.zelfStand(sch, m == null ? sch.wedMin : m);
    const veld = Object.entries(st).filter(([, id]) => id); const bank = komen(S, a).filter((pl) => !Object.values(st).includes(pl.id));
    CC.sheet(m == null ? 'Wissel plannen' : 'Wissel', `<form data-submit="zelfWisselOk" data-a="${a.id}" class="codeform">
      <label for="zw-m">Minuut</label><input id="zw-m" name="min" type="number" inputmode="numeric" min="1" max="${sch.wedMin - 1}" required value="${m == null ? '' : m}" placeholder="bijv. 20">
      <label for="zw-u">Eruit</label><select id="zw-u" name="uit" class="kies" required><option value="">Kies…</option>${veld.map(([p, id]) => `<option value="${id}" ${id === uit ? 'selected' : ''}>${esc(naam(S, id))} (${esc(`${p} · ${M.posNaam(sch.systeem, p)}`)})</option>`).join('')}</select>
      <label for="zw-i">Erin (neemt die plek over)</label><select id="zw-i" name="in" class="kies" required><option value="">Kies…</option>${bank.map((pl) => `<option value="${pl.id}">${esc(pl.voornaam)} · ${hulpTekst(S, a, pl)}</option>`).join('')}</select>
      <button class="knop vol">${icon('repeat')}${m == null ? 'Wissel plannen' : 'Wissel nu'}</button>
      ${m == null ? '<p class="zacht klein">Een geplande wissel kun je later nog weghalen. Tijdens de wedstrijd vult de app de minuut zelf in.</p>' : ''}</form>`); };
  CC.on('zelfWissel', (el) => { const S = CC.S(); CC.zelfWisselSheet(S, M.act(S, el.dataset.a)); });
  CC.on('zelfWisselOk', (f) => { const S = CC.S(); const a = M.act(S, f.dataset.a); const sch = schemaVan(S, a.id); const min = Math.round(Number(f.min.value));
    if (!(min >= 1 && min < sch.wedMin)) return CC.toast(`Kies een minuut tussen 1 en ${sch.wedMin - 1}`, 'fout');
    const st = M.zelfStand(sch, min); if (!Object.values(st).includes(f.uit.value)) return CC.toast(`${naam(S, f.uit.value)} staat op minuut ${min} niet in het veld`, 'fout');
    if (Object.values(st).includes(f.in.value)) return CC.toast(`${naam(S, f.in.value)} staat op minuut ${min} al in het veld`, 'fout');
    sch.wissels.push({ id: 'w' + Date.now(), min, uit: f.uit.value, in: f.in.value }); CC.closeSheet(); opslaan(S, a, sch); CC.toast(`${min}': ${naam(S, f.in.value)} erin voor ${naam(S, f.uit.value)}`); });
  CC.on('zelfWisselWeg', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.a); const sch = schemaVan(S, a.id); sch.wissels = sch.wissels.filter((w) => w.id !== el.dataset.w); opslaan(S, a, sch); });
  CC.on('zelfKlok', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.a); const sch = schemaVan(S, a.id); (sch.klok || (sch.klok = {}))[el.dataset.k] = new Date().toISOString(); sch.gestart = true; opslaan(S, a, sch); });
})();
