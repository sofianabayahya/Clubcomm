// ClubComm — Besluit 136: teams, trainingsdagen en wedstrijden zelf beheren (clubbeheerder en HO).
// - Teams en trainingsdagen: team toevoegen, trainer koppelen (ook een nieuwe trainer), trainingsdagen (rooster), wedstrijden.
// - Trainingen komen pas in de kalender als er een trainer aan het team is gekoppeld (rooster eerst klaarzetten).
// - Wedstrijden plakken: het programma van voetbal.nl kopiëren en plakken; eerst een voorbeeld, dubbel en bestaand overgeslagen.
// - Trainingsschema laden: de tabel uit Excel (of de tekst uit een PDF) plakken of als CSV kiezen; per team dagen, tijden en velden.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;
  const norm = (x) => String(x || '').toUpperCase().replace(/\s+/g, '');
  const leeftijd = (naam) => { const m = String(naam).match(/(\d{1,2})-/) || String(naam).match(/O\s?(\d{1,2})/i); return m ? Number(m[1]) : null; };
  const catVan = (naam) => { const n = leeftijd(naam); return n ? `O${n}` : 'O12'; };
  const magBeheren = (S) => { const r = (CC.rol() || {}).rol; return r === 'beheerder' || r === 'hjo'; };
  const dagenTekst = (t) => (t.rooster || []).slice().sort((a, b) => ((a.dag + 6) % 7) - ((b.dag + 6) % 7)).map((r) => D.DAG_KORT[r.dag]).join(', ');
  const trainers = (S) => S.people.filter((p) => p.rollen.some((r) => r.rol === 'trainer')).sort((a, b) => a.naam.localeCompare(b.naam));
  const wedstrijden = (S, tid) => S.acts.filter((a) => a.teamId === tid && M.isWed(a) && !a.afgelast).sort((a, b) => (a.datum + a.tijd).localeCompare(b.datum + b.tijd));
  const toekomst = (S, tid) => S.acts.filter((a) => a.teamId === tid && a.soort === 'training' && a.datum >= D.vandaag());

  // Trainingen uit het klaargezette rooster, zodra er een trainer is (alleen als het team nog geen komende trainingen heeft)
  CC.trainingenKlaarzetten = (S, t) => { if (!t || !(t.rooster || []).length || !CC.rooster || toekomst(S, t.id).length) return 0;
    const plan = CC.rooster.plan(S, t, t.rooster, D.vandaag()); CC.rooster.toepassen(S, plan); return plan.erbij.length; };

  // ---------- Overzicht ----------
  CC.teamsBlok = (S) => { if (!magBeheren(S)) return '';
    const l = S.teams.slice().sort((a, b) => a.naam.localeCompare(b.naam, 'nl', { numeric: true }));
    return `<div class="kaartje tb-teams"><b>Teams en trainingsdagen</b>
      <div class="knoppen"><button class="knop" data-act="teamNieuw">${icon('plus')}Team toevoegen</button><button class="knop licht" data-act="schemaLaden">${icon('upload')}Trainingsschema laden</button></div>
      <small class="zacht">Trainingen komen in de kalender zodra er een trainer aan het team is gekoppeld.</small>
      ${l.length ? `<div class="lijst compact">${l.map((t) => { const tr = M.persoon(S, t.trainerId); const w = wedstrijden(S, t.id).filter((a) => a.datum >= D.vandaag()).length;
        return h.rij({ ic: 'shield', titel: esc(t.naam), sub: `${tr ? esc(tr.naam) : '<span class="tb-or">nog geen trainer</span>'} · ${(t.rooster || []).length ? `${dagenTekst(t)} ${esc(t.rooster[0].tijd)}` : '<span class="tb-or">nog geen trainingsdagen</span>'}${w ? ` · ${w} wedstrijd${w === 1 ? '' : 'en'}` : ''}`, act: 'teamBeheer', attrs: `data-team="${esc(t.id)}"` }); }).join('')}</div>` : '<p class="zacht klein">Nog geen teams.</p>'}</div>`; };
  CC.views.teamsBeheer = (S) => ({ titel: 'Teams en trainers', html: `<div class="lijst">${h.rij({ ic: 'user-plus', titel: 'Trainer toevoegen', sub: 'Naam en e-mailadres; hij of zij krijgt een welkomstmail', act: 'stafNieuw' })}</div>${CC.teamsBlok(S)}` });

  // Clubbeheerder: bovenaan Seizoen. HO (pakket Trainers begeleiden): een regel onder Trainers.
  const wacht = () => {
    if (!CC.rollen || !CC.rollen.beheerder || !CC.rollen.hjo) return setTimeout(wacht, 0);
    const sz = CC.rollen.beheerder.schermen.seizoen; CC.rollen.beheerder.schermen.seizoen = (S) => CC.teamsBlok(S) + sz(S);
    const tr = CC.rollen.hjo.schermen.trainers; CC.rollen.hjo.schermen.trainers = (S) => { const html = tr(S); if (!(CC.pakketTrainers && CC.pakketTrainers(S)) || (CC.rol() || {}).rol !== 'hjo') return html;
      const zonder = S.teams.filter((t) => !t.trainerId).length;
      return `${html}${h.sectie('Teams')}<div class="lijst">${h.rij({ ic: 'shield', titel: 'Teams, trainingsdagen en wedstrijden', sub: `${S.teams.length} team${S.teams.length === 1 ? '' : 's'}${zonder ? ` · ${zonder} zonder trainer` : ''}`, act: 'open', attrs: 'data-view="teamsBeheer"' })}${h.rij({ ic: 'user-plus', titel: 'Trainer toevoegen', sub: 'Naam en e-mailadres; koppel meteen het team', act: 'stafNieuw' })}</div>`; };
  };
  wacht();

  // ---------- Team toevoegen ----------
  const leeftijden = Array.from({ length: 14 }, (_, i) => `O${i + 6}`);
  CC.on('teamNieuw', () => { const S = CC.S();
    CC.sheet('Team toevoegen', `<form data-submit="teamNieuwOk" class="codeform"><label for="tn-n">Naam</label><input id="tn-n" name="n" required placeholder="Bijv. JO16-2 ZO" autocomplete="off">
      <div class="twee"><div><label for="tn-c">Leeftijd</label><select id="tn-c" name="c"><option value="">Uit de naam</option>${leeftijden.map((x) => `<option>${x}</option>`).join('')}</select></div>
      <div><label for="tn-y">Soort</label><select id="tn-y" name="y"><option value="selectie">Selectie</option><option value="breedte">Breedte</option></select></div></div>
      <label for="tn-t">Trainer</label><select id="tn-t" name="t"><option value="">Nog geen</option>${trainers(S).map((p) => `<option value="${esc(p.id)}">${esc(p.naam)}</option>`).join('')}</select>
      <button class="knop vol">Toevoegen</button><p class="zacht klein">Nieuwe trainer? Voeg het team eerst toe; in het venster van het team staat <b>Nieuwe trainer toevoegen</b>.</p></form>`); });
  CC.on('teamNieuwOk', (f) => { const S = CC.S(); const naam = f.n.value.trim().replace(/\s+/g, ' '); if (!naam) return;
    if (S.teams.some((t) => norm(t.naam) === norm(naam))) return CC.toast('Dit team bestaat al', 'fout');
    let id = naam.toUpperCase().replace(/[^A-Z0-9-]/g, ''); while (S.teams.some((t) => t.id === id)) id += 'x';
    const t = { id, naam, cat: f.c.value || catVan(naam), type: f.y.value, rooster: [], afwijking: {}, trainerId: null, teamleiderId: null };
    S.teams.push(t); if (f.t.value) koppel(S, t, f.t.value);
    CC.save(); CC.closeSheet(); CC.render(); openTeam(t.id); CC.toast(`${naam} toegevoegd`); });
  const koppel = (S, t, pid) => { const p = M.persoon(S, pid); if (!p) return 0;
    if (!p.rollen.some((r) => r.rol === 'trainer' && r.teamId === t.id)) p.rollen.push({ rol: 'trainer', teamId: t.id });
    t.trainerId = p.id; return CC.trainingenKlaarzetten(S, t); };

  // ---------- Venster van een team ----------
  const openTeam = (tid) => { const S = CC.S(); const t = M.team(S, tid); if (!t) return; const w = wedstrijden(S, t.id); const komend = w.filter((a) => a.datum >= D.vandaag());
    CC.sheet(t.naam, `<form class="codeform" data-autosave="teamGeg" data-team="${esc(t.id)}">
        <div class="twee"><div><label for="tb-n">Naam</label><input id="tb-n" name="n" value="${esc(t.naam)}"></div><div><label for="tb-c">Leeftijd</label><select id="tb-c" name="c">${leeftijden.map((x) => `<option ${x === t.cat ? 'selected' : ''}>${x}</option>`).join('')}</select></div></div>
        <label for="tb-y">Soort</label><select id="tb-y" name="y"><option value="selectie" ${t.type === 'selectie' ? 'selected' : ''}>Selectie</option><option value="breedte" ${t.type !== 'selectie' ? 'selected' : ''}>Breedte</option></select></form>
      <label for="tb-t">Trainer</label><select id="tb-t" data-change="teamTrainer" data-team="${esc(t.id)}"><option value="">Nog geen</option>${trainers(S).map((p) => `<option value="${esc(p.id)}" ${p.id === t.trainerId ? 'selected' : ''}>${esc(p.naam)}</option>`).join('')}</select>
      <button class="linkknop" data-act="stafNieuw" data-team="${esc(t.id)}">${icon('user-plus')}Nieuwe trainer toevoegen</button>
      ${h.sectie('Trainingsdagen')}
      ${(t.rooster || []).length ? `<p>${t.rooster.slice().sort((a, b) => ((a.dag + 6) % 7) - ((b.dag + 6) % 7)).map((r) => `${esc(D.DAG[r.dag])} ${esc(r.tijd)}–${esc(r.eind)}, ${esc(r.veld)}`).join('<br>')}</p>
        <p class="zacht klein">${t.trainerId ? `${toekomst(S, t.id).length} trainingen in de kalender.` : 'Klaargezet: de trainingen komen in de kalender zodra er een trainer is.'}</p>`
        : '<p class="tb-or">Nog geen trainingsdagen</p>'}
      <button class="knop licht vol" data-act="roosterTeam" data-team="${esc(t.id)}">${icon('calendar-days')}Trainingsdagen ${(t.rooster || []).length ? 'aanpassen' : 'instellen'}</button>
      ${h.sectie(`Wedstrijden (${komend.length})`)}
      ${komend.length ? `<div class="lijst compact">${komend.slice(0, 4).map((a) => h.rij({ ic: 'trophy', titel: `${esc(D.kort(a.datum))} · ${esc(a.tijd)} · ${a.thuis ? 'thuis' : 'uit'}`, sub: esc(a.tegen || ''), chevron: false })).join('')}${komend.length > 4 ? `<p class="zacht klein">… en nog ${komend.length - 4}</p>` : ''}</div>` : '<p class="zacht klein">Nog geen wedstrijden.</p>'}
      <div class="knoppen"><button class="knop licht" data-act="wedNieuw" data-team="${esc(t.id)}">${icon('plus')}Wedstrijd</button><button class="knop" data-act="wedPlak" data-team="${esc(t.id)}">${icon('list-checks')}Wedstrijden plakken</button></div>`, { groot: true }); };
  CC.on('teamBeheer', (el) => openTeam(el.dataset.team));
  CC.autosave.teamGeg = (f) => { const S = CC.S(); const t = M.team(S, f.dataset.team); if (!t) return; const n = f.n.value.trim().replace(/\s+/g, ' ');
    if (n && !S.teams.some((x) => x !== t && norm(x.naam) === norm(n))) t.naam = n; t.cat = f.c.value; t.type = f.y.value; };
  CC.on('teamTrainer', (el) => { const S = CC.S(); const t = M.team(S, el.dataset.team); const oud = t.trainerId; const nieuw = el.value || null; if (oud === nieuw) return;
    const po = oud && M.persoon(S, oud); if (po) po.rollen = po.rollen.filter((r) => !(r.rol === 'trainer' && r.teamId === t.id));
    let n = 0; if (nieuw) n = koppel(S, t, nieuw); else t.trainerId = null;
    CC.save(); CC.render(); openTeam(t.id);
    CC.toast(nieuw ? `${(M.persoon(S, nieuw) || {}).naam || 'Trainer'} is trainer van ${t.naam}${n ? ` · ${n} trainingen in de kalender` : ''}` : 'Trainer losgekoppeld'); });

  // ---------- Eén wedstrijd ----------
  const eindVan = (S, t, tijd) => CC.plusMin ? CC.plusMin(tijd, CC.categorie(t.speelCat || t.cat).duur + 15) : tijd;
  CC.on('wedNieuw', (el) => { const S = CC.S(); const t = M.team(S, el.dataset.team);
    CC.sheet(`Wedstrijd · ${t.naam}`, `<form data-submit="wedNieuwOk" data-team="${esc(t.id)}" class="codeform"><label for="wn-t">Tegenstander</label><input id="wn-t" name="tegen" required placeholder="Bijv. AFC O16-2">
      <div class="twee"><div><label for="wn-d">Datum</label><input id="wn-d" name="datum" type="date" required></div><div><label for="wn-a">Aftrap</label><input id="wn-a" name="tijd" type="time" required value="11:00"></div></div>
      <label class="vink"><input type="checkbox" name="thuis" checked><span>Thuis</span></label><button class="knop vol">Toevoegen</button></form>`); });
  CC.on('wedNieuwOk', (f) => { const S = CC.S(); const t = M.team(S, f.dataset.team);
    S.acts.push({ id: 'w' + Date.now(), teamId: t.id, soort: 'wedstrijd', datum: f.datum.value, tijd: f.tijd.value, eind: eindVan(S, t, f.tijd.value), tegen: f.tegen.value.trim(), thuis: f.thuis.checked, veld: '', afgelast: false, uitslag: null });
    S.acts.sort((x, y) => (x.datum + x.tijd).localeCompare(y.datum + y.tijd)); CC.save(); CC.render(); openTeam(t.id); CC.toast('Wedstrijd toegevoegd'); });

  // ---------- Wedstrijden plakken (voetbal.nl) ----------
  const MND = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  const DAGRE = /^(maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag)\s+(\d{1,2})\s+([a-z]+)\s+(\d{4})$/i;
  const schoon = (x) => x.replace(/\s+/g, ' ').trim();
  const teamNaam = (x) => schoon(x.replace(/\((zon|zat|zo|za)\)/ig, ''));
  CC.wedLezen = (tekst) => { const r = String(tekst || '').split(/\r?\n/).map(schoon).filter(Boolean);
    const blokken = []; let b = null;
    r.forEach((x) => { const m = x.match(DAGRE); if (m) { const mi = MND.indexOf(m[3].toLowerCase()); b = { datum: mi < 0 ? null : `${m[4]}-${String(mi + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`, regels: [] }; blokken.push(b); return; }
      if (b && !/^\d+e ronde$/i.test(x) && !/^(beker|oefen|competitie)/i.test(x) && b.regels[b.regels.length - 1] !== teamNaam(x)) b.regels.push(/^\d{1,2}[:.]\d{2}$/.test(x) ? x.replace('.', ':') : teamNaam(x)); });
    const lijst = blokken.map((x) => { const i = x.regels.findIndex((y) => /^\d{1,2}:\d{2}$/.test(y)); return i > 0 && x.datum && x.regels[i + 1] ? { datum: x.datum, tijd: x.regels[i].padStart(5, '0'), thuisTeam: x.regels[i - 1], uitTeam: x.regels[i + 1] } : { fout: true }; });
    const ok = lijst.filter((x) => !x.fout); const tel = {}; ok.forEach((x) => { [x.thuisTeam, x.uitTeam].forEach((n) => { tel[n] = (tel[n] || 0) + 1; }); });
    const eigen = Object.keys(tel).sort((a, c) => tel[c] - tel[a])[0] || '';
    const gezien = new Set(); const uit = [];
    ok.forEach((x) => { const thuis = x.thuisTeam === eigen; const tegen = thuis ? x.uitTeam : x.thuisTeam; const k = `${x.datum}|${x.tijd}|${tegen}`;
      if (gezien.has(k)) return; gezien.add(k); uit.push({ datum: x.datum, tijd: x.tijd, thuis, tegen }); });
    return { eigen, lijst: uit, dubbel: ok.length - uit.length, fout: lijst.length - ok.length }; };
  const PL = () => CC.ui.wedPlak || (CC.ui.wedPlak = {});
  const plakVoorbeeld = (S, t) => { const r = CC.wedLezen(PL().tekst); if (!r.lijst.length) return PL().tekst ? '<p class="zacht klein">Nog geen wedstrijden herkend. Kopieer het programma inclusief de datumregels (bijv. "Zondag 1 november 2026").</p>' : '';
    const al = (x) => S.acts.some((a) => a.teamId === t.id && M.isWed(a) && a.datum === x.datum);
    const nieuw = r.lijst.filter((x) => !al(x));
    return `<p><b>Gevonden: ${r.lijst.length} wedstrijd${r.lijst.length === 1 ? '' : 'en'}</b>${r.dubbel ? ` <span class="zacht">· ${r.dubbel} dubbel, één keer genomen</span>` : ''}${r.fout ? ` <span class="tb-or">· ${r.fout} niet herkend</span>` : ''}</p>
      <p class="zacht klein">Eigen team volgens het programma: <b>${esc(r.eigen)}</b>. Thuis of uit leest ClubComm uit de volgorde (eerst genoemd = thuis).</p>
      <div class="tr-tabel"><table class="tb-wed"><tbody>${r.lijst.map((x) => `<tr class="${al(x) ? 'zacht' : ''}"><td>${esc(D.kort(x.datum))}</td><td>${esc(x.tijd)}</td><td>${x.thuis ? 'thuis' : 'uit'}</td><td>${esc(x.tegen)}${al(x) ? ' <small>(staat er al)</small>' : ''}</td></tr>`).join('')}</tbody></table></div>
      <div class="knoppen"><button class="knop" data-act="wedPlakOk" data-team="${esc(t.id)}" ${nieuw.length ? '' : 'disabled'}>${nieuw.length} wedstrijd${nieuw.length === 1 ? '' : 'en'} toevoegen</button><button class="knop licht" data-act="teamBeheer" data-team="${esc(t.id)}">Terug</button></div>`; };
  CC.on('wedPlak', (el) => { const S = CC.S(); const t = M.team(S, el.dataset.team); PL().tekst = ''; PL().team = t.id;
    CC.sheet(`Wedstrijden plakken · ${t.naam}`, `<p class="zacht klein">Kopieer het programma van <b>${esc(t.naam)}</b> op voetbal.nl (of in de app) en plak het hier. Je ziet eerst wat er gebeurt.</p>
      <textarea id="wedPlakTekst" rows="6" placeholder="Zondag 1 november 2026&#10;9e ronde&#10;Swift O16-2&#10;10:30&#10;Kon. HFC O16-1"></textarea><div id="wedPlakVb"></div>`, { groot: true }); });
  document.addEventListener('input', (e) => { if (e.target.id !== 'wedPlakTekst') return; PL().tekst = e.target.value; const S = CC.S(); const t = M.team(S, PL().team); const v = document.getElementById('wedPlakVb'); if (t && v) v.innerHTML = plakVoorbeeld(S, t); });
  CC.on('wedPlakOk', (el) => { const S = CC.S(); const t = M.team(S, el.dataset.team); const r = CC.wedLezen(PL().tekst); let n = 0;
    r.lijst.forEach((x) => { if (S.acts.some((a) => a.teamId === t.id && M.isWed(a) && a.datum === x.datum)) return;
      S.acts.push({ id: `w${Date.now()}${n}`, teamId: t.id, soort: 'wedstrijd', datum: x.datum, tijd: x.tijd, eind: eindVan(S, t, x.tijd), tegen: x.tegen, thuis: x.thuis, veld: '', afgelast: false, uitslag: null }); n++; });
    S.acts.sort((x, y) => (x.datum + x.tijd).localeCompare(y.datum + y.tijd)); PL().tekst = ''; CC.save(); CC.render(); openTeam(t.id); CC.toast(`${n} wedstrijd${n === 1 ? '' : 'en'} toegevoegd`); });

  // ---------- Trainingsschema laden ----------
  const DAGNR = { maandag: 1, dinsdag: 2, woensdag: 3, donderdag: 4, vrijdag: 5, zaterdag: 6, zondag: 0 };
  const TIJD = /^(\d{1,2})[.:](\d{2})\s*-\s*(\d{1,2})[.:](\d{2})/;
  const tijd = (u, m) => `${u.padStart(2, '0')}:${m}`;
  const TEAMRE = /^(M?JO|MO)\s?(\d{1,2})-(\d{1,2})\s*(Z[AO])?$/i;
  CC.schemaLezen = (tekst) => { const regels = String(tekst || '').split(/\r?\n/); let dag = null, velden = []; const slots = {}; const twijfel = new Set();
    regels.forEach((rg) => { if (!rg.trim()) return; const cel = (rg.includes('\t') ? rg.split('\t') : rg.includes(';') ? rg.split(';') : rg.trim().split(/\s{2,}/)).map((x) => x.trim().replace(/^"|"$/g, ''));
      const dn = (cel[0] || '').toLowerCase(); if (DAGNR[dn] !== undefined) { dag = DAGNR[dn]; velden = cel.slice(1).map((x) => x.replace(/^veld/i, 'Veld').trim() || null); return; }
      const m = (cel[0] || '').match(TIJD); if (!m || dag === null) return; const van = tijd(m[1], m[2]), tot = tijd(m[3], m[4]);
      cel.slice(1).forEach((c, i) => { if (!c) return; const veld = velden[i] || `Veld ${i + 1}`;
        c.replace(/\([^)]*\)?/g, ' ').split('/').map((x) => x.trim()).filter(Boolean).forEach((deel) => {
          const z = deel.match(/^(M?JO|MO)\s?(\d{1,2})-Z([AO])(\d{1,2})$/i); const t = z ? [deel, z[1], z[2], z[4], `Z${z[3]}`] : deel.match(TEAMRE); // JO19-ZO3 = JO19-3 ZO
          if (!t) { if (deel.length < 40 && !/^\d+$/.test(deel) && !/^(vrij|beschikbaar)/i.test(deel)) twijfel.add(deel); return; }
          const naam = `${t[1].toUpperCase()}${t[2]}-${t[3]}${t[4] ? ` ${t[4].toUpperCase()}` : ''}`;
          ((slots[naam] = slots[naam] || {})[`${dag}|${veld}`] = slots[naam][`${dag}|${veld}`] || []).push([van, tot]); }); }); });
    const teams = Object.entries(slots).map(([naam, per]) => { const best = {};
      Object.entries(per).forEach(([k, l]) => { const [d, veld] = k.split('|'); const van = l.map((x) => x[0]).sort()[0]; const tot = l.map((x) => x[1]).sort().slice(-1)[0];
        const duur = l.length; if (!best[d] || best[d].n < duur) best[d] = { dag: Number(d), tijd: van, eind: tot, veld, n: duur }; });
      return { naam, leeftijd: leeftijd(naam), rooster: Object.values(best).map(({ n, ...r }) => r).sort((a, b) => ((a.dag + 6) % 7) - ((b.dag + 6) % 7)) }; })
      .sort((a, b) => a.naam.localeCompare(b.naam, 'nl', { numeric: true }));
    teams.filter((t) => !/ Z[AO]$/.test(t.naam) && teams.some((x) => x.naam.startsWith(`${t.naam} `))).forEach((t) => twijfel.add(`${t.naam} (zonder ZA/ZO; bestaat ook met)`));
    return { teams, twijfel: [...twijfel] }; };
  const SC = () => CC.ui.schema || (CC.ui.schema = {});
  const zelfde = (a, b) => JSON.stringify((a || []).map((r) => [r.dag, r.tijd, r.eind, r.veld]).sort()) === JSON.stringify((b || []).map((r) => [r.dag, r.tijd, r.eind, r.veld]).sort());
  const schemaVoorbeeld = (S) => { const sc = SC(); const r = CC.schemaLezen(sc.tekst); if (!r.teams.length) return sc.tekst ? '<p class="zacht klein">Nog geen teams herkend. Plak de hele tabel, met de regels van de dagen (MAANDAG, VELD 1 …) en de tijden.</p>' : '';
    const vanaf = Number(sc.vanaf || S.club.schemaVanaf || 0); const l = r.teams.filter((t) => !vanaf || (t.leeftijd || 99) >= vanaf);
    const status = (t) => { const b = S.teams.find((x) => norm(x.naam) === norm(t.naam)); return !b ? 'nieuw team' : zelfde(b.rooster, t.rooster) ? 'gelijk' : b.trainerId ? 'trainingen worden bijgewerkt' : 'rooster bijgewerkt'; };
    return `<label for="sc-v">Welke teams?</label><select id="sc-v" data-change="schemaVanaf"><option value="0" ${!vanaf ? 'selected' : ''}>Alle teams</option>${[8, 10, 12, 13, 14, 15, 16, 17].map((n) => `<option value="${n}" ${vanaf === n ? 'selected' : ''}>Vanaf O${n}</option>`).join('')}</select>
      <p><b>${l.length} team${l.length === 1 ? '' : 's'} herkend</b></p>
      <div class="tr-tabel"><table class="tb-wed"><tbody>${l.map((t) => `<tr><td><label class="vink"><input type="checkbox" name="sct" value="${esc(t.naam)}" ${status(t) === 'gelijk' ? '' : 'checked'}><span>${esc(t.naam)}<br><small class="zacht">${status(t)}</small></span></label></td><td>${t.rooster.map((x) => `${esc(D.DAG_KORT[x.dag])} ${esc(x.tijd)}–${esc(x.eind)} ${esc(x.veld.replace(/^Veld /, 'v'))}`).join('<br>')}</td></tr>`).join('')}</tbody></table></div>
      ${(() => { const tw = r.twijfel.filter((x) => !vanaf || (leeftijd(x.replace(/\s/g, '')) || 0) >= vanaf); return tw.length ? `<details class="uitklap"><summary>Niet herkend (${tw.length}): niet geladen</summary><p class="zacht klein">${tw.map(esc).join(' · ')}</p></details>` : ''; })()}
      <p class="zacht klein">Nieuwe teams krijgen hun trainingsdagen; de trainingen komen in de kalender zodra er een trainer is. Een team dat al trainingen heeft, wordt veilig bijgewerkt (afmeldingen blijven staan).</p>
      <div class="knoppen"><button class="knop" data-act="schemaOk">Aangevinkte teams klaarzetten</button><button class="knop licht" data-act="sluit">Annuleren</button></div>`; };
  CC.on('schemaLaden', () => { const sc = SC(); sc.tekst = ''; sc.vanaf = null;
    CC.sheet('Trainingsschema laden', `<p class="zacht klein">Open het schema in Excel, selecteer de hele tabel (Ctrl+A), kopieer en plak hier. Een CSV-bestand kan ook. Je ziet eerst wat er gebeurt.</p>
      <textarea id="schemaTekst" rows="5" placeholder="MAANDAG	VELD 1	VELD 2&#10;17:00-17:45	JO15-1 ZA / JO10-1	JO16-1 ZA"></textarea>
      <label class="knop licht vol bestand">${icon('upload')}CSV-bestand kiezen<input type="file" accept=".csv,.txt,text/csv,text/plain" data-change="schemaBestand" hidden></label><div id="schemaVb"></div>`, { groot: true }); });
  const toonSchema = () => { const v = document.getElementById('schemaVb'); if (v) v.innerHTML = schemaVoorbeeld(CC.S()); };
  document.addEventListener('input', (e) => { if (e.target.id !== 'schemaTekst') return; SC().tekst = e.target.value; toonSchema(); });
  CC.on('schemaBestand', (el) => { const f = el.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { SC().tekst = String(r.result); const t = document.getElementById('schemaTekst'); if (t) t.value = SC().tekst; toonSchema(); }; r.readAsText(f); });
  CC.on('schemaVanaf', (el) => { SC().vanaf = Number(el.value); toonSchema(); });
  CC.on('schemaOk', () => { const S = CC.S(); const sc = SC(); const r = CC.schemaLezen(sc.tekst); const gekozen = new Set([...document.querySelectorAll('#schemaVb [name="sct"]:checked')].map((x) => x.value));
    let nieuw = 0, bij = 0, tr = 0;
    r.teams.filter((t) => gekozen.has(t.naam)).forEach((x) => { let t = S.teams.find((b) => norm(b.naam) === norm(x.naam));
      if (!t) { let id = x.naam.toUpperCase().replace(/[^A-Z0-9-]/g, ''); while (S.teams.some((b) => b.id === id)) id += 'x';
        t = { id, naam: x.naam, cat: catVan(x.naam), type: /-1( |$)/.test(x.naam) ? 'selectie' : 'breedte', rooster: x.rooster, afwijking: {}, trainerId: null, teamleiderId: null }; S.teams.push(t); nieuw++; return; }
      if (zelfde(t.rooster, x.rooster)) return; bij++;
      if (t.trainerId || toekomst(S, t.id).length) { const plan = CC.rooster.plan(S, t, x.rooster, D.addDays(D.vandaag(), 1)); CC.rooster.toepassen(S, plan); tr += plan.erbij.length + plan.wijzig.length; } else t.rooster = x.rooster; });
    if (sc.vanaf != null) S.club.schemaVanaf = sc.vanaf;
    CC.save(); CC.closeSheet(); CC.render(); CC.toast(`${nieuw} nieuw${nieuw === 1 ? ' team' : 'e teams'} · ${bij} bijgewerkt${tr ? ` · ${tr} trainingen aangepast` : ''}`); });
})();
