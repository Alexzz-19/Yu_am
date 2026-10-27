import type { Metadata } from 'next'

export const SITE_URL = 'https://yuam.tech'
export const SITE_NAME = "YU'AM"
export const TITLE_TEMPLATE = "%s | YU'AM - Fotobiorreactores & CleanTech Guatemala"
export const DEFAULT_DESCRIPTION = 'Plataforma de MILAB en Guatemala para monitorear fotobiorreactores, explorar telemetría IoT y aprender sobre microalgas, hardware abierto y biotecnología.'
const shareImage = { url: '/images/logos/logo-horizontal.webp', width: 1280, height: 512, alt: 'Logotipo de YU’AM, plataforma de fotobiorreactores y CleanTech de Guatemala' }

export const PUBLIC_ROUTES = [
  { path: '/', name: 'Inicio' }, { path: '/nosotros', name: 'Nosotros' },
  { path: '/mapa', name: 'Mapa de fotobiorreactores' }, { path: '/hub', name: 'Hub científico' },
  { path: '/yum', name: 'Yum AI' }, { path: '/hardware', name: 'Guías de hardware' },
  { path: '/simulador', name: 'Simulador de biocultivos' },
  { path: '/privacidad', name: 'Política de privacidad' }, { path: '/terminos', name: 'Condiciones de servicio' },
] as const

export function pageMetadata(title: string, description: string, path: string, options: { absolute?: boolean; index?: boolean } = {}): Metadata {
  return {
    title: options.absolute ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    robots: { index: options.index !== false, follow: options.index !== false },
    openGraph: { type: 'website', siteName: SITE_NAME, locale: 'es_GT', title, description, url: path, images: [shareImage] },
    twitter: { card: 'summary_large_image', title, description, images: [shareImage] },
  }
}

export const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: SITE_NAME,
      url: SITE_URL, logo: `${SITE_URL}/images/logos/logo-mark.webp`,
      description: DEFAULT_DESCRIPTION,
      email: 'Yuam_support@protonmail.com',
      contactPoint: { '@type': 'ContactPoint', email: 'Yuam_support@protonmail.com', contactType: 'customer support', availableLanguage: ['Spanish', 'English'] },
      sameAs: ['https://github.com/Alexzz-19/Yu_am'],
    },
    {
      '@type': 'SoftwareApplication', '@id': `${SITE_URL}/#application`, name: SITE_NAME,
      applicationCategory: 'EducationalApplication', operatingSystem: 'Web', url: SITE_URL,
      description: DEFAULT_DESCRIPTION, inLanguage: 'es',
      publisher: { '@id': `${SITE_URL}/#organization` },
      featureList: ['Telemetría IoT de fotobiorreactores', 'Mapa comunitario', 'Guías de hardware abierto', 'Asistente Yum'],
    },
    {
      '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` }, inLanguage: 'es',
      hasPart: PUBLIC_ROUTES.map(route => ({ '@type': 'WebPage', name: route.name, url: `${SITE_URL}${route.path}` })),
    },
  ],
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
