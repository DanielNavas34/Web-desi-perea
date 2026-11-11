import { isSafeHttpUrl, resolveSafeAssetUrl } from "./config.js";

const PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
];

/**
 * @param {object} data
 */
export function initCollaborations(data) {
  const showcase = data.collaborationsShowcase;
  const tabsEl = document.getElementById("collab-tabs");
  const panelsEl = document.getElementById("collab-panels");
  const titleEl = document.getElementById("collab-title");
  const introEl = document.getElementById("collab-intro");

  if (!tabsEl || !panelsEl || !showcase) return;

  if (titleEl && showcase.title) titleEl.textContent = showcase.title;
  if (introEl && showcase.intro) introEl.textContent = showcase.intro;

  const platforms = showcase.platforms || {};
  let active = PLATFORMS.find((p) => (platforms[p.id] || []).length)?.id || "instagram";

  const renderPanels = () => {
    tabsEl.querySelectorAll(".collab-tab").forEach((btn) => {
      const on = btn.dataset.platform === active;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });

    panelsEl.textContent = "";
    const panel = document.createElement("div");
    panel.className = "collab-panel";
    panel.id = `collab-panel-${active}`;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", `collab-tab-${active}`);

    const items = platforms[active] || [];

    if (!items.length) {
      const p = document.createElement("p");
      p.className = "disclaimer";
      p.textContent = showcase.emptyPlatformNote || "Contenido próximamente.";
      panel.appendChild(p);
    } else {
      const grid = document.createElement("div");
      grid.className = "collab-grid";
      items.forEach((item, index) => {
        if (!item?.url || !isSafeHttpUrl(item.url)) return;
        const card = createCollabCard(item, index);
        if (card) grid.appendChild(card);
      });
      panel.appendChild(grid);
    }

    panelsEl.appendChild(panel);
  };

  tabsEl.textContent = "";
  PLATFORMS.forEach((platform) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `collab-tab filter-btn${platform.id === active ? " is-active" : ""}`;
    btn.id = `collab-tab-${platform.id}`;
    btn.dataset.platform = platform.id;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", platform.id === active ? "true" : "false");
    btn.setAttribute("aria-controls", `collab-panel-${platform.id}`);
    btn.textContent = platform.label;
    btn.addEventListener("click", () => {
      active = platform.id;
      renderPanels();
    });
    tabsEl.appendChild(btn);
  });

  renderPanels();
}

function createCollabCard(item, index) {
  if (!item?.url || !isSafeHttpUrl(item.url)) return null;

  const fallbackUrl = resolveSafeAssetUrl(item.coverFallback || item.cover);
  if (!fallbackUrl) return null;

  const a = document.createElement("a");
  a.className = "collab-card";
  a.href = item.url;
  a.rel = "noopener noreferrer";
  a.target = "_blank";
  a.setAttribute(
    "aria-label",
    `${item.title || "Colaboración"}${item.format ? ` — ${item.format}` : ""} (se abre en nueva pestaña)`
  );

  const figure = document.createElement("figure");
  figure.className = "collab-card__figure";

  const picture = document.createElement("picture");
  const coverWebp = item.cover
    ? String(item.cover).replace(/(\.[a-z0-9]+)$/i, "-card.webp")
    : "";
  const webpUrl = resolveSafeAssetUrl(coverWebp) || resolveSafeAssetUrl(item.cover);
  if (webpUrl) {
    const source = document.createElement("source");
    source.type = "image/webp";
    source.srcset = webpUrl;
    picture.appendChild(source);
  }

  const img = document.createElement("img");
  img.src = fallbackUrl;
  img.alt = item.title ? `Carátula — ${item.title}` : "Carátula de colaboración";
  img.loading = index > 2 ? "lazy" : "eager";
  img.decoding = "async";
  img.width = 640;
  img.height = 853;
  picture.appendChild(img);
  figure.appendChild(picture);

  if (item.title || item.format) {
    const figcaption = document.createElement("figcaption");
    figcaption.className = "collab-card__caption";
    if (item.title) {
      const strong = document.createElement("strong");
      strong.textContent = item.title;
      figcaption.appendChild(strong);
    }
    if (item.format) {
      const span = document.createElement("span");
      span.className = "collab-card__format";
      span.textContent = item.format;
      figcaption.appendChild(span);
    }
    figure.appendChild(figcaption);
  }

  a.appendChild(figure);
  return a;
}
