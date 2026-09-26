// ClubComm — motor voor de server (Besluit 77): laadt DEZELFDE regels als de app (public/app/*.js) in een afgeschermde
// omgeving zonder scherm, met een klok in Nederlandse tijd. Werkt in Deno (Edge Function) en in Node (tests).
export const BESTANDEN = ['data.js', 'opslag.js', 'core.js', 'ouder.js', 'trainer.js', 'teamleider.js', 'hjo.js', 'materiaal.js', 'agenda.js',
  'afwezig.js', 'trainerafw.js', 'beoordeling.js', 'gesprek.js', 'taken.js', 'hjohome.js', 'autoberichten.js', 'meehelpen.js', 'waardering.js', 'hjofilter.js'];

// Verschil tussen Nederlandse tijd en UTC (in ms) op een bepaald moment
const verschil = (ms) => {
  const f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const p = Object.fromEntries(f.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - Math.floor(ms / 1000) * 1000;
};
// Een Date waarvan de "lokale" tijd Nederlandse tijd is, terwijl toISOString() de echte tijd geeft.
// Werkt omdat de server in UTC draait: lokale getters = UTC getters = (verschoven) Nederlandse tijd.
const maakKlok = (echtNu) => {
  const Echt = Date; const nu = () => (echtNu ? echtNu() : Echt.now());
  const metZone = /(Z|[+-]\d\d:?\d\d)$/i;
  class NLDate extends Echt {
    constructor(...a) {
      if (!a.length) { const t = nu(); super(t + verschil(t)); }
      else if (a.length === 1 && typeof a[0] === 'string' && metZone.test(a[0].trim())) { const t = Echt.parse(a[0]); super(t + verschil(t)); }
      else super(...a);
    }
    static now() { const t = nu(); return t + verschil(t); }
    toISOString() { const t = this.getTime(); return new Echt(t - verschil(t - verschil(t))).toISOString(); }
    toJSON() { return this.toISOString(); }
  }
  return NLDate;
};

// bronnen: { 'data.js': '...code...', ... }. Geeft CC terug met de gegevens S = leeg; zet daarna S met CC.zetS.
export const maakMotor = (bronnen, echtNu) => {
  const opslag = new Map();
  const stil = () => {};
  const element = new Proxy({}, { get: () => stil });
  const window = { addEventListener: stil, removeEventListener: stil, scrollTo: stil, matchMedia: () => ({ matches: false }), scrollY: 0 };
  const document = { addEventListener: stil, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: () => element, body: { classList: { add: stil, remove: stil } }, hidden: true, title: '' };
  const localStorage = { getItem: (k) => (opslag.has(k) ? opslag.get(k) : null), setItem: (k, v) => opslag.set(k, String(v)), removeItem: (k) => opslag.delete(k) };
  const omgeving = { window, document, localStorage, sessionStorage: localStorage, navigator: { userAgent: 'ClubComm-server', share: null }, location: { hash: '', search: '', origin: 'https://mijnclubcomm.nl', pathname: '/', protocol: 'https:' },
    history: { replaceState: stil }, ICONS: {}, Date: maakKlok(echtNu), setInterval: () => 0, setTimeout: () => 0, clearTimeout: stil, clearInterval: stil, alert: stil, confirm: () => false };
  window.window = window; window.CC = {}; window.ICONS = {}; window.document = document; window.localStorage = localStorage;
  const namen = Object.keys(omgeving);
  for (const b of BESTANDEN) {
    if (!bronnen[b]) throw new Error(`Bestand ontbreekt: ${b}`);
    // eslint-disable-next-line no-new-func
    new Function(...namen, `${bronnen[b]}\n//# sourceURL=${b}`)(...namen.map((n) => omgeving[n]));
  }
  const CC = window.CC;
  CC.render = stil; CC.toast = stil; CC.sheet = stil; CC.closeSheet = stil; CC.save = stil;
  return CC;
};

// Eén club doorrekenen. rijen = alle rijen van de club. Geeft de rijen terug die de server moet opslaan of weghalen.
const MAG_SCHRIJVEN = new Set(['msgs', 'acts', 'ontwGesprek', 'ontwVerslag', 'autoVerstuurd']);
export const draaiClub = (CC, rijen, club) => {
  const D = CC.date, M = CC.m;
  const S = CC.uitRijen(rijen, D.vandaag()); CC.zetS(S); CC.opServer = false;
  const oud = new Map(); CC.naarRijen(S, club).forEach((r, k) => oud.set(k, JSON.stringify(r)));
  const verslag = [];
  const als = (p, fn) => { if (!p) return false; CC.me = () => p; try { return fn(); } catch (e) { verslag.push(`fout (${p.id}): ${e.message}`); return false; } };
  // 1. Club: vaste berichten en herinneringen bij activiteiten, als de beheerder (of HJO)
  const beheer = S.people.find((p) => p.rollen.some((r) => r.rol === 'beheerder')) || S.people.find((p) => p.rollen.some((r) => r.rol === 'hjo'));
  if (als(beheer, () => CC.automaatClub(S))) verslag.push('club');
  // 2. Per team, als de trainer (of anders de teamleider): uitslag, ontwikkelgesprekken, afgelaste trainingen
  S.teams.forEach((t) => { const staf = M.stafVan(S, t.id, ['trainer'])[0] || M.stafVan(S, t.id, ['teamleider'])[0]; const p = staf && M.persoon(S, staf);
    if (als(p, () => CC.automaatTeam(S))) verslag.push(`team ${t.id}`); });
  // 3. Wat is er veranderd? Alleen soorten die de server mag schrijven; bestaande berichten nooit aanpassen.
  const nu = CC.naarRijen(S, club); const opslaan = []; const weg = [];
  nu.forEach((r, k) => { if (!MAG_SCHRIJVEN.has(r.soort)) return; const j = JSON.stringify(r); if (oud.get(k) === j) return; if (r.soort === 'msgs' && oud.has(k)) return; opslaan.push(r); });
  oud.forEach((j, k) => { if (!nu.has(k) && k.startsWith('ontwGesprek|')) weg.push(k.split('|').slice(1).join('|')); });
  return { opslaan, weg, verslag };
};
