/**
 * Efectos visuales del hero — respeta prefers-reduced-motion.
 */
export function setHeroTitleAnimated(name) {
  const h1 = document.getElementById("hero-title");
  if (!h1 || !name) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    h1.textContent = name;
    return;
  }

  h1.textContent = "";
  h1.classList.add("hero__title--split");

  [...name].forEach((char, index) => {
    const span = document.createElement("span");
    span.className = "hero-char";
    span.style.setProperty("--char-i", String(index));
    span.textContent = char === " " ? "\u00a0" : char;
    h1.appendChild(span);
  });
}

export function initHeroSpotlight() {
  const frame = document.getElementById("hero-frame");
  const section = document.getElementById("inicio");
  if (!frame || !section) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const desktop = window.matchMedia("(min-width: 1024px)").matches;
  if (reduced || !finePointer || !desktop) {
    frame.classList.add("hero__frame--static");
    return;
  }

  const maxTilt = 4;

  section.addEventListener("pointermove", (e) => {
    const rect = frame.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotY = x * maxTilt * 2;
    const rotX = -y * maxTilt * 2;
    frame.style.setProperty("--tilt-x", `${rotX}deg`);
    frame.style.setProperty("--tilt-y", `${rotY}deg`);
    frame.style.setProperty("--glow-x", `${(x + 0.5) * 100}%`);
    frame.style.setProperty("--glow-y", `${(y + 0.5) * 100}%`);
  });

  section.addEventListener("pointerleave", () => {
    frame.style.setProperty("--tilt-x", "0deg");
    frame.style.setProperty("--tilt-y", "0deg");
    frame.style.setProperty("--glow-x", "50%");
    frame.style.setProperty("--glow-y", "40%");
  });
}

export function initHeroEffects() {
  initHeroSpotlight();
}
