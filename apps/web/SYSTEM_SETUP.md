# Configuración de soporte, Analytics, nodos y Yum

Configurar exclusivamente `apps/web/.env.local` en desarrollo y las variables equivalentes del frontend en producción:

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`: sesión y proyecto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: acceso exclusivo del servidor. Los endpoints verifican el JWT y asignan/filtran `user_id`.
- `GEMINI_API_KEY`: embeddings y respuestas de Yum.
- `GEMINI_MODEL`: modelo de generación; por defecto `gemini-3.1-flash-lite` (comprobado con una respuesta técnica real).
- `NEXT_PUBLIC_GA_ID`: identificador `G-…`. Analytics se carga únicamente con consentimiento `all`.

## Esquema desplegado comprobado

Aplicar `supabase/migrations/202610250003_hardware_quota_map.sql` sobre el esquema desplegado antes de publicar esta versión.
Aplicar después `202610250004_node_key_protection.sql`: elimina el acceso anónimo directo a claves y aplica RLS por propietario.
La tabla `public.nodes` contiene `id`, `user_id`, `name`, `country`, `city`, `lat`, `lng`, `token`, `created_at`, `board_type`, `algae_type` y `sensors`.
El trigger `yuam_sync_reactor` mantiene su reactor (`node_id`, `user_id`, placa, cepa, sensores, ubicación y clave) dentro de la misma transacción.
La creación, reubicación y rotación se revierten por completo si falla esa sincronización.
Los listados excluyen las claves. El propietario puede consultarlas explícitamente en `GET /api/nodes/:id/key`;
el mapa también excluye `user_id` y redondea la posición.

La tabla `public.boveda_memoria` contiene `id` entero, `titulo`, `contenido` y `etiquetas` de texto.
El esquema remoto no dispone de pgvector ni de una RPC de similitud. La recuperación lee hasta 50 notas usando la clave de servicio,
genera embeddings de consulta/documentos con `gemini-embedding-001` (768 dimensiones), y ordena por similitud coseno en el servidor.
Los vectores de documentos se guardan en memoria durante diez minutos; no requieren cambios en Supabase.
Para bóvedas mayores, migrar a un índice vectorial persistente y recuperar los candidatos en la base de datos.

Sin coincidencias, la pregunta se envía igualmente a Gemini Flash con instrucciones técnicas del dominio y sin citas ficticias.
No se utiliza una respuesta prefabricada para las preguntas técnicas.

## Gestión y tiempo de respuesta

`PATCH /api/nodes/:id` con `action: "relocate"` guarda nombre, país, ciudad y coordenadas sin rotar el token.
`DELETE /api/nodes` recibe `{ "id": "uuid" }`; tanto edición como eliminación filtran por `user_id` de la sesión validada.
El diálogo reutilizable en `components/ui/Dialog.tsx` da identidad YU’AM al token, la confirmación de borrado y el límite de preguntas.
Cerrar el token elimina el secreto del estado del componente. La consulta manual de una clave existente exige la sesión del propietario.

La recuperación RAG tiene un límite duro de 4 segundos y propaga la cancelación a Supabase y a los embeddings.
Tras la búsqueda (máximo 4 s), la generación tiene hasta 20 s para ofrecer una respuesta real, con o sin notas.
Los embeddings se calculan en paralelo y se reutilizan durante diez minutos.
La bienvenida se muestra localmente y no consume cuota. `GET /api/chat` consulta la cuota sin consumirla;
`POST /api/chat` reserva atómicamente una de cinco peticiones diarias en `yuam_chat_usage`.
El límite es por usuario y día UTC, compartido entre pestañas, sesiones y servidores; el reinicio es a medianoche UTC.
Las preguntas inválidas no consumen cuota. Una petición técnica válida ya reservada sí cuenta aunque falle el proveedor.
Sin acceso a la cuota persistente, el servidor rechaza la generación: nunca habilita una cuota local ilimitada.

## Telemetría y mapa

`POST /api/telemetry` recibe la clave del nodo en `Authorization: Bearer …` y valores opcionales
`co2_ppm`, `ph`, `temperatura`, `lux`, `pm25` (al menos uno). La función `yuam_ingest_hardware`
asocia la lectura al reactor sincronizado, valida límites y aplica un intervalo mínimo de 60 segundos.
Los valores PM2.5 se expresan en µg/m³; lux es iluminancia y temperatura está en °C.
`yuam_public_node_stats` agrega en PostgreSQL la última lectura y las medias móviles de 7 y 30 días,
sin truncar las lecturas ni sustituir valores ausentes por ceros. El mapa consulta estos datos cada 30 minutos.

Soporte oficial: `Yuam_support@protonmail.com`.
