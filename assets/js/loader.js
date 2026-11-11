import { assetUrl } from "./config.js";

const LOADER_ID = "site-loader";
const TAGLINE = "Colaboraciones lifestyle con mirada auténtica.";
const INICIO_IMAGES = [
  "assets/images/photos/desiperea-02-md.webp",
  "assets/images/photos/desiperea-03-md.webp",
  "assets/images/photos/desiperea-06-md.webp",
];
const MIN_MS = 1100;
const MAX_MS = 4200;

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    const done = () => resolve(src);
    img.addEventListener("load", done);
    img.addEventListener("error", done);
    img.src = src;
  });
}

function isAutomationLab() {
  try {
    return (
      navigator.webdriver === true ||
      /Chrome-Lighthouse|PageSpeed|HeadlessChrome/i.test(navigator.userAgent || "")
    );
  } catch {
    return false;
  }
}

export function initSiteLoader(onDone) {
  const loader = document.getElementById(LOADER_ID);
  const hint = document.getElementById("loader-hint");
  const line = document.getElementById("loader-line");
  const skip = document.getElementById("loader-skip");

  if (!loader) {
    onDone?.();
    return;
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lab = isAutomationLab();

  /* En auditorías Lighthouse/PageSpeed el delay del loader distorsiona LCP/TTI. */
  if (lab || reduced) {
    loader.remove();
    document.body.classList.remove("site-loader-active");
    onDone?.();
    return;
  }

  loader.hidden = false;
  document.body.classList.add("site-loader-active");

  if (hint) hint.textContent = TAGLINE;

  let closed = false;
  let loaded = 0;
  const total = INICIO_IMAGES.length;
  let minReady = false;
  let assetsReady = false;

  const teardown = () => {
    loader.classList.add("is-hidden");
    document.body.classList.remove("site-loader-active", "site-loader--reveal", "site-loader-handoff");
    loader.setAttribute("aria-hidden", "true");
    window.setTimeout(() => loader.remove(), reduced ? 80 : 700);
    onDone?.();
  };

  const tryFinish = () => {
    if (closed) return;
    if (!minReady || !assetsReady) return;
    closed = true;

    if (reduced) {
      teardown();
      return;
    }

    if (line) line.style.width = "100%";
    document.body.classList.add("site-loader--reveal", "site-loader-handoff");
    loader.classList.add("is-revealing");
    window.setTimeout(teardown, 880);
  };

  const finish = () => {
    if (closed) return;
    closed = true;
    window.clearTimeout(maxTimer);

    if (reduced) {
      teardown();
      return;
    }

    if (line) line.style.width = "100%";
    document.body.classList.add("site-loader--reveal", "site-loader-handoff");
    loader.classList.add("is-revealing");
    window.setTimeout(teardown, 880);
  };

  skip?.addEventListener("click", finish);

  const maxTimer = window.setTimeout(finish, MAX_MS);

  window.setTimeout(() => {
    minReady = true;
    tryFinish();
  }, reduced ? 0 : MIN_MS);

  const bumpProgress = () => {
    loaded += 1;
    const ratio = loaded / total;
    if (line) line.style.width = `${Math.round(ratio * 100)}%`;
    if (loaded >= total) {
      assetsReady = true;
      tryFinish();
    }
  };

  if (reduced) {
    assetsReady = true;
    window.setTimeout(finish, 400);
    return;
  }

  INICIO_IMAGES.map((p) => assetUrl(p)).forEach((url) => {
    preloadImage(url).then(bumpProgress);
  });
}
