/* ============================================================
   ARENA.CLUB — интерактив лендинга
   ============================================================ */
"use strict";

/* ---------- Утилиты ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const fmt = (n) => n.toLocaleString("ru-RU") + " ₽";

/* ============================================================
   ШАПКА: скролл + бургер
   ============================================================ */
const header = $("#header");
const burger = $("#burger");
const nav = $("#nav");

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 30);
}, { passive: true });

burger.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  burger.classList.toggle("is-open", open);
  burger.setAttribute("aria-expanded", String(open));
});
$$(".nav__link", nav).forEach((link) =>
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  })
);

/* ============================================================
   HUD: часы, пинг, FPS
   ============================================================ */
const hudClock = $("#hudClock");
const hudPing = $("#hudPing");
const hudFps = $("#hudFps");

setInterval(() => {
  const d = new Date();
  hudClock.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((v) => String(v).padStart(2, "0")).join(":");
}, 1000);

setInterval(() => { hudPing.textContent = (4 + Math.floor(Math.random() * 3)) + " MS"; }, 2400);
setInterval(() => { hudFps.textContent = String(236 + Math.floor(Math.random() * 9)); }, 1600);

/* ============================================================
   HERO: ряды ПК с RGB-подсветкой (генерация SVG)
   ============================================================ */
(function buildHeroScene() {
  const NS = "http://www.w3.org/2000/svg";
  const far = $("#pcRowsFar");
  const near = $("#pcRowsNear");
  if (!far || !near) return;

  function pcRow(group, count, y, scale, opacity) {
    for (let i = 0; i < count; i++) {
      const x = 60 + i * ((1440 - 120) / (count - 1)) - 40 * scale;
      const w = 80 * scale;
      const monH = 46 * scale;
      const g = document.createElementNS(NS, "g");
      g.setAttribute("opacity", opacity.toFixed(2));

      // свечение под станцией
      const glow = document.createElementNS(NS, "ellipse");
      glow.setAttribute("cx", x + w / 2);
      glow.setAttribute("cy", y + monH + 30 * scale);
      glow.setAttribute("rx", 60 * scale);
      glow.setAttribute("ry", 12 * scale);
      glow.setAttribute("fill", i % 2 ? "#E100FF" : "#00E5FF");
      glow.setAttribute("class", "pc-glow");
      glow.style.animationDelay = (i * 0.35) + "s";
      g.appendChild(glow);

      // монитор
      const mon = document.createElementNS(NS, "rect");
      mon.setAttribute("x", x);
      mon.setAttribute("y", y);
      mon.setAttribute("width", w);
      mon.setAttribute("height", monH);
      mon.setAttribute("rx", 3 * scale);
      mon.setAttribute("fill", "#11141B");
      mon.setAttribute("stroke", i % 2 ? "#E100FF" : "#00E5FF");
      mon.setAttribute("stroke-width", 1.4);
      mon.setAttribute("stroke-opacity", ".55");
      g.appendChild(mon);

      // экран
      const scr = document.createElementNS(NS, "rect");
      scr.setAttribute("x", x + 5 * scale);
      scr.setAttribute("y", y + 5 * scale);
      scr.setAttribute("width", w - 10 * scale);
      scr.setAttribute("height", monH - 10 * scale);
      scr.setAttribute("fill", i % 2 ? "#E100FF" : "#00E5FF");
      scr.setAttribute("opacity", ".16");
      g.appendChild(scr);

      // стойка + системный блок с RGB-линией
      const stand = document.createElementNS(NS, "rect");
      stand.setAttribute("x", x + w / 2 - 3 * scale);
      stand.setAttribute("y", y + monH);
      stand.setAttribute("width", 6 * scale);
      stand.setAttribute("height", 12 * scale);
      stand.setAttribute("fill", "#1B2233");
      g.appendChild(stand);

      const rgb = document.createElementNS(NS, "rect");
      rgb.setAttribute("x", x + w + 10 * scale);
      rgb.setAttribute("y", y + 6 * scale);
      rgb.setAttribute("width", 14 * scale);
      rgb.setAttribute("height", monH + 6 * scale);
      rgb.setAttribute("rx", 2 * scale);
      rgb.setAttribute("fill", "url(#rgbline)");
      rgb.setAttribute("class", "pc-glow");
      rgb.style.animationDelay = (i * 0.5 + 0.2) + "s";
      g.appendChild(rgb);

      group.appendChild(g);
    }
  }

  pcRow(far, 9, 150, 0.62, 0.55);
  pcRow(near, 7, 300, 1.0, 0.9);
})();

