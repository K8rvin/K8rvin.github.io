/* ============================================================
   Nord Forest — интерактив: бронирование, слайдер, отзывы,
   звёзды, параллакс, reveal-анимации. Ванильный JS.
   ============================================================ */
"use strict";

/* ---------- утилиты ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const fmtRub = (n) => n.toLocaleString("ru-RU") + " ₽";
const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const MONTHS_NOM = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
const DOW_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function plural(n, one, few, many) {
  const m = n % 10, h = n % 100;
  if (m === 1 && h !== 11) return one;
  if (m >= 2 && m <= 4 && (h < 10 || h >= 20)) return few;
  return many;
}
function fmtDate(d) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
function fmtDateShort(d) {
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}.`;
}
const dayKey = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => { const c = new Date(d); c.setDate(c.getDate() + n); return c; };

/* ---------- данные ---------- */
const HOUSES = {
  lake: { name: "Купол у озера", base: 14000, weekend: 17000, maxGuests: 2 },
  barn: { name: "Барнхаус в лесу", base: 18000, weekend: 22000, maxGuests: 4 },
  hill: { name: "Купол на холме", base: 16000, weekend: 19000, maxGuests: 3 },
};

/* генерация занятости на 14 дней: детерминированно, но «живо» */
function buildAvailability() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = addDays(today, i);
    const dow = d.getDay(); // 0=Вс
    const isWeekend = dow === 5 || dow === 6;
    // псевдослучайность, стабильная в рамках дня
    const seed = (d.getDate() * 31 + d.getMonth() * 7) % 10;
    // у домиков разные загрузки: купол у озера бронируют первым, на холме — последним
    const busy = {
      lake: isWeekend ? seed < 7 : seed < 3,
      barn: isWeekend ? seed < 6 : seed < 2,
      hill: isWeekend ? seed < 3 : seed < 2,
    };
    if (i < 2) { busy.lake = true; busy.barn = true; busy.hill = true; } // сегодня-завтра заняты
    days.push({ date: d, isWeekend, busy });
  }
  return days;
}
const DAYS = buildAvailability();

/* ============================================================
   ЗВЁЗДЫ В HERO
   ============================================================ */
(function buildStars() {
  const g = document.getElementById("stars");
  if (!g) return;
  const NS = "http://www.w3.org/2000/svg";
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 90; i++) {
    const c = document.createElementNS(NS, "circle");
    const x = Math.random() * 1440;
    const y = Math.random() * 470;
    const r = 0.6 + Math.random() * 1.5;
    c.setAttribute("cx", x.toFixed(1));
    c.setAttribute("cy", y.toFixed(1));
    c.setAttribute("r", r.toFixed(2));
    c.setAttribute("fill", "#EFEAE2");
    c.style.setProperty("--tw-dur", (2.6 + Math.random() * 4.5).toFixed(2) + "s");
    c.style.setProperty("--tw-min", (0.06 + Math.random() * 0.2).toFixed(2));
    c.style.animationDelay = (-Math.random() * 6).toFixed(2) + "s";
    frag.appendChild(c);
  }
  g.appendChild(frag);
})();

/* ============================================================
   HEADER + БУРГЕР
   ============================================================ */
(function header() {
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$(".nav__link", nav).forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    })
  );
})();

/* ============================================================
   REVEAL-АНИМАЦИИ
   ============================================================ */
(function reveal() {
  const els = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 90 + "ms";
    io.observe(el);
  });
})();

/* ============================================================
   БРОНИРОВАНИЕ
   ============================================================ */
const booking = {
  house: "lake",
  checkin: null,   // индекс в DAYS
  checkout: null,  // индекс в DAYS (день выезда, не считается ночью)
  guests: 2,
};

