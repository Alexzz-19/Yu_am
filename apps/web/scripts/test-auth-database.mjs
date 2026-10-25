// Integración opcional: usa un contenedor PostgreSQL vacío, sin conectar Supabase remoto.
// docker run -d --rm --name yuam-auth-postgres-test -e POSTGRES_HOST_AUTH_METHOD=trust postgres:17-alpine
// node scripts/test-auth-database.mjs
import assert from 'node:assert/strict'
import { execFile, execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { promisify } from 'node:util'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const container = 'yuam-auth-postgres-test'
const args = ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-Atq']
const sql = source => execFileSync('docker', args, { input: source, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
const run = promisify(execFile)
const owner = '11111111-1111-4111-8111-111111111111'
const other = '22222222-2222-4222-8222-222222222222'
const hash = 'a'.repeat(64)
const nextHash = 'b'.repeat(64)
const asUser = (id, query) => `SET ROLE authenticated; SET request.jwt.claims = '{"sub":"${id}","role":"authenticated"}'; ${query}`
const ingest = secret => `SET ROLE service_role; SELECT public.yuam_ingest_telemetry('${secret}',520,7.1,26.5);`

sql(`
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
CREATE TABLE auth.users(id UUID PRIMARY KEY);
CREATE FUNCTION auth.jwt() RETURNS JSONB LANGUAGE sql STABLE AS
  $$ SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
CREATE FUNCTION auth.uid() RETURNS UUID LANGUAGE sql STABLE AS $$ SELECT (auth.jwt()->>'sub')::uuid $$;
CREATE FUNCTION auth.role() RETURNS TEXT LANGUAGE sql STABLE AS $$ SELECT auth.jwt()->>'role' $$;
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
INSERT INTO auth.users VALUES ('${owner}'), ('${other}');
`)
sql(readFileSync(path.resolve(root, '../../packages/database/schema.sql'), 'utf8'))
const migration = readFileSync(path.join(root, 'supabase/migrations/202610250001_auth_nodes_telemetry.sql'), 'utf8')
sql(migration)
sql(migration) // Reaplicación sin pérdida de datos ni políticas duplicadas.

const id = sql(asUser(owner, `SELECT public.yuam_register_node('Cultivo','Zona general',14.5968,-90.5103,'${hash}');`))
assert.match(id, /^[a-f0-9-]{36}$/)
assert.throws(() => sql(`SET ROLE anon; SELECT public.yuam_register_node('X','Y',0,0,'${hash}');`), /permission denied/)
assert.throws(() => sql('SET ROLE authenticated; SELECT * FROM public.yuam_node_credentials;'), /permission denied/)
assert.throws(() => sql(asUser(owner, `INSERT INTO public.telemetria_mq135(nodo_id) VALUES ('${id}');`)), /permission denied/)
assert.throws(() => sql(asUser(owner, `SELECT public.yuam_ingest_telemetry('${hash}',1,7,20);`)), /permission denied/)
assert.throws(() => sql(asUser(other, `SELECT public.yuam_rotate_node_token('${id}','${nextHash}');`)), /Node not found/)
assert.throws(() => sql(asUser(other, `SELECT public.yuam_delete_node('${id}');`)), /Node not found/)
assert.equal(sql(asUser(other, 'SELECT count(*) FROM public.nodos_iot;')), '0')

const publicNode = JSON.parse(sql('SET ROLE anon; SELECT row_to_json(n) FROM public.yuam_public_nodes() n;'))
assert.equal(publicNode.ubicacion_ofuscada.lat, 14.6)
assert.equal(publicNode.ubicacion_ofuscada.lng, -90.51)
assert.equal(publicNode.estado, 'inactivo')
assert.ok(!JSON.stringify(publicNode).includes(owner))
assert.ok(!JSON.stringify(publicNode).includes(hash))

// Ocho conexiones PostgreSQL reales compiten por el mismo token.
const responses = await Promise.all(Array.from({ length: 8 }, async () => {
  const { stdout } = await run('docker', [...args, '-c', ingest(hash)])
  return JSON.parse(stdout.trim())
}))
assert.equal(responses.filter(value => value.status === 'accepted').length, 1)
assert.equal(responses.filter(value => value.status === 'rate_limited').length, 7)
assert.equal(sql(`SELECT count(*) FROM public.telemetria_mq135 WHERE nodo_id='${id}';`), '1')
assert.equal(JSON.parse(sql('SET ROLE anon; SELECT row_to_json(n) FROM public.yuam_public_nodes() n;')).estado, 'activo')

sql(`UPDATE public.yuam_node_credentials SET ultimo_envio=clock_timestamp()-interval '59 seconds' WHERE nodo_id='${id}';`)
assert.equal(JSON.parse(sql(ingest(hash))).status, 'rate_limited')
sql(`UPDATE public.yuam_node_credentials SET ultimo_envio=clock_timestamp()-interval '60 seconds' WHERE nodo_id='${id}';`)
assert.equal(JSON.parse(sql(ingest(hash))).status, 'accepted')

// Un error de escritura debe revertir también el reloj del límite.
sql(`UPDATE public.yuam_node_credentials SET ultimo_envio=clock_timestamp()-interval '61 seconds' WHERE nodo_id='${id}';
CREATE FUNCTION public.test_ingest_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Test rollback'; END; $$;
CREATE TRIGGER test_ingest_failure BEFORE INSERT ON public.telemetria_mq135 FOR EACH ROW EXECUTE FUNCTION public.test_ingest_failure();`)
const last = sql(`SELECT ultimo_envio FROM public.yuam_node_credentials WHERE nodo_id='${id}';`)
assert.throws(() => sql(ingest(hash)), /Test rollback/)
assert.equal(sql(`SELECT ultimo_envio FROM public.yuam_node_credentials WHERE nodo_id='${id}';`), last)
sql('DROP TRIGGER test_ingest_failure ON public.telemetria_mq135; DROP FUNCTION public.test_ingest_failure();')
assert.equal(JSON.parse(sql(ingest(hash))).status, 'accepted')

sql(asUser(owner, `SELECT public.yuam_rotate_node_token('${id}','${nextHash}');`))
assert.equal(JSON.parse(sql(ingest(hash))).status, 'unauthorized')
assert.equal(JSON.parse(sql(ingest(nextHash))).status, 'rate_limited')

for (let index = 1; index <= 3; index++) {
  sql(asUser(owner, `SELECT public.yuam_register_node('Nodo ${index}','Zona',0,0,'${String(index).repeat(64)}');`))
}
assert.throws(() => sql(asUser(owner, `SELECT public.yuam_register_node('Quinto','Zona',0,0,'${'9'.repeat(64)}');`)), /Maximum four nodes/)

const quota = await Promise.allSettled(Array.from({ length: 5 }, (_, i) => run('docker', [...args, '-c',
  asUser(other, `SELECT public.yuam_register_node('Concurrente ${i}','Zona',0,0,'${String(i + 4).repeat(64)}');`)])))
assert.equal(quota.filter(value => value.status === 'fulfilled').length, 4)
assert.equal(quota.filter(value => value.status === 'rejected' && value.reason.stderr.includes('Maximum four nodes')).length, 1)
assert.equal(sql(asUser(owner, 'SELECT count(*) FROM public.nodos_iot;')), '4')
assert.equal(sql(asUser(other, 'SELECT count(*) FROM public.nodos_iot;')), '4')

sql(asUser(owner, `SELECT public.yuam_delete_node('${id}');`))
assert.equal(JSON.parse(sql(ingest(nextHash))).status, 'unauthorized')
assert.equal(sql(`SELECT count(*) FROM public.telemetria_mq135 WHERE nodo_id='${id}';`), '0')
console.log('PostgreSQL: migración idempotente, RLS, tokens, privacidad, 8 ingestas simultáneas, límite 59/60 s, rollback, rotación, borrado y cuota concurrente verificados.')
