/* ============================================================
   Дока Строй — журнальный лендинг: весь интерактив
   ============================================================ */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Форматирование цен ---------- */
  function formatRub(value) {
    return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";
  }

  /* ============================================================
     1. Липкая шапка + бургер-меню
     ============================================================ */
  var header = document.getElementById("siteHeader");
  var burger = document.getElementById("burger");
  var mainNav = document.getElementById("mainNav");

  function onHeaderScroll() {
    header.classList.toggle("is-stuck", window.scrollY > 60);
  }
  window.addEventListener("scroll", onHeaderScroll, { passive: true });
  onHeaderScroll();

  burger.addEventListener("click", function () {
    var open = mainNav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });

  // Закрываем меню при переходе по ссылке
  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mainNav.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  /* ============================================================
     2. Появление элементов при скролле (IntersectionObserver)
     ============================================================ */
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal, .reveal-quote").forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ============================================================
     3. Параллакс: hero-фон и обложка кейса
     ============================================================ */
  var heroBg = document.querySelector(".hero-bg");
  var parallaxImgs = Array.prototype.slice.call(document.querySelectorAll(".parallax-img"));

  if (!reducedMotion) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        // Лёгкий параллакс обложки номера
        if (y < window.innerHeight * 1.2) {
          heroBg.style.transform = "translateY(" + y * 0.28 + "px)";
        }
        // Параллакс внутри рамки кейса
        parallaxImgs.forEach(function (img) {
          var rect = img.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < window.innerHeight) {
            var progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
            var speed = parseFloat(img.dataset.speed || "0.2");
            img.style.backgroundPosition =
              "center calc(30% + " + (progress * speed * 100).toFixed(2) + "%)";
          }
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ============================================================
     4. Анимированные счётчики (лонгрид-статистика)
     ============================================================ */
  var counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        counterObserver.unobserve(el);
        var target = parseInt(el.dataset.count, 10);
        if (reducedMotion || !target) { el.textContent = target || el.textContent; return; }
        var start = null;
        var duration = 1400;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach(function (el) {
    counterObserver.observe(el);
  });

  /* ============================================================
     5. Калькулятор сметы
     ============================================================ */
  var calcArea = document.getElementById("calcArea");
  var areaOut = document.getElementById("areaOut");
  var calcTariff = document.getElementById("calcTariff");
  var calcTotal = document.getElementById("calcTotal");
  var calcMonthly = document.getElementById("calcMonthly");
  var calcMonthlyValue = document.getElementById("calcMonthlyValue");
  var optionBoxes = Array.prototype.slice.call(
    document.querySelectorAll(".calc-options input[type=checkbox]")
  );
  var installmentChips = Array.prototype.slice.call(
    document.querySelectorAll(".calc-installment .chip")
  );
  var installmentMonths = 0;

  function recalc() {
    var area = parseInt(calcArea.value, 10);
    areaOut.textContent = area;
    var rate = parseInt(calcTariff.value, 10);
    optionBoxes.forEach(function (box) {
      if (box.checked) rate += parseInt(box.dataset.price, 10);
    });
    var total = area * rate;
    calcTotal.textContent = formatRub(total);
    if (installmentMonths > 0) {
      calcMonthly.hidden = false;
      calcMonthlyValue.textContent = formatRub(total / installmentMonths);
    } else {
      calcMonthly.hidden = true;
    }
  }

  [calcArea, calcTariff].forEach(function (el) {
    el.addEventListener("input", recalc);
  });
  optionBoxes.forEach(function (box) { box.addEventListener("change", recalc); });

  installmentChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      installmentChips.forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      installmentMonths = parseInt(chip.dataset.months, 10);
      recalc();
    });
  });
  recalc();

  /* ---------- Печать / «скачать PDF» примера сметы ---------- */
  document.getElementById("printEstimate").addEventListener("click", function () {
    window.print();
  });

  /* ============================================================
     6. Тарифы: аккордеон «что входит»
     ============================================================ */
  document.querySelectorAll(".tariff").forEach(function (tariff) {
    var headBtn = tariff.querySelector(".tariff-head");
    var body = tariff.querySelector(".tariff-body");
    headBtn.addEventListener("click", function () {
      var isOpen = tariff.classList.toggle("is-open");
      headBtn.setAttribute("aria-expanded", String(isOpen));
      body.style.maxHeight = isOpen ? body.scrollHeight + "px" : "0px";
    });
  });
  // Первый (рекомендуемый) тариф раскрыт по умолчанию
  var featured = document.querySelector(".tariff-featured");
  if (featured) {
    featured.classList.add("is-open");
    var fHead = featured.querySelector(".tariff-head");
    var fBody = featured.querySelector(".tariff-body");
    fHead.setAttribute("aria-expanded", "true");
    // Откладываем, чтобы scrollHeight посчитался после загрузки шрифтов
    window.addEventListener("load", function () {
      fBody.style.maxHeight = fBody.scrollHeight + "px";
    });
    fBody.style.maxHeight = fBody.scrollHeight + "px";
  }

  /* ============================================================
     7. Портфолио: фильтры + горизонтальная лента
     ============================================================ */
  var strip = document.getElementById("portfolioStrip");
  var projectCards = Array.prototype.slice.call(document.querySelectorAll(".project-card"));

  document.querySelectorAll(".portfolio-filters .chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".portfolio-filters .chip").forEach(function (c) {
        c.classList.remove("is-active");
      });
      chip.classList.add("is-active");
      var filter = chip.dataset.filter;
      projectCards.forEach(function (card) {
        var show = filter === "all" || card.dataset.cat === filter;
        card.classList.toggle("is-hidden", !show);
      });
      strip.scrollTo({ left: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
  });

  function stripStep() {
    var card = strip.querySelector(".project-card:not(.is-hidden)");
    return card ? card.offsetWidth + 28 : 340;
  }
  document.querySelector(".strip-prev").addEventListener("click", function () {
    strip.scrollBy({ left: -stripStep(), behavior: "smooth" });
  });
  document.querySelector(".strip-next").addEventListener("click", function () {
    strip.scrollBy({ left: stripStep(), behavior: "smooth" });
  });

  /* ============================================================
     8. Слайдер «до / после»
     ============================================================ */
  var baSlider = document.getElementById("baSlider");
  var baBefore = document.getElementById("baBefore");
  var baHandle = document.getElementById("baHandle");
  var baRange = document.getElementById("baRange");

  function setBa(pct) {
    pct = Math.max(0, Math.min(100, pct));
    baBefore.style.clipPath = "inset(0 " + (100 - pct) + "% 0 0)";
    baHandle.style.left = pct + "%";
    baRange.value = String(pct);
  }

  baRange.addEventListener("input", function () {
    setBa(parseFloat(baRange.value));
  });

  // Перетаскивание мышью/пальцем по всей области слайдера
  function baFromEvent(clientX) {
    var rect = baSlider.getBoundingClientRect();
    setBa(((clientX - rect.left) / rect.width) * 100);
  }
  baSlider.addEventListener("pointerdown", function (e) {
    baSlider.setPointerCapture(e.pointerId);
    baFromEvent(e.clientX);
    function move(ev) { baFromEvent(ev.clientX); }
    baSlider.addEventListener("pointermove", move);
    baSlider.addEventListener("pointerup", function up() {
      baSlider.removeEventListener("pointermove", move);
      baSlider.removeEventListener("pointerup", up);
    });
  });
  setBa(50);

  /* ============================================================
     9. Карусель «Письма читателей»
     ============================================================ */
  var track = document.getElementById("lettersTrack");
  var letters = track.children;
  var dotsWrap = document.getElementById("lettersDots");
  var letterIndex = 0;
  var letterTimer = null;

  for (var i = 0; i < letters.length; i++) {
    var dot = document.createElement("button");
    dot.setAttribute("aria-label", "Отзыв " + (i + 1));
    dot.dataset.index = String(i);
    dotsWrap.appendChild(dot);
  }
  var dots = Array.prototype.slice.call(dotsWrap.children);

  function goToLetter(index) {
    letterIndex = (index + letters.length) % letters.length;
    track.style.transform = "translateX(-" + letterIndex * 100 + "%)";
    dots.forEach(function (d, di) {
      d.classList.toggle("is-active", di === letterIndex);
    });
    restartLetterTimer();
  }

  function restartLetterTimer() {
    clearInterval(letterTimer);
    if (!reducedMotion) {
      letterTimer = setInterval(function () { goToLetter(letterIndex + 1); }, 7000);
    }
  }

  document.getElementById("letterPrev").addEventListener("click", function () {
    goToLetter(letterIndex - 1);
  });
  document.getElementById("letterNext").addEventListener("click", function () {
    goToLetter(letterIndex + 1);
  });
  dots.forEach(function (d) {
    d.addEventListener("click", function () {
      goToLetter(parseInt(d.dataset.index, 10));
    });
  });
  goToLetter(0);

  /* ============================================================
     10. Плавающая CTA-кнопка
     ============================================================ */
  var floatingCta = document.getElementById("floatingCta");
  var contactSection = document.getElementById("contact");
  window.addEventListener("scroll", function () {
    var pastHero = window.scrollY > window.innerHeight * 0.9;
    var contactRect = contactSection.getBoundingClientRect();
    var contactVisible = contactRect.top < window.innerHeight && contactRect.bottom > 0;
    floatingCta.classList.toggle("is-visible", pastHero && !contactVisible);
  }, { passive: true });

  /* ============================================================
     11. Форма: валидация + сообщение об успехе
     ============================================================ */
  var form = document.getElementById("contactForm");
  var formSuccess = document.getElementById("formSuccess");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = true;
    form.querySelectorAll("[required]").forEach(function (field) {
      var empty = !field.value.trim();
      var badPhone = field.type === "tel" && field.value.replace(/\D/g, "").length < 10;
      var invalid = empty || badPhone;
      field.classList.toggle("is-error", invalid);
      if (invalid) valid = false;
    });
    if (!valid) return;
    form.hidden = true;
    formSuccess.hidden = false;
    formSuccess.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
  });

  // Снимаем подсветку ошибки при вводе
  form.querySelectorAll("[required]").forEach(function (field) {
    field.addEventListener("input", function () {
      field.classList.remove("is-error");
    });
  });

  /* ============================================================
     12. FAQ: закрываем соседние вопросы (поведение аккордеона)
     ============================================================ */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });
})();
