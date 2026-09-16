# YU'AM Frontend (Next.js App Router)

Esta carpeta contendrá la aplicación frontend desarrollada en **Next.js** con App Router, TypeScript y Tailwind CSS.

## Estructura planificada (App Router):
- `app/`
  - `layout.tsx` (Layout principal con navegación limpia y Breadcrumbs)
  - `page.tsx` (Landing / Inicio)
  - `biblioteca/` (Rutas jerárquicas: `/biblioteca/biotecnologia/...`)
  - `dashboard/` (Monitoreo de nodos IoT y avatares)
  - `onboarding/` (Tour guiado interactivo)

## Comando de inicialización (para cuando se ejecute):
\`\`\`bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
\`\`\`
