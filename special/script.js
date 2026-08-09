/* ============================================================
   Тематики по запросу — логика витрины
   ============================================================ */

// --- Контакты из catalog.js ---
document.getElementById("contact-telegram").href = CONTACTS.telegram;
document.getElementById("contact-telegram-label").textContent = CONTACTS.telegramLabel;
document.getElementById("contact-email").href = "mailto:" + CONTACTS.email;
document.getElementById("contact-email-label").textContent = CONTACTS.email;
document.getElementById("contact-phone").textContent = CONTACTS.phone;
document.getElementById("year").textContent = new Date().getFullYear();

// --- Рендер групп работ ---
const container = document.getElementById("works");
const PREVIEW_WIDTH = 1440;

function cardHTML(work) {
  return `
    <a class="card reveal" href="${work.path}" target="_blank" rel="noopener">
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

function renderWorks() {
  const groups = [];
  WORKS.forEach(w => {
    let g = groups.find(g => g.category === w.category);
    if (!g) groups.push(g = { category: w.category, works: [] });
    g.works.push(w);
  });
  container.innerHTML = groups.map(g => `
    <section class="works-group">
      <h2 class="group-title">${g.category} <span class="group-count">${g.works.length}</span></h2>
      <div class="grid">${g.works.map(cardHTML).join("")}</div>
    </section>`).join("");
  scalePreviews();
  observeIframes();
  observeReveals();
}

// --- Масштаб iframe-превью ---
function scalePreviews() {
  container.querySelectorAll(".card-preview").forEach(preview => {
    const iframe = preview.querySelector("iframe");
    const scale = preview.clientWidth / PREVIEW_WIDTH;
    iframe.style.transform = `scale(${scale})`;
    iframe.style.height = `${preview.clientHeight / scale}px`;
  });
}
window.addEventListener("resize", scalePreviews);

// --- Ленивая загрузка превью ---
const iframeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const iframe = entry.target;
    if (!iframe.src && iframe.dataset.src) iframe.src = iframe.dataset.src;
    iframeObserver.unobserve(iframe);
  });
}, { rootMargin: "200px" });

function observeIframes() {
  container.querySelectorAll("iframe[data-src]").forEach(f => iframeObserver.observe(f));
}

// --- Появление при скролле ---
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

// --- Старт ---
renderWorks();
observeReveals();
