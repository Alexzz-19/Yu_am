# Bot YU'AM y bóveda de memoria

El bot usa el acceso de Supabase Auth existente. Configura `GEMINI_API_KEY` **solo
en el servidor** (`apps/web/.env.local` para desarrollo y secretos del hosting para
despliegue). La variable ya está en `.env.example`; nunca la expongas con el prefijo
`NEXT_PUBLIC_` ni la envíes desde el navegador.

Aplica `supabase/migrations/202610250002_boveda_memoria.sql` con el SQL Editor de
Supabase, después del esquema base. La migración crea `boveda_memoria` con
`titulo`, `contenido`, `etiquetas` (arreglo de texto) y una política de lectura
para usuarios autenticados. No concede escritura al navegador. Si ya existe una
tabla con ese nombre, comprueba que estas columnas y tipos coincidan antes de
aplicar la migración. No hay notas precargadas.

Ejemplo de nota, cargada desde el SQL Editor con privilegios administrativos:

```sql
INSERT INTO public.boveda_memoria (titulo, contenido, etiquetas)
VALUES ('Calibración de pH',
  'El sensor de pH debe calibrarse con dos soluciones tampón que cubran el rango del cultivo.',
  ARRAY['sensores', 'pH', 'calibración']);
```

`POST /api/chat` requiere `Authorization: Bearer <access_token>` de una sesión
Supabase activa y `{ "prompt": "pregunta" }`. La API valida el token con
`auth.getUser`, busca coincidencias `ilike` en título y contenido, selecciona
hasta cinco notas y envía solo sus fragmentos relevantes a Gemini. Devuelve
`answer` y `sources`. Si no hay notas pertinentes, devuelve una respuesta fija
sin llamar a Gemini. La generación usa el modelo `gemini-3.8-flash`, la clave en
la cabecera `x-goog-api-key` y un límite de tiempo de 20 segundos.

Las notas citadas son datos de la bóveda, no instrucciones para el modelo. El
prompt exige responder solo desde ellas y declarar cuando falte información.
Las respuestas generadas siguen requiriendo revisión humana para decisiones de
cultivo. El historial del widget vive solo en memoria de la pestaña y se borra
al cambiar de cuenta o recargar la página.

Verifica en despliegue: sesión ausente → 401; pregunta inválida → 400; nota
coincidente → respuesta con fuentes; pregunta sin coincidencias → respuesta fija;
clave ausente → 503 y Gemini no disponible → 502. El widget muestra un acceso a
`/login` cuando no hay sesión. `npm test` cubre el controlador con servicios
simulados; la llamada real requiere la clave y notas cargadas.

La migración puede verificarse con PostgreSQL local en un contenedor vacío:

```bash
docker run -d --rm --name yuam-auth-postgres-test -e POSTGRES_HOST_AUTH_METHOD=trust postgres:17-alpine
docker exec yuam-auth-postgres-test pg_isready -U postgres
node scripts/test-chat-database.mjs
docker stop yuam-auth-postgres-test
```

Referencias: [búsqueda ilike de Supabase](https://supabase.com/docs/reference/javascript/using-filters-ilike),
[generación REST de Gemini](https://ai.google.dev/gemini-api/docs/generate-content/text-generation).
