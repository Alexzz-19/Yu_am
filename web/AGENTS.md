# SUBAGENTE FRONTEND — YU'AM v2.0
- **Ámbito:** Exclusivamente la carpeta `/web` (Next.js, React, Tailwind CSS).
- **Reglas:**
  1. Utiliza Server Components por defecto. Usa `'use client'` únicamente cuando requieras estado o eventos del navegador.
  2. Sigue la especificación de diseño visual definida en `../design.md` y la skill `.agents/skills/frontend-design`.
  3. No modifiques archivos fuera de la carpeta `web/`.

## CONFIGURACIÓN DE VARIABLES DE ENTORNO (.env.local)
- **Variables requeridas:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `FIGMA_ACCESS_TOKEN`.
- **Regla estricta:** Si falta una clave visual o de Supabase, solicita actualizar únicamente `web/.env.local`. Nunca pidas credenciales del Backend.

## ESTÁNDAR DE CÓDIGO
- **Lenguaje:** TypeScript obligatorio (`.tsx` para componentes, `.ts` para utilidades/hooks).
- **Tipado Estricto:** Prohibido el uso de `any`. Define interfaces/tipos para la telemetría (malla de sensores, estado del reactor y métricas MQ-135).
- **Consumo Supabase:** Generar o utilizar tipos derivados directamente del esquema de Supabase (`Database['public']['Tables']['readings']['Row']`).

## 🔒 NORMAS GLOBALES DE GIT (ver `AGENTS.md` raíz)
- No commitear cambios triviales aislados; agrupar por bloque funcional completo.
- Mensajes concisos, profesionales, en español, con Conventional Commits. Cero "vibecoder".
- Solo pushear a `main` tras verificar compilación y funcionamiento.
