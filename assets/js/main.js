import {
  config,
  assetUrl,
  isSafeHttpUrl,
  isSafeMailto,
  resolveSafeAssetUrl,
  resolveSafeHref,
} from "./config.js";
import { initGallery } from "./gallery.js";
import { initCollaborations } from "./collabs.js";
import { initPlatformStats } from "./stats.js";
import { initCookieConsent } from "./cookies.js";
import { initSiteLoader } from "./loader.js";

function applyBasePath() {
  if (!config.site.basePath) return;
  document.querySelectorAll("[href^='assets/'], [src^='assets/']").forEach((el) => {
    const attr = el.hasAttribute("href") ? "href" : "src";
    const val = el.getAttribute(attr);
    if (val && !val.startsWith("http")) {
      el.setAttribute(attr, assetUrl(val));
    }
  });
}

function initDemoBanner() {
  const el = document.getElementById("demo-banner");
  if (!el || !config.demoMode.enabled) return;
  el.textContent = config.demoMode.bannerText;
  el.hidden = false;
}

function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const panel = document.getElementById("nav-mobile");
  const closeBtn = document.getElementById("nav-close");
  if (!toggle || !panel) return;

  const open = () => {
    panel.hidden = false;
    panel.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    closeBtn?.focus();
  };

  const close = () => {
    panel.classList.remove("is-open");
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  };

  toggle.addEventListener("click", () => {
    if (panel.classList.contains("is-open")) close();
    else open();
  });

  closeBtn?.addEventListener("click", close);

  panel.addEventListener("click", (e) => {
    if (e.target === panel) close();
  });

  document.querySelectorAll("[data-nav-close]").forEach((link) => {
    link.addEventListener("click", close);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("is-open")) close();
  });
}

function initSmoothAnchors() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });
}

function initReveal() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nodes = document.querySelectorAll(".reveal");
  if (reduced) {
    nodes.forEach((n) => n.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  nodes.forEach((n) => io.observe(n));
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el && text) el.textContent = text;
}

function renderProfile(data) {
  const { profile } = data;
  if (!profile) return;

  const about = document.getElementById("about-content");
  if (about && profile.about) {
    about.textContent = "";
    profile.about.split(/\n\n+/).forEach((block) => {
      const text = block.trim();
      if (!text) return;
      const p = document.createElement("p");
      p.textContent = text;
      about.appendChild(p);
    });
  }

  renderAboutVideo(profile);

  const contactIg = document.getElementById("contact-instagram");
  if (contactIg && isSafeHttpUrl(profile.instagramUrl)) {
    contactIg.href = profile.instagramUrl;
  }

  const pageTitle = document.getElementById("page-title");
  if (pageTitle && profile.name) {
    pageTitle.textContent = profile.name;
  }
}

function renderAboutVideo(profile) {
  const video = profile?.aboutVideo;
  const el = document.getElementById("about-video");
  const source = document.getElementById("about-video-source");
  const caption = document.getElementById("about-video-caption");
  const wrap = document.getElementById("about-video-wrap");
  if (!video?.src || !el || !source) {
    wrap?.remove();
    return;
  }

  const resolvedSrc = resolveSafeAssetUrl(video.src);
  if (!resolvedSrc) {
    wrap?.remove();
    return;
  }

  source.src = resolvedSrc;
  el.load();

  if (video.poster) {
    const resolvedPoster = resolveSafeAssetUrl(video.poster);
    if (resolvedPoster) el.poster = resolvedPoster;
  }

  if (caption && video.caption) {
    caption.textContent = video.caption;
  }
}