/* ============================================================
   КАРТА ЗАЛА: генерация мест, выбор, бронь
   ============================================================ */
const TIERS = {
  standard: {
    name: "STANDARD",
    price: 150,
    specs: ["RTX 4060 · 165 Гц", "Ryzen 5 7600 · 32 GB", "24.5\" IPS · 1440p"],
  },
  pro: {
    name: "PRO",
    price: 250,
    specs: ["RTX 4070 · 240 Гц", "Ryzen 7 7800X3D · 64 GB", "25\" Fast IPS · турнирная зона"],
  },
  vip: {
    name: "VIP-КАБИНА",
    price: 450,
    specs: ["RTX 4080 · 360 Гц OLED", "i9-14900K · 64 GB", "Кресло премиум + диван"],
  },
};

const seats = []; // {id, tier, occupied, x, y, w, h}
(function layoutSeats() {
  // STANDARD: 2 ряда по 10
  const sPitch = 74, sW = 52, sH = 40, sStartX = (900 - 9 * sPitch - sW) / 2;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 10; c++) {
      seats.push({
        id: "S-" + String(r * 10 + c + 1).padStart(2, "0"),
        tier: "standard",
        x: sStartX + c * sPitch,
        y: 70 + r * 78,
        w: sW, h: sH,
        occupied: false,
      });
    }
  }
  // PRO: 2 ряда по 8
  const pPitch = 88, pW = 58, pH = 44, pStartX = (900 - 7 * pPitch - pW) / 2;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 8; c++) {
      seats.push({
        id: "P-" + String(r * 8 + c + 1).padStart(2, "0"),
        tier: "pro",
        x: pStartX + c * pPitch,
        y: 252 + r * 84,
        w: pW, h: pH,
        occupied: false,
      });
    }
  }
  // VIP: 4 кабины
  const vPitch = 176, vW = 118, vH = 62, vStartX = (900 - 3 * vPitch - vW) / 2;
  for (let c = 0; c < 4; c++) {
    seats.push({
      id: "V-0" + (c + 1),
      tier: "vip",
      x: vStartX + c * vPitch,
      y: 462,
      w: vW, h: vH,
      occupied: false,
    });
  }

  // Детерминированный «рандом» занятости: 26 занято, 14 свободно
  let seed = 42;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const order = seats.map((_, i) => i).sort(() => rnd() - 0.5);
  order.slice(0, 26).forEach((i) => (seats[i].occupied = true));
})();

const hallMap = $("#hallMap");
const selected = new Set();
let hours = 3;

/* ---------- Счётчики свободных машин (объявлены до отрисовки карты) ---------- */
const freeCountHero = $("#freeCountHero");
const freeCountMap = $("#freeCountMap");
const freeCountFinal = $("#freeCountFinal");

function freeCount() {
  return seats.filter((s) => !s.occupied && !selected.has(s.id)).length;
}
function updateCounters() {
  const n = freeCount();
  freeCountHero.textContent = n;
  freeCountMap.textContent = n;
  freeCountFinal.textContent = n;
}

