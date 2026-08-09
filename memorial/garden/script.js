/* ===== Мемориальный сад — логика лендинга ===== */
(function () {
  "use strict";

  var fmt = function (n) {
    return n.toLocaleString("ru-RU") + " ₽";
  };

  /* ---------- Демо-данные каталога ---------- */
  var MATERIAL_LABEL = { granite: "Гранит", marble: "Мрамор" };
  var FORM_LABEL = { straight: "Прямоугольная", arch: "Арочная", figure: "Фигурная" };
  var CATEGORY_LABEL = { econom: "Эконом", standard: "Стандарт", figure: "Фигурные", exclusive: "Эксклюзив" };

  var MODELS = [
    { id: "e1", name: "Стела «Тихая»", category: "econom", material: "granite", form: "straight", price: 14500 },
    { id: "e2", name: "Стела «Светлая»", category: "econom", material: "marble", form: "straight", price: 15800 },
    { id: "e3", name: "Арка «Простая»", category: "econom", material: "granite", form: "arch", price: 16900 },
    { id: "s1", name: "Стела «Классика»", category: "standard", material: "granite", form: "straight", price: 24000 },
    { id: "s2", name: "Арка «Память»", category: "standard", material: "marble", form: "arch", price: 27500 },
    { id: "s3", name: "Комплект «Семейный»", category: "standard", material: "granite", form: "arch", price: 34200 },
    { id: "f1", name: "Волна", category: "figure", material: "granite", form: "figure", price: 18500 },
    { id: "f2", name: "Свеча", category: "figure", material: "marble", form: "figure", price: 21800 },
    { id: "f3", name: "Крыло", category: "figure", material: "granite", form: "figure", price: 26400 },
    { id: "x1", name: "Комплекс «Сад»", category: "exclusive", material: "granite", form: "figure", price: 86000 },
    { id: "x2", name: "Комплекс «Родовой»", category: "exclusive", material: "granite", form: "straight", price: 124000 },
    { id: "x3", name: "Мраморная часовня", category: "exclusive", material: "marble", form: "arch", price: 158000 }
  ];

  /* SVG-иллюстрация памятника по форме и материалу */
  function modelSVG(model) {
    var dark = model.material === "granite";
    var body = dark ? "#2E2C29" : "#EFE9DD";
    var edge = dark ? "#4A4741" : "#D9D0BD";
    var line = dark ? "#9C7A4D" : "#8A9B7E";
    var shape;
    if (model.form === "arch") {
      shape = '<path d="M30 130 L30 60 Q30 22 60 20 Q90 22 90 60 L90 130 Z" fill="' + body + '" stroke="' + edge + '" stroke-width="2"/>';
    } else if (model.form === "figure") {
      shape = '<path d="M34 130 L34 64 Q34 30 60 24 Q88 30 84 66 Q82 92 86 130 Z" fill="' + body + '" stroke="' + edge + '" stroke-width="2"/>';
    } else {
      shape = '<rect x="30" y="26" width="60" height="104" rx="3" fill="' + body + '" stroke="' + edge + '" stroke-width="2"/>';
    }
    return '<svg viewBox="0 0 120 150" aria-hidden="true">' +
      '<ellipse cx="60" cy="138" rx="46" ry="6" fill="#8A9B7E" opacity="0.45"/>' +
      '<rect x="18" y="128" width="84" height="10" rx="2" fill="' + edge + '"/>' +
      shape +
      '<ellipse cx="60" cy="58" rx="13" ry="16" fill="' + (dark ? "#F2EDE4" : "#8A9B7E") + '" opacity="0.28"/>' +
      '<path d="M44 96 h32 M49 106 h22" stroke="' + line + '" stroke-width="2" opacity="0.6" stroke-linecap="round"/>' +
      "</svg>";
  }

  /* ---------- Каталог: табы + фильтры ---------- */
  var grid = document.getElementById("catalogGrid");
  var emptyMsg = document.getElementById("catalogEmpty");
  var tabs = document.getElementById("catalogTabs");
  var filterMaterial = document.getElementById("filterMaterial");
  var filterForm = document.getElementById("filterForm");
  var activeCategory = "econom";

  function renderCatalog() {
    var items = MODELS.filter(function (m) {
      if (m.category !== activeCategory) return false;
      if (filterMaterial.value !== "any" && m.material !== filterMaterial.value) return false;
      if (filterForm.value !== "any" && m.form !== filterForm.value) return false;
      return true;
    });
    grid.innerHTML = items.map(function (m) {
      return '<article class="card" data-id="' + m.id + '">' +
        '<div class="card__art">' + modelSVG(m) + "</div>" +
        '<div class="card__body">' +
          '<h3 class="card__name">' + m.name + "</h3>" +
          '<p class="card__meta">' + MATERIAL_LABEL[m.material] + " · " + FORM_LABEL[m.form] + "</p>" +
          '<p class="card__price">от ' + fmt(m.price) + "</p>" +
          '<button class="card__btn" type="button" data-pick="' + m.id + '">Подробнее</button>' +
        "</div></article>";
    }).join("");
    emptyMsg.hidden = items.length > 0;
  }

  tabs.addEventListener("click", function (e) {
    var btn = e.target.closest(".tab");
    if (!btn) return;
    tabs.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("is-active"); });
    btn.classList.add("is-active");
    activeCategory = btn.dataset.category;
    renderCatalog();
  });
  filterMaterial.addEventListener("change", renderCatalog);
  filterForm.addEventListener("change", renderCatalog);

  /* «Подробнее» — подставляет модель в калькулятор и мягко скроллит к нему */
  grid.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-pick]");
    if (!btn) return;
    var model = MODELS.find(function (m) { return m.id === btn.dataset.pick; });
    if (!model) return;
    calcModel.value = model.id;
    calcMaterial.value = model.material;
    recalc();
    document.getElementById("calculator").scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- Калькулятор ---------- */
  var calcModel = document.getElementById("calcModel");
  var calcMaterial = document.getElementById("calcMaterial");
  var calcSize = document.getElementById("calcSize");
  var calcPortrait = document.getElementById("calcPortrait");
  var calcBreakdown = document.getElementById("calcBreakdown");
  var calcTotal = document.getElementById("calcTotal");
  var calcOrder = document.getElementById("calcOrder");
  var calcOk = document.getElementById("calcOk");
  var addons = Array.prototype.slice.call(document.querySelectorAll(".calc-addon"));

  var SIZE_MULT = { s: 0.85, m: 1, l: 1.25, xl: 1.55 };
  var SIZE_LABEL = { s: "80 × 40 см", m: "100 × 50 см", l: "120 × 60 см", xl: "140 × 70 см" };
  var MATERIAL_MULT = { granite: 1, marble: 0.92 };
  var PORTRAIT_PRICE = 6500;
  var INSTALL_BASE = 4800; /* доставка и установка */
  var ADDON_LABEL = { table: "Столик из камня", bench: "Скамья из камня", tile: "Облицовка плиткой", fence: "Ограда" };

  /* заполняем список моделей */
  calcModel.innerHTML = MODELS.map(function (m) {
    return '<option value="' + m.id + '">' + m.name + " — " + CATEGORY_LABEL[m.category] + " (от " + fmt(m.price) + ")</option>";
  }).join("");
  calcModel.value = "s1";

  function recalc() {
    var model = MODELS.find(function (m) { return m.id === calcModel.value; }) || MODELS[0];
    var stone = Math.round(model.price * SIZE_MULT[calcSize.value] * MATERIAL_MULT[calcMaterial.value] / 100) * 100;
    var works = INSTALL_BASE + (calcPortrait.checked ? PORTRAIT_PRICE : 0);
    var care = addons.reduce(function (sum, a) {
      return sum + (a.checked ? parseInt(a.dataset.price, 10) : 0);
    }, 0);
    var total = stone + works + care;

    var rows = [];
    rows.push('<li class="calc__group"><span>Памятник</span><span></span></li>');
    rows.push("<li><span>" + model.name + ", " + MATERIAL_LABEL[calcMaterial.value].toLowerCase() + " " + SIZE_LABEL[calcSize.value] + "</span><span>" + fmt(stone) + "</span></li>");
    rows.push('<li class="calc__group"><span>Работы</span><span></span></li>');
    rows.push("<li><span>Доставка и установка</span><span>" + fmt(INSTALL_BASE) + "</span></li>");
    if (calcPortrait.checked) {
      rows.push("<li><span>Гравировка портрета</span><span>" + fmt(PORTRAIT_PRICE) + "</span></li>");
    }
    rows.push('<li class="calc__group"><span>Благоустройство</span><span></span></li>');
    var anyAddon = false;
    addons.forEach(function (a) {
      if (a.checked) {
        anyAddon = true;
        rows.push("<li><span>" + ADDON_LABEL[a.value] + "</span><span>" + fmt(parseInt(a.dataset.price, 10)) + "</span></li>");
      }
    });
    if (!anyAddon) {
      rows.push("<li><span>Не выбрано</span><span>—</span></li>");
    }
    calcBreakdown.innerHTML = rows.join("");

    /* мягкая смена итога */
    calcTotal.style.opacity = 0;
    window.setTimeout(function () {
      calcTotal.textContent = fmt(total);
      calcTotal.style.opacity = 1;
    }, 220);
  }

  [calcModel, calcMaterial, calcSize].forEach(function (el) {
    el.addEventListener("change", recalc);
  });
  calcPortrait.addEventListener("change", recalc);
  addons.forEach(function (a) { a.addEventListener("change", recalc); });

  calcOrder.addEventListener("click", function () {
    calcOk.hidden = false;
    calcOrder.disabled = true;
    window.setTimeout(function () {
      calcOrder.disabled = false;
      calcOk.hidden = true;
    }, 6000);
  });

  /* ---------- Галерея работ ---------- */
  var WORKS = [
    { name: "Арка из чёрного гранита", meta: "Гранит «Габбро» · 12 дней", scene: 0 },
    { name: "Семейный комплект", meta: "Гранит, две стелы · 18 дней", scene: 1 },
    { name: "Мраморная стела с розой", meta: "Мрамор «Коелга» · 14 дней", scene: 2 },
    { name: "Фигурная «Волна»", meta: "Гранит, ручная шлифовка · 21 день", scene: 0 },
    { name: "Комплекс с оградой", meta: "Гранит + плитка · 30 дней", scene: 1 },
    { name: "Реставрация старой стелы", meta: "Мрамор, восстановление · 7 дней", scene: 2 }
  ];

  function workSVG(scene) {
    var stones = ["#2E2C29", "#3B3833", "#EFE9DD"];
    var stone = stones[scene];
    var line = scene === 2 ? "#8A9B7E" : "#9C7A4D";
    var second = scene === 1
      ? '<path d="M118 168 L118 110 Q118 82 144 80 Q170 82 170 110 L170 168 Z" fill="' + stone + '" opacity="0.75"/>' : "";
    return '<svg viewBox="0 0 300 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<rect width="300" height="210" fill="#F4EFE5"/>' +
      '<ellipse cx="60" cy="70" rx="55" ry="70" fill="#8A9B7E" opacity="0.4"/>' +
      '<ellipse cx="250" cy="80" rx="45" ry="60" fill="#8A9B7E" opacity="0.35"/>' +
      '<ellipse cx="150" cy="215" rx="220" ry="55" fill="#8A9B7E" opacity="0.55"/>' +
      second +
      '<rect x="62" y="168" width="120" height="14" rx="2" fill="#4A4741"/>' +
      '<path d="M78 168 L78 96 Q78 62 122 58 Q166 62 166 96 L166 168 Z" fill="' + stone + '"/>' +
      '<ellipse cx="122" cy="98" rx="15" ry="18" fill="' + (scene === 2 ? "#8A9B7E" : "#F2EDE4") + '" opacity="0.3"/>' +
      '<path d="M98 132 h48 M106 144 h32" stroke="' + line + '" stroke-width="2.2" opacity="0.6" stroke-linecap="round"/>' +
      '<circle cx="205" cy="182" r="4" fill="#C9B87A"/>' +
      '<circle cx="222" cy="186" r="3" fill="#D8C99A"/>' +
      "</svg>";
  }

  var worksGrid = document.getElementById("worksGrid");
  worksGrid.innerHTML = WORKS.map(function (w) {
    return '<article class="work">' +
      '<div class="work__art">' + workSVG(w.scene) + "</div>" +
      '<div class="work__body"><h3>' + w.name + "</h3><p>" + w.meta + "</p></div>" +
      "</article>";
  }).join("");

  /* ---------- Отзывы: тихая карусель ---------- */
  var REVIEWS = [
    { text: "«Всё объяснили спокойно, без торопливости. Эскиз правили три раза, пока мы не утвердили. Памятник поставили аккуратно, участок оставили чистым.»", author: "Наталья, 54 года — Красноармейский район" },
    { text: "«Оформили рассрочку без лишних вопросов. На каждом этапе присылали фотографии — было видно, как работа идёт. Спасибо за бережность.»", author: "Виктор Петрович, 67 лет — Волгоград" },
    { text: "«Помогли с разрешением на установку, сами съездили на замер. Через три недели памятник уже стоял. Очень достойная работа.»", author: "Елена и Сергей — Волжский" },
    { text: "«Заказывали комплекс с плиткой и скамьей. Сделали в срок, цена совпала со сметой до рубля. Теперь приезжаем — там спокойно и красиво.»", author: "Семья Ковалёвых — Городищенский район" }
  ];

  var viewport = document.getElementById("carouselViewport");
  var dotsBox = document.getElementById("carouselDots");
  var current = 0;
  var timer = null;

  viewport.innerHTML = REVIEWS.map(function (r, i) {
    return '<blockquote class="review' + (i === 0 ? " is-active" : "") + '">' +
      '<p class="review__text">' + r.text + "</p>" +
      '<cite class="review__author">' + r.author + "</cite>" +
      "</blockquote>";
  }).join("");
  dotsBox.innerHTML = REVIEWS.map(function (_, i) {
    return '<button class="carousel__dot' + (i === 0 ? " is-active" : "") + '" data-dot="' + i + '" aria-label="Отзыв ' + (i + 1) + '"></button>';
  }).join("");

  function showReview(index) {
    current = (index + REVIEWS.length) % REVIEWS.length;
    viewport.querySelectorAll(".review").forEach(function (el, i) {
      el.classList.toggle("is-active", i === current);
    });
    dotsBox.querySelectorAll(".carousel__dot").forEach(function (el, i) {
      el.classList.toggle("is-active", i === current);
    });
  }
  function restartTimer() {
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(function () { showReview(current + 1); }, 9000);
  }
  document.getElementById("carouselPrev").addEventListener("click", function () { showReview(current - 1); restartTimer(); });
  document.getElementById("carouselNext").addEventListener("click", function () { showReview(current + 1); restartTimer(); });
  dotsBox.addEventListener("click", function (e) {
    var dot = e.target.closest("[data-dot]");
    if (!dot) return;
    showReview(parseInt(dot.dataset.dot, 10));
    restartTimer();
  });
  restartTimer();

  /* ---------- Появление блоков — медленный fade ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Тихий плавающий блок ---------- */
  var quiet = document.getElementById("quietConsult");
  var quietClose = document.getElementById("quietConsultClose");
  var quietShown = false;
  window.addEventListener("scroll", function () {
    if (quietShown) return;
    if (window.scrollY > window.innerHeight * 1.1) {
      quietShown = true;
      quiet.hidden = false;
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () { quiet.classList.add("is-shown"); });
      });
    }
  }, { passive: true });
  quietClose.addEventListener("click", function () {
    quiet.classList.remove("is-shown");
    window.setTimeout(function () { quiet.hidden = true; }, 1200);
  });

  /* ---------- Форма ---------- */
  var form = document.getElementById("leadForm");
  var formOk = document.getElementById("formOk");
  var leadName = document.getElementById("leadName");
  var leadPhone = document.getElementById("leadPhone");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = true;
    [leadName, leadPhone].forEach(function (input) {
      var bad = input.value.trim().length < (input === leadPhone ? 6 : 2);
      input.classList.toggle("is-error", bad);
      if (bad) valid = false;
    });
    if (!valid) return;
    formOk.hidden = false;
    form.reset();
    window.setTimeout(function () { formOk.hidden = true; }, 8000);
  });

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Старт ---------- */
  renderCatalog();
  recalc();
})();