const SOCIAL_ICONS = {
  instagram: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 1.75A3.75 3.75 0 0 0 3.75 7.5v9A3.75 3.75 0 0 0 7.5 20.25h9A3.75 3.75 0 0 0 20.25 16.5v-9A3.75 3.75 0 0 0 16.5 3.75h-9Zm9.75 1.5a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25ZM12 7.25A4.75 4.75 0 1 1 12 16.75 4.75 4.75 0 0 1 12 7.25Zm0 1.75a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M14.5 3c.4 2.2 1.8 3.9 4 4.4v2.3c-1.4-.1-2.7-.6-3.8-1.4v6.4c0 3.2-2.5 5.7-5.7 5.7S3.3 17.9 3.3 14.7c0-3.1 2.4-5.6 5.5-5.7v2.4c-1.8.1-3.2 1.6-3.2 3.3 0 1.8 1.5 3.3 3.3 3.3s3.3-1.5 3.3-3.3V3h2.3Z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M22.5 7.2a3.1 3.1 0 0 0-2.2-2.2C18.5 4.5 12 4.5 12 4.5s-6.5 0-8.3.5A3.1 3.1 0 0 0 1.5 7.2 32.6 32.6 0 0 0 1 12a32.6 32.6 0 0 0 .5 4.8 3.1 3.1 0 0 0 2.2 2.2c1.8.5 8.3.5 8.3.5s6.5 0 8.3-.5a3.1 3.1 0 0 0 2.2-2.2A32.6 32.6 0 0 0 23 12a32.6 32.6 0 0 0-.5-4.8ZM10 15.5v-7l6 3.5-6 3.5Z"/></svg>`,
};

function renderFollow(data) {
  const section = data.followSection || {};
  const platforms = (data.platforms || []).filter((p) => p?.url && isSafeHttpUrl(p.url));
  const grid = document.getElementById("follow-grid");
  const title = document.getElementById("follow-title");
  const lead = document.getElementById("follow-lead");
  const eyebrow = document.getElementById("follow-eyebrow");
  const wrap = document.getElementById("sigueme");
  if (!grid || !wrap) return;

  if (section.title && title) title.textContent = section.title;
  if (section.eyebrow && eyebrow) eyebrow.textContent = section.eyebrow;
  if (lead) lead.textContent = section.intro || "";

  grid.textContent = "";
  if (!platforms.length) {
    wrap.hidden = true;
    return;
  }

  wrap.hidden = false;
  platforms.forEach((platform) => {
    const a = document.createElement("a");
    a.className = `follow-card follow-card--${platform.id}`;
    a.href = platform.url;
    a.rel = "noopener noreferrer";
    a.target = "_blank";
    a.setAttribute("aria-label", `${platform.name}${platform.handle ? ` @${platform.handle}` : ""} (se abre en nueva pestaña)`);

    const icon = document.createElement("span");
    icon.className = "follow-card__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = SOCIAL_ICONS[platform.id] || "";

    const name = document.createElement("span");
    name.className = "follow-card__name";
    name.textContent = platform.name;

    const handle = document.createElement("span");
    handle.className = "follow-card__handle";
    handle.textContent = platform.handle ? `@${platform.handle}` : "Ver perfil";

    a.append(icon, name, handle);
    grid.appendChild(a);
  });
}

function renderStarMoment(data) {
  const sm = data.starMoment;
  const textEl = document.getElementById("star-moment-text");
  const authorEl = document.getElementById("star-moment-author");
  const wrap = document.getElementById("star-moment");
  if (!sm || !textEl || !wrap) return;

  textEl.textContent = sm.quote || "";
  if (authorEl && sm.attribution) {
    authorEl.textContent = `— ${sm.attribution}`;
  }
}

function isConsultHref(item) {
  if (!item?.consult) return null;
  return resolveSafeHref(item.href) || "#contacto";
}