(function renderHallMap() {
  const NS = "http://www.w3.org/2000/svg";
  const labels = [
    { text: "STANDARD ZONE // 150 ₽/Ч", x: 30, y: 48 },
    { text: "PRO ZONE // 250 ₽/Ч", x: 30, y: 232 },
    { text: "VIP КАБИНЫ // 450 ₽/Ч", x: 30, y: 444 },
  ];
  labels.forEach((l) => {
    const t = document.createElementNS(NS, "text");
    t.setAttribute("x", l.x); t.setAttribute("y", l.y);
    t.setAttribute("class", "zone-label");
    t.textContent = l.text;
    hallMap.appendChild(t);
  });

  seats.forEach((seat, idx) => {
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "seat");
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.dataset.idx = idx;

    const body = document.createElementNS(NS, "rect");
    body.setAttribute("class", "seat__body");
    body.setAttribute("x", seat.x); body.setAttribute("y", seat.y);
    body.setAttribute("width", seat.w); body.setAttribute("height", seat.h);
    body.setAttribute("rx", seat.tier === "vip" ? 10 : 6);
    g.appendChild(body);

    // экран станции
    const scr = document.createElementNS(NS, "rect");
    scr.setAttribute("class", "seat__screen");
    scr.setAttribute("x", seat.x + seat.w * 0.22);
    scr.setAttribute("y", seat.y + seat.h * 0.2);
    scr.setAttribute("width", seat.w * 0.56);
    scr.setAttribute("height", seat.h * 0.34);
    scr.setAttribute("rx", 2);
    scr.setAttribute("fill", seat.tier === "vip" ? "#E100FF" : "#00E5FF");
    scr.setAttribute("opacity", ".35");
    g.appendChild(scr);

    const label = document.createElementNS(NS, "text");
    label.setAttribute("x", seat.x + seat.w / 2);
    label.setAttribute("y", seat.y + seat.h * 0.86);
    label.setAttribute("text-anchor", "middle");
    label.textContent = seat.id;
    g.appendChild(label);

    g.addEventListener("click", () => onSeatClick(idx));
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSeatClick(idx); }
    });
    hallMap.appendChild(g);
  });
  paintSeats();
})();

function paintSeats() {
  $$(".seat", hallMap).forEach((g) => {
    const seat = seats[g.dataset.idx];
    const isSel = selected.has(seat.id);
    g.setAttribute("class",
      "seat" +
      (seat.tier === "vip" ? " seat--vip" : "") +
      (isSel ? " seat--selected" : seat.occupied ? " seat--occupied" : " seat--free"));
    g.setAttribute("aria-label",
      `Место ${seat.id}, ${TIERS[seat.tier].name}, ${seat.occupied ? "занято" : "свободно"}`);
  });
  updateCounters();
}

/* «Живой» счётчик: раз в 20-35 сек одно место освобождается/занимается */
setInterval(() => {
  const candidates = seats.filter((s) => !selected.has(s.id));
  if (!candidates.length) return;
  const seat = candidates[Math.floor(Math.random() * candidates.length)];
  seat.occupied = !seat.occupied;
  paintSeats();
}, 20000 + Math.random() * 15000);

/* ---------- Панель бронирования ---------- */
const stationCard = $("#stationCard");
const bookingEmpty = $("#bookingEmpty");
const bookingBody = $("#bookingBody");
const bookingStep = $("#bookingStep");
const teamCount = $("#teamCount");
const teamBar = $("#teamBar");
const teamHint = $("#teamHint");
const selectedSeatsBox = $("#selectedSeats");
const hoursValue = $("#hoursValue");
const totalLine = $("#totalLine");
const totalSum = $("#totalSum");
const discountRow = $("#discountRow");
const discountSum = $("#discountSum");
const finalSum = $("#finalSum");
const toast = $(".toast") || createToast();

