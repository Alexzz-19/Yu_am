# Autenticación, nodos y telemetría

## Configuración del despliegue

1. Copia `.env.example` a `.env.local` para desarrollo y configura los equivalentes
   en el entorno del hosting. No publiques `.env.local`. `SUPABASE_SERVICE_ROLE_KEY`
   solo se lee en módulos de servidor. `GEMINI_API_KEY` se usa en `/api/chat`;
   consulta `BOT_SETUP.md` para la bóveda de memoria.
2. Aplica primero el esquema base `packages/database/schema.sql` si el proyecto es
   nuevo. Después ejecuta `supabase/migrations/202610250001_auth_nodes_telemetry.sql`
   desde el SQL Editor de tu proyecto Supabase. La migración se ejecuta en una
   transacción y no instala automáticamente cambios en una base remota.
3. Habilita Google en Supabase Authentication → Sign In / Providers y configura su
   client ID y secret allí. En Google Cloud autoriza el callback de Supabase
   `https://TU_PROYECTO.supabase.co/auth/v1/callback`. En Supabase URL Configuration,
   configura Site URL y autoriza `https://TU_DOMINIO/login` y, en desarrollo,
   `http://localhost:3000/login`. El cliente usa PKCE y Supabase procesa el código
   al regresar a `/login`; una sesión válida redirige a `/perfil`. `@supabase/ssr`
   comparte la sesión mediante cookies y `middleware.ts` valida los JWT en `/perfil`
   y `/dashboard` antes de mostrar esas páginas.
4. Crea un widget **Cloudflare Turnstile** para tus dominios y localhost. Su site
   key se guarda en `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (se conserva el nombre pedido).
   No uses una clave de Google reCAPTCHA: Supabase Auth admite Turnstile/hCaptcha.
   Habilita CAPTCHA en Supabase Authentication → Bot and Abuse Protection y
   configura allí el **secret de Turnstile**. Este secret nunca se expone al navegador.
   Es obligatorio habilitarlo en Supabase: deshabilitar solo el botón en la UI no
   protege el endpoint directo de Auth. Activa también las restricciones/rate limits
   de Supabase Auth y confirma la política de confirmación de correo.
5. Reinicia o reconstruye Next.js tras configurar variables públicas.

En producción, sin site key el formulario por correo queda deshabilitado. Durante
desarrollo local, Turnstile se omite para permitir probar el flujo sin configurar
Cloudflare; Supabase Auth sigue aplicando sus propias reglas. Sin service role la
ingesta devuelve 503; no hay credenciales por defecto ni modo de prueba en producción.
Google requiere configuración independiente en Supabase. El código, por sí solo,
no habilita proveedores ni secretos en servicios externos.

Referencias: [CAPTCHA en Supabase](https://supabase.com/docs/guides/auth/auth-captcha),
[Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google),
[Turnstile](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/).

## Propiedad y tokens

Las APIs `/api/nodes` verifican el JWT mediante `auth.getUser` en cada petición.
Las RPC usan `auth.uid()` y RLS conserva la lectura de cada propietario. Los nodos
se crean inactivos. Un bloqueo en el perfil serializa registros simultáneos para
permitir un máximo de cuatro nodos por usuario.

Los tokens tienen el prefijo `yua_live_` y 32 bytes aleatorios criptográficos en
hexadecimal. Solo se almacena su SHA-256 en `yuam_node_credentials`, sin permisos
para `anon` ni `authenticated`. El token se devuelve una vez, con `Cache-Control:
no-store`; no se registra en logs ni se guarda en localStorage. La rotación revoca
el anterior y conserva la fecha de última ingesta. Eliminar un nodo elimina sus
credenciales y su telemetría. La migración revoca escrituras directas de clientes
en nodos y telemetría: los dispositivos deben migrar a `/api/telemetry`.

## Ingesta

```bash
curl -X POST https://TU_DOMINIO/api/telemetry \
  -H "Authorization: Bearer $YUAM_NODE_TOKEN" \
  -H 'Content-Type: application/json' \
  --data '{"co2_ppm":520,"ph":7.1,"temperatura":26.5}'
```

No envíes claves de Supabase desde el firmware. Cada token identifica un único nodo;
no se admite elegir otro `nodo_id` en el cuerpo. Envía solo `co2_ppm` (0–1000000),
`ph` (0–14) y/o `temperatura` (-55–125 °C), al menos uno y siempre numéricos.
Los campos ausentes se almacenan como NULL. El límite del cuerpo es 4 KiB.

- 201: lectura guardada y nodo activo.
- 400/413/415: corrige JSON, tamaño o Content-Type.
- 401: token ausente, inválido o revocado.
- 429: `Frecuencia de envío superada. Máximo 1 lectura por minuto` y `Retry-After`
  en segundos. Conserva la lectura local y espera antes de reenviar.
- 503: revisa variables del servidor, disponibilidad y migración.

La RPC de ingesta solo se concede a `service_role`. Bloquea la credencial del nodo
con `FOR UPDATE`, verifica el reloj de PostgreSQL y guarda lectura, último envío y
estado en una sola transacción. Dos servidores no pueden aceptar lecturas del mismo
nodo dentro de 60 segundos. Un error revierte también el reloj de rate limiting.
El firmware anterior de hardware usa intervalos de 30 segundos y acceso REST directo:
adáptalo a este endpoint, Bearer y un intervalo de al menos 60000 ms.

## Mapa y comprobación de despliegue

`/api/nodes/public` solo expone nombre, zona, coordenadas redondeadas a dos decimales,
estado y última lectura. No expone propietario, correo ni tokens. El mapa consulta
cada 30 segundos; considera inactivos los nodos sin lectura en cinco minutos.
El redondeo es aproximación geográfica, no una garantía de anonimato: usa nombres
y zonas generales en el formulario.

Tras aplicar la migración y configurar proveedores, verifica Google y el retorno
PKCE; acceso, confirmación de correo y CAPTCHA expirado; redirección sin sesión;
registro y copia de token; 201 seguido de 429; rotación (token viejo → 401);
aislamiento entre dos usuarios; borrado y aparición del nodo en el mapa.

`npm test` cubre los controladores y validaciones con Supabase simulado. Las pruebas
de Auth/Google/Turnstile reales requieren el proyecto configurado. La compilación
por defecto usa Turbopack; si el entorno impide abrir sus puertos locales, usa
`npm run build -- --webpack` para verificar el mismo proyecto.

Para repetir la integración en PostgreSQL real, utiliza un contenedor vacío dedicado:

```bash
docker run -d --rm --name yuam-auth-postgres-test -e POSTGRES_HOST_AUTH_METHOD=trust postgres:17-alpine
# Espera a que PostgreSQL termine de arrancar antes de ejecutar el script.
docker exec yuam-auth-postgres-test pg_isready -U postgres
node scripts/test-auth-database.mjs
docker stop yuam-auth-postgres-test
```

El script crea roles, un esquema Auth de prueba y datos ficticios en ese contenedor.
Comprueba la migración y su reaplicación, RLS, ocho ingestas simultáneas (una aceptada),
límites 59/60 segundos, rollback, rotación, borrado y altas concurrentes. No se conecta
al proyecto Supabase ni utiliza `.env.local`.
