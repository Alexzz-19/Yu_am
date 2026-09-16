# GUÍA TÉCNICA: CONFIGURACIÓN SEGURA DE MCPs Y PROTOCOLO DE SUBAGENTES — YU'AM v2.0

## 1. Reglas de Oro para JSON en OpenCode
- **Sintaxis estricta:** Utilizar exclusivamente comillas dobles (`"`) para claves y valores (`"key": "value"`). No se permiten comillas simples en JSON.
- **Sin trailing commas:** El último elemento de un objeto o lista **nunca** debe llevar coma al final.
- **Evitar escapes erróneos:** Cuidar el escape de barras invertidas (`\`) en rutas de archivos o cadenas de conexión.
- **Inyección segura:** Utilizar siempre `cat << 'EOF' > archivo` (con delimitador entrecomillado `'EOF'`) para evitar expansión de variables de shell no deseadas.

## 2. URL Encoding en Cadenas de Conexión (Supabase / Postgres)
- Cuando las contraseñas o tokens contienen caracteres especiales (ej. `@`, `#`, `:`, `/`, `?`, `&`), deben codificarse obligatoriamente usando codificación porcentual (URL Encoding):
  - `@` -> `%40`
  - `:` -> `%3A`
  - `/` -> `%2F`
  - `#` -> `%23`
- Ejemplo de conexión segura con PostgreSQL MCP:
  `postgresql://postgres.user:pass%40word@aws-0-region.pooler.supabase.com:6543/postgres`

## 3. Manejo de Claves y Variables de Entorno (`.env`)
- **Aislamiento:** Las credenciales, API Keys y tokens (ej. `OBSIDIAN_REST_API_KEY`, tokens de Supabase y Figma) deben residir exclusivamente en archivos `.env` locales (como `docs/.env` o `db/.env`), los cuales están excluidos mediante `.gitignore`.
- **Regla estricta:** Nunca incluir claves secretas directamente en el código fuente, archivos de configuración compartidos ni en los commits de Git.
- **Sincronización:** Para Obsidian y otros servicios integrados, actualizar únicamente `docs/.env` según lo requerido por el Subagente Documentador.

## 4. Protocolo de Subagentes y Orquestación
- **Ámbitos definidos:** Cada agente y subagente tiene un dominio de responsabilidad estricto (ej. el Subagente Documentador opera exclusivamente en `/docs`).
- **Delegación eficiente:** Utilizar tareas paralelas (`task`) para investigaciones de código o consultas independientes, manteniendo la separación de contextos.
- **Verificación:** Todo cambio documental o de código debe ser verificado, documentado en la bitácora diaria correspondiente (`docs/obsidian/daily/`) y sincronizado con el repositorio remoto.

## 5. Servidores MCP Configurados
- **Supabase MCP (PostgreSQL):**
  - Tipo: Local (`@modelcontextprotocol/server-postgres`)
  - Uso: Inspección directa de esquemas y tablas.
- **Figma MCP:**
  - Tipo: Local (`figma-mcp`)
  - Variable: `FIGMA_ACCESS_TOKEN`
  - Uso: Lectura de componentes y maquetación UI/UX para Next.js.

## 6. Checklist de Diagnóstico
- `Connection closed`: Error de sintaxis JSON o paquete npm/npx inexistente.
- `SSE 404`: Cadena de conexión o URL de base de datos mal escrita.
- `MCP no aparece`: Reiniciar el proceso en la terminal.