(function bookingWidget() {
  const houseSelect = document.getElementById("houseSelect");
  const calendarEl = document.getElementById("calendar");
  const bookBtn = document.getElementById("bookBtn");
  const summaryCard = document.getElementById("summaryCard");
  const successCard = document.getElementById("successCard");

  /* --- выбор домика --- */
  Object.entries(HOUSES).forEach(([key, h]) => {
    const btn = document.createElement("button");
    btn.className = "house-option" + (key === booking.house ? " is-active" : "");
    btn.dataset.house = key;
    btn.setAttribute("role", "tab");
    btn.innerHTML =
      `<span class="house-option__name">${h.name}</span>` +
      `<span class="house-option__price">до ${h.maxGuests} гостей · от <strong>${fmtRub(h.base)}</strong></span>`;
    btn.addEventListener("click", () => selectHouse(key));
    houseSelect.appendChild(btn);
  });

  function selectHouse(key) {
    booking.house = key;
    $$(".house-option", houseSelect).forEach((b) => b.classList.toggle("is-active", b.dataset.house === key));
    // ограничить число гостей
    const max = HOUSES[key].maxGuests;
    if (booking.guests > max) booking.guests = max;
    renderGuests();
    renderCalendar();
    renderSummary();
  }

  /* --- календарь --- */
  DOW_SHORT.forEach((d) => {
    const el = document.createElement("div");
    el.className = "calendar__dow";
    el.textContent = d;
    calendarEl.appendChild(el);
  });
  // сдвиг первой недели (Пн=0)
  const lead = (DAYS[0].date.getDay() + 6) % 7;
  for (let i = 0; i < lead; i++) calendarEl.appendChild(document.createElement("div"));

  const dayBtns = DAYS.map((day, i) => {
    const b = document.createElement("button");
    b.className = "cal-day";
    b.type = "button";
    const price = day.isWeekend ? HOUSES[booking.house].weekend : HOUSES[booking.house].base;
    b.innerHTML = `<span>${day.date.getDate()}</span><span class="cal-day__price">${(price / 1000).toFixed(0)}к</span>`;
    if (day.isWeekend) b.classList.add("cal-day--weekend");
    if (i === 0) b.classList.add("cal-day--today");
    b.addEventListener("click", () => pickDate(i));
    calendarEl.appendChild(b);
    return b;
  });

  function pickDate(i) {
    const day = DAYS[i];
    if (day.busy[booking.house]) return;
    // первый клик или сброс: новый заезд
    if (booking.checkin === null || booking.checkout !== null || i <= booking.checkin) {
      booking.checkin = i;
      booking.checkout = null;
    } else {
      // проверка: все ночи в диапазоне свободны
      for (let k = booking.checkin; k < i; k++) {
        if (DAYS[k].busy[booking.house]) {
          booking.checkin = i;
          booking.checkout = null;
          renderCalendar(); renderSummary();
          return;
        }
      }
      booking.checkout = i;
    }
    renderCalendar();
    renderSummary();
  }

  function renderCalendar() {
    DAYS.forEach((day, i) => {
      const b = dayBtns[i];
      const busy = day.busy[booking.house];
      b.disabled = busy;
      b.classList.toggle("cal-day--busy", busy);
      b.classList.toggle("cal-day--edge", i === booking.checkin || i === booking.checkout);
      b.classList.toggle(
        "cal-day--in-range",
        booking.checkin !== null && booking.checkout !== null && i > booking.checkin && i < booking.checkout
      );
      const price = day.isWeekend ? HOUSES[booking.house].weekend : HOUSES[booking.house].base;
      $(".cal-day__price", b).textContent = (price / 1000).toFixed(0) + "к";
      const label = fmtDate(day.date) + (busy ? ", занято" : ", свободно, " + fmtRub(price));
      b.setAttribute("aria-label", label);
    });
  }

  /* --- гости --- */
  const guestsCount = document.getElementById("guestsCount");
  const guestsLabel = document.getElementById("guestsLabel");
  $$(".guests__btn").forEach((b) =>
    b.addEventListener("click", () => {
      const dir = Number(b.dataset.dir);
      const max = HOUSES[booking.house].maxGuests;
      booking.guests = Math.min(max, Math.max(1, booking.guests + dir));
      renderGuests();
      renderSummary();
    })
  );
  function renderGuests() {
    guestsCount.textContent = booking.guests;
    guestsLabel.textContent = plural(booking.guests, "гость", "гостя", "гостей");
  }

  /* --- итог --- */
  function nightsInfo() {
    if (booking.checkin === null || booking.checkout === null) return null;
    const nights = booking.checkout - booking.checkin;
    if (nights < 1) return null;
    let total = 0;
    const parts = [];
    for (let k = booking.checkin; k < booking.checkout; k++) {
      const d = DAYS[k];
      const p = d.isWeekend ? HOUSES[booking.house].weekend : HOUSES[booking.house].base;
      total += p;
      parts.push(`${fmtDateShort(d.date)} — ${fmtRub(p)}`);
    }
    return { nights, total, parts };
  }

  function renderSummary() {
    const h = HOUSES[booking.house];
    $("#sumHouse").textContent = h.name;
    $("#sumCheckin").textContent = booking.checkin !== null ? fmtDate(DAYS[booking.checkin].date) : "—";
    $("#sumCheckout").textContent = booking.checkout !== null ? fmtDate(DAYS[booking.checkout].date) : "—";
    $("#sumGuests").textContent = `${booking.guests} ${plural(booking.guests, "гость", "гостя", "гостей")}`;
    const info = nightsInfo();
    const calc = $("#sumCalc"), total = $("#sumTotal"), breakdown = $("#sumBreakdown");
    if (info) {
      calc.textContent = `${info.nights} ${plural(info.nights, "ночь", "ночи", "ночей")} × итог`;
      total.textContent = fmtRub(info.total);
      breakdown.innerHTML = info.parts.join("<br>");
      breakdown.hidden = false;
      bookBtn.disabled = false;
    } else {
      calc.textContent = booking.checkin !== null ? "Теперь выберите выезд" : "Выберите даты";
      total.textContent = "—";
      breakdown.hidden = true;
      bookBtn.disabled = true;
    }
  }

  /* --- отправка --- */
  bookBtn.addEventListener("click", () => {
    const info = nightsInfo();
    if (!info) return;
    const h = HOUSES[booking.house];
    $("#successText").textContent =
      `${h.name}, ${fmtDate(DAYS[booking.checkin].date)} → ${fmtDate(DAYS[booking.checkout].date)}, ` +
      `${info.nights} ${plural(info.nights, "ночь", "ночи", "ночей")}, ${booking.guests} ${plural(booking.guests, "гость", "гостя", "гостей")} — ${fmtRub(info.total)}.`;
    summaryCard.hidden = true;
    successCard.hidden = false;
  });

  document.getElementById("successReset").addEventListener("click", () => {
    booking.checkin = null;
    booking.checkout = null;
    successCard.hidden = true;
    summaryCard.hidden = false;
    renderCalendar();
    renderSummary();
  });

  /* --- индикатор «остался 1 домик» --- */
  (function availability() {
    const el = document.getElementById("availabilityText");
    // ближайшие выходные = первая пятница впереди
    let idx = DAYS.findIndex((d) => d.date.getDay() === 5);
    if (idx === -1) idx = 0;
    let free = 0;
    ["lake", "barn", "hill"].forEach((k) => { if (!DAYS[idx].busy[k]) free++; });
    setTimeout(() => {
      if (free === 0) {
        el.textContent = "Ближайшие выходные заняты — смотрите будни, там тише и дешевле";
      } else if (free === 1) {
        el.textContent = "На ближайшие выходные остался 1 домик";
      } else {
        el.textContent = `На ближайшие выходные свободно: ${free} ${plural(free, "домик", "домика", "домиков")}`;
      }
    }, 900);
  })();

  /* --- кнопки «Выбрать» на карточках домиков --- */
  $$(".house-card__btn").forEach((b) =>
    b.addEventListener("click", () => {
      selectHouse(b.dataset.house);
      document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
    })
  );

  renderGuests();
  renderCalendar();
  renderSummary();
})();

