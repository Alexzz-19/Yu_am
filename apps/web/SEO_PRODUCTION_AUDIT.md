# SEO, consentimiento y calidad editorial

Revisión del 26 de octubre de 2026. Ámbito: `apps/web`.

## SEO y Webmaster

- Dominio canónico: `https://yuam.tech`. Cada vista tiene título, descripción, canonical y etiquetas sociales propios.
- Los cinco títulos indicados por el proyecto usan títulos absolutos para evitar duplicar YU’AM al aplicar la plantilla global.
- `/sitemap.xml` se genera con las rutas públicas; excluye login, perfil, dashboard autenticado y el alias `/about` (canonical `/nosotros`). No inventa fechas de actualización.
- `/robots.txt` permite el rastreo general y enlaza al sitemap. Las páginas privadas usan `noindex` y las APIs devuelven `X-Robots-Tag`.
- JSON-LD describe Organization, SoftwareApplication y WebSite. No se añaden valoraciones, usuarios, precios ni certificaciones inventados.
- Los sitelinks son automáticos: [Google Search Central](https://developers.google.com/search/docs/appearance/sitelinks). Estos cambios ayudan a describir y navegar el sitio; no prometen su aparición.
- Configurar `GOOGLE_SITE_VERIFICATION` y `BING_SITE_VERIFICATION` con el valor `content` de los paneles oficiales y volver a desplegar. Permanecen vacíos por decisión del propietario hasta disponer de los códigos reales.
- Métodos oficiales: [Google Search Console](https://support.google.com/webmasters/answer/9008080), [Bing Webmaster](https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b).

## Analítica y privacidad

- Se mantiene `@next/third-parties/google` con `NEXT_PUBLIC_GA_ID` y consentimiento previo.
- Sin elección o con «Solo esenciales», el componente GA no se monta. Retirar permiso activa la bandera de deshabilitación y abre el banner.
- La elección se conserva en memoria si falla localStorage, y se sincroniza entre pestañas cuando el almacenamiento está disponible.
- Política y condiciones completas en español e inglés; cada bloque declara su idioma y enlaza fuentes legales y proveedores.
- Referencias legales consultadas: [Constitución de Guatemala, art. 24](https://www.congreso.gob.gt/assets/uploads/secciones/pdf/16e67-constitucion-politica-de-la-republica-de-guatemala.pdf), [Decreto 06-2003](https://www.congreso.gob.gt/detalle_pdf/decretos/240), [RGPD y su ámbito territorial](https://eur-lex.europa.eu/eli/reg/2016/679/oj). No se declara que todas las normas se apliquen automáticamente por publicar un sitio global.

## Checklist editorial y anti-slop

- [x] Contenido específico del cultivo, sensores y hardware; se corrigieron promesas de captura automática, ausencia absoluta de pérdidas y supuesta validación de laboratorio.
- [x] Telemetría de producción tomada de Supabase. Se retiró el nodo central fijo de MINEDUC que no era un registro del proyecto.
- [x] Consultas ambientales de Open-Meteo identificadas como modeladas; se retiró una clasificación sanitaria atribuida sin fundamento a la OMS.
- [x] Visuales conceptuales diferenciados de fotos reales. Se sustituyeron ilustraciones con conteos ficticios y fotografías de stock no específicas por fotos verificadas y esquemas sin cifras inventadas.
- [x] El simulador y los precios del presupuesto siguen identificados como estimaciones, con parámetros de referencia; los ejemplos de firmware se muestran como código de configuración.
- [x] Sin numeración decorativa presentada como fases de un proceso que no es secuencial.
- [x] Texto alternativo comprobado en todas las imágenes JSX, más descripciones accesibles en los diagramas SVG.
- [x] Navegación móvil, enlaces tocables, foco visible, enlace de salto, preferencia de movimiento reducido y galería con diálogo nativo.
- [x] Correo oficial mediante `mailto:`. No hay un teléfono público confirmado que deba convertirse en `tel:`.
- [x] 404 con Yum y navegación de recuperación. Registro de hardware confirmado únicamente tras éxito de la API; el mismo modal muestra la clave, sin apilar ventanas.
- [x] No hay formulario de contacto que afirme enviar mensajes: el soporte usa el correo oficial.

Las comprobaciones automatizadas cubren sitemap/canonicals, JSON-LD seguro, consentimiento, correspondencia de cláusulas bilingües y presencia de `alt`. La compilación y las comprobaciones HTTP validan las rutas generadas antes de publicar.
