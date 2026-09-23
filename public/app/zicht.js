// ClubComm prototype — Besluit 24: wie ziet wat (per rol, in te stellen door de clubbeheerder).
// Ieder ziet wat hij nodig heeft voor zijn taak. De HJO ziet alles; ouders zien alleen hun eigen kind.
(function () {
  const CC = window.CC; const h = CC.h, icon = CC.icon, esc = CC.esc;

  CC.ZICHT = [
    { k: 'toelichting', titel: 'Toelichting bij afmelden', sub: 'Wat de ouder er zelf bij typt, bijv. "enkelblessure, fysio"' },
    { k: 'beoordeling', titel: 'Beoordelingen', sub: 'Scores en gesprekpunten' },
    { k: 'gesprekken', titel: 'Gespreksnotities en afspraken', sub: 'Gebeld, geappt, persoonlijk gesprek' },
    { k: 'contact', titel: 'Contact vastleggen', sub: 'Zelf een gesprek of belletje noteren' },
  ];
  // Standaard: trainer alles, teamleider alleen wat hij voor zijn taken nodig heeft
  const STANDAARD = { trainer: { toelichting: true, beoordeling: true, gesprekken: true, contact: true }, teamleider: { toelichting: false, beoordeling: false, gesprekken: false, contact: false } };
  // Vast: de trainer beoordeelt en belt (Besluit 15 en 23), dat kan niet uit
  const VAST = { trainer: ['beoordeling', 'contact'] };

  const zicht = (S) => S.club.zicht || (S.club.zicht = JSON.parse(JSON.stringify(STANDAARD)));
  // Mag deze rol dit zien? (zonder rol: de huidige rol)
  CC.zicht = (k, rol) => {
    const S = CC.S(); const r = rol || (CC.rol() || {}).rol;
    if (r === 'hjo' || r === 'beheerder') return true;
    const z = zicht(S)[r]; return !!(z && z[k]);
  };
  // Meldingen: de toelichting alleen voor wie hem mag zien
  CC.metToelichting = (ids, rolVan) => ids.filter(Boolean).reduce((acc, id) => { (CC.zicht('toelichting', rolVan(id)) ? acc.met : acc.zonder).push(id); return acc; }, { met: [], zonder: [] });

  const tabel = (S) => {
    const z = zicht(S); const hjo = esc(S.club.labels.hjo);
    const cel = (rol, k) => { const vast = (VAST[rol] || []).includes(k); return `<td><input type="checkbox" ${z[rol][k] ? 'checked' : ''} ${vast ? 'disabled' : ''} data-change="zichtZet" data-rol="${rol}" data-k="${k}" aria-label="${rol}: ${k}"></td>`; };
    return `${h.sectie('Wie ziet wat')}
      <p class="zacht klein">Iedereen ziet wat hij nodig heeft voor zijn taak. In de onderbouw is de teamleider meestal een ouder van een teamgenoot; daarom ziet hij standaard geen beoordelingen, gespreksnotities of toelichtingen.</p>
      <div class="tabelvak"><table class="tabel zicht"><thead><tr><th></th><th>Team&shy;leider</th><th>Trainer</th><th>${hjo}</th></tr></thead><tbody>
        <tr><td><b>Aanwezig, afgemeld, te laat</b><small>met soort reden (ziek, blessure…)</small></td><td>✓</td><td>✓</td><td>✓</td></tr>
        <tr><td><b>Kaarten en signalen</b><small>langdurig afwezig melden</small></td><td>✓</td><td>✓</td><td>✓</td></tr>
        ${CC.ZICHT.map((x) => `<tr><td><b>${x.titel}</b><small>${x.sub}</small></td>${cel('teamleider', x.k)}${cel('trainer', x.k)}<td>✓</td></tr>`).join('')}
      </tbody></table></div>
      <p class="zacht klein">Ouders zien altijd alleen hun eigen kind. De ${hjo} ziet alles. De trainer beoordeelt en belt, dus die vakjes staan vast aan. In versie 2 dwingt de server dit af.</p>`;
  };
  CC.on('zichtZet', (el) => { const S = CC.S(); zicht(S)[el.dataset.rol][el.dataset.k] = el.checked; CC.save(); CC.toast('Opgeslagen'); });

  const origRollen = CC.rollen.beheerder.schermen.rollen;
  CC.rollen.beheerder.schermen.rollen = (S) => origRollen(S) + tabel(S);

  const orig = CC.generate;
  CC.generate = function () { const S = orig(); zicht(S); return S; };
  zicht(CC.S());
})();
