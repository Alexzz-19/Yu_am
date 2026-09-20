# CONTEXT.md — Estado actual de YU'AM v2.0

> Memoria operativa del proyecto. Refleja el stack, la estructura monorepo, el estado de CI/CD y las directivas multi-agente vigentes.

## 1. Identidad del proyecto

- **Nombre:** YU'AM v2.0 ("Vida, Alma y Salud" en Q'eqchi').
- **Misión:** Democratizar el conocimiento biotecnológico y la monitorización ambiental mediante interfaces inteligentes e IoT (ESP32 + MQ-135).
- **Alineación:** Plan Nacional de Desarrollo K'atun 2032 (Guatemala) y ODS 3, 4, 11, 12, 13.
- **Repositorio oficial:** `https://github.com/Alexzz-19/Yu_am.git` (rama `main`).
- **Rama de respaldo histórico:** `v1.0-prototype` (prototipo v1.0 preservado).

## 2. Stack actual

- **Frontend (`apps/web/`):** Next.js 16.3.5 (App Router, Turbopack), React 19.2.8, TypeScript 5 (estricto, `any` prohibido), Tailwind CSS 4, ESLint 9 + `eslint-config-next`.
- **Backend / DB (`packages/database/`):** Supabase (PostgreSQL + Realtime + RLS), cliente `@supabase/supabase-js` v2, scripts TypeScript (`client.ts`, `inspect.ts`), esquema en `packages/database/schema.sql` con `created_at` / `updated_at` y políticas RLS por tabla.
- **Documentación (`docs/`):** Especificaciones SDD en `docs/specs/`, Vault de Obsidian en `docs/obsidian/` (índice, log y notas diarias).
- **Orquestación MCP (`opencode.json`):** servidores `supabase` y `figma` como MCP locales, solo con interpolación de variables de entorno (`{env:...}`), sin secretos en texto plano.

## 3. Estructura monorepo

```text
Yu_am/
├── .ai/                       # Configuración de IA (cerebros del proyecto)
│   ├── AGENTS.md              # Cerebro global y directivas de Git
│   ├── CLAUDE.md              # Contexto para agentes Claude/IA
│   └── CONTEXT.md             # Este archivo (estado operativo)
├── .github/workflows/ci.yml  # CI: lint + tsc + build en apps/web
├── .agents/                   # Skills (frontend-design, web-artifacts-builder)
├── apps/
│   └── web/                   # Subagente Frontend (Next.js)
│       ├── AGENTS.md
│       ├── app/(page.tsx, dashboard/)
│       ├── lib/supabaseClient.ts
│       └── package.json
├── packages/
│   └── database/              # Subagente Backend (Supabase/PostgreSQL)
│       ├── AGENTS.md
│       ├── schema.sql
│       ├── client.ts
│       └── inspect.ts
├── docs/                      # Subagente Documentador (Obsidian/SDD)
│   ├── AGENTS.md
│   ├── obsidian/
│   └── specs/
├── opencode.json              # MCPs compartidas + rutas de subagentes
└── README.md                  # Instalación y clonado oficial
```

## 4. CI/CD y producción (`main`)

- **Integración continua (GitHub Actions):** `.github/workflows/ci.yml` activo en `push` y `pull_request` hacia `main`. Job `web` en `ubuntu-latest` con Node 20.x:
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` con caché npm (`apps/web/package-lock.json`)
  3. `npm ci`
  4. `npm run lint` (0 errores / 0 advertencias verificado en local)
  5. `npx tsc --noEmit` (estricto, exit 0)
  6. `npm run build` (compilación de producción verificada, rutas `/` y `/dashboard`)
- **Despliegue automático (Vercel):** conectado a la rama `main` del repositorio oficial; cada push a `main` que pase la CI despliega a producción. Sin `vercel.json` versionado (configuración por dashboard de Vercel).
- **Estado:** CI y despliegue configurados y funcionando sobre `main`.

## 5. Directivas multi-agente

- **OpenCode (motor CLI local, modo estricto):** ejecuta cambios, verificación (`lint`, `tsc`, `build`) y operaciones Git solo bajo orden explícita. Sin commits ni push autónomos.
- **LLM web (diseño, arquitectura y seguridad):** apoyo para UI/UX (Figma), modelado de datos/RLS y revisión de seguridad y privacidad (Privacy-by-Design, ofuscación de coordenadas).
- **Configuración de IA en `.ai/`:** `AGENTS.md` (cerebro global), `CLAUDE.md` (contexto Claude) y `CONTEXT.md` (estado operativo). `opencode.json` permanece en la raíz con `instructions: [".ai/AGENTS.md"]` y `references` hacia cada subagente.
- **Subagentes por ámbito:**
  - **Raíz (`/`):** Orquestador global — entorno, `opencode.json`, portabilidad multi-equipo y Git.
  - **`apps/web/`:** Frontend — Next.js, TypeScript estricto, Tailwind, Figma MCP. Solo `apps/web/.env.local`.
  - **`packages/database/`:** Backend — PostgreSQL, Supabase, RLS, PostgreSQL MCP. Solo `packages/database/.env`.
  - **`docs/`:** Documentador — SDD, Obsidian y bitácoras. Solo `docs/.env`.

## 6. Reglas de trabajo vigentes

- **Idioma:** español en documentación, bitácoras y mensajes de commit.
- **Git:** un solo commit por bloque funcional completo (no triviales aislados); mensajes Conventional Commits concisos en español, cero "vibecoder"; push a `main` únicamente tras verificación local y **solo cuando el usuario lo ordena explícitamente**.
- **Secretos:** ningún `.env` se versiona; solo plantillas `.env.example`. `opencode.json` sin claves en texto plano.
- **Últimos hitos en `main`:** `docs(readme)` URL oficial de clonado, `docs(agentes)` directivas de Git, `ci` workflow de verificación, `fix(web)` tipos `any` y variables sin uso para CI, `refactor(core)` monorepo estándar Fase 1.

## 8. Gobernanza en GitHub (Fase 2 — activa)
- **Plantilla de PR:** `.github/PULL_REQUEST_TEMPLATE.md` — exige resumen, tipo de cambio (`feat`/`fix`/`refactor`/`docs`/`chore`/`ci`), alcance por ámbito y checklist (lint + `tsc` + build limpios, sin secretos, bitácora actualizada, Conventional Commits en español).
- **Variables de ejemplo:** `apps/web/.env.example` documenta `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `FIGMA_ACCESS_TOKEN` solo con placeholders, sin valores reales.
- **Flujo:** todo cambio a `main` vía PR con checklist completo y CI en verde; commits directos a `main` solo por orden explícita del usuario.

## 7. Puesta en marcha rápida

```bash
git clone https://github.com/Alexzz-19/Yu_am.git
cd Yu_am
cd apps/web && npm install
cd ../../packages/database && npm install
cd ../../apps/web && npm run dev   # http://localhost:3000
```

Verificación local (en `apps/web/`): `npm run lint`, `npx tsc --noEmit`, `npm run build`.
