# SUBAGENTE BACKEND — YU'AM v2.0
- **Ámbito:** Exclusivamente la carpeta `/db` (Supabase, PostgreSQL, Migraciones SQL).
- **Reglas:**
  1. Toda tabla debe incluir campos timestamp (`created_at`, `updated_at`).
  2. Define siempre políticas de seguridad RLS (Row Level Security) para cada tabla.
  3. No modifiques la interfaz gráfica en `/web`.

## CONFIGURACIÓN DE VARIABLES DE ENTORNO (.env)
- **Variables requeridas:** `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DEEPSEEK_API_KEY`.
- **Regla estricta:** Si falta acceso a la base de datos o la IA, solicita actualizar únicamente `db/.env`. Nunca solicites claves de diseño o UI.
