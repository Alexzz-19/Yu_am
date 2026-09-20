# AGENTS.md — Cerebro del Proyecto YU'AM v2.0

> Memoria e instrucciones técnicas para agentes de IA (OpenCode, Claude, etc.) que trabajen en este repositorio.

## 🧬 Identidad y Contexto del Proyecto
- **Nombre:** YU'AM ("Vida, Alma y Salud" en Q'eqchi').
- **Misión:** Democratizar el conocimiento biotecnológico y la monitorización ambiental mediante interfaces inteligentes e IoT, optimizando la captura de CO2 y la investigación de cultivos biológicos.
- **Alineación:** Plan Nacional de Desarrollo K'atun 2032 (Guatemala) y ODS 3, 4, 11, 12, 13.
- **Entorno:** Ubuntu / Linux Mint (CPU-only), Node.js, Next.js, Supabase, ESP32 + MQ-135.

## 🤖 Arquitectura Multiagente y Responsabilidades
- **Raíz (`/`):** Agente Orquestador Global — Gestión general, configuración de entorno (`opencode.json`), portabilidad multi-equipo y control de versiones Git.
- **`apps/web/`:** Subagente Frontend — Aplicación web en Next.js (App Router, TypeScript estricto, Tailwind CSS, integración Figma MCP).
- **`packages/database/`:** Subagente Backend — Gestión de esquemas PostgreSQL, políticas RLS, cliente Supabase y conexión PostgreSQL MCP.
- **`docs/`:** Subagente Documentador — Especificaciones técnicas SDD, vault de Obsidian y bitácoras diarias de desarrollo.

## 🛠️ Stack Tecnológico y Repositorio Oficial
- **Repositorio Oficial:** `https://github.com/Alexzz-19/Yu_am.git`
- **Frontend:** Next.js (App Router, TypeScript, Tailwind CSS, Breadcrumbs).
- **Backend / DB:** Supabase (PostgreSQL, Autenticación, Realtime, RLS).
- **IoT:** ESP32 + Sensor MQ-135 (con búfer local ante fallas de red).
- **Seguridad y Privacidad:** reCAPTCHA, API Keys (máx 4 por usuario), Privacy-by-Design (ofuscación de coordenadas geográficas).

## 📂 Mapa de Carpetas
```text
Yu_am/
├── .ai/                       # Configuración de IA (AGENTS.md, CLAUDE.md, CONTEXT.md)
├── .github/workflows/ci.yml   # CI sobre apps/web
├── apps/
│   └── web/                   # Aplicación Next.js (App Router) + Subagente Frontend
├── packages/
│   └── database/              # Esquemas SQL y políticas de Supabase + Subagente Backend
│       └── schema.sql
└── docs/                      # Documentación y Obsidian Vault + Subagente Documentador
    ├── Informe_YUAM_Biotecnologia.pdf
    └── obsidian/
        ├── 00_Index_YUAM.md
        ├── Log_Desarrollo.md
        └── daily/
```

## 📜 Reglas de Trabajo y Convenciones
- **Idioma:** Español en documentación, bitácoras y comentarios clave.
- **Privacidad:** Nunca exponer coordenadas reales de nodos IoT en mapas públicos (Privacy-by-Design).
- **Actualización de Bitácora:** Al finalizar cada sesión o cambio importante, actualizar obligatoriamente `docs/obsidian/daily/YYYY-MM-DD.md` y registrarlo en este archivo.

## 🔒 Directivas Estrictas de Git & Commits
1. **Frecuencia de commits:**
   - NO hagas commits por cambios mínimos o triviales individuales.
   - Agrupa los cambios y realiza UN solo commit ÚNICAMENTE al completar un bloque de trabajo lógico o una tarea funcional completa (ejemplo: terminada una pantalla, arreglado un bug entero, o finalizada la documentación de un módulo).
2. **Estilo y mensajes de commit (cero "vibecoder"):**
   - Prohibidos mensajes genéricos o automáticos repetitivos.
   - Los mensajes deben ser concisos, profesionales y redactados en español claro en el cuerpo o prefijo.
   - Utiliza verbos de acción directos y Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`). Ejemplos aceptables:
     - `feat(web): implementar tarjetas de telemetría en el dashboard`
     - `fix(db): corregir política RLS para lectura de sensores`
     - `docs: actualizar instrucciones de instalación en README`
3. **Autonomía:**
   - Mantén el código local editable. Solo solicita o ejecuta `git push` a `main` tras verificar que los cambios compilan y funcionan correctamente.

---

## 📅 Bitácora de Avances (Changelog Diario)

### 15/09/2026 — Inicialización y Arquitectura v2.0
- **Estructura del Proyecto:** Creación de la carpeta oficial `~/Documentos/MILAB/YU_AM` e inicialización del repositorio Git local (`main`).
- **Base de Datos:** Definición del esquema relacional en `db/schema.sql` (tablas de perfiles, avatares, nodos IoT y telemetría MQ-135 con soporte RLS).
- **Documentación & Obsidian:** Configuración de la estructura en `docs/obsidian/`, índice general, log de desarrollo y nota diaria inicial.
- **Configuración de IA:** Creación de `AGENTS.md` y `CLAUDE.md` para persistencia de contexto multi-agente.
- **Frontend & Repositorio Remoto:** Scaffolding de Next.js (App Router, Tailwind CSS, TypeScript), integración del cliente Supabase y vinculación y sincronización exitosa con el repositorio remoto privado en GitHub (`Alexzz-19/YU_AM`).

## ENTORNO DINÁMICO Y MODELOS DE IA
- **Entorno Multi-Equipo:** El proyecto se desarrolla en múltiples máquinas y distribuciones Linux/Windows.
- **Modelos Locales Variables:** El proveedor o modelo de IA (OpenCode, DeepSeek, Claude, Gemini u modelos locales en Ollama) puede variar según el equipo activo.
- **Regla de Portabilidad:** No asumas rutas absolutas fijas fuera de `~/Documentos/MILAB/YU_AM` ni dependas de configuraciones exclusivas del sistema operativo local. Toda ruta debe ser relativa a la raíz del repositorio.
