# YU'AM | Biotecnología & Plataforma Digital (Versión 2.0)

> Plataforma científica y tecnológica orientada a la convergencia entre la biología aplicada y el desarrollo de software de vanguardia.

Termino de origen **Q'eqchi'** que condensa los pilares de **"Vida, Alma y Salud"**.

---

## 🎯 Misión y Visión

- **Misión:** Democratizar el conocimiento biotecnológico y la monitorización ambiental mediante interfaces inteligentes e IoT, optimizando la captura de CO2 y la investigación de cultivos biológicos.
- **Visión:** Convertirse en un estándar de infraestructura digital y educativa de biorremediación activa, directamente alineado con el **Plan Nacional de Desarrollo K'atun 2032 de Guatemala** y los **Objetivos de Desarrollo Sostenible (ODS 3, 4, 11, 12 y 13)**.

---

## 🏗️ Arquitectura Full-Stack (Versión 2.0)

| Capa / Módulo | Tecnología / Enfoque | Propósito Operativo |
| :--- | :--- | :--- |
| **Frontend** | Next.js (React) | Interfaz de alto rendimiento, SEO técnico, arquitectura de rutas jerárquicas limpias y Breadcrumbs. |
| **Backend & Data** | Supabase (PostgreSQL) | Base de datos relacional, autenticación segura y almacenamiento de métricas biológicas y físicas. |
| **Hardware IoT** | ESP32 + Sensor MQ-135 | Captura continua de calidad del aire y variables del cultivo con búfer de memoria local ante fallas de red. |
| **Control de Versiones** | Git / GitHub (Privado) | Control de versiones seguro, gestión de observaciones y resguardo de variables de entorno (`.env`). |
| **Privacidad** | Privacy-by-Design | Ofuscación automatizada de coordenadas geográficas en el mapa público de nodos. |
| **Seguridad** | reCAPTCHA + API Keys | Filtrado estricto contra bots en registros; asignación de 1 API Key inicial por usuario (hasta 4 por uso regular). |
| **Analítica** | Exportación Múltiple | Generación de reportes científicos (diario, semanal, mensual) en formatos CSV, XLSX y PDF. |

---

## 📂 Estructura del Repositorio

```text
YU_AM/
├── docs/           # Documentación técnica oficial (Informe YUAM PDF, etc.)
├── db/             # Esquemas relacionales y políticas de Supabase (SQL)
└── web/            # Aplicación Frontend en Next.js (App Router)
```

---

## 🚀 Siguientes Pasos de Integración

1. **Maquetación:** Finalizar la maquetación de los módulos de usuario y catálogo de avatares en Next.js.
2. **Base de Datos:** Consolidar el esquema de base de datos relacional y telemetría en Supabase.
3. **IoT:** Conectar las lecturas en tiempo real del sensor MQ-135 (ESP32) con la interfaz de la Web 2.0.
4. **Verificación:** Realizar pruebas de carga y resiliencia para asegurar la estabilidad durante la presentación en MILAB.

---

## ✉️ Soporte y Contacto

- **Línea directa de soporte técnico:** `bionexo_support@proton.me`
- **Revisión de aportes:** Google Forms / Biblioteca YU'AM
