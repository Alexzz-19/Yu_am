# Log de Desarrollo — YU'AM v2.0

Registro histórico de hitos y decisiones técnicas del proyecto.

---

## [15/09/2026] — Hito 1: Inicialización y Estructura Full-Stack
- **Ubicación:** Establecimiento de la ruta definitiva en `~/Documentos/MILAB/YU_AM`.
- **Control de Versiones:** Repositorio Git inicializado con rama principal `main`.
- **Base de Datos:** Creación del esquema inicial en Supabase (`db/schema.sql`) contemplando perfiles, catálogo de 35 avatares, nodos IoT y telemetría MQ-135 con RLS.
- **Memoria de IA:** Configuración de `AGENTS.md` y `CLAUDE.md` para persistencia contextual entre múltiples agentes.
- **Obsidian:** Creación de la estructura de documentación en `docs/obsidian/`.
- **Documentación:** Generación del `README.md` profesional en español con guías de instalación, requisitos y variables de entorno para el repositorio privado `YU_AM`.
- **Frontend & Supabase:** Scaffolding de Next.js (App Router, Tailwind CSS, TypeScript) en `web/`, instalación de `@supabase/supabase-js`, creación de `web/lib/supabaseClient.ts` y archivo `.env.local.example`.
- **Git & GitHub:** Enlace de origen remoto con `Alexzz-19/YU_AM`.