function renderRates(data) {
  const container = document.getElementById("rates-container");
  const title = document.getElementById("rates-title");
  if (!container || !data.rates) return;

  if (data.rates.title && title) title.textContent = data.rates.title;

  container.textContent = "";

  if (data.rates.intro) {
    const intro = document.createElement("p");
    intro.className = "rates-hub__intro";
    intro.textContent = data.rates.intro;
    container.appendChild(intro);
  }

  const items = data.rates.items || [];

  if (items.length) {
    const grid = document.createElement("div");
    grid.className = "rates-grid";

    items.forEach((item, index) => {
      const safeHref = isConsultHref(item);
      const tag = safeHref ? "a" : "article";
      const card = document.createElement(tag);
      card.className = safeHref ? "rate-card rate-card--consult" : "rate-card";
      card.style.setProperty("--rate-i", String(index));
      if (safeHref) {
        card.href = safeHref;
      }

      const ring = document.createElement("div");
      ring.className = "rate-card__ring";
      const price = document.createElement("span");
      price.className = "rate-card__price";
      price.textContent = item.display || item.price || "";
      ring.appendChild(price);
      card.appendChild(ring);

      const label = document.createElement("p");
      label.className = "rate-card__label";
      label.textContent = item.name || "";
      card.appendChild(label);

      grid.appendChild(card);
    });

    container.appendChild(grid);

    if (data.rates.footnote) {
      const foot = document.createElement("p");
      foot.className = "rates-hub__footnote disclaimer";
      foot.textContent = data.rates.footnote;
      container.appendChild(foot);
    }

    const cta = document.createElement("p");
    cta.className = "rates-hub__cta";
    const btn = document.createElement("a");
    btn.className = "btn btn--primary";
    const ratesMailto = buildContactMailto(data.contact?.email);
    btn.href = ratesMailto || "#contacto";
    btn.textContent = "Proponer una colaboración";
    cta.appendChild(btn);
    container.appendChild(cta);
    return;
  }

  const cta = document.createElement("p");
  cta.className = "rates-hub__cta";
  const btn = document.createElement("a");
  btn.className = "btn btn--primary";
  const ratesMailto = buildContactMailto(data.contact?.email);
  btn.href = ratesMailto || "#contacto";
  btn.textContent = "Solicitar tarifas";
  cta.appendChild(btn);
  container.appendChild(cta);
}

