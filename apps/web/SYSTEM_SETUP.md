# Configuración de soporte, Analytics, nodos y Yum

Configurar exclusivamente `apps/web/.env.local` en desarrollo y las variables equivalentes del frontend en producción:

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`: sesión y proyecto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: acceso exclusivo del servidor. Los endpoints verifican el JWT y asignan/filtran `user_id`.
- `GEMINI_API_KEY`: embeddings y respuestas de Yum.
- `GEMINI_MODEL`: modelo de generación; por defecto `gemini-2.5-flash`.
- `NEXT_PUBLIC_GA_ID`: identificador `G-…`. Analytics se carga únicamente con consentimiento `all`.

## Esquema desplegado comprobado

La tabla `public.nodes` contiene `id`, `user_id`, `name`, `country`, `city`, `lat`, `lng`, `token` y `created_at`.
El alta inserta y devuelve el registro confirmado en una sola operación. El token se devuelve únicamente al crear o rotar;
los listados siempre seleccionan columnas explícitas que lo excluyen. El mapa también excluye `user_id` y redondea la posición.

La tabla `public.boveda_memoria` contiene `id` entero, `titulo`, `contenido` y `etiquetas` de texto.
El esquema remoto no dispone de pgvector ni de una RPC de similitud. La recuperación lee hasta 50 notas usando la clave de servicio,
genera embeddings de consulta/documentos con `gemini-embedding-001` (768 dimensiones), y ordena por similitud coseno en el servidor.
Los vectores de documentos se guardan en memoria durante diez minutos; no requieren cambios en Supabase.
Para bóvedas mayores, migrar a un índice vectorial persistente y recuperar los candidatos en la base de datos.

Sin coincidencias, Yum ofrece orientación contextual sobre cultivos, fotobiorreactores y sensores, sin atribuirla a fuentes inexistentes.

## Gestión y tiempo de respuesta

`PATCH /api/nodes/:id` con `action: "relocate"` guarda nombre, país, ciudad y coordenadas sin rotar el token.
`DELETE /api/nodes` recibe `{ "id": "uuid" }`; tanto edición como eliminación filtran por `user_id` de la sesión validada.
La creación y rotación muestran el token en un diálogo nativo. Cerrar con el botón o Escape elimina el secreto del estado del componente.

La recuperación RAG tiene un límite duro de 4 segundos y propaga la cancelación a Supabase y a los embeddings.
La ruta de chat usa un presupuesto global objetivo de 1600 ms y concede hasta 650 ms a la búsqueda;
si no alcanza, devuelve orientación contextual sin esperar a Gemini. La generación recibe solo el tiempo restante.
Los embeddings se calculan en paralelo y se reutilizan durante diez minutos. La latencia de autenticación,
el arranque del servidor y el tránsito de red pueden añadir tiempo; no existe una garantía extremo a extremo de dos segundos.

Soporte oficial: `Yuam_support@protonmail.com`.