/* ============================================================
   QUICK DATES (финальный CTA)
   ============================================================ */
(function quickDates() {
  const box = document.getElementById("quickDates");
  const windows = [];
  for (let i = 0; i < DAYS.length - 1 && windows.length < 3; i++) {
    const a = DAYS[i], b = DAYS[i + 1];
    const freeAll = ["lake", "barn", "hill"].filter((k) => !a.busy[k] && !b.busy[k]);
    if (freeAll.length === 0) continue;
    const cheapest = Math.min(
      ...freeAll.map((k) => HOUSES[k][a.isWeekend ? "weekend" : "base"] + HOUSES[k][b.isWeekend ? "weekend" : "base"])
    );
    windows.push({ from: a.date, to: b.date, price: cheapest, isWeekend: a.isWeekend });
  }
  windows.forEach((w) => {
    const btn = document.createElement("button");
    btn.className = "quick-date" + (w.isWeekend ? " quick-date--hot" : "");
    btn.innerHTML =
      `<span>${w.isWeekend ? '<span class="quick-date__tag">выходные</span>' : '<span class="quick-date__tag">будни</span>'}` +
      `<span class="quick-date__range">${fmtDate(w.from)} → ${fmtDate(w.to)}</span></span>` +
      `<span class="quick-date__price">от ${fmtRub(w.price)}</span>`;
    btn.addEventListener("click", () => document.getElementById("booking").scrollIntoView({ behavior: "smooth" }));
    box.appendChild(btn);
  });
})();