function normalizeBrandKey(name) {
  return (name || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildBrandChips(names, { ambassador = false } = {}) {
  const chips = document.createElement("div");
  chips.className = ambassador
    ? "brand-chips brand-chips--ambassador"
    : "brand-chips brand-chips--grid";
  names.forEach((name, index) => {
    const span = document.createElement("span");
    span.className = ambassador ? "brand-chip brand-chip--ambassador" : "brand-chip";
    span.style.setProperty("--chip-i", String(index));
    if (ambassador) {
      const label = document.createElement("span");
      label.className = "brand-chip__label";
      label.textContent = name;
      span.appendChild(label);
      const badge = document.createElement("span");
      badge.className = "brand-chip__badge";
      badge.textContent = "Embajadora";
      span.appendChild(badge);
    } else {
      span.textContent = name;
    }
    chips.appendChild(span);
  });
  return chips;
}

function buildBrandsPanel({ title, lead, chips, variant }) {
  const panel = document.createElement("div");
  panel.className = "glass-panel brands-panel";
  const aurora = document.createElement("div");
  aurora.className = "brands-panel__aurora";
  aurora.setAttribute("aria-hidden", "true");
  panel.appendChild(aurora);

  const body = document.createElement("div");
  body.className = "brands-panel__body";

  const head = document.createElement("div");
  head.className = "brands-panel__head";
  if (variant === "ambassador") {
    const mark = document.createElement("span");
    mark.className = "brands-panel__mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "✦";
    head.appendChild(mark);
  }
  const h = document.createElement("h3");
  h.className = "brands-panel__title";
  h.textContent = title;
  head.appendChild(h);
  body.appendChild(head);

  if (lead) {
    const p = document.createElement("p");
    p.className = "brands-panel__lead";
    p.textContent = lead;
    body.appendChild(p);
  }
  body.appendChild(chips);
  panel.appendChild(body);
  return panel;
}

function initBrandsPremium(container) {
  if (!container || container.classList.contains("brands-stack--ready")) return;
  container.classList.add("brands-stack--ready");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    container.classList.add("brands-stack--live");
    return;
  }

  const section = document.getElementById("marcas");
  const activate = () => container.classList.add("brands-stack--live");

  if (!section || !("IntersectionObserver" in window)) {
    activate();
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activate();
          io.disconnect();
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
  );
  io.observe(section);
}

function renderMarcas(data) {
  const section = data.brandsSection;
  const lead = document.getElementById("brands-lead");
  const container = document.getElementById("marcas-container");
  const heading = document.getElementById("brands-title");
  if (!container || !section) return;

  if (section.title && heading) heading.textContent = section.title;
  if (lead) lead.textContent = section.intro || "";

  container.textContent = "";

  const ambassador = section.ambassador || [];
  let collab = section.collaborations || [];

  if (section.dedupeAmbassadorInCollaborations && ambassador.length && collab.length) {
    const ambassadorKeys = new Set(ambassador.map(normalizeBrandKey));
    collab = collab.filter((name) => !ambassadorKeys.has(normalizeBrandKey(name)));
  }

  if (ambassador.length) {
    const panel = buildBrandsPanel({
      title: "Embajadora",
      lead: section.ambassadorIntro || "",
      chips: buildBrandChips(ambassador, { ambassador: true }),
      variant: "ambassador",
    });
    panel.classList.add("brands-panel--ambassador");
    container.appendChild(panel);
  }

  if (collab.length) {
    const panel = buildBrandsPanel({
      title: "Marcas con las que he trabajado",
      lead: section.collaborationsIntro || "",
      chips: buildBrandChips(collab),
      variant: "collaborations",
    });
    panel.classList.add("brands-panel--collaborations");
    container.appendChild(panel);
  }

  if (section.collaborationsVideoHint && (ambassador.length || collab.length)) {
    const hint = document.createElement("p");
    hint.className = "brands-stack__hint";
    const text = document.createElement("span");
    text.textContent = `${section.collaborationsVideoHint} `;
    hint.appendChild(text);
    const link = document.createElement("a");
    link.href = "#colaboraciones";
    link.textContent = section.collaborationsVideoLinkLabel || "Ver colaboraciones";
    hint.appendChild(link);
    container.appendChild(hint);
  }

  if (!collab.length && !ambassador.length && section.emptyNote) {
    const p = document.createElement("p");
    p.className = "disclaimer glass-panel brands-panel";
    p.textContent = section.emptyNote;
    container.appendChild(p);
  }

  initBrandsPremium(container);
}

function buildContactMailto(email) {
  const trimmed = (email || "").trim();
  if (!trimmed || !isSafeMailto(`mailto:${trimmed}`)) return null;
  return `mailto:${trimmed}?subject=${encodeURIComponent(config.contact.mailtoSubject)}&body=${config.contact.mailtoBody}`;
}

function renderContact(data) {
  const { contact } = data;
  const mailBtn = document.getElementById("contact-mailto");
  if (!mailBtn) return;

  const email = (contact?.email || "").trim();
  const mailto = buildContactMailto(email);

  if (mailto) {
    const btn = mailBtn.cloneNode(true);
    mailBtn.replaceWith(btn);
    btn.href = mailto;
    btn.removeAttribute("aria-disabled");
    btn.classList.remove("btn--ghost");
    btn.textContent = contact.ctaLabel || "Escríbeme para colaborar";
    return;
  }

  mailBtn.classList.add("btn--ghost");
  mailBtn.setAttribute("aria-disabled", "true");
  mailBtn.textContent = "Correo pendiente de confirmar";
  mailBtn.addEventListener("click", (e) => e.preventDefault());
  mailBtn.href = "#contacto";
}

async function loadPortfolio() {
  const url = assetUrl("assets/data/portfolio.json");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo cargar portfolio.json (${res.status})`);
  return res.json();
}

function initFooterYear() {
  const el = document.getElementById("footer-year");
  if (el) el.textContent = String(new Date().getFullYear());
}

async function bootstrapApp() {
  applyBasePath();
  initDemoBanner();
  initCookieConsent();
  initMobileNav();
  initSmoothAnchors();
  initReveal();
  initFooterYear();
  try {
    const data = await loadPortfolio();
    renderProfile(data);
    initCollaborations(data);
    renderFollow(data);
    initPlatformStats(data);
    renderRates(data);
    renderMarcas(data);
    renderStarMoment(data);
    renderContact(data);
    initGallery(data, config);
  } catch (err) {
    console.error(err);
    const grid = document.getElementById("gallery-grid");
    if (grid) {
      const p = document.createElement("p");
      p.className = "disclaimer";
      p.textContent =
        "No se pudo cargar la galería. Ejecuta la web con un servidor local (por ejemplo: npx serve .).";
      grid.appendChild(p);
    }
  }
}

initSiteLoader(() => {
  bootstrapApp();
});
