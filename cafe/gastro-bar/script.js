/* ============================================================
   ШИНОК — интерактивность лендинга (ванильный JS)
   ============================================================ */
"use strict";

document.addEventListener("DOMContentLoaded", function () {

  /* ---------- Шапка: фон при скролле ---------- */
  var header = document.getElementById("header");
  function onScrollHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Мобильное меню-бургер ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  nav.querySelectorAll(".nav__link").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  /* ---------- Появление при скролле (IntersectionObserver) ---------- */
  // Заголовки — clip-path reveal
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll(".reveal").forEach(function (el) { revealObserver.observe(el); });

  // Карточки и блоки — мягкий fade-up с каскадом
  var fadeTargets = document.querySelectorAll(
    ".dish, .scene, .event, .promo, .shot, .salo__art, .salo__text, .booking__side, .form, .bar__tabs, .bar__slider-wrap, .delivery__facts li, .zone, .delivery__cta"
  );
  fadeTargets.forEach(function (el) { el.classList.add("fade-up"); });
  var fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        // небольшая каскадная задержка внутри одной сетки
        var siblings = Array.prototype.slice.call(el.parentElement.children);
        var idx = siblings.indexOf(el);
        el.style.transitionDelay = Math.min(idx, 5) * 90 + "ms";
        el.classList.add("in-view");
        fadeObserver.unobserve(el);
      }
    });
  }, { threshold: 0.15 });
  fadeTargets.forEach(function (el) { fadeObserver.observe(el); });

  /* ---------- Барная карта: данные ---------- */
  var BAR_MENU = {
    vodka: [
      { name: "Водка «Шинок»", meta: "пшеничная · ледяная подача", desc: "Наша марка: мягкая, хлебная, подаётся при −4 °C из ледяного шкафа. Закуска — сало и огурчик.", price: "190 ₽", unit: "/ 50 мл" },
      { name: "Водка «Северная»", meta: "на клюкве", desc: "Лёгкая ягодная горечь, долгое тёплое послевкусие. Хороша под рёбра.", price: "240 ₽", unit: "/ 50 мл" },
      { name: "Водка «Белуга»", meta: "классика", desc: "Благородная и чистая. Для тех, кто понимает без лишних слов.", price: "320 ₽", unit: "/ 50 мл" },
      { name: "Графин дня", meta: "500 мл на компанию", desc: "Водка «Шинок» графином в ледяной колбе — для длинного стола и долгих разговоров.", price: "1 400 ₽", unit: "/ графин" }
    ],
    tincture: [
      { name: "Хреновуха", meta: "выдержка 2 недели", desc: "Жгучая, честная, с корнем хрена и мёдом. Сжигает усталость за один глоток.", price: "220 ₽", unit: "/ 50 мл" },
      { name: "Клюква на мёде", meta: "выдержка 3 недели", desc: "Кисло-сладкая, почти десертная. Дамы просят повторить.", price: "220 ₽", unit: "/ 50 мл" },
      { name: "Кедровая", meta: "выдержка 30 дней", desc: "Смола, орех, дымность — как сибирский вечер у костра.", price: "260 ₽", unit: "/ 50 мл" },
      { name: "Вишня с дубом", meta: "выдержка 45 дней", desc: "Тёмная, густая, с нотой вишнёвой косточки и дубовой щепы.", price: "260 ₽", unit: "/ 50 мл" },
      { name: "Ликёр «Смородина»", meta: "домашний", desc: "Густой ягодный ликёр по рецепту бабушки нашего шефа.", price: "240 ₽", unit: "/ 50 мл" }
    ],
    cognac: [
      { name: "Коньяк «Старый Кенигсберг»", meta: "4 года", desc: "Тёплый, сухофруктовый — к копчёному салу и тишине.", price: "290 ₽", unit: "/ 50 мл" },
      { name: "Коньяк «Дербент»", meta: "5 лет", desc: "Выдержанный, с нотами грецкого ореха и ванили.", price: "340 ₽", unit: "/ 50 мл" },
      { name: "Виски «Glen Moray»", meta: "спейсайд", desc: "Мягкий солодовый, яблоко и ириска. Лёд — по желанию, но мы против.", price: "390 ₽", unit: "/ 50 мл" },
      { name: "Виски «Laphroaig 10»", meta: "айла · торф", desc: "Дым, йод, море. Для тех, кто любит пожёстче.", price: "520 ₽", unit: "/ 50 мл" }
    ],
    beer: [
      { name: "Пиво «Жигулёвское» разливное", meta: "светлое · 4,0%", desc: "Холодное, честное, из проверенной пивоварни. К рёбрам — идеально.", price: "280 ₽", unit: "/ 0,5 л" },
      { name: "Тёмный лагер «Шинок»", meta: "крафтовое · 5,2%", desc: "Варят для нас в Волгограде: карамель, жёный солод, лёгкий дымок.", price: "340 ₽", unit: "/ 0,5 л" },
      { name: "Коктейль «Кровавая Мэри по-шинковски»", meta: "с хреновухой", desc: "Томат, хреновуха, копчёная соль, стебель сельдерея. Лечит почти всё.", price: "420 ₽", unit: "/ 350 мл" },
      { name: "«Волжский вечер»", meta: "авторский", desc: "Кедровая настойка, тоник, розмарин, подожжённый при вас. Шоу включено.", price: "460 ₽", unit: "/ 300 мл" }
    ]
  };

  var barSlider = document.getElementById("barSlider");
  var barTabs = document.querySelectorAll(".bar__tab");

  function renderBar(cat) {
    barSlider.innerHTML = "";
    BAR_MENU[cat].forEach(function (item) {
      var card = document.createElement("article");
      card.className = "bar-card";
      card.innerHTML =
        '<h3 class="bar-card__name">' + item.name + "</h3>" +
        '<p class="bar-card__meta">' + item.meta + "</p>" +
        '<p class="bar-card__desc">' + item.desc + "</p>" +
        '<p class="bar-card__price">' + item.price + " <span>" + item.unit + "</span></p>";
      barSlider.appendChild(card);
    });
    barSlider.scrollLeft = 0;
    updateArrows();
  }

  barTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      barTabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      renderBar(tab.dataset.cat);
    });
  });

  /* Стрелки слайдера */
  var barPrev = document.getElementById("barPrev");
  var barNext = document.getElementById("barNext");
  function updateArrows() {
    var max = barSlider.scrollWidth - barSlider.clientWidth - 4;
    barPrev.disabled = barSlider.scrollLeft <= 4;
    barNext.disabled = barSlider.scrollLeft >= max;
  }
  barPrev.addEventListener("click", function () {
    barSlider.scrollBy({ left: -330, behavior: "smooth" });
  });
  barNext.addEventListener("click", function () {
    barSlider.scrollBy({ left: 330, behavior: "smooth" });
  });
  barSlider.addEventListener("scroll", updateArrows, { passive: true });
  window.addEventListener("resize", updateArrows);

  renderBar("vodka");

  /* ---------- Виджет «сегодня в баре»: имитация реального времени ---------- */
  var tablesFreeEl = document.getElementById("tablesFree");
  var tablesDot = document.querySelector(".tables-dot");
  var tablesFree = 7;
  var TABLES_TOTAL = 24;

  function renderTables() {
    tablesFreeEl.textContent = tablesFree;
    tablesDot.classList.toggle("is-low", tablesFree <= 3);
  }
  // каждые 18 секунд стол занимают или освобождают
  setInterval(function () {
    var delta = Math.random() < 0.5 ? -1 : 1;
    var next = tablesFree + delta;
    if (next >= 0 && next <= 12) {
      tablesFree = next;
      // лёгкая анимация смены цифры
      tablesFreeEl.style.transition = "opacity 0.3s";
      tablesFreeEl.style.opacity = "0";
      setTimeout(function () {
        renderTables();
        tablesFreeEl.style.opacity = "1";
      }, 300);
    }
  }, 18000);
  renderTables();

  /* ---------- Валидация форм ---------- */
  function setError(input, message) {
    var field = input.closest(".form__field");
    var err = field.querySelector(".form__error");
    field.classList.toggle("has-error", Boolean(message));
    if (err) err.textContent = message || "";
    return !message;
  }

  function validateName(input) {
    var v = input.value.trim();
    if (v.length < 2) return setError(input, "Напишите имя — хотя бы два символа.");
    return setError(input, "");
  }
  function validatePhone(input) {
    var digits = input.value.replace(/\D/g, "");
    if (digits.length < 10) return setError(input, "Введите телефон полностью, например +7 (927) 555-44-33.");
    return setError(input, "");
  }
  function validateDate(input) {
    if (!input.value) return setError(input, "Выберите дату визита.");
    var chosen = new Date(input.value + "T23:59:59");
    var now = new Date();
    if (chosen < now) return setError(input, "Эта дата уже прошла — выберите сегодня или позже.");
    return setError(input, "");
  }
  function validateSelect(input, message) {
    if (!input.value) return setError(input, message);
    return setError(input, "");
  }

  /* ---------- Форма бронирования ---------- */
  var bookingForm = document.getElementById("bookingForm");
  var formSuccess = document.getElementById("formSuccess");
  var successText = document.getElementById("successText");
  var fDate = document.getElementById("fDate");

  // минимальная дата — сегодня
  var today = new Date();
  fDate.min = today.toISOString().split("T")[0];

  bookingForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var nameInput = document.getElementById("fName");
    var phoneInput = document.getElementById("fPhone");
    var timeInput = document.getElementById("fTime");
    var guestsInput = document.getElementById("fGuests");

    var ok = [
      validateName(nameInput),
      validatePhone(phoneInput),
      validateDate(fDate),
      validateSelect(timeInput, "Выберите время."),
      validateSelect(guestsInput, "Сколько вас будет?")
    ].every(Boolean);

    if (!ok) return;

    var dateStr = new Date(fDate.value).toLocaleDateString("ru-RU", {
      day: "numeric", month: "long"
    });
    successText.textContent =
      nameInput.value.trim() + ", ждём вас " + dateStr + " в " + timeInput.value +
      " (" + guestsInput.value.toLowerCase() + "). Перезвоним в течение 15 минут и подтвердим стол.";
    formSuccess.hidden = false;
  });

  // убираем ошибку при вводе
  bookingForm.querySelectorAll("input, select").forEach(function (el) {
    el.addEventListener("input", function () { setError(el, ""); });
    el.addEventListener("change", function () { setError(el, ""); });
  });

  /* ---------- Модальное окно дегустации ---------- */
  var modal = document.getElementById("degustModal");
  var degustBtn = document.getElementById("degustBtn");
  var degustForm = document.getElementById("degustForm");
  var degustSuccess = document.getElementById("degustSuccess");

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    var first = document.getElementById("dName");
    if (first) first.focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }
  degustBtn.addEventListener("click", openModal);
  modal.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  degustForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = [
      validateName(document.getElementById("dName")),
      validatePhone(document.getElementById("dPhone"))
    ].every(Boolean);
    if (!ok) return;
    degustSuccess.hidden = false;
    setTimeout(closeModal, 2600);
  });
  degustForm.querySelectorAll("input").forEach(function (el) {
    el.addEventListener("input", function () { setError(el, ""); });
  });

});