function createToast() {
  const el = document.createElement("div");
  el.className = "toast";
  document.body.appendChild(el);
  return el;
}
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function onSeatClick(idx) {
  const seat = seats[idx];
  showStationCard(seat);
  if (seat.occupied) {
    showToast(`Место ${seat.id} занято — выбери другое`);
    return;
  }
  if (selected.has(seat.id)) selected.delete(seat.id);
  else {
    if (selected.size >= 10) { showToast("Максимум 10 мест за одну бронь"); return; }
    selected.add(seat.id);
  }
  paintSeats();
  renderPanel();
}

function showStationCard(seat) {
  const tier = TIERS[seat.tier];
  stationCard.hidden = false;
  $("#stName").textContent = seat.id;
  $("#stTier").textContent = tier.name;
  $("#stSpecs").innerHTML = tier.specs.map((s) => `<li>▸ ${s}</li>`).join("");
  $("#stPrice").textContent = tier.price;
}

function plural(n, one, few, many) {
  const m = Math.abs(n) % 100, d = m % 10;
  if (m > 10 && m < 20) return many;
  if (d > 1 && d < 5) return few;
  if (d === 1) return one;
  return many;
}

function renderPanel() {
  const n = selected.size;
  bookingEmpty.hidden = n > 0;
  bookingBody.hidden = n === 0;
  bookingStep.textContent = n === 0 ? "ШАГ 1/3" : "ШАГ 2/3";

  teamCount.textContent = Math.min(n, 5) + "/5";
  teamBar.style.width = Math.min(n / 5, 1) * 100 + "%";
  const fullTeam = n >= 5;
  teamHint.textContent = fullTeam
    ? "Пятёрка собрана! Скидка 10% применена"
    : "5 мест рядом — скидка 10% на всю пачку";
  teamHint.classList.toggle("is-done", fullTeam);

  selectedSeatsBox.innerHTML = [...selected].sort().map((id) => `<span class="chip">${id}</span>`).join("");

  const perHour = [...selected].reduce((sum, id) => sum + TIERS[seats.find((s) => s.id === id).tier].price, 0);
  const raw = perHour * hours;
  const discount = fullTeam ? Math.round(raw * 0.1) : 0;

  totalLine.textContent = `${n} ${plural(n, "место", "места", "мест")} × ${hours} ч`;
  totalSum.textContent = fmt(raw);
  discountRow.hidden = !fullTeam;
  discountSum.textContent = "−" + fmt(discount);
  finalSum.textContent = fmt(raw - discount);
}

/* ---------- Часы ---------- */
function setHours(v) {
  hours = Math.min(12, Math.max(1, v));
  hoursValue.textContent = hours;
  $$("#hoursQuick button").forEach((b) => b.classList.toggle("is-active", +b.dataset.h === hours));
  renderPanel();
}
$("#hoursMinus").addEventListener("click", () => setHours(hours - 1));
$("#hoursPlus").addEventListener("click", () => setHours(hours + 1));
$$("#hoursQuick button").forEach((b) => b.addEventListener("click", () => setHours(+b.dataset.h)));

