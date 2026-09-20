# ADR 0001 — Stack base: Next.js + Supabase + protocolo MCP

- **Estado:** Aceptado
- **Fecha:** 2026-09-19
- **Ámbito:** `apps/web`, `packages/database`, `opencode.json`

## Contexto

YU'AM v2.0 requiere un dashboard web en tiempo real sobre telemetría de fotobiorreactores (ESP32 + MQ-135: CO₂, temperatura, humedad) con ingesta tolerante a fallos de red, control de acceso por usuario y despliegue continuo desde `main`. El equipo es pequeño y multi-entorno (Linux/Windows, modelos de IA variables), por lo que se prioriza: mínimo backend propio que mantener, tiempo real sin infraestructura adicional, TypeScript estricto de extremo a extremo y herramientas de IA (OpenCode, LLM web) conectadas al proyecto mediante un protocolo estándar.

Alternativas consideradas: backend propio (Express/Fastify + PostgreSQL autogestionado), Firebase (Realtime DB + Auth) y stack desacoplado con API REST a medida.

## Decisión

1. **Frontend y hosting en Next.js (App Router) desplegado en Vercel**, con TypeScript estricto (`any` prohibido), Tailwind CSS y Server Components por defecto. La CI (`lint` + `tsc --noEmit` + `build`) es puerta obligatoria a `main`.
2. **Supabase como backend único**: PostgreSQL con Row Level Security en todas las tablas, Auth, Realtime para telemetría en vivo y `service_role` restringido a scripts de `packages/database/` (nunca expuesto al cliente). Esquema versionado en `packages/database/schema.sql` con `created_at`/`updated_at`.
3. **Protocolo MCP como interfaz de IA**: `opencode.json` declara servidores `supabase` y `figma` como MCP locales, alimentados exclusivamente por variables de entorno (`{env:...}`), sin secretos en texto plano. OpenCode opera como motor CLI local estricto; los LLM web apoyan diseño, arquitectura y seguridad.

## Consecuencias

- **Positivas:** sin servidores propios que operar; tiempo real y auth resueltos por plataforma; despliegue automático Vercel + CI en verde; IA conectada a datos y diseño vía MCP con secretos aislados en `.env` locales.
- **Negativas / riesgos:** acoplamiento a Supabase y Vercel (mitigado con esquema SQL versionado y RLS en la base, no solo en la app); costos/límites del tier de Supabase ante alta frecuencia de ingesta (mitigado con búfer local en ESP32 y agregación); `service_role` exige disciplina de secretos (mitigado con `.gitignore`, plantillas `*.example` y checklist de PR).
- **Seguimiento:** ADR futuros para estrategia de ingesta a escala, política de retención de telemetría y endurecimiento de RLS por rol.
