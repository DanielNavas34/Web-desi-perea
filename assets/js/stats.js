import { isSafeHttpUrl } from "./config.js";

const PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
];

const AUDIENCE_VIEWS = [
  { key: "gender", label: "Género" },
  { key: "age", label: "Edad" },
  { key: "locations", label: "Ubicación" },
  { key: "languages", label: "Idiomas", instagramOnly: true },
];

/**
 * @param {object} data
 */
export function initPlatformStats(data) {
  const hub = document.getElementById("stats-hub");
  const lead = document.getElementById("stats-lead");
  const sourceNote = document.getElementById("stats-source-note");
  const pm = data.platformMetrics;

  if (!hub) return;

  if (!pm?.verified || !pm.platforms) {
    hub.innerHTML =
      '<p class="stats-pending">Las métricas detalladas se publicarán cuando la cliente confirme los datos.</p>';
    return;
  }

  if (lead && pm.intro) lead.textContent = pm.intro;
  if (sourceNote && pm.sourceNote) {
    sourceNote.textContent = pm.sourceNote;
    sourceNote.hidden = false;
  }

  hub.textContent = "";
  let activePlatform = "instagram";
  let activeAudience = "gender";

  const platformTabs = document.createElement("div");
  platformTabs.className = "stats-hub__platform-tabs collab-tabs";
  platformTabs.setAttribute("role", "tablist");
  platformTabs.setAttribute("aria-label", "Plataforma");

  const panel = document.createElement("div");
  panel.className = "stats-hub__panel glass-panel section-panel stats-hub__panel--instagram";
  panel.setAttribute("role", "tabpanel");

  const insightEl = document.createElement("p");
  insightEl.className = "stats-hub__insight";
  insightEl.hidden = !pm.insight;
  if (pm.insight) insightEl.textContent = pm.insight;

  hub.append(platformTabs, insightEl, panel);

  const render = () => {
    const platform = pm.platforms[activePlatform];
    if (!platform) return;

    platformTabs.querySelectorAll(".collab-tab").forEach((btn) => {
      const on = btn.dataset.platform === activePlatform;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });

    panel.className = `stats-hub__panel glass-panel section-panel stats-hub__panel--${activePlatform}`;
    panel.classList.remove("is-switching");
    void panel.offsetWidth;
    panel.classList.add("is-switching");

    panel.textContent = "";

    const head = document.createElement("div");
    head.className = "stats-hub__head";
    const period = document.createElement("p");
    period.className = "stats-hub__period";
    period.textContent = platform.periodLabel || "";
    head.appendChild(period);

    if (platform.handle && platform.profileUrl && isSafeHttpUrl(platform.profileUrl)) {
      const profile = document.createElement("a");
      profile.className = "stats-hub__profile";
      profile.href = platform.profileUrl;
      profile.target = "_blank";
      profile.rel = "noopener noreferrer";
      profile.textContent = `@${platform.handle}`;
      head.appendChild(profile);
    }

    panel.appendChild(head);

    const kpiGrid = document.createElement("div");
    kpiGrid.className = "stats-kpi-grid";
    (platform.kpis || []).forEach((kpi, i) => {
      kpiGrid.appendChild(buildKpiCard(kpi, i, i === 0));
    });
    panel.appendChild(kpiGrid);

    const audTitle = document.createElement("h3");
    audTitle.className = "stats-hub__subtitle";
    audTitle.textContent = "Audiencia";
    panel.appendChild(audTitle);

    const audTabs = document.createElement("div");
    audTabs.className = "stats-hub__audience-tabs";
    audTabs.setAttribute("role", "tablist");
    audTabs.setAttribute("aria-label", "Dimensión de audiencia");

    const viewsAvailable = AUDIENCE_VIEWS.filter((v) => {
      if (v.instagramOnly && activePlatform !== "instagram") return false;
      const items = platform.audience?.[v.key];
      return items?.length;
    });

    if (!viewsAvailable.find((v) => v.key === activeAudience)) {
      activeAudience = viewsAvailable[0]?.key || "gender";
    }

    viewsAvailable.forEach((view) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `filter-btn stats-audience-tab${view.key === activeAudience ? " is-active" : ""}`;
      btn.dataset.audience = view.key;
      btn.setAttribute("role", "tab");
      btn.textContent = view.label;
      btn.addEventListener("click", () => {
        activeAudience = view.key;
        renderAudienceBlock();
        audTabs.querySelectorAll(".stats-audience-tab").forEach((b) => {
          b.classList.toggle("is-active", b.dataset.audience === activeAudience);
        });
      });
      audTabs.appendChild(btn);
    });

    panel.appendChild(audTabs);

    const audBlock = document.createElement("div");
    audBlock.className = "stats-audience-block";
    audBlock.id = "stats-audience-block";
    panel.appendChild(audBlock);

    const activity = platform.audience?.activityNote;
    if (activity) {
      const note = document.createElement("p");
      note.className = "stats-hub__activity";
      note.textContent = activity;
      panel.appendChild(note);
    }

    const renderAudienceBlock = () => {
      audBlock.textContent = "";
      const items = platform.audience?.[activeAudience] || [];
      items.forEach((row, index) => {
        audBlock.appendChild(buildBarRow(row, index));
      });
    };

    renderAudienceBlock();
  };

  PLATFORMS.forEach((p) => {
    if (!pm.platforms[p.id]) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `collab-tab filter-btn${p.id === activePlatform ? " is-active" : ""}`;
    btn.dataset.platform = p.id;
    btn.setAttribute("role", "tab");
    btn.textContent = p.label;
    btn.addEventListener("click", () => {
      activePlatform = p.id;
      activeAudience = "gender";
      render();
    });
    platformTabs.appendChild(btn);
  });

  render();
}

