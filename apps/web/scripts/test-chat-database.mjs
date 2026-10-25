// Ejecutar solo contra un contenedor PostgreSQL desechable llamado yuam-auth-postgres-test.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = ['exec', '-i', 'yuam-auth-postgres-test', 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-Atq']
const sql = source => execFileSync('docker', args, { input: source, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
const owner = '11111111-1111-4111-8111-111111111111'

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
INSERT INTO auth.users VALUES ('${owner}');
`)
sql(readFileSync(path.resolve(root, '../../packages/database/schema.sql'), 'utf8'))
const migration = readFileSync(path.join(root, 'supabase/migrations/202610250002_boveda_memoria.sql'), 'utf8')
sql(migration)
sql(migration) // La migración puede reaplicarse sin duplicar políticas.
sql(`INSERT INTO public.boveda_memoria(titulo, contenido, etiquetas)
  VALUES ('Calibración pH', 'Usa dos soluciones tampón.', ARRAY['sensores', 'ph']);`)

assert.throws(() => sql('SET ROLE anon; SELECT titulo FROM public.boveda_memoria;'), /permission denied/)
assert.equal(sql(`SET ROLE authenticated; SET request.jwt.claims = '{"sub":"${owner}","role":"authenticated"}';
  SELECT titulo FROM public.boveda_memoria;`), 'Calibración pH')
assert.throws(() => sql(`SET ROLE authenticated; SET request.jwt.claims = '{"sub":"${owner}","role":"authenticated"}';
  INSERT INTO public.boveda_memoria(titulo, contenido) VALUES ('X','Y');`), /permission denied/)
assert.equal(sql(`SET ROLE authenticated; SET request.jwt.claims = '{"sub":"${owner}","role":"authenticated"}';
  SELECT count(*) FROM public.boveda_memoria WHERE titulo ILIKE '%PH%' OR contenido ILIKE '%ph%';`), '1')

console.log('PostgreSQL: migración de bóveda idempotente, lectura autenticada, escritura bloqueada e ILIKE verificados.')
