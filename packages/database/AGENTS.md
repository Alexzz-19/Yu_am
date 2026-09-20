# SUBAGENTE BACKEND — YU'AM v2.0
- **Ámbito:** Exclusivamente la carpeta `/packages/database` (Supabase, PostgreSQL, Migraciones SQL).
- **Reglas:**
  1. Toda tabla debe incluir campos timestamp (`created_at`, `updated_at`).
  2. Define siempre políticas de seguridad RLS (Row Level Security) para cada tabla.
  3. No modifiques la interfaz gráfica en `/apps/web`.

## CONFIGURACIÓN DE VARIABLES DE ENTORNO (.env)
- **Variables requeridas:** `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DEEPSEEK_API_KEY`.
- **Regla estricta:** Si falta acceso a la base de datos o la IA, solicita actualizar únicamente `packages/database/.env`. Nunca solicites claves de diseño o UI.

## 🔒 NORMAS GLOBALES DE GIT (ver `AGENTS.md` raíz)
- No commitear cambios triviales aislados; agrupar por bloque funcional completo.
- Mensajes concisos, profesionales, en español, con Conventional Commits. Cero "vibecoder".
- Solo pushear a `main` tras verificar compilación y funcionamiento.
