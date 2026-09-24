// ClubComm prototype — Besluit 26: Home van HJO en coördinator = "Te doen" en "Ter informatie".
// Spelerzaken lopen eerst via de coördinator (of de HJO als een team geen coördinator heeft).
// De HJO ziet ze pas als ze blijven liggen; echt ernstige zaken ziet hij wel, ter informatie.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;

  const inst = (S) => { const i = S.club.inst; if (i.liggenDagen == null) i.liggenDagen = 14; if (i.ernstig == null) i.ernstig = 50; return i; };
  // Wie volgt de spelers van dit team op (na trainer en teamleider)? De coördinator, anders de HJO.
  const eersteLijn = (S, tid, rol) => rol === 'coordinator' || (rol === 'hjo' && !CC.coordinatorVoor(S, tid));

  // Sinds wanneer staat een signaal open? (voor "blijft liggen")
  const sinds = (S, sig, teamIds) => {
    const z = S.sigSinds || (S.sigSinds = {}); const nu = new Date().toISOString(); const actief = new Set(sig.map((s) => s.sleutel));
    sig.forEach((s) => { if (!z[s.sleutel]) z[s.sleutel] = nu; });
    Object.keys(z).forEach((k) => { if (teamIds.includes(k.split('|')[1]) && !actief.has(k)) delete z[k]; });
    return z;
  };
  const opgepakt = (S, s, vanaf) => S.gesprekken.some((g) => g.spelerId === s.spelerId && g.datum >= vanaf.slice(0, 10));
  const dagenOpen = (iso) => Math.floor((Date.now() - new Date(iso)) / 864e5);

  // "Gezien": een informatieregel verdwijnt tot er iets verandert
  const gezien = (S) => { const me = CC.me(); const g = S.gezienInfo || (S.gezienInfo = {}); return g[me.id] || (g[me.id] = {}); };
  // Ter informatie: geen "Gezien"-knop meer; een regel verdwijnt vanzelf als het is opgelost (Besluit 34)
  const infoRij = (S, key, hash, rij) => rij;
  CC.on('infoGezien', (el) => { const S = CC.S(); gezien(S)[el.dataset.key] = el.dataset.hash; CC.save(); CC.render(); });

  const perTeam = (lijst) => { const t = {}; lijst.forEach((s) => { t[s.teamId] = (t[s.teamId] || 0) + 1; }); return Object.entries(t).sort((a, b) => b[1] - a[1]).map(([tid, n]) => `${esc(tid)} (${n})`).join(', '); };

  CC.hjoOverzicht = (S) => {
    const rol = CC.rol().rol; const i = inst(S); const tids = S.teams.map((t) => t.id);
    const sig = M.signalen(S, tids, true); const z = sinds(S, sig, tids);
    const eigen = (s) => eersteLijn(S, s.teamId, rol);
    const groep = (soort, f = () => true) => sig.filter((s) => s.soort === soort && f(s));
    const rood = groep('speler', (s) => s.niveau === 'rood');
    // Blijft liggen: rood of opschaling, langer dan X dagen open zonder vastgelegd contact, in een team van de coördinator
    const liggen = rol === 'hjo' ? sig.filter((s) => M.STAPPEN.includes(s.soort) && !eigen(s) && dagenOpen(z[s.sleutel]) >= i.liggenDagen && !opgepakt(S, s, z[s.sleutel])) : [];
    const ernstig = rol === 'hjo' ? rood.filter((s) => !eigen(s) && Number((s.tekst.match(/: (\d+)%/) || [])[1]) < i.ernstig) : [];
    return { sig, z, eigen, groep, rood, liggen, ernstig, rol, i };
  };

  CC.rollen.hjo.schermen.home = (S) => {
    const O = CC.hjoOverzicht(S); const { rol, i, eigen, groep } = O; const L = S.club.labels;
    const per = M.periode(S, 'blok');
    const stats = S.teams.map((t) => M.teamStats(S, t.id, per));
    const tot = stats.reduce((s, x) => s + x.spelers.reduce((a, y) => a + y.st.totaal, 0), 0);
    const aan = stats.reduce((s, x) => s + x.spelers.reduce((a, y) => a + y.st.aanwezig, 0), 0);
    const doen = []; const info = []; const verborgen = { n: 0 };

    // ---- Te doen ----
    if (CC.vervangerRijen) doen.push(...CC.mijnVervangingen(S), ...CC.vervangerRijen(S, S.teams.map((t) => t.id)));
    if (CC.autoBerichtRijen) doen.push(...CC.autoBerichtRijen(S));
    const gesprek = [...groep('clubbesluit'), ...groep('gesprekHjo')];
    const magG = (s) => CC.mag(s.soort === 'clubbesluit' ? 'clubbesluit' : 'gesprek', null, s.teamId);
    gesprek.filter(magG).forEach((s) => doen.push(CC.stapRij(S, s)));
    const bellen = groep('bellen'); // Bellen is eerst van de trainer/teamleider als die de taak hebben; dan is het voor jou ter informatie
    const belEigen = bellen.filter((s) => CC.mag('bellen', null, s.teamId) && eigen(s) && !CC.mag('bellen', 'trainer') && !CC.mag('bellen', 'teamleider'));
    if (belEigen.length) doen.push(h.rij({ ic: 'phone', titel: `${belEigen.length} ${belEigen.length === 1 ? 'ouder' : 'ouders'} bellen of appen`, sub: `Drempel bereikt · ${perTeam(belEigen)}`, kleur: 'rood', act: 'open', attrs: 'data-view="signalen" data-soort="bellen"' }));
    // Losse spelers (rode zone, patronen, langdurig) staan niet op Home: dat volgt de trainer. Zichtbaar bij Inzicht en per team (Besluit 34).
    O.liggen.forEach((s) => doen.push(h.rij({ ic: 'hourglass', titel: `Blijft liggen: ${esc(s.tekst.split(':')[0])} (${esc(s.teamId)})`, sub: `${dagenOpen(O.z[s.sleutel])} dagen open, nog geen contact vastgelegd · ${esc(L.coordinator.toLowerCase())}: ${esc((CC.coordinatorVoor(S, s.teamId) || { naam: '–' }).naam)}`, kleur: 'rood', act: 'open', attrs: `data-view="speler" data-id="${s.spelerId}"` })));
    const zonderStaf = CC.mag('staf') ? S.teams.filter((t) => !t.trainerId || !t.teamleiderId) : [];
    if (zonderStaf.length) doen.push(h.rij({ ic: 'user-cog', titel: zonderStaf.length === 1 ? `${esc(zonderStaf[0].naam)} zonder ${!zonderStaf[0].trainerId ? 'trainer' : 'teamleider'}` : `${zonderStaf.length} teams zonder complete staf`, sub: zonderStaf.map((t) => `${esc(t.naam)} (${!t.trainerId && !t.teamleiderId ? 'trainer + teamleider' : !t.trainerId ? 'trainer' : 'teamleider'})`).join(', '), kleur: 'oranje', act: 'open', attrs: zonderStaf.length === 1 ? `data-view="team" data-team="${zonderStaf[0].id}"` : 'data-view="zonderStaf"' }));
    const laat = S.aanm.filter((x) => x.status === 'open' && Date.now() - new Date(x.tijd) > 48 * 3600e3 && S.teams.some((t) => t.id === x.teamId) && CC.mag('aanmeldingen48', null, x.teamId));
    if (laat.length) doen.push(h.rij({ ic: 'hourglass', titel: `${laat.length} aanmelding${laat.length > 1 ? 'en' : ''} langer dan 48 uur open`, sub: laat.map((x) => `${esc(x.kindVoor)} (${esc(x.teamId)})`).join(', '), kleur: 'oranje', act: 'open', attrs: 'data-view="aanmeldingenHjo"' }));
    if (CC.trainerAandacht) doen.push(...CC.trainerAandacht(S));

    // ---- Ter informatie ----
    const teams = groep('team');
    if (teams.length) { const r = teams.filter((s) => s.niveau === 'rood').length; info.push(infoRij(S, 'teams', teams.map((s) => s.teamId + s.niveau).join(), h.rij({ ic: 'shield', titel: `${teams.length} ${teams.length === 1 ? 'team' : 'teams'} in de ${r ? 'rode' : 'oranje'}${r && r < teams.length ? ' of oranje' : ''} zone`, sub: teams.map((s) => esc(s.tekst.split(':')[0]) + ' ' + s.tekst.match(/\d+%/)[0]).join(', '), kleur: r ? 'rood' : 'oranje', act: 'tab', attrs: 'data-tab="inzicht"' }), verborgen)); }
    const mat = CC.materiaalAandacht && CC.materiaalAandacht(S); if (mat) info.push(infoRij(S, 'materiaal', mat.replace(/<[^>]+>/g, '').slice(0, 80), mat, verborgen));
    const af = M.afgedaanRecent(S, S.teams.filter((t) => eersteLijn(S, t.id, rol)).map((t) => t.id), 14).filter((x) => !x.akkoord);
    if (af.length) info.push(h.rij({ ic: 'check', titel: `${af.length} ${af.length === 1 ? 'signaal' : 'signalen'} afgedaan als "geen actie nodig"`, sub: 'Door trainers en teamleiders. Akkoord, of toch oppakken?', act: 'open', attrs: 'data-view="afgedaan"' }));
    const wijz = S.wijzigingen.filter((w) => Date.now() - new Date(w.tijd) < 7 * 864e5 && (!w.teamId || S.teams.some((t) => t.id === w.teamId)));
    if (wijz.length) info.push(infoRij(S, 'wijz', wijz.map((w) => w.tijd).join(), h.rij({ ic: 'calendar-days', titel: `${wijz.length} planningswijziging${wijz.length > 1 ? 'en' : ''} door trainers`, sub: 'Je hoeft niets te doen', act: 'tab', attrs: 'data-tab="planning"' }), verborgen));

    const infoHtml = info.filter(Boolean);
    return `<div class="clubregel"><span><b>${S.teams.length}</b> teams</span><span><b>${S.players.filter((p) => p.teamId && S.teams.some((t) => t.id === p.teamId)).length}</b> spelers</span><span><b>${tot ? Math.round((100 * aan) / tot) : '–'}%</b> aanwezig</span></div>
      ${h.sectie(`Te doen${doen.length ? ` (${doen.length})` : ''}`)}${doen.length ? `<div class="lijst">${doen.join('')}</div>` : h.leeg('Niets te doen 👍', 'circle-check')}
      ${h.sectie('Ter informatie')}<p class="zacht klein">Om op de hoogte te zijn; je hoeft er niets mee. Het verdwijnt vanzelf als het is opgelost. Losse spelers volgt de trainer${S.club.coordinatorAan ? ` en daarna de ${esc(L.coordinator.toLowerCase())}` : ''}; je ziet ze hier pas als het jouw stap is of als het ${i.liggenDagen} dagen blijft liggen. Alles blijft zichtbaar bij Inzicht.</p>
      ${infoHtml.length ? `<div class="lijst">${infoHtml.join('')}</div>` : '<p class="zacht klein">Niets nieuws.</p>'}
      `;
  };

  // Signalenlijst: ook "ernstig", en alleen wat bij deze rol hoort
  const origSignalen = CC.views.signalen;
  CC.views.signalen = (S, p) => {
    if (!['ernstig', 'speler', 'lang', 'patroon'].includes(p.soort)) return origSignalen(S, p);
    const O = CC.hjoOverzicht(S);
    const lijst = p.soort === 'ernstig' ? O.ernstig : p.soort === 'speler' ? O.rood.filter(O.eigen) : O.groep(p.soort, O.eigen);
    const titel = { ernstig: `Onder ${O.i.ernstig}% aanwezig`, speler: 'Spelers in de rode zone', lang: 'Langdurig afwezig', patroon: 'Opvallende patronen' }[p.soort];
    const teams = [...new Set(lijst.map((s) => s.teamId))];
    return { titel, html: `<p class="zacht klein">ClubComm signaleert; de trainer of teamleider pakt het als eerste op. ${p.soort === 'ernstig' ? `De ${esc(S.club.labels.coordinator.toLowerCase())} volgt dit op; jij hoeft niets te doen.` : 'Jij kijkt of het gebeurt.'}</p>
      ${teams.map((tid) => `${h.sectie(`${esc(tid)} · trainer ${esc((M.persoon(S, M.team(S, tid).trainerId) || { naam: '–' }).naam)}`)}<div class="lijst">${lijst.filter((s) => s.teamId === tid).map((s) => { const d = dagenOpen(O.z[s.sleutel] || new Date().toISOString()); const op = opgepakt(S, s, O.z[s.sleutel] || new Date().toISOString()); return (s.afdoenbaar ? CC.signaalRijAfdoen(S, s) : CC.stapRij(S, s)).replace('</small>', ` · ${op ? 'opgepakt' : d ? `${d} ${d === 1 ? 'dag' : 'dagen'} open` : 'nieuw'}</small>`); }).join('')}</div>`).join('') || h.leeg('Niets')}` };
  };

  // Afgedane signalen: akkoord, of toch oppakken
  CC.views.afgedaan = (S) => {
    const rol = CC.rol().rol; const lijst = M.afgedaanRecent(S, S.teams.filter((t) => eersteLijn(S, t.id, rol)).map((t) => t.id), 60).slice().reverse();
    return { titel: 'Afgedane signalen', html: `<p class="zacht klein">Trainers en teamleiders hebben deze signalen afgedaan als "geen actie nodig". Klopt dat? Dan <b>Akkoord</b>. Twijfel je? Dan <b>Toch oppakken</b>.</p>
      <div class="lijst">${lijst.map((x) => `<div class="signaal">${h.rij({ ic: x.akkoord ? 'circle-check' : 'check', titel: esc(x.tekst), sub: `${esc(x.teamId)} · ${esc((M.persoon(S, x.door) || { naam: '' }).naam)} · ${D.tijdstip(x.tijd)}${x.notitie ? '<br>' + esc(x.notitie) : ''}`, act: x.spelerId ? 'open' : '', attrs: x.spelerId ? `data-view="speler" data-id="${x.spelerId}"` : '' })}
        <div class="signaal-voet">${x.akkoord ? '<small class="zacht">Akkoord</small>' : `<button class="knop klein licht" data-act="afgedaanAkkoord" data-tijd="${esc(x.tijd)}">${icon('check')}Akkoord</button><button class="knop klein licht" data-act="afgedaanOppakken" data-tijd="${esc(x.tijd)}">${icon('undo-2')}Toch oppakken</button>`}</div></div>`).join('') || h.leeg('Niets afgedaan')}</div>` };
  };
  const vind = (S, tijd) => (S.signaalAfgedaan || []).find((x) => x.tijd === tijd);
  CC.on('afgedaanAkkoord', (el) => { const S = CC.S(); vind(S, el.dataset.tijd).akkoord = true; CC.save(); CC.render(); });
  CC.on('afgedaanOppakken', (el) => {
    const S = CC.S(); const x = vind(S, el.dataset.tijd); const t = M.team(S, x.teamId); const tr = M.persoon(S, t.trainerId);
    CC.sheet('Toch oppakken', `<p>${esc(x.tekst)}</p><form data-submit="afgedaanOppakkenOk" data-tijd="${esc(x.tijd)}" class="codeform">
      <label for="to-w">Wie pakt het op?</label><select id="to-w" name="w">${tr ? `<option value="trainer">Terug naar de trainer (${esc(tr.naam)}) met een vraag</option>` : ''}<option value="zelf">Ik pak het zelf op</option></select>
      <label for="to-v">Vraag of opmerking</label><input id="to-v" name="v" placeholder="Bijv. kun je toch even bellen? Het is al de derde keer.">
      <button class="knop">Oppakken</button><p class="zacht klein">Het signaal komt terug in de lijst.</p></form>`);
  });
  CC.on('afgedaanOppakkenOk', (f) => {
    const S = CC.S(); const x = vind(S, f.dataset.tijd); const t = M.team(S, x.teamId); const me = CC.me();
    S.signaalAfgedaan = S.signaalAfgedaan.filter((y) => y !== x);
    if (f.w.value === 'trainer' && t.trainerId) S.msgs.push({ id: 'b' + Date.now(), van: me.id, soort: 'persoonlijk', bereik: t.id, onderwerp: `Toch oppakken: ${x.tekst.split(':')[0]}`, tekst: `Je had dit signaal afgedaan als "geen actie nodig": ${x.tekst}. ${f.v.value || 'Wil je het toch oppakken?'}`, tijd: new Date().toISOString(), ontvangers: [t.trainerId], gelezen: [], antw: [], urgent: false, gepland: null });
    CC.save(); CC.closeSheet(); CC.render(); CC.toast(f.w.value === 'trainer' ? 'De trainer krijgt je vraag; het signaal staat weer open' : 'Het signaal staat weer open');
  });

  // Regels: wanneer komt een spelerzaak bij de HJO?
  const origRegels = CC.rollen.beheerder.schermen.regels;
  CC.rollen.beheerder.schermen.regels = (S) => { const i = inst(S); return origRegels(S) + `${h.sectie('Wanneer ziet de ' + esc(S.club.labels.hjo) + ' spelerzaken?')}<form data-submit="escalatieOk" class="kaartje codeform"><p class="zacht klein">Spelerzaken gaan eerst naar trainer, teamleider en ${esc(S.club.labels.coordinator.toLowerCase())}. De ${esc(S.club.labels.hjo)} ziet ze pas als:</p><div class="twee"><div><label for="e-l">Ze … dagen blijven liggen</label><input id="e-l" name="l" type="number" min="3" max="60" value="${i.liggenDagen}"></div><div><label for="e-e">Of aanwezigheid onder … %</label><input id="e-e" name="e" type="number" min="10" max="90" value="${i.ernstig}"></div></div><button class="knop licht klein">Opslaan</button></form>`; };
  CC.on('escalatieOk', (f) => { const S = CC.S(); const i = inst(S); i.liggenDagen = Number(f.l.value); i.ernstig = Number(f.e.value); CC.save(); CC.render(); CC.toast('Opgeslagen'); });

  // Demo: één zaak bij de coördinator ligt al 20 dagen stil
  const demo = (S) => {
    inst(S); const tids = S.teams.map((t) => t.id); const sig = M.signalen(S, tids, true); const z = sinds(S, sig, tids);
    const oud = new Date(Date.now() - 20 * 864e5).toISOString();
    const s = sig.find((x) => x.soort === 'speler' && x.niveau === 'rood' && CC.coordinatorVoor(S, x.teamId) && x.teamId !== 'O10-1');
    if (s) z[s.sleutel] = oud;
    S.hjoHomeDemo = true;
  };
  const orig = CC.generate;
  CC.generate = function () { const S = orig(); demo(S); return S; };
  const S0 = CC.S(); if (!S0.hjoHomeDemo) { demo(S0); CC.save(); }
})();
