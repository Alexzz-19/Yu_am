name: "🐛 Bug report / Reporte de bug"
description: "Report a reproducible defect / Reporta un defecto reproducible"
labels: ["bug", "triage"]
body:
  - type: markdown
    attributes:
      value: "## English / Español\nComplete in either language. / Completa en cualquiera de los dos idiomas."

  - type: dropdown
    id: scope
    attributes:
      label: "Scope / Alcance"
      options:
        - "apps/web (Next.js frontend)"
        - "packages/database (Supabase / PostgreSQL)"
        - "docs/ (Documentation / Documentación)"
        - ".ai/ / opencode.json (AI config)"
        - ".github/ (CI/CD & governance)"
        - "IoT firmware (ESP32 + MQ-135)"
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: "Description / Descripción"
      description: "What happened and what did you expect? / ¿Qué ocurrió y qué esperabas?"
      placeholder: "Telemetry table renders stale values after Realtime reconnect…"
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: "Steps to reproduce / Pasos para reproducir"
      description: "Numbered steps, environment and commands. / Pasos numerados, entorno y comandos."
      placeholder: "1. cd apps/web && npm run dev\n2. Open /dashboard …"
    validations:
      required: true

  - type: textarea
    id: evidence
    attributes:
      label: "Evidence / Evidencia"
      description: "Logs, screenshots, CI run link. Never paste secrets. / Logs, capturas, enlace de CI. Nunca pegues secretos."
    validations:
      required: false

  - type: checkboxes
    id: checklist
    attributes:
      label: "Pre-check / Verificación previa"
      options:
        - label: "I ran `npm run lint` and `npx tsc --noEmit` in `apps/web` / Ejecuté lint y tsc en `apps/web`"
        - label: "No secrets included / Sin secretos incluidos"
