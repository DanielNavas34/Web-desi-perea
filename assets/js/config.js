/**
 * Configuración de despliegue y sitio — edite canonicalUrl y CNAME antes de producción.
 */
export const config = {
  site: {
    basePath: "",
    canonicalUrl: "https://www.ejemplo-desiperea.com",
    lang: "es",
    name: "Desi Perea",
  },

  demoMode: {
    enabled: false,
    bannerText: "",
  },

  social: {
    instagram: "https://www.instagram.com/desiperea99/",
    tiktok: "https://www.tiktok.com/@creoquemellamandesi",
    youtube: "https://www.youtube.com/@Creoquemellamandesi",
  },

  seo: {
    defaultTitle: "Desi Perea | Creadora de contenido lifestyle",
    defaultDescription:
      "Portfolio profesional de Desi Perea, creadora de contenido lifestyle. Colaboraciones con marcas, tarifas y referencias en Instagram, TikTok y YouTube.",
    ogImage: "assets/images/og-image.jpg",
    twitterCard: "summary_large_image",
  },

  contact: {
    mailtoSubject: "Colaboración comercial — Desi Perea",
    mailtoBody:
      "Hola Desi,%0D%0A%0D%0AMe gustaría proponerte una colaboración:%0D%0A%0D%0AMarca / agencia:%0D%0APropuesta:%0D%0A%0D%0AUn saludo,",
  },

  gallery: {
    minItemsForFilters: 6,
  },

  cookies: {
    enabled: true,
    policyVersion: 1,
    storageKey: "desi-perea-cookie-consent",
    banner: {
      title: "Cookies y privacidad",
      description:
        "Usamos almacenamiento local necesario para recordar su elección. Las tipografías externas (Google Fonts) y la analítica solo se activan si usted lo permite. Puede cambiar su decisión en cualquier momento.",
      acceptAllLabel: "Aceptar todas",
      rejectAllLabel: "Rechazar todas",
      configureLabel: "Configurar",
      policyLinkLabel: "Política de cookies",
      preferencesTitle: "Preferencias de cookies",
      preferencesIntro:
        "Seleccione las categorías que desea permitir. Las cookies necesarias no se pueden desactivar.",
      savePreferencesLabel: "Guardar preferencias",
      alwaysActiveLabel: "Siempre activas",
    },
    categories: {
      necessary: {
        title: "Necesarias",
        description:
          "Imprescindibles para guardar su consentimiento y el funcionamiento básico del sitio (localStorage).",
      },
      functional: {
        title: "Funcionales / preferencias",
        description:
          "Carga de tipografías desde Google Fonts (Google Ireland Limited). Puede implicar tratamiento de datos técnicos del navegador por parte del proveedor.",
      },
      analytics: {
        title: "Medición / analítica",
        description:
          "Estadísticas de uso del sitio. En la configuración actual no hay servicio de analítica activo.",
      },
    },
    analytics: {
      enabled: false,
      measurementId: "",
    },
  },
};

/**
 * @param {string} path Ruta relativa sin barra inicial
 * @returns {string}
 */
export function assetUrl(path) {
  const base = config.site.basePath.replace(/\/?$/, "/");
  const clean = path.replace(/^\//, "");
  return base === "/" ? clean : `${base}${clean}`;
}

/**
 * Solo HTTPS absoluto (sin base relativa).
 * @param {string} url
 * @returns {boolean}
 */
export function isSafeHttpUrl(url) {
  if (typeof url !== "string" || !url.trim()) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Ruta de asset relativa al sitio o URL https segura (sin path traversal).
 * @param {string} path
 * @returns {boolean}
 */
export function isSafeAssetPath(path) {
  const p = String(path || "").trim();
  if (!p || p.includes("..") || p.includes("\\") || p.includes("\0")) return false;
  if (/^https?:\/\//i.test(p)) return isSafeHttpUrl(p);
  if (p.startsWith("/") || p.startsWith("//")) return false;
  return /^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(p);
}

/**
 * @param {string} path
 * @returns {string|null}
 */
export function resolveSafeAssetUrl(path) {
  const p = String(path || "").trim();
  if (!isSafeAssetPath(p)) return null;
  if (/^https:\/\//i.test(p)) return p;
  return assetUrl(p);
}

/**
 * Ancla interna (#contacto) o URL https.
 * @param {string} href
 * @returns {string|null}
 */
export function resolveSafeHref(href) {
  const h = String(href || "").trim();
  if (!h) return null;
  if (/^#[A-Za-z][\w:-]*$/.test(h)) return h;
  if (isSafeHttpUrl(h)) return h;
  return null;
}

/**
 * @param {string} href
 * @returns {boolean}
 */
export function isSafeMailto(href) {
  if (typeof href !== "string") return false;
  const trimmed = href.trim();
  const address = trimmed.split("?")[0];
  return /^mailto:[^\s@]+@[^\s@.]+\.[^\s@]+$/i.test(address);
}

export default config;
