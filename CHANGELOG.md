# Changelog

All notable changes to YU'AM v2.0 are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0-alpha] - 2026-09-22

### Added
- Standard monorepo layout: `apps/web` (Next.js frontend), `packages/database` (Supabase/PostgreSQL), `docs/`, AI config in `.ai/`.
- GitHub Actions CI (`lint`, strict `tsc --noEmit`, production `build`) with Supabase secrets injection.
- Repository governance: `main` branch protection (mandatory PR + `web` status check) and bilingual PR template with verification checklist.
- Quality gates: husky + lint-staged pre-commit hook and zero-dependency smoke tests (`node:test`, 3/3 green).
- Senior documentation: badges + Mermaid architecture README (EN/ES dual-language), ADR `0001-stack-base-y-mcp`, `mcp-guide.md`.
- Dual-language support: primary English `README.md` with Spanish `README.es.md` cross-navigation.

### Fixed
- Removed explicit `any` types and unused variables in the IoT dashboard to pass CI linting.
- Robust Supabase client validation to fail fast instead of failing silently on missing env vars.
