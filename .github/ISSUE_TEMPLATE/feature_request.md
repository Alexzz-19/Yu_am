name: "✨ Feature request / Solicitud de funcionalidad"
description: "Propose a module, sensor or photobioreactor model / Propón un módulo, sensor o modelo de fotobiorreactor"
labels: ["enhancement", "triage"]
body:
  - type: markdown
    attributes:
      value: "## English / Español\nComplete in either language. / Completa en cualquiera de los dos idiomas."

  - type: dropdown
    id: kind
    attributes:
      label: "Request kind / Tipo de solicitud"
      options:
        - "Web module (apps/web) / Módulo web"
        - "Sensor / telemetry ingestion / Sensor / ingesta de telemetría"
        - "Photobioreactor model / Modelo de fotobiorreactor"
        - "Database / RLS policy / Base de datos / política RLS"
        - "Docs / governance / Documentación / gobernanza"
    validations:
      required: true

  - type: textarea
    id: problem
    attributes:
      label: "Problem / Problema"
      description: "Which need does it solve? Link K'atun 2032 / SDG alignment if relevant. / ¿Qué necesidad resuelve?"
    validations:
      required: true

  - type: textarea
    id: proposal
    attributes:
      label: "Proposal / Propuesta"
      description: "Scope, affected tables/endpoints, privacy impact (node coordinates). / Alcance, tablas/endpoints, impacto en privacidad."
      placeholder: "New MQ-137 ammonia sensor → readings.ammonia_ppm (nullable), RLS unchanged, dashboard card…"
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: "Alternatives considered / Alternativas consideradas"
    validations:
      required: false

  - type: checkboxes
    id: checklist
    attributes:
      label: "Acceptance hints / Pistas de aceptación"
      options:
        - label: "Fits monorepo scopes (`apps/web`, `packages/database`) / Encaja en los scopes del monorepo"
        - label: "Privacy-by-Design preserved (coordinate obfuscation) / Privacidad preservada"
        - label: "Documentable in docs/adr if architectural / Documentable en ADR si es arquitectural"
