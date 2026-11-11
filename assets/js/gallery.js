import { resolveSafeAssetUrl } from "./config.js";

const CATEGORY_LABELS = {
  moda: "Moda",
  lifestyle: "Lifestyle",
  belleza: "Belleza",
  viajes: "Viajes",
};

/**
 * @param {import('./config.js').config} siteConfig
 * @param {object} data
 */
export function initGallery(data, siteConfig) {
  const items = data.gallery || [];
  const grid = document.getElementById("gallery-grid");
  const viewport = document.getElementById("gallery-rail-viewport");
  const scrollHint = document.getElementById("gallery-scroll-hint");
  const filtersEl = document.getElementById("gallery-filters");
  const dialog = document.getElementById("lightbox");
  const dialogImg = document.getElementById("lightbox-img");
  const dialogCaption = document.getElementById("lightbox-caption");
  const closeBtn = document.getElementById("lightbox-close");

  if (!grid) return;

  grid.textContent = "";
  grid.classList.remove("gallery-grid--auto");

  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))];
  const showFilters =
    items.length >= (siteConfig.gallery?.minItemsForFilters ?? 6) && categories.length > 1;

  let activeFilter = "all";
  const prefersReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (filtersEl) {
    if (!showFilters) {
      filtersEl.hidden = true;
    } else {
      filtersEl.hidden = false;
      buildFilters(filtersEl, categories, (cat) => {
        activeFilter = cat;
        renderItems();
      });
    }
  }

  function buildFilters(container, cats, onSelect) {
    container.textContent = "";
    const allBtn = createFilterButton("all", "Todas", true);
    allBtn.addEventListener("click", () => {
      setActiveFilter(container, allBtn);
      onSelect("all");
    });
    container.appendChild(allBtn);

    cats.forEach((cat) => {
      const btn = createFilterButton(cat, CATEGORY_LABELS[cat] || cat, false);
      btn.addEventListener("click", () => {
        setActiveFilter(container, btn);
        onSelect(cat);
      });
      container.appendChild(btn);
    });
  }

  function createFilterButton(value, label, active) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `filter-btn${active ? " is-active" : ""}`;
    btn.dataset.filter = value;
    btn.textContent = label;
    return btn;
  }

  function setActiveFilter(container, activeBtn) {
    container.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("is-active"));
    activeBtn.classList.add("is-active");
  }

  function appendGalleryItem(item, index) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gallery-item gallery-item--rail gallery-item--square";
    btn.setAttribute("aria-label", `Ampliar: ${item.title || item.alt || "imagen"}`);

    const img = document.createElement("img");
    const thumbCandidate =
      item.thumb || String(item.src || "").replace(/(\.[a-z0-9]+)$/i, "-thumb.webp");
    const thumbUrl = resolveSafeAssetUrl(thumbCandidate) || resolveSafeAssetUrl(item.src);
    if (!thumbUrl) return;
    img.src = thumbUrl;
    img.alt = item.alt || "";
    img.loading = index > 2 ? "lazy" : "eager";
    img.decoding = "async";
    img.width = 480;
    img.height = 480;

    btn.appendChild(img);

    if (item.title) {
      const label = document.createElement("span");
      label.className = "gallery-item__label";
      label.textContent = item.title;
      btn.appendChild(label);
    }

    btn.addEventListener("click", () => openLightbox(item));
    grid.appendChild(btn);
  }

  function renderItems() {
    grid.textContent = "";
    grid.classList.remove("gallery-grid--rail", "gallery-grid--auto", "gallery-grid--manual");

    const filtered =
      activeFilter === "all" ? items : items.filter((i) => i.category === activeFilter);

    const useAuto =
      filtered.length >= 2 && activeFilter === "all" && !prefersReduced();

    const display = useAuto ? [...filtered, ...filtered] : filtered;

    if (useAuto) {
      grid.classList.add("gallery-grid--rail", "gallery-grid--auto");
      viewport?.classList.add("gallery-rail__viewport--auto");
      if (scrollHint) {
        scrollHint.hidden = false;
        scrollHint.textContent = "Pasa el cursor o toca una imagen para pausar";
      }
    } else {
      grid.classList.add("gallery-grid--rail", "gallery-grid--manual");
      viewport?.classList.remove("gallery-rail__viewport--auto");
      if (scrollHint) {
        scrollHint.hidden = false;
        scrollHint.textContent = "Desliza para explorar →";
      }
    }

    display.forEach((item, index) => appendGalleryItem(item, index));
  }

  function openLightbox(item) {
    if (!dialog || !dialogImg || !dialogCaption) return;
    const fullUrl = resolveSafeAssetUrl(item.src);
    if (!fullUrl) return;
    dialogImg.src = fullUrl;
    dialogImg.alt = item.alt || "";
    dialogCaption.textContent = item.title || item.alt || "";
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    }
  }

  function closeLightbox() {
    if (!dialog) return;
    dialog.close();
    if (dialogImg) {
      dialogImg.removeAttribute("src");
      dialogImg.alt = "";
    }
  }

  closeBtn?.addEventListener("click", closeLightbox);
  dialog?.addEventListener("click", (e) => {
    if (e.target === dialog) closeLightbox();
  });
  dialog?.addEventListener("cancel", () => {
    if (dialogImg) dialogImg.removeAttribute("src");
  });

  if (viewport && !prefersReduced()) {
    let touchPauseTimer;
    viewport.addEventListener(
      "touchstart",
      () => {
        grid.classList.add("is-paused");
        clearTimeout(touchPauseTimer);
      },
      { passive: true }
    );
    viewport.addEventListener(
      "touchend",
      () => {
        touchPauseTimer = window.setTimeout(() => grid.classList.remove("is-paused"), 2500);
      },
      { passive: true }
    );
  }

  renderItems();
}