/* ---------- Модалки ---------- */
function openModal(modal) {
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeModal(modal) {
  modal.hidden = true;
  document.body.style.overflow = "";
}
$$(".modal").forEach((modal) => {
  $$("[data-close]", modal).forEach((el) =>
    el.addEventListener("click", () => closeModal(modal)));
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") $$(".modal").forEach((m) => { if (!m.hidden) closeModal(m); });
});

/* ---------- Бронь: шаг 3 ---------- */
const bookingModal = $("#bookingModal");
$("#bookBtn").addEventListener("click", () => {
  if (!selected.size) { showToast("Сначала выбери места на схеме"); return; }
  bookingStep.textContent = "ШАГ 3/3";
  $("#bookingSummary").textContent =
    [...selected].sort().join(", ") + ` · ${hours} ч · ${finalSum.textContent}`;
  openModal(bookingModal);
});
/* После закрытия окна успеха — места становятся занятыми */
$$("#bookingModal [data-close]").forEach((el) =>
  el.addEventListener("click", () => {
    if (!selected.size) return;
    seats.forEach((s) => { if (selected.has(s.id)) s.occupied = true; });
    selected.clear();
    paintSeats();
    renderPanel();
    stationCard.hidden = true;
  })
);

/* ---------- Регистрация команды ---------- */
const registerModal = $("#registerModal");
const regForm = $("#regForm");
const regSuccess = $("#regSuccess");

$$(".js-register").forEach((btn) =>
  btn.addEventListener("click", () => {
    $("#regTourName").textContent = btn.dataset.tour;
    regForm.hidden = false;
    regSuccess.hidden = true;
    regForm.reset();
    $$(".is-error", regForm).forEach((i) => i.classList.remove("is-error"));
    openModal(registerModal);
  })
);

regForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let ok = true;
  $$("input", regForm).forEach((input) => {
    const bad = !input.value.trim();
    input.classList.toggle("is-error", bad);
    if (bad) ok = false;
  });
  if (!ok) return;
  $("#regSuccessTeam").textContent = regForm.team.value.trim();
  regForm.hidden = true;
  regSuccess.hidden = false;
});

/* ============================================================
   REVEAL-анимации + счётчики табло
   ============================================================ */
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    $$(".scoreboard__digits", entry.target).forEach(runCounter);
    io.unobserve(entry.target);
  });
}, { threshold: 0.18 });
$$(".reveal").forEach((el) => io.observe(el));

function runCounter(el) {
  if (el.dataset.done) return;
  el.dataset.done = "1";
  const target = +el.dataset.count;
  const dur = 1200;
  const t0 = performance.now();
  (function tick(t) {
    const p = Math.min((t - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased).toLocaleString("ru-RU");
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

/* ============================================================
   СЛАЙДЕР АТМОСФЕРЫ
   ============================================================ */
(function vibeSlider() {
  const slides = $$(".vibe-slide");
  const dotsBox = $("#vibeDots");
  let current = 0, timer;

  slides.forEach((_, i) => {
    const d = document.createElement("button");
    d.setAttribute("aria-label", "Слайд " + (i + 1));
    d.addEventListener("click", () => go(i));
    dotsBox.appendChild(d);
  });
  const dots = $$("button", dotsBox);

  function go(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("is-active", k === current));
    dots.forEach((d, k) => d.classList.toggle("is-active", k === current));
    restart();
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(current + 1), 6000);
  }
  $("#vibePrev").addEventListener("click", () => go(current - 1));
  $("#vibeNext").addEventListener("click", () => go(current + 1));
  go(0);
})();

/* ============================================================
   КАРУСЕЛЬ ОТЗЫВОВ
   ============================================================ */
(function reviewsCarousel() {
  const track = $("#reviewsTrack");
  const cards = $$(".review-card", track);
  const dotsBox = $("#revDots");
  let index = 0;

  const visible = () => (window.innerWidth <= 860 ? 1 : 2);
  const maxIndex = () => Math.max(0, cards.length - visible());

  function render() {
    const gap = 22;
    const w = cards[0].getBoundingClientRect().width + gap;
    index = Math.min(index, maxIndex());
    track.style.transform = `translateX(${-index * w}px)`;
    renderDots();
  }
  function renderDots() {
    dotsBox.innerHTML = "";
    for (let i = 0; i <= maxIndex(); i++) {
      const d = document.createElement("button");
      d.setAttribute("aria-label", "Отзыв " + (i + 1));
      d.classList.toggle("is-active", i === index);
      d.addEventListener("click", () => { index = i; render(); });
      dotsBox.appendChild(d);
    }
  }
  $("#revPrev").addEventListener("click", () => { index = index <= 0 ? maxIndex() : index - 1; render(); });
  $("#revNext").addEventListener("click", () => { index = index >= maxIndex() ? 0 : index + 1; render(); });
  window.addEventListener("resize", render);
  render();
})();
