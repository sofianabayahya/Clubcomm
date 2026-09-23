// ClubComm prototype — Teamleider (Besluit 9): Home · Wedstrijd · Regelen · Berichten · Team
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;

  const volgendeWedstrijd = (S, tid) => M.komend(S, tid, 20).find((a) => a.soort !== 'training' && !a.afgelast);
  const vervoerInfo = (S, a) => {
    if (a.thuis || a.soort === 'oefen') return { nodig: false };
    const v = S.vervoer[a.id] || { aanbod: [], plek: {} };
    const komen = M.spelers(S, a.teamId).filter((pl) => M.status(S, pl, a).code === 'verwacht');
    const zonder = komen.filter((pl) => !v.plek[pl.id]);
    const plekken = v.aanbod.reduce((s, x) => s + x.plekken, 0);
    return { nodig: true, v, komen, zonder, plekken };
  };
  const takenInfo = (S, a) => { const t = S.taken.filter((x) => x.actId === a.id); return { t, bezet: t.filter((x) => x.personId).length }; };
  const openAanm = (S, tid) => S.aanm.filter((x) => x.teamId === tid && x.status === 'open');
  CC.openAanm = openAanm;

  CC.rollen.teamleider = {
    context(S) { const t = M.team(S, CC.teamId()); return { titel: t.naam, sub: `Teamleider · ${S.club.naam}` }; },
    tabs(S) {
      const me = CC.me(); const tid = CC.teamId(); const a = volgendeWedstrijd(S, tid);
      let regel = 0; if (a) { const v = vervoerInfo(S, a); const t = takenInfo(S, a); regel = (v.nodig && v.zonder.length ? 1 : 0) + (t.t.length - t.bezet ? 1 : 0); }
      return [['home', 'Home', 'house'], ['wedstrijd', 'Wedstrijd', 'trophy'], (S.club.modules.vervoer || S.club.modules.taken) && ['regelen', 'Regelen', 'hand-helping', regel], ['berichten', 'Berichten', 'message-circle', M.ongelezen(S, me.id)], ['team', 'Team', 'users', openAanm(S, tid).length]];
    },
    schermen: {
      home(S) {
        const tid = CC.teamId(); const me = CC.me(); const a = volgendeWedstrijd(S, tid);
        const acties = [];
        const open = openAanm(S, tid); if (open.length) acties.push(h.rij({ ic: 'user-check', titel: `${open.length} aanmelding${open.length > 1 ? 'en' : ''} goedkeuren`, sub: 'Ouders wachten op toegang', act: 'tab', attrs: 'data-tab="team"', kleur: 'oranje' }));
        const n = M.ongelezen(S, me.id); if (n) acties.push(h.rij({ ic: 'message-circle', titel: `${n} ${n === 1 ? 'nieuw bericht' : 'nieuwe berichten'}`, act: 'tab', attrs: 'data-tab="berichten"', kleur: 'blauw' }));
        acties.push(...CC.signaalRegels(S, tid, false));
        if (!a) return h.leeg('Geen wedstrijden gepland') + (acties.length ? `${h.sectie('Actie nodig')}<div class="lijst">${acties.join('')}</div>` : '');
        const sp = M.spelers(S, tid); const komt = sp.filter((pl) => M.status(S, pl, a).code === 'verwacht').length;
        const v = vervoerInfo(S, a); const t = takenInfo(S, a); const beg = a.begeleiderId && M.persoon(S, a.begeleiderId);
        const minimum = CC.categorie(M.team(S, tid).cat).opVeld;
        return `<article class="kaartje hoofd">
          <small>${D.relatief(a.datum)} · verzamelen ${a.verzamel}</small><h2>${h.actTitel(S, a)}</h2><p class="zacht">Aftrap ${a.tijd}${a.thuis ? ` · ${esc(a.veld)}` : ` · ${esc(a.adres)}`}</p>
          <div class="lijst">
            ${h.rij({ ic: 'users', titel: 'Spelers', sub: `${komt} van ${sp.length} komen`, rechts: komt < minimum + 1 ? '<span class="chip oranje mini">krap</span>' : '', kleur: komt < minimum + 1 ? 'oranje' : '', act: 'tab', attrs: 'data-tab="wedstrijd"' })}
            ${S.club.modules.vervoer ? h.rij({ ic: 'car', titel: 'Vervoer', sub: !v.nodig ? 'Thuiswedstrijd, niet nodig' : v.zonder.length ? `${v.zonder.length} ${v.zonder.length === 1 ? 'kind' : 'kinderen'} zonder vervoer` : 'Iedereen heeft een plek', kleur: v.nodig && v.zonder.length ? 'oranje' : '', act: 'tab', attrs: 'data-tab="regelen"' }) : ''}
            ${S.club.modules.taken ? h.rij({ ic: 'list-checks', titel: 'Taken', sub: t.t.length ? `${t.bezet} van ${t.t.length} bezet` : 'Geen taken', kleur: t.t.length - t.bezet ? 'oranje' : '', act: 'tab', attrs: 'data-tab="regelen"' }) : ''}
            ${h.rij({ ic: 'clipboard-check', titel: 'Begeleider', sub: beg ? esc(beg.naam) : 'Nog niemand', kleur: beg ? '' : 'oranje', act: 'tab', attrs: 'data-tab="wedstrijd"' })}
          </div>
          <button class="knop licht vol" data-act="deelWedstrijd" data-id="${a.id}">${icon('share-2')}Wedstrijdinfo delen in de teamgroep</button></article>
          ${acties.length ? `${h.sectie('Actie nodig')}<div class="lijst">${acties.join('')}</div>` : ''}`;
      },
      wedstrijd(S) {
        const tid = CC.teamId(); const t = M.team(S, tid);
        const lijst = S.acts.filter((a) => a.teamId === tid && a.soort !== 'training' && a.datum >= D.addDays(D.vandaag(), -14)).slice(0, 8);
        const std = volgendeWedstrijd(S, tid);
        const a = lijst.find((x) => x.id === h.segVal('tlWed', std && std.id)) || std || lijst[0];
        if (!a) return h.leeg('Geen wedstrijden') + `<button class="knop vol" data-act="wedstrijdToevoegen">${icon('plus')}Wedstrijd toevoegen</button>`;
        const sp = M.spelers(S, tid).map((pl) => ({ pl, st: M.status(S, pl, a) }));
        const af = sp.filter((x) => !['verwacht', 'aanwezig', 'telaat'].includes(x.st.code));
        const kandidaten = [t.teamleiderId, t.trainerId, ...S.taken.filter((x) => x.actId === a.id && x.soort === 'Coach' && x.personId).map((x) => x.personId)].filter(Boolean);
        const gespeeld = a.datum < D.vandaag() || (a.datum === D.vandaag() && new Date() > D.start(a));
        return `<select class="kies" data-change="kiesTlWed" aria-label="Wedstrijd">${lijst.map((w) => `<option value="${w.id}" ${w.id === a.id ? 'selected' : ''}>${D.kort(w.datum)} · ${h.actTitel(S, w)}${w.uitslag ? ' · ' + w.uitslag : ''}</option>`).join('')}</select>
          <form class="kaartje codeform" data-submit="wedstrijdInfo" data-id="${a.id}">
            <div class="kaart-kop">${h.datumBlok(a)}<div><b>${h.actTitel(S, a)}</b><small>Aftrap ${a.tijd}</small></div></div>
            <div class="twee"><div><label for="wi-v">Verzamelen</label><input id="wi-v" name="verzamel" type="time" value="${a.verzamel}"></div><div><label for="wi-t">Tenue</label><input id="wi-t" name="tenue" value="${esc(a.tenue || '')}"></div></div>
            <label for="wi-a">Adres</label><input id="wi-a" name="adres" value="${esc(a.adres || '')}">
            ${gespeeld ? `<label for="wi-u">Uitslag</label><input id="wi-u" name="uitslag" placeholder="bijv. 3-2" value="${esc(a.uitslag || '')}">` : ''}
            <div class="knoppen"><button class="knop">Opslaan</button><button type="button" class="knop licht" data-act="deelWedstrijd" data-id="${a.id}">${icon('share-2')}Delen</button></div></form>
          ${h.sectie('Wedstrijdbegeleider')}
          <div class="kaartje"><select class="kies" data-change="zetBegeleider" data-id="${a.id}" aria-label="Begeleider"><option value="">Nog niemand</option>${[...new Set(kandidaten)].map((pid) => `<option value="${pid}" ${a.begeleiderId === pid ? 'selected' : ''}>${esc(M.persoon(S, pid).naam)}${pid === t.teamleiderId ? ' (teamleider)' : pid === t.trainerId ? ' (trainer)' : ' (ouder-coach)'}</option>`).join('')}</select>
            <p class="zacht klein">Volgorde: teamleider → trainer → ouder die zich als "Coach" heeft aangemeld. De begeleider doet aanwezigheid${S.club.modules.speeltijd ? ' en speeltijd' : ''} voor deze wedstrijd.</p>
            <div class="knoppen"><button class="knop licht" data-act="open" data-view="opnemen" data-id="${a.id}">${icon('clipboard-check')}Aanwezigheid</button>${S.club.modules.speeltijd ? `<button class="knop licht" data-act="open" data-view="speeltijd" data-team="${tid}">${icon('timer')}Speeltijd</button>` : ''}</div></div>
          ${h.sectie(`Komen: ${sp.length - af.length} van ${sp.length}`)}
          <div class="lijst compact">${af.map((x) => h.rij({ ic: h.avatar(x.pl.voornaam), titel: esc(M.naam(S, x.pl)), rechts: h.chip(x.st) })).join('') || '<p class="zacht klein">Iedereen komt.</p>'}</div>
          <button class="knop licht vol" data-act="wedstrijdToevoegen">${icon('plus')}Wedstrijd toevoegen</button>`;
      },
      regelen(S) {
        const tid = CC.teamId();
        const wed = M.komend(S, tid, 20).filter((a) => a.soort !== 'training' && !a.afgelast).slice(0, 3);
        const hulp = {}; M.oudersVan(S, tid).forEach((p) => { hulp[p] = 0; });
        S.taken.forEach((x) => { const a = M.act(S, x.actId); if (a && a.teamId === tid && x.personId && hulp[x.personId] != null && a.datum < D.vandaag()) hulp[x.personId]++; });
        const rang = Object.entries(hulp).sort((a, b) => b[1] - a[1]);
        const nooit = rang.filter(([, n]) => n === 0);
        return `<div class="info">${icon('bell')}<span>Herinneringen gaan <b>automatisch</b>: ${S.club.inst.oproepDagen} dagen van tevoren krijgen ouders een oproep voor open taken en een melding als hun kind nog geen vervoer heeft.</span></div>
          ${wed.map((a) => {
            const v = vervoerInfo(S, a); const t = takenInfo(S, a);
            return `${h.sectie(`${D.relatief(a.datum)} · ${h.actTitel(S, a)}`)}<div class="kaartje">
              ${S.club.modules.vervoer ? (v.nodig ? `<h4>${icon('car')}Vervoer · ${v.plekken} plekken aangeboden</h4>
                ${v.v.aanbod.map((x) => { const p = M.persoon(S, x.personId); const mee = Object.entries(v.v.plek).filter(([, d]) => d === x.personId).map(([s]) => M.speler(S, s).voornaam); return `<p class="klein">${esc(p.naam)}: ${mee.map(esc).join(', ') || '–'} <span class="zacht">(${x.plekken - mee.length} vrij)</span></p>`; }).join('') || '<p class="zacht klein">Nog niemand rijdt.</p>'}
                ${v.zonder.length ? `<p class="klein oranje-tekst"><b>Zonder vervoer:</b> ${v.zonder.map((pl) => `<button class="chipknop" data-act="indelen" data-a="${a.id}" data-s="${pl.id}">${esc(pl.voornaam)} ${icon('plus')}</button>`).join(' ')}</p>` : '<p class="klein groen-tekst">Iedereen heeft een plek.</p>'}` : `<p class="zacht klein">${icon('car')} Thuiswedstrijd: geen vervoer nodig.</p>`) : ''}
              ${S.club.modules.taken ? `<h4>${icon('list-checks')}Taken · ${t.bezet} van ${t.t.length} bezet</h4>
                ${t.t.map((x) => `<p class="klein">${esc(x.soort)}: ${x.personId ? esc(M.persoon(S, x.personId).naam) : '<b class="oranje-tekst">open</b>'}</p>`).join('')}
                <div class="knoppen"><button class="knop klein licht" data-act="taakToevoegen" data-a="${a.id}">${icon('plus')}Taak</button><button class="knop klein licht" data-act="deelTaken" data-a="${a.id}">${icon('share-2')}Oproep delen</button></div>` : ''}</div>`;
          }).join('') || h.leeg('Geen wedstrijden gepland')}
          ${S.club.modules.taken ? `<details class="uitklap"><summary>${icon('hand-helping')}Wie helpt er mee?</summary>
            <div class="lijst compact">${rang.filter(([, n]) => n > 0).map(([p, n]) => h.rij({ ic: h.avatar(M.persoon(S, p).naam), titel: esc(M.persoon(S, p).naam), rechts: `<b>${n}×</b>` })).join('')}</div>
            ${nooit.length ? `<p class="klein"><b>Nog nooit geholpen (${nooit.length}):</b> ${nooit.map(([p]) => esc(M.persoon(S, p).naam.split(' ')[0])).join(', ')}</p><p class="zacht klein">Tip: vraag deze ouders persoonlijk. Een directe vraag werkt beter dan een groepsoproep.</p>` : ''}</details>` : ''}`;
      },
      berichten: (S) => CC.berichtenScherm(S, { nieuw: true }),
      team(S) {
        const tid = CC.teamId(); const open = openAanm(S, tid);
        const sp = M.spelers(S, tid);
        const eenOuder = sp.filter((pl) => pl.ouders.length < 2);
        return `${open.length ? `${h.sectie(`Aanmeldingen goedkeuren (${open.length})`)}<div class="lijst">${open.map((x) => CC.aanmRij(S, x)).join('')}</div>` : ''}
          ${h.sectie('Ouders uitnodigen')}${CC.uitnodigBlok(tid)}
          ${h.sectie(`Spelers (${sp.length})`, `<button class="linkknop" data-act="open" data-view="overzichtTeam" data-team="${tid}">Aanwezigheid</button>`)}
          <div class="lijst">${sp.map((pl) => { const o = pl.ouders.map((x) => M.persoon(S, x)); return h.rij({ ic: h.avatar(pl.voornaam), titel: esc(M.naam(S, pl)), sub: o.map((p) => esc(p.naam)).join(' · '), rechts: `<a class="icoonknop groen" href="https://wa.me/31${o[0].tel.slice(1)}" target="_blank" rel="noopener" aria-label="WhatsApp ouder van ${esc(pl.voornaam)}" data-stop="1">${icon('message-circle')}</a>`, act: 'open', attrs: `data-view="speler" data-id="${pl.id}"` }); }).join('')}</div>
          <details class="uitklap"><summary>${icon('user-plus')}Nog niet aangemeld</summary><p class="klein">${eenOuder.length} spelers hebben één ouder gekoppeld. De tweede ouder kan zich via de uitnodiging aanmelden of door de eerste ouder worden uitgenodigd.</p><p class="zacht klein">Van team wisselen is een clubbeslissing en loopt via de ${esc(S.club.labels.hjo)}.</p></details>`;
      },
    },
  };
  CC.views.overzichtTeam = (S, p) => ({ titel: 'Aanwezigheid per speler', html: CC.overzichtHtml(S, p.team) });
  CC.views.speeltijd = (S, p) => ({ titel: 'Speeltijd', html: CC.speeltijdHtml(S, p.team) });

  CC.on('kiesTlWed', (el) => { CC.ui.seg.tlWed = el.value; CC.render(); });
  CC.on('wedstrijdInfo', (f) => { const S = CC.S(); const a = M.act(S, f.dataset.id); a.verzamel = f.verzamel.value; a.tenue = f.tenue.value; a.adres = f.adres.value; if (f.uitslag) a.uitslag = f.uitslag.value; CC.save(); CC.render(); CC.toast('Opgeslagen; ouders zien het direct'); });
  CC.on('zetBegeleider', (el) => { const S = CC.S(); M.act(S, el.dataset.id).begeleiderId = el.value || null; CC.save(); CC.render(); CC.toast(el.value ? 'Begeleider ingesteld' : 'Begeleider verwijderd'); });
  CC.on('deelWedstrijd', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.id); CC.deel(`${a.teamId} ${D.lang(a.datum)}: ${a.thuis ? 'thuis' : 'uit'} tegen ${a.tegen}. Verzamelen ${a.verzamel}, aftrap ${a.tijd}. ${a.thuis ? '' : `Adres: ${a.adres}. `}Tenue: ${a.tenue}. Kan je kind niet? Meld af in ClubComm: ${location.origin}${location.pathname}`, 'Wedstrijdinfo'); });
  CC.on('deelTaken', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.a); const open = S.taken.filter((x) => x.actId === a.id && !x.personId).map((x) => x.soort); CC.deel(open.length ? `Voor ${D.lang(a.datum)} (${a.tegen}) zoeken we nog: ${open.join(', ')}. Kun jij? Tik op "Ik doe het" in ClubComm: ${location.origin}${location.pathname}` : 'Alle taken zijn bezet, dank jullie wel!', 'Taken'); });
  CC.on('indelen', (el) => {
    const S = CC.S(); const v = S.vervoer[el.dataset.a]; const pl = M.speler(S, el.dataset.s);
    const vrij = v ? v.aanbod.filter((x) => x.plekken > Object.values(v.plek).filter((p) => p === x.personId).length) : [];
    if (!vrij.length) return CC.toast('Geen vrije plekken. De oproep voor vervoer gaat automatisch uit.', 'fout');
    CC.sheet(`${pl.voornaam} indelen`, `<div class="lijst">${vrij.map((x) => h.rij({ ic: h.avatar(M.persoon(S, x.personId).naam), titel: esc(M.persoon(S, x.personId).naam), act: 'indelenOk', attrs: `data-a="${el.dataset.a}" data-s="${pl.id}" data-p="${x.personId}"` })).join('')}</div>`);
  });
  CC.on('indelenOk', (el) => { const S = CC.S(); S.vervoer[el.dataset.a].plek[el.dataset.s] = el.dataset.p; CC.save(); CC.closeSheet(); CC.render(); CC.toast('Ingedeeld; ouders krijgen een melding'); });
  CC.on('taakToevoegen', (el) => CC.sheet('Taak toevoegen', `<div class="lijst">${CC.TAAKSOORTEN.map((s) => h.rij({ ic: 'plus', titel: s, act: 'taakToevoegenOk', attrs: `data-a="${el.dataset.a}" data-s="${s}"` })).join('')}</div>`));
  CC.on('taakToevoegenOk', (el) => { const S = CC.S(); S.taken.push({ id: 't' + Date.now(), actId: el.dataset.a, soort: el.dataset.s, personId: null }); CC.save(); CC.closeSheet(); CC.render(); });
  CC.on('wedstrijdToevoegen', () => CC.sheet('Wedstrijd toevoegen', `<form data-submit="wedstrijdToevoegenOk" class="codeform"><label for="nw-t">Tegenstander</label><input id="nw-t" name="tegen" required placeholder="Bijv. FC Amstelland O10-2"><div class="twee"><div><label for="nw-d">Datum</label><input id="nw-d" name="datum" type="date" required value="${D.addDays(D.vandaag(), 10)}"></div><div><label for="nw-a">Aftrap</label><input id="nw-a" name="tijd" type="time" required value="09:00"></div></div><label class="vink"><input type="checkbox" name="thuis" checked> Thuiswedstrijd</label><button class="knop">Toevoegen</button><p class="zacht klein">In de pilot voer je wedstrijden zelf in. Later komen ze automatisch uit Sportlink of voetbal.nl.</p></form>`));
  CC.on('wedstrijdToevoegenOk', (f) => {
    const S = CC.S(); const tid = CC.teamId(); const thuis = f.thuis.checked; const [hh, mm] = f.tijd.value.split(':').map(Number); const vz = hh * 60 + mm - (thuis ? 30 : 60);
    S.acts.push({ id: 'a' + Date.now(), teamId: tid, soort: 'wedstrijd', datum: f.datum.value, tijd: f.tijd.value, eind: `${String(hh + 1).padStart(2, '0')}:${String(mm).padStart(2, '0')}`, thuis, tegen: f.tegen.value, veld: thuis ? 'Veld 1' : '', adres: thuis ? 'Sportpark Buitenveldert, De Boelelaan 50, Amsterdam' : '', verzamel: `${String(Math.floor(vz / 60)).padStart(2, '0')}:${String(vz % 60).padStart(2, '0')}`, tenue: thuis ? 'Thuistenue (wit/blauw)' : 'Uittenue (blauw)', begeleiderId: M.team(S, tid).teamleiderId, uitslag: null, afgelast: false });
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
    if (!ouder) { ouder = { id: 'p' + Date.now(), naam: x.ouderNaam, email: x.email, tel: '0612345678', rollen: [{ rol: 'ouder' }] }; S.people.push(ouder); }
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
