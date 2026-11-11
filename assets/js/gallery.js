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

  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))];
  const showFilters =
    items.length >= (siteConfig.gallery?.minItemsForFilters ?? 6) && categories.length > 1;

  let activeFilter = "all";
  const prefersReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /** @type {ReturnType<typeof createMarqueeRail>|null} */
  let rail = null;
  /** @type {WeakMap<HTMLElement, object>} */
  const itemByButton = new WeakMap();

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
    img.draggable = false;
    img.width = 480;
    img.height = 480;

    btn.appendChild(img);

    if (item.title) {
      const label = document.createElement("span");
      label.className = "gallery-item__label";
      label.textContent = item.title;
      btn.appendChild(label);
    }

    itemByButton.set(btn, item);
    btn.addEventListener("click", (e) => {
      // El lightbox principal se abre desde pointerup del carril;
      // este click cubre teclado y evita abrir tras un arrastre.
      if (rail?.consumeDrag()) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.detail === 0) openLightbox(item);
    });
    grid.appendChild(btn);
  }

  function renderItems() {
    rail?.destroy();
    rail = null;

    grid.textContent = "";
    grid.classList.remove("gallery-grid--rail", "gallery-grid--auto", "gallery-grid--manual");
    grid.style.transform = "";

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
        scrollHint.textContent = "Se mueve sola · arrastra para moverla · pulsa para ampliar";
      }
    } else {
      grid.classList.add("gallery-grid--rail", "gallery-grid--manual");
      viewport?.classList.remove("gallery-rail__viewport--auto");
      if (scrollHint) {
        scrollHint.hidden = false;
        scrollHint.textContent = "Arrastra para explorar · pulsa para ampliar";
      }
    }

    display.forEach((item, index) => appendGalleryItem(item, index));

    if (viewport) {
      rail = createMarqueeRail(viewport, grid, {
        auto: useAuto,
        infinite: useAuto,
        onTap(clientX, clientY) {
          const node = document.elementFromPoint(clientX, clientY);
          const btn = node?.closest?.("button.gallery-item");
          if (!(btn instanceof HTMLElement)) return;
          const item = itemByButton.get(btn);
          if (item) openLightbox(item);
        },
      });
    }
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

  renderItems();
}

/**
 * Carril tipo marquee + arrastre (solo tras mover) + tap/clic para lightbox.
 * @param {HTMLElement} viewport
 * @param {HTMLElement} track
 * @param {{ auto?: boolean, infinite?: boolean, onTap?: (x: number, y: number) => void }} options
 */
function createMarqueeRail(viewport, track, { auto = false, infinite = false, onTap } = {}) {
  const SPEED = 0.45;
  const RESUME_MS = 1800;
  const DRAG_THRESHOLD = 12;

  let destroyed = false;
  let offset = 0;
  let paused = false;
  let holding = false;
  let dragging = false;
  let dragged = false;
  let blockClick = false;
  let startX = 0;
  let startOffset = 0;
  let pointerId = null;
  let resumeTimer = 0;
  let rafId = 0;

  const normalize = () => {
    if (!infinite) {
      const max = Math.max(0, track.scrollWidth - viewport.clientWidth);
      offset = Math.min(Math.max(0, offset), max || 0);
      return;
    }
    const half = track.scrollWidth / 2;
    if (half <= 0) return;
    while (offset >= half) offset -= half;
    while (offset < 0) offset += half;
  };

  const paint = () => {
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
  };

  const pause = () => {
    paused = true;
    window.clearTimeout(resumeTimer);
  };

  const scheduleResume = () => {
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => {
      if (!destroyed) paused = false;
    }, RESUME_MS);
  };

  const tick = () => {
    if (destroyed) return;
    if (auto && !paused && !holding && !dragging) {
      offset += SPEED;
      normalize();
      paint();
    }
    rafId = window.requestAnimationFrame(tick);
  };

  const onPointerDown = (e) => {
    if (pointerId !== null) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    // No capturamos aún: así el clic/tap llega a la foto.
    holding = true;
    dragging = false;
    dragged = false;
    pointerId = e.pointerId;
    startX = e.clientX;
    startOffset = offset;
    pause();
  };

  const onPointerMove = (e) => {
    if (pointerId === null || e.pointerId !== pointerId) return;
    const dx = e.clientX - startX;

    if (!dragging && Math.abs(dx) >= DRAG_THRESHOLD) {
      dragging = true;
      dragged = true;
      blockClick = true;
      viewport.classList.add("is-dragging");
      try {
        viewport.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }

    if (!dragging) return;

    offset = startOffset - dx;
    normalize();
    paint();
    if (e.cancelable) e.preventDefault();
  };

  const onPointerUp = (e) => {
    if (pointerId === null || e.pointerId !== pointerId) return;

    const wasDragging = dragging;
    holding = false;
    dragging = false;
    pointerId = null;
    viewport.classList.remove("is-dragging");

    try {
      viewport.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    // Tap sin arrastre: abrir la foto bajo el puntero.
    if (!wasDragging && !dragged) {
      onTap?.(e.clientX, e.clientY);
    }

    scheduleResume();
  };

  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointermove", onPointerMove, { passive: false });
  viewport.addEventListener("pointerup", onPointerUp);
  viewport.addEventListener("pointercancel", onPointerUp);

  paint();
  rafId = window.requestAnimationFrame(tick);

  return {
    consumeDrag() {
      if (blockClick || dragged) {
        blockClick = false;
        dragged = false;
        return true;
      }
      return false;
    },
    destroy() {
      destroyed = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(resumeTimer);
      viewport.classList.remove("is-dragging");
      track.style.transform = "";
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointercancel", onPointerUp);
    },
  };
}
