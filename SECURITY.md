# Security Policy — YU'AM v2.0 / Política de seguridad

[English](#english) | [Español](#español)

---

<a id="english"></a>
## English

### Supported versions

| Version | Supported |
|---|---|
| `main` (v2.0.x) | ✅ |
| `v1.0-prototype` (archived) | ❌ (historical reference only) |

### Reporting a vulnerability (private)

**Do not open a public issue, PR, or discussion for security vulnerabilities.** Report them privately:

1. Email **`bionexo_support@proton.me`** with subject `[SECURITY] YU'AM — brief description`.
2. Include: affected scope (`apps/web`, `packages/database`, Supabase RLS, CI/CD), steps to reproduce, and impact assessment.
3. Allow **up to 5 business days** for triage response before any disclosure.

We handle reports confidentially, prioritize fixes involving IoT node privacy (coordinate obfuscation), Supabase `service_role` exposure, and auth/RLS bypasses, and we credit reporters (unless anonymity is requested) in the fix release notes.

---

<a id="español"></a>
## Español

### Versiones soportadas

| Versión | Soportada |
|---|---|
| `main` (v2.0.x) | ✅ |
| `v1.0-prototype` (archivada) | ❌ (solo referencia histórica) |

### Reporte privado de vulnerabilidades

**No abras issues, PRs ni discusiones públicas para vulnerabilidades de seguridad.** Repórtalas en privado:

1. Escribe a **`bionexo_support@proton.me`** con asunto `[SECURITY] YU'AM — descripción breve`.
2. Incluye: alcance afectado (`apps/web`, `packages/database`, RLS de Supabase, CI/CD), pasos para reproducir y evaluación de impacto.
3. Otorga **hasta 5 días hábiles** para respuesta de triage antes de cualquier divulgación.

Manejamos los reportes confidencialmente, priorizamos fixes de privacidad de nodos IoT (ofuscación de coordenadas), exposición de `service_role` y bypasses de auth/RLS, y damos crédito al reportante (salvo anonimato solicitado) en las notas de la versión.
