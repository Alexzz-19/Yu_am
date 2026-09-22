# Pull Request — YU'AM v2.0

## Description
<!-- Concise summary of what changes and why. / Resumen conciso de qué cambia y por qué. -->

## Type of change
<!-- Check with an `x` the matching type. Only one per PR. / Marca con una `x` el tipo que corresponda. Solo uno por PR. -->
- [ ] `feat` — New feature / Nueva funcionalidad
- [ ] `fix` — Bug fix / Corrección de bug
- [ ] `refactor` — Refactor without behavior change / Refactor sin cambio de comportamiento
- [ ] `docs` — Documentation only / Solo documentación
- [ ] `chore` / `ci` — Maintenance, dependencies or CI/CD / Mantenimiento, dependencias o CI/CD

## Scope / Alcance
<!-- Check the affected areas. / Marca los ámbitos afectados. -->
- [ ] `apps/web` (Next.js frontend)
- [ ] `packages/database` (Supabase / PostgreSQL)
- [ ] `docs/` (Documentation / Documentación, Obsidian)
- [ ] `.ai/` / `opencode.json` (AI configuration / Configuración de IA)
- [ ] `.github/` (CI/CD & governance / gobernanza)

## Checklist
<!-- Every PR to `main` must meet these before review. / Todo PR a `main` debe cumplir estos puntos antes de revisión. -->
- [ ] `npm run lint` in `apps/web` passes with no errors or warnings
- [ ] `npx tsc --noEmit` in `apps/web` passes (strict TypeScript, no `any`)
- [ ] `npm run build` in `apps/web` compiles successfully
- [ ] No secrets or keys in the diff (placeholders in `*.example` only)
- [ ] Daily log updated in `docs/obsidian/daily/` if the change is relevant
- [ ] Merge/squash message follows Conventional Commits (concise, professional)

## Related Issue
<!-- Link the related issue, if any. / Enlaza el issue relacionado, si existe. -->
- Closes #

## Evidence
<!-- Screenshots, CI logs or manual verification steps. / Capturas, logs de CI o pasos de verificación manual. -->
