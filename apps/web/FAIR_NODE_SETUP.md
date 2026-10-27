# Fotobiorreactor oficial INED La Estancia

El nodo destacado utiliza el ID público `18e57a0c-6a18-4f18-9e18-1ed0018a2026`,
Chlorella vulgaris y Arduino + Script Puente Python. La ubicación del mapa es una
referencia de Ciudad de Guatemala; el propietario puede corregirla desde su perfil.

Aplicar `supabase/migrations/202610260007_fair_vip_telemetry.sql` después de 0006.
La bandera `nodes.is_demo_vip` solo se concede desde el servidor o SQL Editor.
El registro del nodo y su token se provisionan mediante la clave de servicio;
el propietario consulta y rota la clave en `/perfil` → Conectar tu hardware.
La migración no contiene claves ni asigna nodos a una cuenta arbitraria.

## Conexión en la feria

1. Iniciar sesión con la cuenta propietaria y elegir el nodo INED La Estancia en el perfil.
2. Consultar/copiar su token privado. Conservarlo únicamente en el equipo del puente.
3. Usar el script Python de `/hardware` con `NODE_TOKEN`, `SERIAL_PORT`, `BAUD_RATE`
   y `SEND_INTERVAL_SECONDS=10`. Cerrar el monitor serie de Arduino IDE.
4. En el sketch de Arduino, emitir una trama JSON cada 10 segundos (`delay(10000)`
   o `INTERVAL_MS = 10000UL`). Los baudios deben coincidir con el puente Python.
5. Enviar únicamente mediciones reales de `co2_ppm`, `ph`, `temperatura`, `humedad`,
   `lux` o `pm25` a `https://yuam.tech/api/telemetry` usando
   `Authorization: Bearer <NODE_TOKEN>` y `Content-Type: application/json`.

El intervalo mínimo es **10 segundos para nodos VIP** y **1800 segundos para los demás**.
PostgreSQL comprueba el token y bloquea la fila del nodo antes de revisar la última
lectura. Las solicitudes simultáneas y las rotaciones de token no evaden el límite.
HTTP 429 devuelve `Retry-After` y `interval_seconds`; el puente debe respetarlos.
El JSON del dispositivo no puede activar `is_demo_vip`.

La tarjeta oficial consulta las estadísticas públicas cada 10 segundos. El panel
privado usa Realtime y consulta cada 10 segundos como respaldo para VIP.
Antes de recibir la primera trama se muestra «Sin datos».
Selecciona desde el perfil únicamente los sensores que estén instalados físicamente.
