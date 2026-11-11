# Portfolio — Desi Perea

Web estática profesional para la creadora [@desiperea99](https://www.instagram.com/desiperea99/). Pensada para GitHub Pages y dominio personalizado, sin backend.

## Estado actual

- Contenido en modo **placeholder** (imágenes demo, bio provisional, sin estadísticas inventadas).
- URL publicada: `https://danielnavas34.github.io/Web-desi-perea/` (actualizar al pasar a dominio propio).

## Estructura

```
index.html              Página principal (one-page)
assets/css/             Estilos y tokens
assets/js/              config.js, main.js, gallery.js
assets/data/            portfolio.json (datos editables)
assets/images/          Fotos, favicon, OG
legal/                  Aviso legal, privacidad, cookies
docs/                   Investigación, arte, seguridad, SEO, despliegue
```

## Desarrollo local

```bash
npx serve .
```

No abrir `index.html` con `file://` si necesitas galería JSON y módulos ES.

## Personalización rápida

1. `assets/data/portfolio.json` — textos, galería, servicios, stats verificadas
2. `assets/js/config.js` — `canonicalUrl`, banner demo
3. `assets/images/` — hero, galería, OG (ver `assets/images/README.md`)
4. `CNAME` — dominio GitHub Pages

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [docs/INVESTIGACION.md](docs/INVESTIGACION.md) | Referencias y pendientes |
| [docs/DIRECCION_ARTISTICA.md](docs/DIRECCION_ARTISTICA.md) | Paleta y tipografía |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | GitHub Pages + dominio |
| [docs/SEGURIDAD.md](docs/SEGURIDAD.md) | Medidas frontend |
| [docs/PRIVACIDAD_Y_CUMPLIMIENTO.md](docs/PRIVACIDAD_Y_CUMPLIMIENTO.md) | Cookies y RGPD (borrador) |
| [docs/SEO_Y_ACCESIBILIDAD.md](docs/SEO_Y_ACCESIBILIDAD.md) | Checklist |

## Informe final (resumen)

Ver sección **Informe de entrega** al final de este README en la primera versión del proyecto.

## Licencia

Contenido y diseño sujetos a derechos de la titular. Código del sitio: uso del proyecto acordado con la creadora.

---

## Informe de entrega

### 1. Archivos creados

Proyecto completo greenfield: `index.html`, assets (css, js, data, images), `legal/*`, `docs/*`, `robots.txt`, `sitemap.xml`, `CNAME`, `.gitignore`.

### 2. Tecnologías

HTML5, CSS3, JavaScript ES modules, JSON estático, Google Fonts (CSS), GitHub Pages.

### 3. Paleta

Primary `#2C2420`, secondary `#8B7355`, accent `#C9A962`, fondos `#FAF8F5` / `#F0EBE3` (provisional).

### 4. Tipografías

Cormorant Garamond + DM Sans.

### 5. Funcionalidades

One-page, nav sticky/móvil, galería editorial con filtros y lightbox, media kit con stats condicionales, contacto mailto/Instagram, animaciones scroll, legal estático.

### 6. Seguridad

Sin secretos, URLs validadas, textContent para JSON, sin formularios ficticios.

### 7. Cookies

Sin banner (sin analítica); política de cookies documentada.

### 8. Clasificación de tareas

| Estado | Elemento |
|--------|----------|
| Implementado | Maquetación, JS, galería, docs, legales plantilla, SEO base |
| Pendiente validación | Dominio real, Lighthouse en producción |
| Pendiente información | Bio, email, stats, marcas, fotos |
| Pendiente legal | Completar aviso legal y privacidad |
| No implementado | Banner cookies (no requerido ahora), formulario externo, analytics |

### 9. Antes de producción

Confirmar dominio, imágenes autorizadas, datos legales, email profesional y servicios comerciales con Desi.
