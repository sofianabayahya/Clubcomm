// ClubComm prototype — Ouder (Besluit 4): Home · Planning · Vervoer · Berichten · Taken
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;

  // Open taken voor Home: alleen de komende dagen (instelbaar), en niet als je al hebt gezegd dat je niet kunt
  const homeDagen = (S) => S.club.inst.homeDagen || 7;
  const openTaken = (S, teamId) => { const me = CC.me(); return S.taken.filter((t) => { const a = M.act(S, t.actId); return a && a.teamId === teamId && a.datum >= D.vandaag() && a.datum <= D.addDays(D.vandaag(), homeDagen(S)) && !t.personId && !(t.kanNiet || []).includes(me.id); }); };
  // Vervoer (Besluit 31): ouders brengen hun eigen kind. Op Home alleen als een ander kind een plek zoekt en jouw kind ook gaat.
  const zoektPlek = (S, pl) => {
    if (!S.club.modules.vervoer) return null;
    const me = CC.me();
    const a = M.komend(S, pl.teamId, 6).find((x) => x.soort === 'wedstrijd' && !x.thuis && !x.afgelast);
    if (!a || a.datum > D.addDays(D.vandaag(), homeDagen(S)) || M.status(S, pl, a).code !== 'verwacht') return null;
    const wie = M.plekZoekers(S, a).filter((x) => !x.ouders.includes(me.id));
    return wie.length ? { a, wie } : null;
  };

  CC.rollen.ouder = {
    context(S) { const k = CC.kind(); const kids = CC.kinderen(); return k ? { titel: `${k.voornaam} · ${CC.tn(k.teamId)}`, sub: S.club.naam, act: kids.length > 1 ? 'kiesKind' : null } : { titel: 'ClubComm', sub: S.club.naam }; },
    tabs(S) {
      const me = CC.me(); const k = CC.kind();
      return [['home', 'Home', 'house'], ['planning', 'Planning', 'calendar-days'], S.club.modules.vervoer && ['vervoer', 'Vervoer', 'car', k && zoektPlek(S, k) ? zoektPlek(S, k).wie.length : 0],
        ['berichten', 'Berichten', 'message-circle', M.ongelezen(S, me.id)], S.club.modules.taken && ['taken', 'Taken', 'list-checks', k ? openTaken(S, k.teamId).length : 0]];
    },
    schermen: {
      home(S) {
        const pl = CC.kind(); if (!pl) return h.leeg('Er is nog geen kind aan je account gekoppeld. Wacht op goedkeuring van de teamleider.', 'hourglass');
        const me = CC.me();
        const komend = M.komend(S, pl.teamId, 3);
        const st = M.stats(S, pl, M.periode(S, 'blok'));
        const k = M.kaarten(S, pl);
        const z = M.zone(S, st.pct, pl.teamId);
        const lang = S.lang.find((l) => l.spelerId === pl.id && l.tot >= D.vandaag());
        const acties = [];
        // Urgent (ongelezen) ook op Home; vastgezette uitleg staat bij Berichten (Besluit 19, aangepast in Besluit 30)
        S.msgs.filter((m) => M.zichtbaar(S, m, me.id) && m.ontvangers.includes(me.id) && m.soort !== 'persoonlijk' && !m.gelezen.includes(me.id) && m.urgent).forEach((m) => acties.push(h.rij({ ic: m.urgent ? 'triangle-alert' : 'pin', titel: esc(m.onderwerp), sub: `${m.urgent ? 'Urgent · ' : ''}${esc(CC.isClub(m) ? 'Club' : m.bereik || '')}`, act: 'open', attrs: `data-view="bericht" data-id="${m.id}"`, kleur: m.urgent ? 'rood' : 'blauw' })));
        const pers = S.msgs.filter((m) => m.soort === 'persoonlijk' && M.isOngelezen(S, m, me.id));
        pers.forEach((m) => acties.push(h.rij({ ic: 'message-circle', titel: m.van === 'systeem' ? 'Bericht van ClubComm' : `Bericht van ${esc((M.persoon(S, m.van) || { naam: 'onbekend' }).naam.split(' ')[0])}`, sub: esc(m.onderwerp), act: 'open', attrs: `data-view="bericht" data-id="${m.id}"`, kleur: 'blauw' })));
        S.acts.filter((a) => a.vervangerId === me.id && a.datum >= D.vandaag() && !a.afgelast).slice(0, 1).forEach((a) => acties.push(h.rij({ ic: 'user-cog', titel: `Jij geeft de training ${D.relatief(a.datum).toLowerCase()} ${a.tijd}`, sub: `${esc(CC.tn(a.teamId))} · ${esc(a.veld || '')} · aanwezigheid opnemen`, act: 'open', attrs: `data-view="begeleiden" data-id="${a.id}"`, kleur: 'blauw' })));
        // Taak op de wedstrijddag (Besluit 33): trainer-coach → aanwezigheid, timekeeper → wisselschema
        S.taken.filter((t) => t.personId === me.id && ['Trainer-coach', 'Timekeeper'].includes(t.soort)).map((t) => ({ t, a: M.act(S, t.actId) })).filter(({ a }) => a && a.teamId === pl.teamId && !a.afgelast && a.datum >= D.vandaag() && a.datum <= D.addDays(D.vandaag(), homeDagen(S))).slice(0, 1).forEach(({ t, a }) => acties.push(h.rij({ ic: t.soort === 'Timekeeper' ? 'timer' : 'clipboard-check', titel: `Jij bent ${t.soort.toLowerCase()} ${D.relatief(a.datum).toLowerCase()}`, sub: t.soort === 'Timekeeper' ? 'Op de dag zelf: het wisselschema' : 'Op de dag zelf: de aanwezigheid invullen', act: 'open', attrs: `data-view="begeleiden" data-id="${a.id}"`, kleur: 'blauw' })));
        M.komend(S, pl.teamId, 30).filter((a) => a.opgave && !a.afgelast && (a.opgaveTot || a.datum) >= D.vandaag() && M.status(S, pl, a).code === 'open').slice(0, 2).forEach((a) => acties.push(h.rij({ ic: 'circle-help', titel: `Geef ${esc(pl.voornaam)} op: ${esc(a.naam || 'activiteit')}`, sub: `${D.kort(a.datum)} · opgeven tot ${D.kort(a.opgaveTot || a.datum)}`, act: 'open', attrs: `data-view="activiteit" data-id="${a.id}"`, kleur: 'oranje' })));
        const zp = zoektPlek(S, pl); if (zp) acties.push(h.rij({ ic: 'car', titel: zp.wie.length === 1 ? `${esc(zp.wie[0].voornaam)} zoekt vervoer` : `${zp.wie.length} kinderen zoeken vervoer`, sub: `${D.relatief(zp.a.datum)} uit bij ${esc(zp.a.tegen)}. Kan er iemand met jou mee?`, act: 'tab', attrs: 'data-tab="vervoer"' }));
        const ot = S.club.modules.taken ? openTaken(S, pl.teamId) : [];
        if (ot.length) { const a = M.act(S, ot[0].actId); acties.push(h.rij({ ic: 'hand-helping', titel: `${ot.length} ${ot.length === 1 ? 'taak' : 'taken'} nog open`, sub: `${esc(ot[0].soort)} · ${D.relatief(a.datum)}. Help je mee?`, act: 'tab', attrs: 'data-tab="taken"' })); }
        if (CC.ouderGesprekRijen) acties.push(...CC.ouderGesprekRijen(S, pl));
        const statusregel = st.pct == null ? 'Nog geen activiteiten deze fase' : `Aanwezig ${st.pct}%${st.telaat ? ` · ${st.telaat}× te laat` : ''}`;
        const compliment = z === 'groen' && !k.geel && !k.rood && !st.telaat ? `<span class="compliment">${icon('star')}Betrouwbare speler!</span>` : '';
        return `
          ${lang ? `<div class="info">${icon('hospital')}<span><b>${esc(pl.voornaam)} is langdurig afwezig</b> tot ongeveer ${D.kort(lang.tot)}. Je hoeft niet per training af te melden.</span></div>` : ''}
          ${h.actieBlok(acties, 'nieuwe berichten, een taak of vervoer waar je voor bent ingedeeld')}
          ${h.sectie(`Programma${weekLabel(komend)}`)}
          <div class="acts">${komend.map((a) => CC.actKaart(S, a, pl)).join('') || h.leeg('Geen activiteiten gepland', 'calendar')}</div>
          <button class="status ${z}" data-act="open" data-view="kindOverzicht" data-id="${pl.id}"><span>${h.stip(z)}${statusregel} <small>deze fase</small></span><span>${h.kaartjes(k)}${compliment}${icon('circle-help', 'zacht')}</span></button>`;
      },
      planning(S) {
        const pl = CC.kind(); if (!pl) return '';
        const ver = h.segVal('verder', '0') === '1';
        const tot = D.addDays(D.vandaag(), ver ? 42 : 13);
        const acts = M.acts(S, pl.teamId, D.vandaag(), tot);
        const week = (a) => { const d = D.parse(a.datum); const ma = new Date(d); ma.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return D.iso(ma); };
        const dezeWeek = week({ datum: D.vandaag() });
        // Besluit 73: vakanties en vrije dagen zichtbaar in de planning, zodat ouders zien waarom er geen training is
        const vrij = [...(S.club.vakanties || []), ...(S.club.stops || [])].filter((v) => !v.trainen && v.tot >= D.vandaag() && v.van <= tot)
          .map((v) => ({ vak: v, datum: v.van > D.vandaag() ? v.van : D.vandaag(), tijd: '00:00' }));
        const groepen = {}; [...acts, ...vrij].sort((x, y) => (x.datum + x.tijd).localeCompare(y.datum + y.tijd)).forEach((a) => { (groepen[week(a)] = groepen[week(a)] || []).push(a); });
        const st = M.stats(S, pl, M.periode(S, 'seizoen'));
        const agenda = CC.agendaRij && !CC.me().agendaAbonnement ? `<div class="lijst">${CC.agendaRij()}</div>` : '';
        // Verder vooruit kijken hoort bij de weken: als laatste regel in het laatste weekblok
        const verder = !ver ? h.rij({ ic: 'calendar-days', titel: 'Verder vooruit kijken', sub: 'Toon de komende 6 weken', act: 'seg', attrs: 'data-key="verder" data-val="1"', chevron: false }) : '';
        const weken = Object.entries(groepen);
        const blokken = weken.map(([w, as], i) => `${h.sectie(w === dezeWeek ? `Deze week${wk(w)}` : w === D.addDays(dezeWeek, 7) ? `Volgende week${wk(w)}` : `Week ${D.weeknr(w)}<span class="wk"> · ${periode(w)}</span>`)}<div class="lijst">${as.map((a) => (a.vak ? h.rij({ ic: 'plane', titel: esc(a.vak.naam), sub: `${a.vak.van === a.vak.tot ? D.lang(a.vak.van) : `${D.kort(a.vak.van)} t/m ${D.kort(a.vak.tot)}`} · geen training` }) : h.rij({ ic: h.datumBlok(a), titel: h.actTitel(S, a), sub: h.actSub(S, a), rechts: M.status(S, pl, a).code === 'verwacht' ? '' : h.chip(M.status(S, pl, a)), act: 'open', attrs: `data-view="activiteit" data-id="${a.id}"` }))).join('')}${i === weken.length - 1 ? verder : ''}</div>`).join('') || `${h.leeg('Geen activiteiten gepland', 'calendar')}${verder ? `<div class="lijst">${verder}</div>` : ''}`;
        const gesprek = CC.ouderGesprekRijen ? h.rij({ ic: 'star', titel: 'Ontwikkelgesprek: wapen en doelen', sub: `Twee keer per seizoen, met ${esc(pl.voornaam)} erbij`, act: 'open', attrs: `data-view="${(S.ontwGesprek || []).some((g) => g.teamId === pl.teamId) ? 'gesprekKiezen' : 'beoordelingKind'}" data-id="${pl.id}"` }) : '';
        return `${agenda}${blokken}
          ${h.sectie(`Over ${esc(pl.voornaam)}`)}<div class="lijst">${h.rij({ ic: 'chart-column', titel: 'Aanwezigheid en kaarten', sub: `Deze fase ${M.stats(S, pl, M.periode(S, 'blok')).pct ?? '–'}% · seizoen ${st.pct ?? '–'}% · afmeldgeschiedenis`, act: 'open', attrs: `data-view="kindOverzicht" data-id="${pl.id}"` })}${gesprek}</div>
          ${h.sectie('Langer afwezig')}<div class="lijst">${h.rij({ ic: 'plane', titel: 'Afwezig voor een periode', sub: 'Bijvoorbeeld vakantie', act: 'periodeSheet', attrs: `data-id="${pl.id}"` })}${h.rij({ ic: 'hospital', titel: 'Langer geblesseerd of ziek', sub: 'Meld het één keer, niet per training', act: 'langdurigSheet', attrs: `data-id="${pl.id}"` })}</div>`;
      },
      vervoer(S) {
        const pl = CC.kind(); const me = CC.me();
        const uit = M.komend(S, pl.teamId, 12).filter((a) => a.soort === 'wedstrijd' && !a.thuis && !a.afgelast).slice(0, 3);
        if (!uit.length) return h.leeg('Geen uitwedstrijden de komende tijd. Bij thuiswedstrijden is geen vervoer nodig.', 'car');
        return `<p class="zacht klein">Je brengt ${esc(pl.voornaam)} zelf naar uitwedstrijden. Lukt het een keer niet? Laat het hier weten; de andere ouders van het team zien je vraag.</p>
          ${uit.map((a) => {
          const v = S.vervoer[a.id] || (S.vervoer[a.id] = { aanbod: [], plek: {}, vraag: {} }); const vraag = v.vraag || {};
          const komt = M.status(S, pl, a).code === 'verwacht';
          const bij = v.plek[pl.id] && v.plek[pl.id] !== me.id && M.persoon(S, v.plek[pl.id]);
          const zoekers = M.plekZoekers(S, a).filter((x) => !x.ouders.includes(me.id));
          const mijnMee = M.meerijders(S, v, me.id).filter((x) => !x.ouders.includes(me.id));
          const eigen = !komt ? `<p class="zacht klein">${esc(pl.voornaam)} is afgemeld voor deze wedstrijd.</p>`
            : bij ? `<div class="info groen">${icon('circle-check')}<span>${esc(pl.voornaam)} kan meerijden met <b>${esc(bij.naam)}</b>. Spreek samen af waar en hoe.</span></div><button class="knop licht klein" data-act="afmeldenRit" data-a="${a.id}">Toch niet nodig</button>`
            : vraag[pl.id] ? `<div class="info oranje">${icon('car')}<span>Je zoekt vervoer voor ${esc(pl.voornaam)}. De andere ouders zien je vraag.</span></div><button class="knop licht klein" data-act="plekZoekenStop" data-a="${a.id}">Toch niet nodig</button>`
            : `<button class="knop licht vol" data-act="plekZoeken" data-a="${a.id}">${icon('car')}Ik zoek vervoer voor ${esc(pl.voornaam)}</button>`;
          const lijst = [
            ...mijnMee.map((x) => h.rij({ ic: h.avatar(x.voornaam), titel: `${esc(x.voornaam)} rijdt met jou mee`, sub: `Spreek met ${esc(((M.persoon(S, (vraag[x.id] || {}).door) || { naam: 'de ouder' }).naam).split(' ')[0])} af waar en hoe`, rechts: `<button class="linkknop klein" data-act="neemMeeStop" data-a="${a.id}" data-s="${x.id}">Toch niet</button>` })),
            ...zoekers.map((x) => h.rij({ ic: h.avatar(x.voornaam), titel: `${esc(x.voornaam)} zoekt vervoer`, sub: esc((M.persoon(S, (vraag[x.id] || {}).door) || { naam: '' }).naam), rechts: `<button class="knop klein" data-act="ikNeemMee" data-a="${a.id}" data-s="${x.id}">Kan met mij mee</button>` })),
          ];
          return `<article class="kaartje">
            <div class="kaart-kop">${h.datumBlok(a)}<div><b>${h.actTitel(S, a)}</b><small>Verzamelen ${a.verzamel} · ${esc(a.adres)}</small></div></div>
            ${eigen}
            ${lijst.length ? `<div class="lijst compact">${lijst.join('')}</div>` : ''}
          </article>`;
        }).join('')}`;
      },
      berichten: (S) => CC.berichtenScherm(S, { ouder: true }),
      taken(S) {
        const pl = CC.kind(); const me = CC.me();
        const acts = M.acts(S, pl.teamId, D.vandaag(), D.addDays(D.vandaag(), 28)).filter((a) => S.taken.some((t) => t.actId === a.id));
        const mijn = S.taken.filter((t) => t.personId === me.id).length;
        return `${CC.mijnHulp ? CC.mijnHulp(S, pl) : `<div class="info">${icon('info')}<span>Je hebt dit seizoen <b>${mijn}×</b> geholpen. Dank je wel!</span></div>`}
          ${acts.map((a) => `${h.sectie(`${D.relatief(a.datum)} · ${!M.isWed(a) ? 'training' : a.thuis ? 'thuis' : 'uit'}`)}<div class="lijst">${S.taken.filter((t) => t.actId === a.id).map((t) => {
            const p = t.personId && M.persoon(S, t.personId);
            return h.rij({ ic: t.soort === CC.VERVANGER ? 'user-cog' : t.soort === 'Trainer-coach' ? 'clipboard-check' : t.soort === 'Timekeeper' ? 'timer' : t.soort === 'Spelbegeleider' || t.soort === 'Vlagger' ? 'flag' : t.soort === 'Scheidsrechter' ? 'megaphone' : t.soort === 'Fotograaf' ? 'eye' : t.soort === 'Wastas' ? 'shirt' : 'hand-helping', titel: esc(t.soort), sub: p ? (p.id === me.id ? 'Jij doet dit. Top!' : esc(p.naam)) : (t.kanNiet || []).includes(me.id) ? 'Nog niemand · jij kunt deze keer niet' : 'Nog niemand', kleur: '',
              rechts: !p ? ((t.kanNiet || []).includes(me.id) ? `<button class="linkknop klein" data-act="taakKanToch" data-id="${t.id}">Toch wel?</button>` : `<span class="knoppen-rij"><button class="knop klein" data-act="ikDoeHet" data-id="${t.id}">Ik doe het</button><button class="knop klein licht" data-act="taakKanNiet" data-id="${t.id}">Kan niet</button></span>`) : p.id === me.id ? `<button class="knop klein licht" data-act="taakAf" data-id="${t.id}">Afmelden</button>` : icon('circle-check', 'groen') });
          }).join('')}</div>`).join('') || h.leeg('Geen taken de komende weken', 'list-checks')}
          ${acts.length ? `<p class="zacht klein">Staat een taak ${S.club.inst.oproepDagen} dagen van tevoren nog open, dan krijgt iedereen automatisch een oproep.</p>` : ''}`;
      },
    },
  };

  // Opgave bij een activiteit: ja (de ouder geeft het kind op); nee gaat via afmelden
  CC.on('opgaveJa', (el) => { const S = CC.S(); (S.opgave || (S.opgave = [])).push({ id: 'o' + Date.now(), actId: el.dataset.act2, spelerId: el.dataset.speler, komt: true, tijd: new Date().toISOString(), door: CC.me().id }); CC.save(); CC.render(); CC.toast('Opgegeven. Tot dan!'); });
  CC.on('taakKanNiet', (el) => { const S = CC.S(); const t = S.taken.find((x) => x.id === el.dataset.id); (t.kanNiet || (t.kanNiet = [])).push(CC.me().id); CC.save(); CC.render(); CC.toast('Genoteerd. De taak blijft open voor andere ouders.'); });
  CC.on('taakKanToch', (el) => { const S = CC.S(); const t = S.taken.find((x) => x.id === el.dataset.id); t.kanNiet = (t.kanNiet || []).filter((x) => x !== CC.me().id); CC.save(); CC.render(); });

  // Overzicht voor de ouder: aanwezigheid en kaarten per fase of seizoen (dezelfde cijfers als de HJO ziet)
  CC.views.kindOverzicht = (S, p) => {
    const pl = M.speler(S, p.id); const soort = h.segVal('kindPer', 'blok'); const per = M.periode(S, soort);
    const st = M.stats(S, pl, per); const z = M.zone(S, st.pct, pl.teamId);
    const k = M.kaarten(S, pl); const stap = M.stap(S, pl, k);
    const hist = S.afm.filter((f) => f.spelerId === pl.id).map((f) => ({ f, a: M.act(S, f.actId) })).filter((x) => x.a && x.a.datum < D.vandaag() && x.a.datum >= per.van).sort((x, y) => y.a.datum.localeCompare(x.a.datum));
    return { titel: 'Aanwezigheid en kaarten', html: `${h.seg('kindPer', [['blok', `Deze fase (${M.blok(S, D.vandaag()).naam.toLowerCase()})`], ['seizoen', 'Heel seizoen']], 'blok')}
      <div class="cijfers"><div class="cijfer ${z}"><b>${st.pct == null ? '–' : st.pct + '%'}</b><small>aanwezig</small></div><div class="cijfer"><b>${st.pctTr == null ? '–' : st.pctTr + '%'}</b><small>trainingen (${st.tr.aan}/${st.tr.tot})</small></div><div class="cijfer"><b>${st.pctWed == null ? '–' : st.pctWed + '%'}</b><small>wedstrijden (${st.wed.aan}/${st.wed.tot})</small></div></div>
      <p class="zacht klein">${st.aanwezig} van de ${st.totaal} keer aanwezig (te laat telt als aanwezig). Alleen activiteiten die al geweest zijn en waarbij de aanwezigheid is opgenomen; afgelaste trainingen tellen niet mee.</p>
      ${h.sectie('Afmelden: kaarten dit seizoen')}${k.ev.length ? `<div class="lijst compact">${k.ev.slice().reverse().map((e) => h.rij({ ic: CC.kaartIc(e), titel: CC.kaartTitel(e), sub: `${D.kort(e.act.datum)} · ${e.wat.toLowerCase()}${e.geaccepteerd ? ' · geaccepteerd door de trainer' : ''}` })).join('')}</div>` : '<p class="zacht klein">Geen herinneringen of kaarten. Top!</p>'}
      <p class="zacht klein">${k.herinneringen < k.max ? `Nog ${k.max - k.herinneringen === 1 ? 'één vriendelijke herinnering' : `${k.max - k.herinneringen} vriendelijke herinneringen`} dit seizoen; daarna volgt een kaart.` : 'De vriendelijke herinneringen van dit seizoen zijn gebruikt; hierna volgt bij te laat afmelden een gele kaart, bij niet afmelden een rode.'}${stap ? ` <b>Volgende stap: ${stap.soort === 'bellen' ? `de ${CC.wie('bellen', pl.teamId)} neemt contact met je op` : stap.soort === 'gesprekHjo' ? `een persoonlijk gesprek met de ${CC.wie('gesprek', pl.teamId)}` : 'de club bespreekt het vervolg'}.</b>` : ''} ${st.telaat ? `Te laat gekomen: ${st.telaat}× (geen kaart).` : ''}</p>
      <div class="knoppen"><button class="linkknop" data-act="uitlegKaarten">Wat betekenen de kaarten?</button><button class="linkknop" data-act="open" data-view="beoordelingKind" data-id="${pl.id}">Wapen en doelen</button></div>
      ${h.sectie('Afmeldgeschiedenis')}<div class="lijst compact">${hist.map(({ f, a }) => h.rij({ ic: h.reden(f.reden), titel: `${D.kort(a.datum)} · ${h.actTitel(S, a)}`, sub: `Reden: ${esc(f.reden)}${f.opm ? ' · ' + esc(f.opm) : ''}`, rechts: M.teLaatAfgemeld(S, f, a) ? '<span class="chip geel mini">te laat afgemeld</span>' : '<span class="chip groen mini">op tijd afgemeld</span>' })).join('') || '<p class="zacht klein">Geen afmeldingen in deze periode.</p>'}</div>` };
  };

  // Activiteitkaart met afmeldknop (Home)
  // Weeknummer in een kop, klein achter de titel (week 39, of week 39–40 als het over twee weken gaat)
  const wk = (s) => `<span class="wk"> · week ${D.weeknr(s)}</span>`;
  const weekLabel = (acts) => { const n = [...new Set(acts.map((a) => D.weeknr(a.datum)))]; return n.length ? `<span class="wk"> · week ${n[0]}${n.length > 1 ? `–${n[n.length - 1]}` : ''}</span>` : ''; };
  const periode = (ma) => { const zo = D.addDays(ma, 6); const [a, b] = [D.parse(ma), D.parse(zo)]; return a.getMonth() === b.getMonth() ? `${a.getDate()}–${b.getDate()} ${D.MAAND[b.getMonth()]}` : `${a.getDate()} ${D.MAAND[a.getMonth()]} – ${b.getDate()} ${D.MAAND[b.getMonth()]}`; };

  CC.actKaart = (S, a, pl) => {
    const st = M.status(S, pl, a);
    const voorDeadline = new Date() < M.deadline(S, a);
    const begonnen = new Date() > D.start(a);
    let knop = '';
    if (!begonnen && st.code === 'verwacht') knop = `<button class="knop klein licht rood-tekst" data-act="afmelden" data-act2="${a.id}" data-speler="${pl.id}">${a.opgave ? 'Toch niet' : 'Afmelden'}</button>`;
    if (!begonnen && st.code === 'open') knop = `<span class="knoppen-rij"><button class="knop klein" data-act="opgaveJa" data-act2="${a.id}" data-speler="${pl.id}">Ja, komt</button><button class="knop klein licht" data-act="afmelden" data-act2="${a.id}" data-speler="${pl.id}">Nee</button></span>`;
    if (!begonnen && st.code === 'afgemeld' && voorDeadline) knop = `<button class="knop klein licht" data-act="intrekken" data-act2="${a.id}" data-speler="${pl.id}">${icon('undo-2')}Intrekken</button>`;
    const extra = '';
    const status = a.opgave && st.code === 'open' ? `<small class="oranje-tekst">Opgeven tot ${D.kort(a.opgaveTot || a.datum)}</small>` : a.opgave && st.code === 'verwacht' ? h.chip(st) : st.code === 'verwacht' ? (begonnen ? '' : `<small class="zacht">Afmelden tot ${M.deadlineTekst(S, a)}</small>`) : h.chip(st);
    return `<article class="act ${a.afgelast ? 'afgelast' : ''}">
      <button class="act-body" data-act="open" data-view="activiteit" data-id="${a.id}">${h.datumBlok(a)}<span class="act-tekst"><small>${D.relatief(a.datum)}</small><b>${h.actTitel(S, a)}</b><small>${h.actSub(S, a)}</small>${extra}</span></button>
      <div class="act-voet">${status}${knop}</div></article>`;
  };

  // Activiteit-detail (alle rollen)
  CC.views.activiteit = (S, p) => {
    const a = M.act(S, p.id); const rol = CC.rol().rol; const t = M.team(S, a.teamId);
    const kaart = a.adres ? `<p class="klein adresregel">${icon('map-pin')}<span>${esc(a.adres)}</span></p><div class="knoppen">${h.route(a.adres)}</div>` : '';
    let meer = '';
    if (rol === 'ouder') { const pl = CC.kind(); meer = `<div class="acts">${CC.actKaart(S, a, pl)}</div>`; }
    else {
      const sp = M.spelers(S, a.teamId).map((pl) => ({ pl, st: M.status(S, pl, a) }));
      const af = sp.filter((x) => !['verwacht', 'aanwezig', 'telaat'].includes(x.st.code));
      const nOpen = sp.filter((x) => x.st.code === 'open').length;
      meer = `${h.sectie(a.opgave ? `Opgave: ${sp.length - af.length} komen · ${af.length - nOpen} niet · ${nOpen} nog geen antwoord` : `Verwacht: ${sp.length - af.length} van ${sp.length}`)}<div class="lijst compact">${af.map((x) => h.rij({ ic: h.avatar(x.pl.voornaam), titel: esc(M.naam(S, x.pl)), rechts: h.chip(x.st), sub: x.st.afm && x.st.afm.opm && CC.zicht('toelichting') ? esc(x.st.afm.opm) : '' })).join('') || '<p class="zacht klein">Iedereen komt.</p>'}</div>
        ${rol === 'trainer' && CC.kanNietBlok ? CC.kanNietBlok(S, a) : ''}
        ${['trainer', 'teamleider'].includes(rol) && CC.mag('planning') && a.soort === 'training' && !a.afgelast ? `<button class="knop licht vol" data-act="wijzigDeze" data-id="${a.id}">${icon('pencil')}Deze training aanpassen</button>` : ''}`;
    }
    return {
      titel: a.soort === 'training' ? 'Training' : a.soort === 'activiteit' ? 'Activiteit' : a.soort === 'oefen' ? 'Oefenwedstrijd' : 'Wedstrijd',
      html: `<article class="kaartje"><div class="kaart-kop">${h.datumBlok(a)}<div><b>${h.actTitel(S, a)}</b><small>${D.lang(a.datum)} · ${esc(t.naam)}</small></div></div>
        ${a.soort === 'activiteit' && a.toelichting ? `<p>${esc(a.toelichting)}</p>` : ''}<dl class="gegevens">${a.soort === 'activiteit' ? `${a.verzamel ? `<dt>Verzamelen</dt><dd>${a.verzamel}</dd>` : ''}<dt>Tijd</dt><dd>${a.tijd}–${a.eind}</dd>${a.plaats ? `<dt>Waar</dt><dd>${esc(a.plaats)}</dd>` : ''}` : a.soort === 'training' ? `<dt>Tijd</dt><dd>${a.tijd}–${a.eind}</dd><dt>Veld</dt><dd>${esc(a.veld)}</dd>` : `<dt>Verzamelen</dt><dd>${a.verzamel}</dd><dt>Aftrap</dt><dd>${a.tijd}</dd>${a.veld ? `<dt>Veld</dt><dd>${esc(a.veld)}</dd>` : ''}${a.uitslag && M.uitslagInst(S, a.teamId).naarOuders ? `<dt>Uitslag</dt><dd>${esc(a.uitslag)}</dd>` : ''}`}<dt>Afmelden</dt><dd>tot ${M.deadlineTekst(S, a)}</dd></dl>
        ${a.afgelast ? `<div class="info rood">${icon('ban')}<span>Deze activiteit is afgelast.</span></div>` : ''}${kaart}</article>${meer}`,
    };
  };
  CC.on('wijzigDeze', (el) => CC.wijzigingSheet(el.dataset.id));

  CC.on('kiesKind', () => {
    const kids = CC.kinderen(); const cur = CC.kind();
    CC.sheet('Kies je kind', `<div class="lijst">${kids.map((k) => h.rij({ ic: h.avatar(k.voornaam), titel: esc(M.naam(CC.S(), k)), sub: esc(CC.tn(k.teamId)), act: 'zetKind', attrs: `data-id="${k.id}"`, rechts: k.id === cur.id ? icon('check') : '' })).join('')}</div>`);
  });
  CC.on('zetKind', (el) => { CC.sessie().kindId = el.dataset.id; try { localStorage.setItem('clubcomm-sessie-v1', JSON.stringify(CC.sessie())); } catch (e) { /* */ } CC.closeSheet(); CC.render(); });

  // Vervoer
  CC.on('afmeldenRit', (el) => { const S = CC.S(); const v = S.vervoer[el.dataset.a]; const id = CC.kind().id; delete v.plek[id]; if (v.ouderMee) delete v.ouderMee[id]; if (v.vraag) delete v.vraag[id]; CC.save(); CC.render(); CC.toast('Genoteerd'); });
  CC.on('plekZoeken', (el) => { const S = CC.S(); const v = S.vervoer[el.dataset.a]; (v.vraag || (v.vraag = {}))[CC.kind().id] = { door: CC.me().id, tijd: new Date().toISOString() }; CC.save(); CC.render(); CC.toast('Je vraag staat uit. De andere ouders zien hem.'); });
  CC.on('plekZoekenStop', (el) => { const S = CC.S(); const v = S.vervoer[el.dataset.a]; if (v.vraag) delete v.vraag[CC.kind().id]; CC.save(); CC.render(); });
  CC.on('ikNeemMee', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.a); const pl = M.speler(S, el.dataset.s); M.neemMee(S, a, pl, CC.me().id); CC.save(); CC.render(); CC.toast(`Top! Spreek met de ouder van ${pl.voornaam} af waar en hoe.`); });
  CC.on('neemMeeStop', (el) => { const S = CC.S(); const v = S.vervoer[el.dataset.a]; delete v.plek[el.dataset.s]; CC.save(); CC.render(); CC.toast('Genoteerd; de vraag staat weer open'); });

  // Taken
  CC.on('ikDoeHet', (el) => {
    const S = CC.S(); const t = S.taken.find((x) => x.id === el.dataset.id); t.personId = CC.me().id;
    const a = M.act(S, t.actId); let extra = '';
    if (t.soort === CC.VERVANGER && !a.vervangerId) { CC.vervangerNeemOver(S, a, CC.me()); extra = ' Je geeft deze training; je ziet de aanwezigheid op Home.'; }
    if (t.soort === 'Trainer-coach') extra = ' Op de wedstrijddag vul je de aanwezigheid in; je ziet het op Home.';
    if (t.soort === 'Timekeeper') extra = ' Op de wedstrijddag doe je de wissels met het wisselschema; je ziet het op Home.';
    CC.save(); CC.render(); CC.toast(`Top! Jij bent ${t.soort.toLowerCase()}.${extra}`);
  });
  // Tijdelijke toegang voor de ouder-coach (Besluit 7): alleen deze wedstrijd, vervalt daarna vanzelf
  CC.views.begeleiden = (S, p) => {
    const a = M.act(S, p.id);
    const ik = CC.me().id;
    const coach = M.taakVan(S, a, 'Trainer-coach') === ik || a.vervangerId === ik; const tk = M.taakVan(S, a, 'Timekeeper') === ik;
    if ((!coach && !tk) || a.datum < D.vandaag()) return { titel: 'Begeleiden', html: h.leeg('Je toegang voor deze activiteit is verlopen.', 'lock') };
    const training = !M.isWed(a);
    return { titel: training ? 'Training geven' : tk && !coach ? 'Timekeeper' : 'Trainer-coach', html: `<div class="info">${icon('info')}<span>Je hebt tijdelijk toegang, alleen voor deze ${training ? 'training' : 'wedstrijd'}.</span></div>
      <div class="kaart-kop los">${h.datumBlok(a)}<div><b>${h.actTitel(S, a)}</b><small>${training ? `${a.tijd}–${a.eind} · ${esc(a.veld || '')}` : `Verzamelen ${a.verzamel} · aftrap ${a.tijd}`}</small></div></div>
      ${coach ? `${h.sectie('Aanwezigheid')}${CC.opnemenHtml(S, a)}` : ''}${!training && tk && S.club.modules.speeltijd ? `${h.sectie('Wisselschema')}${a.datum === D.vandaag() ? CC.speeltijdHtml(S, a.teamId, { alleenSchema: true, act: a.id }) : '<p class="zacht klein">Het wisselschema van de trainer zie je op de wedstrijddag hier.</p>'}` : ''}` };
  };
  CC.on('taakAf', (el) => { const S = CC.S(); const t = S.taken.find((x) => x.id === el.dataset.id); const a = M.act(S, t.actId); if (t.soort === CC.VERVANGER && a.vervangerId === t.personId) a.vervangerId = null; t.personId = null; CC.save(); CC.render(); CC.toast('Afgemeld voor deze taak; de teamleider krijgt bericht'); });
})();
