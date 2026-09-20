# Pull Request — YU'AM v2.0

## Resumen del cambio
<!-- Describe de forma concisa qué cambia y por qué. En español claro. -->

## Tipo de cambio
<!-- Marca con una `x` el tipo que corresponda. Solo uno por PR. -->
- [ ] `feat` — Nueva funcionalidad
- [ ] `fix` — Corrección de bug
- [ ] `refactor` — Refactor sin cambio de comportamiento
- [ ] `docs` — Solo documentación
- [ ] `chore` / `ci` — Mantenimiento, dependencias o CI/CD

## Alcance
<!-- Marca los ámbitos afectados. -->
- [ ] `apps/web` (Frontend Next.js)
- [ ] `packages/database` (Supabase / PostgreSQL)
- [ ] `docs/` (Documentación / Obsidian)
- [ ] `.ai/` / `opencode.json` (Configuración de IA)
- [ ] `.github/` (CI/CD y gobernanza)

## Lista de verificación
<!-- Todo PR a `main` debe cumplir estos puntos antes de pedir revisión. -->
- [ ] `npm run lint` en `apps/web` sin errores ni advertencias
- [ ] `npx tsc --noEmit` en `apps/web` sin errores (TypeScript estricto, sin `any`)
- [ ] `npm run build` en `apps/web` compila correctamente
- [ ] Sin secretos ni claves en el diff (solo placeholders en `*.example`)
- [ ] Bitácora actualizada en `docs/obsidian/daily/` si el cambio es relevante
- [ ] El mensaje de merge/squash sigue Conventional Commits en español

## Evidencia
<!-- Capturas, logs de CI o pasos de verificación manual. -->
