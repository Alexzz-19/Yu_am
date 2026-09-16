# YU'AM | Biotecnología & Plataforma Digital (Versión 2.0)

> Plataforma científica y tecnológica orientada a la convergencia entre la biología aplicada y el desarrollo de software de vanguardia. Término de origen **Q'eqchi'** que condensa los pilares de **"Vida, Alma y Salud"**.

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![ESP32](https://img.shields.io/badge/IoT-ESP32%20%2B%20MQ--135-blue?style=flat&logo=arduino)](https://www.espressif.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 1. Nombre del Proyecto
- **MILAB / YU'AM** (Versión 2.0)

## 2. ¿Qué hace este proyecto?
**YU'AM** es una plataforma científica y tecnológica que democratiza el conocimiento biotecnológico y la monitorización ambiental. Resuelve la necesidad de optimizar la captura de CO₂ y la investigación de cultivos biológicos mediante interfaces inteligentes conectadas a dispositivos IoT (ESP32 con sensor MQ-135). 

Está alineado estratégicamente con el **Plan Nacional de Desarrollo K'atun 2032 de Guatemala** y los **Objetivos de Desarrollo Sostenible (ODS 3, 4, 11, 12 y 13)**.

## 3. Tecnologías Usadas
- **Frontend:** Next.js (App Router, TypeScript, Tailwind CSS, Breadcrumbs).
- **Backend & Base de Datos:** Supabase (PostgreSQL, Autenticación, Realtime, Row Level Security).
- **Hardware IoT:** ESP32 + Sensor MQ-135 (con búfer local ante fallas de red).
- **Seguridad y Privacidad:** reCAPTCHA, API Keys (máx 4 por usuario), Privacy-by-Design (ofuscación de coordenadas geográficas).

## 4. Requisitos Previos
Para ejecutar y desarrollar este proyecto en tu entorno local, asegúrate de tener instalado:
- **Node.js** (v18.0 o superior)
- **npm** o gestor de paquetes compatible
- **Git**
- Cuenta y proyecto configurado en **Supabase**

## 5. Cómo Instalarlo y Ejecutarlo

### Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/YU_AM.git
cd YU_AM
```

### Instalación
Navega al directorio del frontend y descarga las dependencias:
```bash
cd web
npm install
```

### Ejecución
Para iniciar el servidor de desarrollo local de Next.js:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

## 6. Variables de Entorno
Crea un archivo `.env.local` en la raíz de la carpeta `web/` con las siguientes variables requeridas (sin incluir valores reales):

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase_aqui
```

---

## 📂 Estructura del Repositorio
```text
YU_AM/
├── docs/           # Documentación técnica oficial y Vault de Obsidian
├── db/             # Esquemas relacionales y políticas de Supabase (SQL)
└── web/            # Aplicación Frontend en Next.js (App Router)
```

## ✉️ Soporte y Contacto
- **Soporte técnico:** `bionexo_support@proton.me`
- **Revisión de aportes:** Biblioteca YU'AM / MILAB
