English | [Español](./README.es.md)

# YU'AM v2.0 — Real-time telemetry and control for photobioreactors

[![CI](https://github.com/Alexzz-19/Yu_am/actions/workflows/ci.yml/badge.svg)](https://github.com/Alexzz-19/Yu_am/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5_strict-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Real-time telemetry and control system for photobioreactors. Monorepo-based architecture with IoT data ingestion and a Next.js web dashboard.

## Architecture

```mermaid
flowchart TB
    subgraph IoT["IoT Layer"]
        ESP32["ESP32 + MQ-135<br/>CO₂ · Temp · Humidity<br/>local buffer"]
    end
    subgraph Mono["Yu_am Monorepo"]
        AW["apps/web<br/>Next.js 16 · React 19<br/>Dashboard + Realtime"]
        PDB["packages/database<br/>schema.sql · RLS<br/>TS clients"]
        DOCS["docs/<br/>ADRs · Obsidian"]
    end
    subgraph Cloud["Services"]
        SUP[("Supabase<br/>PostgreSQL · Auth<br/>Realtime · RLS")]
        VERCEL["Vercel<br/>deploy from main"]
        CI["GitHub Actions<br/>lint · tsc · build"]
    end
    ESP32 -->|"INSERT telemetry"| SUP
    AW <-->|"supabase-js · Realtime"| SUP
    PDB -->|"migrations / policies"| SUP
    AW -->|"push to main"| CI
    CI -->|"green"| VERCEL
    VERCEL -->|"serves"| AW
```

## Monorepo structure

```text
Yu_am/
├── .ai/                     # AI configuration (AGENTS.md, CLAUDE.md, CONTEXT.md)
├── .github/workflows/ci.yml # CI: lint + tsc + build in apps/web
├── apps/web/                # Next.js frontend (App Router, strict TS, Tailwind)
├── packages/database/       # PostgreSQL schema, RLS and Supabase clients (TS)
└── docs/                    # ADRs, deploy guides and Obsidian Vault
```

## Prerequisites

- Node.js 20.x and npm
- Git
- A Supabase project (URL + anon key)

## Local install and run

```bash
# 1. Clone
git clone https://github.com/Alexzz-19/Yu_am.git
cd Yu_am

# 2. Frontend and backend dependencies (Supabase scripts)
npm install --prefix apps/web
npm install --prefix packages/database

# 3. Frontend environment variables
cp apps/web/.env.example apps/web/.env.local
# Edit apps/web/.env.local with your real Supabase URL and anon key

# 4. Dev server
npm run dev --prefix apps/web
# http://localhost:3000
```

## Verification (gateway to `main`)

```bash
cd apps/web
npm run lint        # ESLint, 0 errors / 0 warnings
npx tsc --noEmit    # Strict TypeScript, no `any`
npm run build       # Production build
```

Every PR to `main` must bring this checklist green (see `.github/PULL_REQUEST_TEMPLATE.md`).

## Environment variables

| Variable | Scope | Source |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `apps/web/.env.local` | Supabase > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `apps/web/.env.local` | Supabase > Project Settings > API (anon) |
| `FIGMA_ACCESS_TOKEN` | `apps/web/.env.local` (local only) | Figma > Account Settings > Personal tokens |
| `SUPABASE_SERVICE_ROLE_KEY` | `packages/database/.env` (never client-side) | Supabase > Project Settings > API (service_role) |

No `.env` file is versioned; only `*.example` templates.

## Architecture decisions (ADRs)

- [`docs/adr/0001-stack-base-y-mcp.md`](docs/adr/0001-stack-base-y-mcp.md) — Next.js + Supabase + MCP protocol.

## Project context

- **Domain:** biotechnology and environmental IoT (MILAB / YU'AM, "Life, Soul and Health" in Q'eqchi').
- **Alignment:** Guatemala's K'atun 2032 National Development Plan, SDGs 3, 4, 11, 12 and 13.
- **Privacy:** Privacy-by-Design — node coordinates obfuscated in public views.
- **AI governance:** see `.ai/AGENTS.md` (global brain) and `.ai/CONTEXT.md` (operating status).

## Support

- **Technical support:** `bionexo_support@proton.me`
- **Contribution review:** YU'AM Library / MILAB
