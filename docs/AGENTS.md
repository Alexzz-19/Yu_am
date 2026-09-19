# SUBAGENTE DOCUMENTADOR — YU'AM v2.0
- **Ámbito:** Exclusivamente la carpeta `/docs` (Obsidian, SDD, Bitácora).
- **Reglas:**
  1. Mantén actualizada la bitácora diaria en `docs/obsidian/daily/`.
  2. Redacta especificaciones en formato Markdown limpio en `docs/specs/`.

## CONFIGURACIÓN DE VARIABLES DE ENTORNO (.env)
- **Variables requeridas:** `OBSIDIAN_REST_API_KEY`.
- **Regla estricta:** Solicita actualizar únicamente `docs/.env` para sincronización de notas.

## 🔒 NORMAS GLOBALES DE GIT (ver `AGENTS.md` raíz)
- No commitear cambios triviales aislados; agrupar por bloque funcional completo.
- Mensajes concisos, profesionales, en español, con Conventional Commits. Cero "vibecoder".
- Solo pushear a `main` tras verificar compilación y funcionamiento.