/* ============================================================
   СЛАЙДЕР АТМОСФЕРЫ + ПАРАЛЛАКС
   ============================================================ */
(function slider() {
  const track = document.getElementById("sliderTrack");
  const slides = $$(".slide", track);
  const dotsBox = document.getElementById("sliderDots");
  let index = 0;

  slides.forEach((_, i) => {
    const d = document.createElement("button");
    d.setAttribute("aria-label", "Сцена " + (i + 1));
    d.addEventListener("click", () => go(i));
    dotsBox.appendChild(d);
  });
  const dots = $$("button", dotsBox);

  function go(i) {
    index = (i + slides.length) % slides.length;
    const slide = slides[index];
    const offset = slide.offsetLeft - (track.parentElement.clientWidth - slide.clientWidth) / 2 + (parseFloat(getComputedStyle(track).paddingLeft) || 0);
    // центрируем активный слайд, не выезжая за края
    const max = track.scrollWidth - track.parentElement.clientWidth + 24;
    track.style.transform = `translateX(${-Math.max(0, Math.min(offset - parseFloat(getComputedStyle(track).paddingLeft), max))}px)`;
    dots.forEach((d, k) => d.classList.toggle("is-active", k === index));
    applyParallax();
  }

  document.getElementById("slidePrev").addEventListener("click", () => go(index - 1));
  document.getElementById("slideNext").addEventListener("click", () => go(index + 1));

  /* свайп */
  let startX = null;
  track.addEventListener("pointerdown", (e) => { startX = e.clientX; }, { passive: true });
  track.addEventListener("pointerup", (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
    startX = null;
  }, { passive: true });

  /* параллакс внутри активной сцены */
  const sliderBox = document.getElementById("slider");
  function applyParallax(clientX, clientY) {
    const slide = slides[index];
    const layers = $$(".parallax", slide);
    const rect = sliderBox.getBoundingClientRect();
    let nx = 0, ny = 0;
    if (clientX !== undefined) {
      nx = (clientX - rect.left) / rect.width - 0.5;
      ny = (clientY - rect.top) / rect.height - 0.5;
    }
    layers.forEach((l) => {
      const depth = parseFloat(l.dataset.depth || 0.1) * 220;
      l.style.transform = `translate(${(-nx * depth).toFixed(1)}px, ${(-ny * depth * 0.5).toFixed(1)}px)`;
    });
  }
  sliderBox.addEventListener("pointermove", (e) => applyParallax(e.clientX, e.clientY), { passive: true });
  sliderBox.addEventListener("pointerleave", () => applyParallax());

  /* медленный дрейф параллакса, когда мыши нет */
  let t = 0;
  setInterval(() => {
    if (matchMedia("(pointer: coarse)").matches) {
      t += 0.012;
      const slide = slides[index];
      $$(".parallax", slide).forEach((l) => {
        const depth = parseFloat(l.dataset.depth || 0.1) * 40;
        l.style.transform = `translate(${(Math.sin(t) * depth).toFixed(1)}px, 0)`;
      });
    }
  }, 60);

  /* автопрокрутка раз в 7 секунд, если пользователь не взаимодействует */
  let idle = true;
  ["pointerdown", "pointermove"].forEach((ev) =>
    sliderBox.addEventListener(ev, () => { idle = false; }, { passive: true, once: false })
  );
  setInterval(() => { if (idle) go(index + 1); }, 7000);

  window.addEventListener("resize", () => go(index));
  go(0);
})();

