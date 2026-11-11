# Imágenes del portfolio

## Sustituir antes de producción

| Archivo | Uso | Recomendación |
|---------|-----|----------------|
| `hero-placeholder.svg` | Hero principal / poster del vídeo | Retrato autorizado, WebP/AVIF + fallback, ~1200 px ancho |
| Vídeo hero (opcional) | Carpeta `assets/videos/` + `profile.heroMedia.videoSrc` en JSON | MP4/WebM corto en bucle, muted, autorizado |
| `placeholder-gallery.svg` | Galería | 6+ fotos reales, optimizadas |
| `og-image.svg` | Open Graph | Exportar **1200×630** JPG o PNG (`og-image.jpg`) y actualizar meta en `index.html` |
| `favicon.svg` | Favicon | Opcional PNG 32×32 |

## Buenas prácticas

- Texto alternativo descriptivo en cada imagen (editar en `assets/data/portfolio.json`).
- `loading="lazy"` en galería (implementado en JS).
- No subir contenido de Instagram sin autorización explícita.
