import type { MetadataRoute } from 'next'
import { PUBLIC_ROUTES, SITE_URL } from '@/lib/seo'

export const revalidate = 86400

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map(route => ({
    url: `${SITE_URL}${route.path}`,
    changeFrequency: route.path === '/mapa' || route.path === '/hub' ? 'daily' : 'monthly',
    priority: route.path === '/' ? 1 : route.path === '/privacidad' || route.path === '/terminos' ? 0.3 : 0.8,
  }))
}
