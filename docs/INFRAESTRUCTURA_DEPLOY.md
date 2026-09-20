# INFRAESTRUCTURA Y DESPLIEGUE CONTINUO (CI/CD) — YU'AM v2.0

## 1. Visión General
La arquitectura de despliegue y entrega continua (CI/CD) de YU'AM v2.0 está diseñada para garantizar calidad de código mediante validaciones automáticas en GitHub Actions y despliegues optimizados en la plataforma Vercel para la aplicación Frontend en Next.js.

## 2. Flujo de Integración Continua (GitHub Actions: `ci.yml`)
El flujo automatizado se ejecuta en cada `push` o `pull_request` sobre la rama `main`, aplicando las siguientes verificaciones:
- **Linting:** Validación de estilos y reglas de código (`npm run lint`).
- **Type-Checking:** Verificación estricta de tipos en TypeScript (`tsc --noEmit`).
- **Build de Producción:** Compilación exitosa del proyecto Next.js (`npm run build`).

### Ejemplo de Configuración (`.github/workflows/ci.yml`)
```yaml
name: CI/CD Pipeline - YU'AM v2.0

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: ./web

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Lint Code
        run: npm run lint

      - name: Type Check
        run: npx tsc --noEmit

      - name: Build Application
        run: npm run build
```

## 3. Configuración y Despliegue en Vercel
El frontend de YU'AM está conectado a Vercel para despliegue continuo automático:
- **Rama de Producción:** `main`.
- **Directorio Raíz del Proyecto (Root Directory):** `web/`.
- **Framework Preset:** Next.js.

### Variables de Entorno Configuradas en Vercel
Para el correcto funcionamiento en producción, se configuran las siguientes variables de entorno en el panel de Vercel (Production, Preview y Development):
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase (Backend/Base de Datos PostgreSQL).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave pública anónima de Supabase para clientes web.
- `FIGMA_ACCESS_TOKEN`: Token de integración con Figma MCP para sincronización de diseño y componentes UI/UX.

## 4. Estrategia de Despliegue Continuo
1. Los cambios se desarrollan bajo control de versiones estricto (Conventional Commits).
2. Se valida localmente y mediante GitHub Actions (`ci.yml`).
3. Al realizar merge o push a `main`, Vercel compila y despliega automáticamente la nueva versión en producción sin tiempo de inactividad.