function buildKpiCard(kpi, index, featured = false) {
  const card = document.createElement("article");
  card.className = `stats-kpi-card${featured ? " stats-kpi-card--featured" : ""}`;

  const value = document.createElement("p");
  value.className = "stats-kpi-card__value";
  value.dataset.display = kpi.display || "";
  if (typeof kpi.numeric === "number") {
    value.dataset.numeric = String(kpi.numeric);
    animateKpiValue(value, kpi.numeric, kpi.display);
  } else {
    value.textContent = kpi.display || "—";
  }

  const label = document.createElement("p");
  label.className = "stats-kpi-card__label";
  label.textContent = kpi.label || "";

  card.append(value, label);

  if (kpi.trend) {
    const trend = document.createElement("p");
    trend.className = `stats-kpi-card__trend stats-kpi-card__trend--${kpi.trendDir || "neutral"}`;
    trend.textContent = kpi.trend;
    card.appendChild(trend);
  }

  card.style.animationDelay = `${index * 0.06}s`;
  return card;
}

function animateKpiValue(el, target, fallbackDisplay) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !target) {
    el.textContent = fallbackDisplay || String(target);
    return;
  }

  const duration = 900;
  const start = performance.now();
  const from = 0;

  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - t) ** 3;
    const current = Math.round(from + (target - from) * eased);
    el.textContent = formatCompact(current);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = fallbackDisplay || formatCompact(target);
  };

  requestAnimationFrame(tick);
}

function formatCompact(n) {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return Number.isInteger(v) ? `${v} M` : `${v.toFixed(1).replace(".", ",")} M`;
  }
  if (n >= 10_000) {
    return `${Math.round(n / 1000)} K`;
  }
  if (n >= 1000) {
    const v = n / 1000;
    return `${v.toFixed(1).replace(".", ",")} K`;
  }
  return n.toLocaleString("es-ES");
}

function buildBarRow(row, index) {
  const wrap = document.createElement("div");
  wrap.className = "stats-bar-row";

  const header = document.createElement("div");
  header.className = "stats-bar-row__header";
  const name = document.createElement("span");
  name.textContent = row.label;
  const pct = document.createElement("span");
  pct.className = "stats-bar-row__pct";
  pct.textContent = `${row.percent} %`;
  header.append(name, pct);

  const track = document.createElement("div");
  track.className = "stats-bar-row__track";
  const fill = document.createElement("div");
  fill.className = "stats-bar-row__fill";
  fill.style.width = "0%";
  fill.dataset.width = String(row.percent);

  track.appendChild(fill);
  wrap.append(header, track);

  requestAnimationFrame(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    fill.style.width = reduced ? `${row.percent}%` : `${row.percent}%`;
    if (!reduced) {
      fill.style.width = "0%";
      requestAnimationFrame(() => {
        fill.style.transition = `width 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.05}s`;
        fill.style.width = `${row.percent}%`;
      });
    }
  });

  return wrap;
}
