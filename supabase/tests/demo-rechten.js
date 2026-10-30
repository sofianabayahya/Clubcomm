// ClubComm — DEMO Swift: maakt van de uitvoer van tests/demo-swift.spec.js (rijen + oordeel van de demo per identiteit) een
// SQL-test voor de tijdelijke lokale database (rechtentest-lokaal.sh, EXTRA_SQL). Per identiteit per rij: lezen en wijzigen.
// "verwacht" = wat de demo toont/toelaat; "uitkomst" = wat de echte rechtenregels doen. Elk verschil is een fout in de demo.
const fs = require('fs');
const { rijen, oordeel } = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const q = (x) => (x == null ? 'null' : `'${String(x).replace(/'/g, "''")}'`);
const ID = { 'demo-trainer': ['00000000-0000-0000-0000-0000000000d1', 'Demo Trainer (alleen trainer)'], 'demo-hjo': ['00000000-0000-0000-0000-0000000000d2', 'Demo HJO (HO + trainer)'] };
const regels = ['begin;', 'create temp table uitkomst (wie text, test text, verwacht text, uitkomst text);',
  `insert into auth.users (id, email, aud, role) values ${Object.entries(ID).map(([p, [u]]) => `('${u}','${p}@demo.invalid','authenticated','authenticated')`).join(', ')};`,
  `insert into public.lid (auth_uid, club_id, persoon_id) values ${Object.entries(ID).map(([p, [u]]) => `('${u}','swift-demo','${p}')`).join(', ')};`,
  `insert into public.rij (club_id, soort, id, scope, team_id, speler_id, persoon_id, act_id, data) values\n${rijen.map((r) => `  (${q(r.club_id)},${q(r.soort)},${q(r.id)},${q(r.scope)},${q(r.team_id)},${q(r.speler_id)},${q(r.persoon_id)},${q(r.act_id)},${q(JSON.stringify(r.data))}::jsonb)`).join(',\n')};`,
  `create function pg_temp.als(uid text, email text, wie text, test text, verwacht text, q text) returns void language plpgsql as $f$
declare n int := 0; u text;
begin
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text, true);
  begin
    execute 'set local role authenticated';
    execute q; get diagnostics n = row_count;
    raise exception 'cc_terug';
  exception when others then
    u := case when sqlerrm = 'cc_terug' and n > 0 then 'mag' else 'weigert' end;
  end;
  execute 'reset role';
  insert into uitkomst values (wie, test, verwacht, u);
end $f$;`];
for (const [pid, lijst] of Object.entries(oordeel)) {
  const [uid, wie] = ID[pid];
  for (const o of lijst) {
    const [soort, id] = o.k.split('|');
    const waar = `soort=${q(soort)} and id=${q(id)} and club_id='swift-demo'`;
    regels.push(`select pg_temp.als('${uid}','${pid}@demo.invalid',${q(wie)},${q('leest ' + o.k.replace('|', ' / '))},'${o.lezen ? 'mag' : 'weigert'}',${q(`select 1 from public.rij where ${waar}`)});`);
    regels.push(`select pg_temp.als('${uid}','${pid}@demo.invalid',${q(wie)},${q('wijzigt ' + o.k.replace('|', ' / '))},'${o.schrijven ? 'mag' : 'weigert'}',${q(`update public.rij set data = data where ${waar}`)});`);
  }
}
regels.push('select wie, test, verwacht, uitkomst, uitkomst = verwacht as ok from uitkomst;', 'rollback;');
process.stdout.write(regels.join('\n') + '\n');
