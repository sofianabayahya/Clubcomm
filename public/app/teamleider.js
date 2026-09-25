// ClubComm prototype — Teamleider (Besluit 9 en 33): Home · Wedstrijd · Berichten · Team
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;

  const volgendeWedstrijd = (S, tid) => M.komend(S, tid, 20).find((a) => M.isWed(a) && !a.afgelast);
  const volgorde = (x) => { const i = CC.TAAKSOORTEN.indexOf(x.soort); return i < 0 ? 99 : i; };
  const takenInfo = (S, a) => { const t = S.taken.filter((x) => x.actId === a.id).sort((x, y) => volgorde(x) - volgorde(y)); return { t, bezet: t.filter((x) => x.personId).length }; };
  const openAanm = (S, tid) => S.aanm.filter((x) => x.teamId === tid && x.status === 'open');
  CC.openAanm = openAanm;
  // Volgt de teamleider spelers op (aanwezigheid, kaarten, signalen)? Standaard niet; de club kan het aanzetten (Taken per rol).
  const volgtSpelers = (tid) => CC.volgtSpelers(tid);

  CC.rollen.teamleider = {
    context(S) { const t = M.team(S, CC.teamId()); return { titel: t.naam, sub: `Teamleider · ${S.club.naam}` }; },
    tabs(S) {
      const me = CC.me(); const tid = CC.teamId(); const a = volgendeWedstrijd(S, tid);
      let open = 0; if (a && S.club.modules.taken) { const t = takenInfo(S, a); open = t.t.length - t.bezet ? 1 : 0; }
      return [['home', 'Home', 'house'], ['wedstrijd', 'Wedstrijd', 'trophy', open], ['berichten', 'Berichten', 'message-circle', M.ongelezen(S, me.id)], ['team', 'Team', 'users', openAanm(S, tid).length]];
    },
    schermen: {
      home(S) {
        const tid = CC.teamId(); const me = CC.me(); const a = volgendeWedstrijd(S, tid);
        const acties = [];
        const open = openAanm(S, tid); if (open.length) acties.push(h.rij({ ic: 'user-check', titel: `${open.length} aanmelding${open.length > 1 ? 'en' : ''} goedkeuren`, sub: 'Ouders wachten op toegang', act: 'tab', attrs: 'data-tab="team"', kleur: 'oranje' }));
        const n = M.ongelezen(S, me.id); if (n) acties.push(h.rij({ ic: 'message-circle', titel: `${n} ${n === 1 ? 'nieuw bericht' : 'nieuwe berichten'}`, act: 'tab', attrs: 'data-tab="berichten"', kleur: 'blauw' }));
        if (CC.vervangerRijen) acties.unshift(...CC.mijnVervangingen(S), ...CC.vervangerRijen(S, [tid]));
        if (volgtSpelers(tid)) acties.push(...CC.signaalRegels(S, tid, false));
        if (!a) return h.leeg('Geen wedstrijden gepland') + (acties.length ? `${h.sectie('Actie nodig')}<div class="lijst">${acties.join('')}</div>` : '');
        const sp = M.spelers(S, tid); const komt = sp.filter((pl) => M.status(S, pl, a).code === 'verwacht').length;
        const t = takenInfo(S, a);
        const minimum = CC.categorie(M.team(S, tid).cat).opVeld;
        return `<article class="kaartje hoofd">
          <small>${D.relatief(a.datum)} · verzamelen ${a.verzamel}</small><h2>${h.actTitel(S, a)}</h2><p class="zacht">Aftrap ${a.tijd}${a.thuis ? ` · ${esc(a.veld)}` : ` · ${esc(a.adres)}`}</p>
          <div class="lijst">
            ${h.rij({ ic: 'users', titel: 'Spelers', sub: `${komt} van ${sp.length} komen`, rechts: komt < minimum + 1 ? '<span class="chip oranje mini">krap</span>' : '', kleur: komt < minimum + 1 ? 'oranje' : '', act: 'tab', attrs: 'data-tab="wedstrijd"' })}
            ${S.club.modules.taken ? h.rij({ ic: 'list-checks', titel: 'Taken', sub: t.t.length ? `${t.bezet} van ${t.t.length} bezet${t.t.length - t.bezet ? ` · open: ${t.t.filter((x) => !x.personId).map((x) => x.soort.toLowerCase()).join(', ')}` : ''}` : 'Geen taken', kleur: t.t.length - t.bezet ? 'oranje' : '', act: 'tab', attrs: 'data-tab="wedstrijd"' }) : ''}
          </div>
          <div class="knoppen">${a.thuis ? '' : h.route(a.adres)}<button class="knop licht" data-act="deelWedstrijd" data-id="${a.id}">${icon('share-2')}Delen in de teamgroep</button></div></article>
          ${acties.length ? `${h.sectie('Actie nodig')}<div class="lijst">${acties.join('')}</div>` : ''}`;
      },
      // Alles over één wedstrijd op één plek, in de volgorde van de dag (Besluit 33)
      wedstrijd(S) {
        const tid = CC.teamId();
        const lijst = S.acts.filter((a) => a.teamId === tid && M.isWed(a) && a.datum >= D.addDays(D.vandaag(), -14)).slice(0, 8);
        const std = volgendeWedstrijd(S, tid);
        const a = lijst.find((x) => x.id === h.segVal('tlWed', std && std.id)) || std || lijst[0];
        if (!a) return h.leeg('Geen wedstrijden') + `<button class="knop vol" data-act="wedstrijdToevoegen">${icon('plus')}Wedstrijd toevoegen</button>`;
        const sp = M.spelers(S, tid).map((pl) => ({ pl, st: M.status(S, pl, a) }));
        const af = sp.filter((x) => !['verwacht', 'aanwezig', 'telaat'].includes(x.st.code));
        const gespeeld = a.datum < D.vandaag() || (a.datum === D.vandaag() && new Date() > D.start(a));
        const vandaag = a.datum === D.vandaag();
        const t = takenInfo(S, a);
        const taakIc = (soort) => ({ 'Trainer-coach': 'clipboard-check', Timekeeper: 'timer', Spelbegeleider: 'flag', Vlagger: 'flag', Scheidsrechter: 'megaphone', Fotograaf: 'eye', Wastas: 'shirt' }[soort] || 'hand-helping');
        return `<select class="kies" data-change="kiesTlWed" aria-label="Wedstrijd">${lijst.map((w) => `<option value="${w.id}" ${w.id === a.id ? 'selected' : ''}>${D.kort(w.datum)} · ${h.actTitel(S, w)}${w.afgelast ? ' · afgelast' : w.uitslag ? ' · ' + w.uitslag : ''}</option>`).join('')}</select>
          ${a.afgelast ? `<div class="info rood">${icon('ban')}<span>Deze wedstrijd is afgelast.</span></div>` : ''}
          <form class="kaartje codeform" data-submit="wedstrijdInfo" data-id="${a.id}">
            <div class="kaart-kop">${h.datumBlok(a)}<div><b>${h.actTitel(S, a)}</b><small>${D.relatief(a.datum)} · aftrap ${a.tijd}</small></div></div>
            <div class="twee"><div><label for="wi-v">Verzamelen</label><input id="wi-v" name="verzamel" type="time" value="${a.verzamel}"></div>${gespeeld ? `<div><label for="wi-u">Uitslag</label><input id="wi-u" name="uitslag" placeholder="bijv. 3-2" value="${esc(a.uitslag || '')}"></div>` : ''}</div>
            ${a.thuis ? `<p class="klein zacht">Thuis · ${esc(a.veld || '')}</p>` : `<label for="wi-a">Adres</label><input id="wi-a" name="adres" value="${esc(a.adres || '')}">`}
            <div class="knoppen"><button class="knop licht">Opslaan</button>${a.thuis ? '' : h.route(a.adres)}<button type="button" class="knop licht" data-act="deelWedstrijd" data-id="${a.id}">${icon('share-2')}Delen</button></div></form>
          ${h.sectie(`Komen: ${sp.length - af.length} van ${sp.length}`)}
          <div class="lijst compact">${af.map((x) => h.rij({ ic: h.avatar(x.pl.voornaam), titel: esc(M.naam(S, x.pl)), rechts: h.chip(x.st) })).join('') || '<p class="zacht klein">Iedereen komt.</p>'}</div>
          ${S.club.modules.taken ? `${h.sectie(`Taken · ${t.bezet} van ${t.t.length} bezet`)}<div class="lijst">${t.t.map((x) => h.rij({ ic: taakIc(x.soort), titel: esc(x.soort), sub: x.personId ? esc(M.persoon(S, x.personId).naam) : '<b class="oranje-tekst">nog open</b>', rechts: gespeeld ? '' : `<button class="icoonknop" data-act="taakVerwijderen" data-id="${x.id}" aria-label="${esc(x.soort)} verwijderen">${icon('x')}</button>` })).join('') || '<p class="zacht klein">Geen taken.</p>'}</div>
            <div class="knoppen"><button class="knop klein licht" data-act="taakToevoegen" data-a="${a.id}">${icon('plus')}Taak</button>${t.t.length - t.bezet ? `<button class="knop klein licht" data-act="deelTaken" data-a="${a.id}">${icon('share-2')}Oproep delen</button>` : ''}</div>
            <p class="zacht klein">Staat een taak ${S.club.inst.oproepDagen} dagen van tevoren nog open, dan krijgen de ouders automatisch een oproep.</p>` : ''}
          ${!a.afgelast && (vandaag || gespeeld) ? `${h.sectie('Op de dag zelf')}<div class="knoppen"><button class="knop licht" data-act="open" data-view="opnemen" data-id="${a.id}">${icon('clipboard-check')}Aanwezigheid</button>${S.club.modules.speeltijd ? `<button class="knop licht" data-act="open" data-view="speeltijd" data-team="${tid}">${icon('timer')}Wisselschema</button>` : ''}</div><p class="zacht klein">De trainer-coach vult de aanwezigheid in, de timekeeper doet de wissels.</p>` : ''}
          <div class="knoppen">${!a.afgelast && !gespeeld ? `<button class="knop licht rood-tekst" data-act="wedstrijdAfgelast" data-id="${a.id}">${icon('ban')}Afgelast</button>` : ''}<button class="knop licht" data-act="wedstrijdToevoegen">${icon('plus')}Wedstrijd toevoegen</button></div>`;
      },
      berichten: (S) => CC.berichtenScherm(S, { nieuw: true }),
      team(S) {
        const tid = CC.teamId(); const open = openAanm(S, tid);
        const sp = M.spelers(S, tid);
        const eenOuder = sp.filter((pl) => pl.ouders.length < 2);
        return `${open.length ? `${h.sectie(`Aanmeldingen goedkeuren (${open.length})`)}<div class="lijst">${open.map((x) => CC.aanmRij(S, x)).join('')}</div>` : ''}
          ${h.sectie('Ouders uitnodigen')}${CC.uitnodigBlok(tid)}
          ${h.sectie(`Spelers (${sp.length})`, volgtSpelers(tid) ? `<button class="linkknop" data-act="open" data-view="overzichtTeam" data-team="${tid}">Aanwezigheid</button>` : '')}
          ${(() => { const volgt = volgtSpelers(tid); const F = CC.spelerFilter(S, tid, !volgt); return F.bar + `<div class="lijst">${F.lijst.map(({ pl, st, vs, z }) => { const o = pl.ouders.map((x) => M.persoon(S, x)); return h.rij({ ic: h.avatar(pl.voornaam), titel: esc(M.naam(S, pl)), sub: `${volgt ? `${st.pct == null ? '–' : st.pct + '%'} aanwezig · ` : ''}${vs && vs.code !== 'verwacht' ? `${h.chip(vs)} · ` : ''}${o.map((p) => esc(p.naam.split(' ')[0])).join(' en ')}`, rechts: `<a class="icoonknop groen" href="https://wa.me/31${o[0].tel.slice(1)}" target="_blank" rel="noopener" aria-label="WhatsApp ouder van ${esc(pl.voornaam)}" data-stop="1">${icon('message-circle')}</a>`, act: 'open', attrs: `data-view="speler" data-id="${pl.id}"` }); }).join('') || h.leeg('Geen spelers met dit filter')}</div>`; })()}
          ${S.club.modules.taken && CC.hulpTeamleider ? CC.hulpTeamleider(S, tid) : ''}
          ${CC.recenteTrainingen && CC.mag('trainerNiet', null, tid) ? CC.recenteTrainingen(S, tid) : ''}
          <details class="uitklap"><summary>${icon('user-plus')}Nog niet aangemeld</summary><p class="klein">${eenOuder.length} spelers hebben één ouder gekoppeld. De tweede ouder kan zich via de uitnodiging aanmelden of door de eerste ouder worden uitgenodigd.</p><p class="zacht klein">Van team wisselen is een clubbeslissing en loopt via de ${esc(S.club.labels.hjo)}.</p></details>`;
      },
    },
  };
  CC.views.overzichtTeam = (S, p) => ({ titel: 'Aanwezigheid per speler', html: CC.overzichtHtml(S, p.team) });
  CC.views.speeltijd = (S, p) => ({ titel: 'Speeltijd', html: CC.speeltijdHtml(S, p.team) });

  CC.on('kiesTlWed', (el) => { CC.ui.seg.tlWed = el.value; CC.render(); });
  CC.on('wedstrijdInfo', (f) => { const S = CC.S(); const a = M.act(S, f.dataset.id); a.verzamel = f.verzamel.value; if (f.adres) a.adres = f.adres.value; if (f.uitslag) a.uitslag = f.uitslag.value; CC.save(); CC.render(); CC.toast('Opgeslagen; ouders zien het direct'); });
  CC.on('wedstrijdAfgelast', (el) => CC.sheet('Wedstrijd afgelast', `<form data-submit="wedstrijdAfgelastOk" data-id="${el.dataset.id}" class="codeform"><label for="wa-r">Waarom?</label><select id="wa-r" name="r"><option>De tegenstander heeft afgezegd</option><option>Het veld is afgekeurd</option><option>Te weinig spelers</option><option>Anders</option></select><button class="knop rood vol">${icon('ban')}Afgelasten en ouders inlichten</button><p class="zacht klein">Alle ouders van het team krijgen direct een melding. Trainer en ${esc(CC.S().club.labels.hjo)} krijgen een melding ter informatie.</p></form>`));
  CC.on('wedstrijdAfgelastOk', (f) => {
    const S = CC.S(); const a = M.act(S, f.dataset.id); const t = M.team(S, a.teamId); const me = CC.me(); const now = new Date().toISOString();
    a.afgelast = true; CC.ui.seg.tlWed = a.id; const tekst = `De wedstrijd van ${D.lang(a.datum)} tegen ${a.tegen} gaat niet door. Reden: ${f.r.value.toLowerCase()}.`;
    S.msgs.push({ id: 'b' + Date.now(), van: me.id, soort: 'nieuws', bereik: a.teamId, onderwerp: 'Wedstrijd afgelast', tekst, tijd: now, ontvangers: M.oudersVan(S, a.teamId), gelezen: [], antw: [], urgent: true, gepland: null });
    const hjo = S.people.filter((p) => p.rollen.some((r) => r.rol === 'hjo')).map((p) => p.id);
    S.msgs.push({ id: 'b' + Date.now() + 1, van: 'systeem', soort: 'melding', bereik: 'Ter informatie', onderwerp: `${a.teamId}: wedstrijd afgelast`, tekst: `${me.naam}: ${tekst} Je hoeft niets te doen.`, tijd: now, ontvangers: [...hjo, t.trainerId].filter((x) => x && x !== me.id), gelezen: [], antw: [], urgent: false, gepland: null });
    S.wijzigingen.push({ id: 'w' + Date.now(), teamId: a.teamId, door: me.id, tekst, tijd: now });
    CC.save(); CC.closeSheet(); CC.render(); CC.toast('Afgelast; ouders zijn ingelicht');
  });
  CC.on('deelWedstrijd', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.id); CC.deel(`${a.teamId} ${D.lang(a.datum)}: ${a.thuis ? 'thuis' : 'uit'} tegen ${a.tegen}. Verzamelen ${a.verzamel}, aftrap ${a.tijd}. ${a.thuis ? '' : `Adres: ${a.adres}. `}Kan je kind niet? Meld af in ClubComm: ${location.origin}${location.pathname}`, 'Wedstrijdinfo'); });
  CC.on('deelTaken', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.a); const open = S.taken.filter((x) => x.actId === a.id && !x.personId).map((x) => x.soort); CC.deel(open.length ? `Voor ${D.lang(a.datum)} (${a.tegen}) zoeken we nog: ${open.join(', ')}. Kun jij? Tik op "Ik doe het" in ClubComm: ${location.origin}${location.pathname}` : 'Alle taken zijn bezet, dank jullie wel!', 'Taken'); });
  // Taak toevoegen: een soort die er al staat, kan niet nog een keer (voorkomt dubbele taken)
  CC.on('taakToevoegen', (el) => { const S = CC.S(); const al = S.taken.filter((x) => x.actId === el.dataset.a).map((x) => x.soort);
    CC.sheet('Taak toevoegen', `<div class="lijst">${CC.TAAKSOORTEN.map((s) => (al.includes(s) ? h.rij({ ic: 'check', titel: s, sub: 'Staat er al' }) : h.rij({ ic: 'plus', titel: s, act: 'taakToevoegenOk', attrs: `data-a="${el.dataset.a}" data-s="${s}"` }))).join('')}</div>`); });
  // Taak verwijderen; een vaste taak komt dan niet vanzelf terug bij deze wedstrijd. Wie de taak had, krijgt bericht.
  CC.on('taakVerwijderen', (el) => { const S = CC.S(); const t = S.taken.find((x) => x.id === el.dataset.id); const p = t.personId && M.persoon(S, t.personId);
    CC.sheet(`${t.soort} verwijderen?`, `<p>${p ? `<b>${esc(p.naam)}</b> doet deze taak en krijgt bericht dat het niet meer nodig is.` : 'Niemand heeft deze taak nog opgepakt.'}</p><div class="knoppen kolom"><button class="knop rood" data-act="taakVerwijderenOk" data-id="${t.id}">${icon('trash-2')}Verwijderen</button></div>`); });
  CC.on('taakVerwijderenOk', (el) => {
    const S = CC.S(); const t = S.taken.find((x) => x.id === el.dataset.id); const a = M.act(S, t.actId);
    if (CC.vasteTakenVoor(S, M.team(S, a.teamId)).includes(t.soort) && !S.taken.some((x) => x !== t && x.actId === t.actId && x.soort === t.soort)) (a.zonderTaken || (a.zonderTaken = [])).push(t.soort);
    if (t.personId && t.personId !== CC.me().id) S.msgs.push({ id: 'b' + Date.now(), van: CC.me().id, soort: 'persoonlijk', bereik: (M.persoon(S, t.personId) || {}).naam || '', onderwerp: `${t.soort} niet meer nodig`, tekst: `De taak ${t.soort.toLowerCase()} bij de wedstrijd van ${D.lang(a.datum)} tegen ${a.tegen} is niet meer nodig. Dank je wel voor het aanbod!`, tijd: new Date().toISOString(), ontvangers: [t.personId], gelezen: [], antw: [], urgent: false, gepland: null });
    S.taken = S.taken.filter((x) => x !== t); CC.save(); CC.closeSheet(); CC.render(); CC.toast('Taak verwijderd');
  });
  CC.on('taakToevoegenOk', (el) => { const S = CC.S(); S.taken.push({ id: 't' + Date.now(), actId: el.dataset.a, soort: el.dataset.s, personId: null }); CC.save(); CC.closeSheet(); CC.render(); });
  CC.on('wedstrijdToevoegen', () => CC.sheet('Wedstrijd toevoegen', `<form data-submit="wedstrijdToevoegenOk" class="codeform"><label for="nw-t">Tegenstander</label><input id="nw-t" name="tegen" required placeholder="Bijv. FC Amstelland O10-2"><div class="twee"><div><label for="nw-d">Datum</label><input id="nw-d" name="datum" type="date" required value="${D.addDays(D.vandaag(), 10)}"></div><div><label for="nw-a">Aftrap</label><input id="nw-a" name="tijd" type="time" required value="09:00"></div></div><label class="vink"><input type="checkbox" name="thuis" checked> Thuiswedstrijd</label><button class="knop">Toevoegen</button><p class="zacht klein">In de pilot voer je wedstrijden zelf in. Later komen ze automatisch uit Sportlink of voetbal.nl.</p></form>`));
  CC.on('wedstrijdToevoegenOk', (f) => {
    const S = CC.S(); const tid = CC.teamId(); const thuis = f.thuis.checked; const [hh, mm] = f.tijd.value.split(':').map(Number); const vz = hh * 60 + mm - (thuis ? 30 : 60);
    S.acts.push({ id: 'a' + Date.now(), teamId: tid, soort: 'wedstrijd', datum: f.datum.value, tijd: f.tijd.value, eind: `${String(hh + 1).padStart(2, '0')}:${String(mm).padStart(2, '0')}`, thuis, tegen: f.tegen.value, veld: thuis ? 'Veld 1' : '', adres: thuis ? (S.club.sportpark || '') : '', verzamel: `${String(Math.floor(vz / 60)).padStart(2, '0')}:${String(vz % 60).padStart(2, '0')}`, tenue: thuis ? 'Thuistenue (wit/blauw)' : 'Uittenue (blauw)', begeleiderId: M.team(S, tid).teamleiderId, uitslag: null, afgelast: false });
    S.acts.sort((x, y) => (x.datum + x.tijd).localeCompare(y.datum + y.tijd)); CC.save(); CC.closeSheet(); CC.render(); CC.toast('Wedstrijd toegevoegd; ouders zien hem in de planning');
  });

  // ---------- Aanmeldingen goedkeuren (Besluit 2) ----------
  const lijkt = (a, b) => { a = a.toLowerCase().replace(/\s+/g, ''); b = b.toLowerCase().replace(/\s+/g, ''); if (a === b) return true; if (Math.abs(a.length - b.length) > 2) return false; let d = 0; for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) d++; return d <= 2; };
  CC.aanmRij = (S, x) => {
    const uur = Math.round((Date.now() - new Date(x.tijd)) / 3600e3);
    return `<div class="rij aanm"><span class="rij-ic">${icon('user-plus')}</span><span class="rij-tekst"><b>${esc(x.kindVoor)} ${esc(x.kindAchter)}</b><small>${esc(x.ouderNaam)} · ${esc(x.email)} · ${uur < 1 ? 'net' : uur + ' uur geleden'}</small>${uur >= 48 ? '<small class="oranje-tekst">Ligt al langer dan 48 uur stil</small>' : ''}</span>
      <span class="rij-r"><button class="knop klein" data-act="goedkeuren" data-id="${x.id}">Goedkeuren</button><button class="icoonknop" data-act="afwijzen" data-id="${x.id}" aria-label="Afwijzen">${icon('x')}</button></span></div>`;
  };
  CC.on('goedkeuren', (el) => {
    const S = CC.S(); const x = S.aanm.find((y) => y.id === el.dataset.id);
    const dubbel = S.players.find((pl) => pl.teamId === x.teamId && lijkt(pl.voornaam + pl.achternaam, x.kindVoor + x.kindAchter));
    if (dubbel) return CC.sheet('Is dit hetzelfde kind?', `<p><b>${esc(x.ouderNaam)}</b> meldt <b>${esc(x.kindVoor)} ${esc(x.kindAchter)}</b> aan. In ${esc(x.teamId)} staat al:</p>${h.rij({ ic: h.avatar(dubbel.voornaam), titel: esc(M.naam(S, dubbel)), sub: `Ouder: ${dubbel.ouders.map((o) => esc(M.persoon(S, o).naam)).join(', ')}` })}
      <div class="knoppen kolom"><button class="knop" data-act="koppelOuder" data-id="${x.id}" data-s="${dubbel.id}">Ja, koppel als tweede ouder</button><button class="knop licht" data-act="nieuwKind" data-id="${x.id}">Nee, het is een ander kind</button></div>`);
    CC.keurGoed(x, null);
  });
  CC.on('koppelOuder', (el) => { const S = CC.S(); CC.keurGoed(S.aanm.find((y) => y.id === el.dataset.id), el.dataset.s); });
  CC.on('nieuwKind', (el) => { const S = CC.S(); CC.keurGoed(S.aanm.find((y) => y.id === el.dataset.id), null); });
  CC.keurGoed = (x, spelerId) => {
    const S = CC.S();
    let ouder = S.people.find((p) => p.email.toLowerCase() === x.email.toLowerCase());
    if (!ouder) { ouder = { id: 'p' + Date.now(), naam: x.ouderNaam, email: x.email, tel: '', rollen: [{ rol: 'ouder' }] }; S.people.push(ouder); }
    else if (!ouder.rollen.some((r) => r.rol === 'ouder')) ouder.rollen.push({ rol: 'ouder' });
    let pl = spelerId && M.speler(S, spelerId);
    if (pl) { if (!pl.ouders.includes(ouder.id)) pl.ouders.push(ouder.id); }
    else { pl = { id: 's' + Date.now(), voornaam: x.kindVoor, achternaam: x.kindAchter, teamId: x.teamId, ouders: [ouder.id], bondsnummer: null }; S.players.push(pl); }
    x.status = 'ok';
    S.msgs.push({ id: 'b' + Date.now(), van: CC.me().id, soort: 'persoonlijk', bereik: ouder.naam, onderwerp: `Welkom bij ${x.teamId}!`, tekst: `Je bent gekoppeld aan ${pl.voornaam}, ${x.teamId}. Tip: zet ClubComm op je beginscherm (Profiel → App op je beginscherm), dan krijg je meldingen.`, tijd: new Date().toISOString(), ontvangers: [ouder.id], gelezen: [], antw: [], urgent: false, gepland: null });
    CC.save(); CC.closeSheet(); CC.render(); CC.toast(`${pl.voornaam} is gekoppeld; ${ouder.naam.split(' ')[0]} krijgt een welkomstmail`);
  };
  CC.on('afwijzen', (el) => CC.sheet('Aanmelding afwijzen', `<form data-submit="afwijzenOk" data-id="${el.dataset.id}" class="codeform"><label for="aw">Reden (de ouder krijgt dit te zien)</label><select id="aw" name="r"><option>Dit kind zit niet in dit team</option><option>Onbekend bij de club</option><option>Dubbele aanmelding</option></select><button class="knop rood">Afwijzen</button><p class="zacht klein">Typfout in de naam? Keur dan goed en pas de naam later aan.</p></form>`));
  CC.on('afwijzenOk', (f) => { const S = CC.S(); S.aanm.find((y) => y.id === f.dataset.id).status = 'af'; CC.save(); CC.closeSheet(); CC.render(); CC.toast('Afgewezen; de ouder krijgt bericht'); });
  CC.views.aanmeldingen = (S) => ({ titel: 'Aanmeldingen', html: `<div class="lijst">${S.aanm.filter((x) => x.status === 'open' && (!CC.teamId() || x.teamId === CC.teamId())).map((x) => CC.aanmRij(S, x)).join('') || h.leeg('Alles is goedgekeurd')}</div>` });
})();
