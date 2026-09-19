# CLAUDE.md — Instructions for Claude & AI Agents in YU'AM v2.0

> This file provides project-specific context and instructions for AI assistants working in the YU'AM repository.

## 🚀 Quick Context
- **Project:** YU'AM v2.0 (Biotechnology & Digital IoT Platform).
- **Official Repository:** `https://github.com/Alexzz-19/Yu_am.git`
- **Core Stack:** Next.js (App Router, TypeScript, Tailwind), Supabase (PostgreSQL), ESP32 IoT (MQ-135).
- **Main Docs:** See `AGENTS.md` for full architectural details and `docs/obsidian/` for the development log.

## 🤖 Multi-Agent Architecture
- **Root (`/`):** Global Orchestrator Agent (Environment, Git, `opencode.json`).
- **`web/`:** Frontend Subagent (Next.js, TypeScript, Tailwind CSS, Figma MCP).
- **`db/`:** Backend Subagent (PostgreSQL, Supabase, RLS, PostgreSQL MCP).
- **`docs/`:** Documentation Subagent (SDD specs, Obsidian Vault & daily logs).

## 🛠️ Development Guidelines
1. Follow existing project conventions and directory structure (`db/`, `web/`, `docs/`).
2. Adhere to Privacy-by-Design principles (obfuscate IoT node coordinates in public maps).
3. Update the daily log in `docs/obsidian/daily/2026-09-15.md` (or current date) and `AGENTS.md` after significant changes.
4. Use conventional commits (`feat:`, `fix:`, `chore:`, `docs:`).
