# Vídeos del sitio

## Sobre mí

- `about-desiperea.mp4` — vídeo vertical (comprimido para web, ~7 MB)
- `about-desiperea-poster.jpg` — miniatura antes de reproducir

Ruta en `assets/data/portfolio.json` → `profile.aboutVideo`.

## Hero (portada)

Los clips del **hero** (marco grande a la derecha del título, sección «Inicio») viven aquí.

1. Copia el MP4/WebM en esta carpeta (p. ej. `hero.mp4`).
2. En `assets/data/portfolio.json`, campo `profile.heroMedia.videoSrc`, pon la ruta relativa:
   ```json
   "videoSrc": "assets/videos/hero.mp4"
   ```
3. Opcional: `poster` en `heroMedia` (imagen mientras carga el vídeo).

Ahora mismo: **`video_prueba.mp4`** — solo para ubicarte; no es contenido final de la cliente.

El vídeo va **muted**, en **bucle** y **playsinline** (móvil). Sin audio en autoplay por normas del navegador.
