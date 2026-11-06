// ClubComm — Besluit 171: lijst en detail naast elkaar op de laptop (vanaf 1100 px), zoals Plannen (Besluit 169).
// Trainers (HO en TC bij het pakket): links de lijst, rechts het dossier van de gekozen trainer.
// Berichten (elke rol): links de lijst, rechts het gesprek; het eerste gesprek dat op je wacht staat meteen open.
// Smaller dan 1100 px verandert niets (lijst → venster → pagina, Besluit 113). Geen nieuwe gegevens of rechten.
(function () {
  const CC = window.CC; const esc = CC.esc, M = CC.m;
  const mq = window.matchMedia ? window.matchMedia('(min-width: 1100px)') : null;
  CC.ldAan = () => !!(mq && mq.matches) && !document.body.classList.contains('rl');
  if (mq) { const opnieuw = () => { if (CC.S && CC.S() && !CC.ui.view && ['trainers', 'berichten', 'aanwezigheid'].includes(CC.ui.tab)) CC.render(); }; /* alleen waar de indeling verandert (ook de Vormenbank) */ if (mq.addEventListener) mq.addEventListener('change', opnieuw); else if (mq.addListener) mq.addListener(opnieuw); }
  const rol = () => (CC.rol() || {}).rol;
  const pakket = (S) => !!(CC.pakketTrainers && CC.pakketTrainers(S));
  const opTrainers = (S) => CC.ldAan() && pakket(S) && !CC.ui.view && ['hjo', 'tc'].includes(rol());
  const opBerichten = () => CC.ldAan() && !CC.ui.view && CC.ui.tab === 'berichten';
  const kolommen = (links, rechts, label) => `<div class="ld"><div class="ld-l">${links}</div><section class="ld-r" aria-label="${esc(label)}">${rechts}</section></div>`;
  const leeg = (tekst) => `<p class="zacht ld-leeg">${esc(tekst)}</p>`;
  const markeer = (html, act, id) => html.replace(new RegExp(`(<(?:div|button) class=")([^"]*)("[^>]*data-act="${act}"[^>]*data-id="${id.replace(/[^\w-]/g, '')}")`), '$1$2 gekozen" aria-current="true$3');

  // Een tik in de lijst kiest; rechts verschijnt het detail (geen snelvenster, geen aparte pagina)
  CC.ldKies = (soort, id) => { CC.ui.seg[soort] = id; CC.render(); };
  const open = CC.open;
  CC.open = (view, params = {}) => { if (view === 'bericht' && opBerichten() && params.id) return CC.ldKies('berKies', params.id); return open(view, params); };

  const wacht = () => {
    if (!CC.rollen || !CC.rollen.hjo || !CC.rollen.hjo.schermen.trainers || !CC.berichtenScherm || !CC.views.trainerDetail || !CC.hoTrainerRij) return setTimeout(wacht, 0);
    // Trainers
    const tr = CC.rollen.hjo.schermen.trainers;
    CC.rollen.hjo.schermen.trainers = (S) => { const lijst = tr(S); if (!opTrainers(S)) return lijst;
      const id = CC.ui.seg.trKies; const p = id && M.persoon(S, id);
      if (!p || !lijst.includes(`data-id="${id}"`)) return kolommen(lijst, leeg('Kies links een trainer. Zijn dossier verschijnt hier.'), 'Dossier');
      const d = CC.views.trainerDetail(S, { id });
      return kolommen(markeer(lijst, 'hoTrainerSnel', id), `<h2 class="ld-kop">${esc(p.naam)}</h2>${d.html}`, `Dossier van ${p.naam}`); };
    // Berichten
    const ber = CC.berichtenScherm;
    CC.berichtenScherm = (S, o = {}) => { const lijst = ber(S, o); if (!opBerichten()) return lijst;
      let id = CC.ui.seg.berKies;
      if (!id || !lijst.includes(`data-view="bericht" data-id="${id}"`)) { const m = lijst.match(/Wacht op jou[\s\S]*?data-view="bericht" data-id="([^"]+)"/); id = m ? m[1] : null; CC.ui.seg.berKies = id; }
      if (!id) return kolommen(lijst, leeg('Kies links een gesprek.'), 'Gesprek');
      const v = CC.views.bericht(S, { id });
      return kolommen(markeer(lijst, 'open', id), v.html, v.titel || 'Gesprek'); };
    // Op de laptop gebruiken deze tabbladen de hele breedte
    Object.values(CC.rollen).forEach((R) => { const b = R.breed;
      R.breed = (S, tab) => (CC.ldAan() && (tab === 'berichten' || (tab === 'trainers' && pakket(S) && ['hjo', 'tc'].includes(rol())))) || !!(b && b(S, tab)); });
  };
  wacht();
})();
