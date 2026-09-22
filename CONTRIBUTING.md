# Contributing to YU'AM v2.0

[English](#english) | [Español](#español)

---

<a id="english"></a>
## English

Thank you for contributing to YU'AM — real-time telemetry and control for photobioreactors. This project follows a strict monorepo workflow enforced by CI (lint + strict TypeScript + production build).

### Monorepo workflow

```bash
# 1. Clone and install
git clone https://github.com/Alexzz-19/Yu_am.git
cd Yu_am
npm install --prefix apps/web
npm install --prefix packages/database

# 2. Environment (placeholders only in repo)
cp apps/web/.env.example apps/web/.env.local

# 3. Develop inside apps/web
cd apps/web
npm run dev        # http://localhost:3000
npm run lint       # 0 errors / 0 warnings required
npx tsc --noEmit   # strict, no `any`
npm run build      # must compile
```

### Branch naming

| Prefix | Use | Example |
|---|---|---|
| `feat/` | New feature | `feat/telemetry-cards` |
| `fix/` | Bug fix | `fix/rls-sensor-read` |
| `docs/` | Documentation only | `docs/adr-ingestion` |
| `chore/` | Maintenance, CI, deps | `chore/husky-hooks` |
| `refactor/` | No behavior change | `refactor/supabase-client` |
| `ci/` | CI/CD pipelines | `ci/vercel-root-dir` |

### Conventional Commits (concise, professional)

Format: `<type>(<scope>): <imperative description in English or Spanish>`

- Scopes: `apps/web`, `database`, `repo`, `ai`, `ci`.
- Examples: `feat(apps/web): add CO2 telemetry cards`, `fix(database): correct sensor RLS policy`.
- One commit per complete logical block — never commit trivial fragments in isolation.
- Open a PR against `main` with `.github/PULL_REQUEST_TEMPLATE.md` fully checked and CI green.

---

<a id="español"></a>
## Español

Gracias por contribuir a YU'AM — telemetría y control en tiempo real para fotobiorreactores. El proyecto sigue un flujo monorepo estricto verificado por CI (lint + TypeScript estricto + build de producción).

### Flujo monorepo

```bash
# 1. Clonar e instalar
git clone https://github.com/Alexzz-19/Yu_am.git
cd Yu_am
npm install --prefix apps/web
npm install --prefix packages/database

# 2. Entorno (solo placeholders en el repo)
cp apps/web/.env.example apps/web/.env.local

# 3. Desarrollar dentro de apps/web
cd apps/web
npm run dev        # http://localhost:3000
npm run lint       # 0 errores / 0 advertencias obligatorio
npx tsc --noEmit   # estricto, sin `any`
npm run build      # debe compilar
```

### Nomenclatura de ramas

| Prefijo | Uso | Ejemplo |
|---|---|---|
| `feat/` | Nueva funcionalidad | `feat/tarjetas-telemetria` |
| `fix/` | Corrección de bug | `fix/lectura-rls-sensores` |
| `docs/` | Solo documentación | `docs/adr-ingesta` |
| `chore/` | Mantenimiento, CI, deps | `chore/hooks-husky` |
| `refactor/` | Sin cambio de comportamiento | `refactor/cliente-supabase` |
| `ci/` | Pipelines CI/CD | `ci/root-dir-vercel` |

### Conventional Commits (concisos, profesionales)

Formato: `<tipo>(<alcance>): <descripción imperativa en inglés o español>`

- Alcances: `apps/web`, `database`, `repo`, `ai`, `ci`.
- Ejemplos: `feat(apps/web): implementar tarjetas de telemetría`, `fix(database): corregir política RLS de sensores`.
- Un commit por bloque lógico completo — nunca fragmentos triviales aislados.
- Abre un PR hacia `main` con `.github/PULL_REQUEST_TEMPLATE.md` completo y CI en verde.
