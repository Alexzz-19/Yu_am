# AGENTS.md — Cerebro del Proyecto YU'AM v2.0

> Memoria e instrucciones técnicas para agentes de IA (OpenCode, Claude, etc.) que trabajen en este repositorio.

## 🧬 Identidad y Contexto del Proyecto
- **Nombre:** YU'AM ("Vida, Alma y Salud" en Q'eqchi').
- **Misión:** Democratizar el conocimiento biotecnológico y la monitorización ambiental mediante interfaces inteligentes e IoT, optimizando la captura de CO2 y la investigación de cultivos biológicos.
- **Alineación:** Plan Nacional de Desarrollo K'atun 2032 (Guatemala) y ODS 3, 4, 11, 12, 13.
- **Entorno:** Ubuntu / Linux Mint (CPU-only), Node.js, Next.js, Supabase, ESP32 + MQ-135.

## 🛠️ Stack Tecnológico
- **Frontend:** Next.js (App Router, TypeScript, Tailwind CSS, Breadcrumbs).
- **Backend / DB:** Supabase (PostgreSQL, Autenticación, Realtime, RLS).
- **IoT:** ESP32 + Sensor MQ-135 (con búfer local ante fallas de red).
- **Seguridad y Privacidad:** reCAPTCHA, API Keys (máx 4 por usuario), Privacy-by-Design (ofuscación de coordenadas geográficas).

## 📂 Mapa de Carpetas
```text
YU_AM/
├── docs/
│   ├── Informe_YUAM_Biotecnologia.pdf
│   └── obsidian/              # Integración con Obsidian Vault
│       ├── 00_Index_YUAM.md
│       ├── Log_Desarrollo.md
│       └── daily/
│           └── 2026-09-15.md
├── db/                        # Esquemas SQL y políticas de Supabase
│   └── schema.sql
└── web/                       # Aplicación Next.js (App Router)
    └── README.md
```

## 📜 Reglas de Trabajo y Convenciones
- **Idioma:** Español en documentación, bitácoras y comentarios clave.
- **Commits y Sincronización:** Mensajes claros siguiendo Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`). **Regla estricta:** Todo cambio o feature completada debe ser commiteado y pusheado inmediatamente al repositorio remoto en GitHub (`origin main`).
- **Privacidad:** Nunca exponer coordenadas reales de nodos IoT en mapas públicos (Privacy-by-Design).
- **Actualización de Bitácora:** Al finalizar cada sesión o cambio importante, actualizar obligatoriamente `docs/obsidian/daily/YYYY-MM-DD.md` y registrarlo en este archivo.

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
