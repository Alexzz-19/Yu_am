# SUBAGENTE FRONTEND — YU'AM v2.0
- **Ámbito:** Exclusivamente la carpeta `/web` (Next.js, React, Tailwind CSS).
- **Reglas:**
  1. Utiliza Server Components por defecto. Usa `'use client'` únicamente cuando requieras estado o eventos del navegador.
  2. Sigue la especificación de diseño visual definida en `../design.md` y la skill `.agents/skills/frontend-design`.
  3. No modifiques archivos fuera de la carpeta `web/`.

## CONFIGURACIÓN DE VARIABLES DE ENTORNO (.env.local)
- **Variables requeridas:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `FIGMA_ACCESS_TOKEN`.
- **Regla estricta:** Si falta una clave visual o de Supabase, solicita actualizar únicamente `web/.env.local`. Nunca pidas credenciales del Backend.
