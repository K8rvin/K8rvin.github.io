/* ============================================================
   LandingWorks — логика витрины
   ============================================================ */

// --- Контакты из catalog.js ---
document.getElementById("contact-telegram").href = CONTACTS.telegram;
document.getElementById("contact-telegram-label").textContent = CONTACTS.telegramLabel;
document.getElementById("contact-email").href = "mailto:" + CONTACTS.email;
document.getElementById("contact-email-label").textContent = CONTACTS.email;
document.getElementById("year").textContent = new Date().getFullYear();

// --- Рендер карточек работ ---
const grid = document.getElementById("works-grid");
const filtersEl = document.getElementById("filters");
const PREVIEW_WIDTH = 1440; // «экран» внутри превью, под него считается scale

function cardHTML(work) {
  return `
    <a class="card reveal" href="${work.path}" target="_blank" rel="noopener" data-category="${work.category}">
      <div class="card-preview">
        <iframe data-src="${work.path}" loading="lazy" tabindex="-1" title="Превью: ${work.title}"></iframe>
        <div class="card-open"><span>Открыть лендинг →</span></div>
      </div>
      <div class="card-body">
        <span class="card-cat">${work.category}</span>
        <div class="card-title">${work.title}</div>
        <div class="card-style">${work.style}</div>
      </div>
    </a>`;
}

function renderWorks(category) {
  const list = category === "Все" ? WORKS : WORKS.filter(w => w.category === category);
  grid.innerHTML = list.map(cardHTML).join("");
  scalePreviews();
  observeIframes();
  observeReveals();
}

// --- Масштаб iframe-превью под ширину карточки ---
function scalePreviews() {
  grid.querySelectorAll(".card-preview").forEach(preview => {
    const iframe = preview.querySelector("iframe");
    const scale = preview.clientWidth / PREVIEW_WIDTH;
    iframe.style.transform = `scale(${scale})`;
    iframe.style.height = `${preview.clientHeight / scale}px`;
  });
}
window.addEventListener("resize", scalePreviews);

// --- Ленивая загрузка превью: iframe получает src, только когда виден ---
const iframeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const iframe = entry.target;
    if (!iframe.src && iframe.dataset.src) iframe.src = iframe.dataset.src;
    iframeObserver.unobserve(iframe);
  });
}, { rootMargin: "200px" });

function observeIframes() {
  grid.querySelectorAll("iframe[data-src]").forEach(f => iframeObserver.observe(f));
}

// --- Фильтры по тематикам ---
function renderFilters() {
  const categories = ["Все", ...new Set(WORKS.map(w => w.category))];
  filtersEl.innerHTML = categories
    .map((c, i) => `<button class="chip${i === 0 ? " active" : ""}" data-category="${c}">${c}</button>`)
    .join("");

  filtersEl.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    filtersEl.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    renderWorks(chip.dataset.category);
  });
}

// --- Появление блоков при скролле ---
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

function observeReveals() {
  document.querySelectorAll(".reveal:not(.visible)").forEach(el => revealObserver.observe(el));
}

// --- Шапка при скролле ---
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 30);
}, { passive: true });

// --- Счётчики в hero ---
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.count;
    const t0 = performance.now();
    const duration = 1200;
    (function tick(t) {
      const p = Math.min((t - t0) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll("[data-count]").forEach(el => counterObserver.observe(el));

// --- Старт ---
renderFilters();
renderWorks("Все");
observeReveals();
