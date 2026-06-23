import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/admin/', '/api/', '/update-password'],
      },
    ],
    sitemap: 'https://facturavis.fr/sitemap.xml',
  }
}