/* ============================================================
   ОТЗЫВЫ
   ============================================================ */
(function reviews() {
  const REVIEWS = [
    {
      text: "Впервые за год я услышала собственные мысли. Ночью смотрели на звёзды через панорамную крышу, утром пили кофе в тумане. Вернулись другими людьми.",
      author: "Марина и Олег",
      meta: "Купол у озера · 2 ночи в мае",
    },
    {
      text: "Купель под открытым небом в −3 — это надо прожить. Пар, снег на ветках, тишина такая, что звенит в ушах. Сервис — как в хорошем отеле, только без людей.",
      author: "Дмитрий",
      meta: "Купол на холме · 3 ночи в январе",
    },
    {
      text: "Приехали «на выходные перезагрузиться» по рекомендации друзей. Камин, баня, завтрак в корзине к двери — продумано всё. Город правда отменяется, проверено.",
      author: "Анна",
      meta: "Барнхаус в лесу · 2 ночи в октябре",
    },
    {
      text: "Сомневался, что глэмпинг — это комфортно. Оказалось: тёплый пол, горячий душ, отличный матрас. А вокруг — только лес. Уже забронировали осень.",
      author: "Игорь и Света",
      meta: "Купол у озера · 2 ночи в июле",
    },
  ];
  const card = document.getElementById("reviewCard");
  const text = document.getElementById("reviewText");
  const author = document.getElementById("reviewAuthor");
  const meta = document.getElementById("reviewMeta");
  const dotsBox = document.getElementById("reviewDots");
  let index = 0, timer;

  REVIEWS.forEach((_, i) => {
    const d = document.createElement("button");
    d.setAttribute("aria-label", "Отзыв " + (i + 1));
    d.addEventListener("click", () => go(i, true));
    dotsBox.appendChild(d);
  });
  const dots = $$("button", dotsBox);

  function render() {
    const r = REVIEWS[index];
    text.textContent = r.text;
    author.textContent = r.author;
    meta.textContent = r.meta;
    dots.forEach((d, k) => d.classList.toggle("is-active", k === index));
  }
  function go(i, manual) {
    index = (i + REVIEWS.length) % REVIEWS.length;
    card.classList.add("is-switching");
    setTimeout(() => { render(); card.classList.remove("is-switching"); }, 380);
    if (manual) restart();
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(index + 1), 6500);
  }
  document.getElementById("revPrev").addEventListener("click", () => go(index - 1, true));
  document.getElementById("revNext").addEventListener("click", () => go(index + 1, true));

  render();
  restart();
})();

/* ============================================================
   КАРТА: машинка едет по маршруту
   ============================================================ */
(function routeCar() {
  const path = document.getElementById("routePath");
  const car = document.getElementById("routeCar");
  if (!path || !car) return;
  const len = path.getTotalLength();
  let t = 0;
  function tick() {
    t = (t + 0.0016) % 1;
    // туда-обратно с плавным замедлением на концах
    const eased = 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
    const p = path.getPointAtLength(eased * len);
    car.setAttribute("cx", p.x);
    car.setAttribute("cy", p.y);
    requestAnimationFrame(tick);
  }
  tick();
})();
