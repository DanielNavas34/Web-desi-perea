import { config, assetUrl } from "./config.js";

const BANNER_ID = "cookie-consent-banner";
const PREFS_ID = "cookie-preferences-dialog";
const FONTS_ID = "consent-fonts-stylesheet";

const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap";

function cookieConfig() {
  return config.cookies ?? { enabled: false };
}

function policyLink() {
  const inLegal = /\/legal\//i.test(window.location.pathname);
  return inLegal ? "cookies.html" : assetUrl("legal/cookies.html");
}

function readStoredConsent() {
  const { storageKey } = cookieConfig();
  if (!storageKey) return null;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeConsent(choices) {
  const { storageKey, policyVersion } = cookieConfig();
  const payload = {
    necessary: true,
    functional: Boolean(choices.functional),
    analytics: Boolean(choices.analytics),
    marketing: Boolean(choices.marketing),
    policyVersion,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(storageKey, JSON.stringify(payload));
  return payload;
}

export function getCookieConsent() {
  const stored = readStoredConsent();
  if (!stored) return null;
  if (stored.policyVersion !== cookieConfig().policyVersion) return null;
  return stored;
}

function loadExternalFonts() {
  if (document.getElementById(FONTS_ID)) {
    document.body.classList.add("fonts-consented");
    return;
  }
  const link = document.createElement("link");
  link.id = FONTS_ID;
  link.rel = "stylesheet";
  link.href = GOOGLE_FONTS_HREF;
  link.onload = () => document.body.classList.add("fonts-consented");
  document.head.appendChild(link);
}

function unloadExternalFonts() {
  document.getElementById(FONTS_ID)?.remove();
  document.body.classList.remove("fonts-consented");
}

function loadAnalytics() {
  const { analytics } = cookieConfig();
  if (!analytics?.enabled || !analytics.measurementId) return;
  /* Extensión: cargar script de analítica solo aquí, nunca antes del consentimiento. */
}

function applyConsent(consent) {
  if (!consent) return;
  if (consent.functional) loadExternalFonts();
  else unloadExternalFonts();
  if (consent.analytics) loadAnalytics();
}

function removeBanner() {
  document.getElementById(BANNER_ID)?.remove();
  document.body.classList.remove("cookie-banner-open");
}

function saveAndClose(choices) {
  const consent = writeConsent(choices);
  applyConsent(consent);
  removeBanner();
  document.getElementById(PREFS_ID)?.close();
}

function buildPreferencesDialog(initial = { functional: false, analytics: false }) {
  let dialog = document.getElementById(PREFS_ID);
  if (dialog) dialog.remove();

  dialog = document.createElement("dialog");
  dialog.id = PREFS_ID;
  dialog.className = "cookie-preferences";
  dialog.setAttribute("aria-labelledby", "cookie-prefs-title");

  const panel = document.createElement("div");
  panel.className = "cookie-preferences__panel";

  const title = document.createElement("h2");
  title.id = "cookie-prefs-title";
  title.className = "cookie-preferences__title";
  title.textContent = cookieConfig().banner.preferencesTitle;

  const intro = document.createElement("p");
  intro.className = "cookie-preferences__intro";
  intro.textContent = cookieConfig().banner.preferencesIntro;

  panel.append(title, intro);

  const necessary = buildPrefRow({
    id: "pref-necessary",
    name: cookieConfig().categories.necessary.title,
    desc: cookieConfig().categories.necessary.description,
    locked: true,
    checked: true,
  });
  panel.appendChild(necessary);

  const functionalCheck = document.createElement("input");
  functionalCheck.type = "checkbox";
  functionalCheck.id = "pref-functional";
  functionalCheck.checked = Boolean(initial.functional);
  const functional = buildPrefRow({
    id: "pref-functional",
    name: cookieConfig().categories.functional.title,
    desc: cookieConfig().categories.functional.description,
    input: functionalCheck,
  });
  panel.appendChild(functional);

  const analyticsCheck = document.createElement("input");
  analyticsCheck.type = "checkbox";
  analyticsCheck.id = "pref-analytics";
  analyticsCheck.checked = Boolean(initial.analytics);
  if (!cookieConfig().analytics?.enabled) {
    analyticsCheck.disabled = true;
  }
  const analytics = buildPrefRow({
    id: "pref-analytics",
    name: cookieConfig().categories.analytics.title,
    desc: cookieConfig().categories.analytics.description,
    input: analyticsCheck,
  });
  panel.appendChild(analytics);

  const actions = document.createElement("div");
  actions.className = "cookie-preferences__actions";

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.className = "btn btn--primary";
  saveBtn.textContent = cookieConfig().banner.savePreferencesLabel;
  saveBtn.addEventListener("click", () => {
    saveAndClose({
      functional: functionalCheck.checked,
      analytics: analyticsCheck.checked && !analyticsCheck.disabled,
      marketing: false,
    });
  });

  const rejectBtn = document.createElement("button");
  rejectBtn.type = "button";
  rejectBtn.className = "btn btn--secondary";
  rejectBtn.textContent = cookieConfig().banner.rejectAllLabel;
  rejectBtn.addEventListener("click", () => {
    saveAndClose({ functional: false, analytics: false, marketing: false });
  });

  actions.append(rejectBtn, saveBtn);
  panel.appendChild(actions);
  dialog.appendChild(panel);
  document.body.appendChild(dialog);

  dialog.addEventListener("close", () => {
    document.body.classList.remove("cookie-banner-open");
  });

  return dialog;
}

function buildPrefRow({ id, name, desc, locked = false, checked = false, input }) {
  const row = document.createElement("div");
  row.className = "cookie-pref";

  const head = document.createElement("div");
  head.className = "cookie-pref__head";

  const label = document.createElement("label");
  label.htmlFor = id;
  label.className = "cookie-pref__name";
  label.textContent = name;

  head.appendChild(label);

  if (locked) {
    const lock = document.createElement("span");
    lock.className = "cookie-pref__lock";
    lock.textContent = cookieConfig().banner.alwaysActiveLabel;
    head.appendChild(lock);
  } else if (input) {
    input.id = id;
    head.appendChild(input);
  }

  const description = document.createElement("p");
  description.className = "cookie-pref__desc";
  description.textContent = desc;

  row.append(head, description);
  if (locked && !input) {
    const hidden = document.createElement("input");
    hidden.type = "checkbox";
    hidden.id = id;
    hidden.checked = checked;
    hidden.disabled = true;
    hidden.hidden = true;
    row.appendChild(hidden);
  }
  return row;
}

function buildBanner() {
  const { banner } = cookieConfig();
  const href = policyLink();

  const root = document.createElement("div");
  root.id = BANNER_ID;
  root.className = "cookie-banner";
  root.setAttribute("role", "region");
  root.setAttribute("aria-labelledby", "cookie-banner-title");
  root.setAttribute("aria-describedby", "cookie-banner-desc");

  const inner = document.createElement("div");
  inner.className = "cookie-banner__inner container";

  const copy = document.createElement("div");
  copy.className = "cookie-banner__copy";
  const title = document.createElement("p");
  title.id = "cookie-banner-title";
  title.className = "cookie-banner__title";
  title.textContent = banner.title;
  const desc = document.createElement("p");
  desc.id = "cookie-banner-desc";
  desc.className = "cookie-banner__text";
  desc.textContent = banner.description;
  const policy = document.createElement("p");
  policy.className = "cookie-banner__policy";
  const policyA = document.createElement("a");
  policyA.href = href;
  policyA.textContent = banner.policyLinkLabel;
  policy.appendChild(policyA);
  copy.append(title, desc, policy);

  const actions = document.createElement("div");
  actions.className = "cookie-banner__actions";

  const btnReject = document.createElement("button");
  btnReject.type = "button";
  btnReject.className = "btn btn--secondary cookie-banner__btn cookie-banner__btn--reject";
  btnReject.textContent = banner.rejectAllLabel;
  btnReject.addEventListener("click", () => {
    saveAndClose({ functional: false, analytics: false, marketing: false });
  });

  const btnConfig = document.createElement("button");
  btnConfig.type = "button";
  btnConfig.className = "btn btn--ghost cookie-banner__btn cookie-banner__btn--config";
  btnConfig.textContent = banner.configureLabel;
  btnConfig.addEventListener("click", () => {
    const dialog = buildPreferencesDialog({ functional: false, analytics: false });
    dialog.showModal();
    dialog.querySelector("#pref-functional")?.focus();
  });

  const btnAccept = document.createElement("button");
  btnAccept.type = "button";
  btnAccept.className = "btn btn--secondary cookie-banner__btn cookie-banner__btn--accept";
  btnAccept.textContent = banner.acceptAllLabel;
  btnAccept.addEventListener("click", () => {
    saveAndClose({
      functional: true,
      analytics: Boolean(cookieConfig().analytics?.enabled),
      marketing: false,
    });
  });

  actions.append(btnReject, btnConfig, btnAccept);
  inner.append(copy, actions);
  root.appendChild(inner);
  return root;
}

export function openCookiePreferences() {
  if (!cookieConfig().enabled) return;
  removeBanner();
  const existing = getCookieConsent();
  const dialog = buildPreferencesDialog({
    functional: existing?.functional ?? false,
    analytics: existing?.analytics ?? false,
  });
  document.body.classList.add("cookie-banner-open");
  dialog.showModal();
}

export function initCookieConsent() {
  const cfg = cookieConfig();
  if (!cfg.enabled) return;

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-cookie-manage]");
    if (trigger) {
      e.preventDefault();
      openCookiePreferences();
    }
  });

  const existing = getCookieConsent();
  if (existing) {
    applyConsent(existing);
    return;
  }

  document.body.appendChild(buildBanner());
  document.body.classList.add("cookie-banner-open");
  requestAnimationFrame(() => {
    document.querySelector(`#${BANNER_ID} .cookie-banner__btn--reject`)?.focus();
  });
}
