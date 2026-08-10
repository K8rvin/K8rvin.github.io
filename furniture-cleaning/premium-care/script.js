/* ============================================================
   КУТЮР — ателье чистки премиальной мебели
   Ванильный JS: меню, reveal-анимации, драг-слайдер до/после,
   карусель отзывов, калькулятор, счётчик окон мастера, форма.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- шапка: фон при скролле ---------- */
  var header = document.getElementById("siteHeader");
  function onScrollHeader() {
    header.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- бургер-меню ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("mainNav");

  function closeNav() {
    nav.classList.remove("open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Открыть меню");
    document.body.style.overflow = "";
  }
  function toggleNav() {
    var open = nav.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", toggleNav);
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeNav();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      closeNav();
      burger.focus();
    }
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 920) closeNav();
  });

  /* ---------- reveal-анимации при скролле ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- счётчик окон мастера ---------- */
  function plural(n, one, few, many) {
    var m = Math.abs(n) % 100;
    var d = m % 10;
    if (m > 10 && m < 20) return many;
    if (d > 1 && d < 5) return few;
    if (d === 1) return one;
    return many;
  }
  function updateSlots() {
    var h = new Date().getHours();
    var text;
    if (h >= 21 || h < 8) {
      text = "Приём на сегодня завершён — на завтра свободно 4 окна";
    } else {
      // в течение дня окна разбирают: 4 утром, к вечеру остаётся 1
      var left = Math.max(1, 4 - Math.floor((h - 8) / 3));
      text = "Сегодня осталось " + left + " " + plural(left, "окно", "окна", "окон") + " мастера";
    }
    document.querySelectorAll(".slots-out").forEach(function (el) {
      el.textContent = text;
    });
  }
  updateSlots();
  setInterval(updateSlots, 60 * 1000);

  /* ---------- драг-слайдер до/после ---------- */
  var baStage = document.querySelector("#baWrap .ba__stage");
  var baHandle = document.getElementById("baHandle");

  function setBaPos(pct) {
    var p = Math.min(96, Math.max(4, pct));
    baStage.style.setProperty("--pos", p + "%");
    baHandle.setAttribute("aria-valuenow", String(Math.round(p)));
  }

  function baPosFromEvent(e) {
    var rect = baStage.getBoundingClientRect();
    return ((e.clientX - rect.left) / rect.width) * 100;
  }

  var baDragging = false;
  baStage.addEventListener("pointerdown", function (e) {
    baDragging = true;
    baStage.setPointerCapture(e.pointerId);
    setBaPos(baPosFromEvent(e));
    e.preventDefault();
  });
  baStage.addEventListener("pointermove", function (e) {
    if (baDragging) setBaPos(baPosFromEvent(e));
  });
  ["pointerup", "pointercancel"].forEach(function (type) {
    baStage.addEventListener(type, function () { baDragging = false; });
  });
  baHandle.addEventListener("keydown", function (e) {
    var cur = parseFloat(baHandle.getAttribute("aria-valuenow")) || 50;
    var step = e.shiftKey ? 10 : 4;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      setBaPos(cur - step);
      e.preventDefault();
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      setBaPos(cur + step);
      e.preventDefault();
    } else if (e.key === "Home") {
      setBaPos(4);
      e.preventDefault();
    } else if (e.key === "End") {
      setBaPos(96);
      e.preventDefault();
    }
  });
  setBaPos(50);

  /* ---------- карусель отзывов ---------- */
  var track = document.getElementById("revTrack");
  var slides = track.children;
  var prevBtn = document.getElementById("revPrev");
  var nextBtn = document.getElementById("revNext");
  var dotsWrap = document.getElementById("revDots");
  var current = 0;

  for (var i = 0; i < slides.length; i++) {
    var dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "Отзыв " + (i + 1));
    (function (idx) {
      dot.addEventListener("click", function () { goTo(idx); });
    })(i);
    dotsWrap.appendChild(dot);
  }
  var dots = dotsWrap.children;

  function goTo(idx) {
    current = (idx + slides.length) % slides.length;
    track.style.transform = "translateX(-" + current * 100 + "%)";
    for (var d = 0; d < dots.length; d++) {
      dots[d].classList.toggle("active", d === current);
      dots[d].setAttribute("aria-selected", d === current ? "true" : "false");
    }
  }
  prevBtn.addEventListener("click", function () { goTo(current - 1); });
  nextBtn.addEventListener("click", function () { goTo(current + 1); });

  var carousel = document.getElementById("carousel");
  carousel.tabIndex = 0;
  carousel.setAttribute("aria-label", "Отзывы клиентов, листайте стрелками");
  carousel.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { goTo(current - 1); e.preventDefault(); }
    if (e.key === "ArrowRight") { goTo(current + 1); e.preventDefault(); }
  });

  // свайп
  var swipeX = null;
  var viewport = carousel.querySelector(".carousel__viewport");
  viewport.addEventListener("pointerdown", function (e) {
    swipeX = e.clientX;
  }, { passive: true });
  viewport.addEventListener("pointerup", function (e) {
    if (swipeX === null) return;
    var dx = e.clientX - swipeX;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
    swipeX = null;
  });
  viewport.addEventListener("pointercancel", function () { swipeX = null; });
  goTo(0);

  /* ---------- калькулятор ---------- */
  var calcType = document.getElementById("calcType");
  var calcFabric = document.getElementById("calcFabric");
  var calcProtect = document.getElementById("calcProtect");
  var calcUrgent = document.getElementById("calcUrgent");
  var calcSum = document.querySelector("#calcOut .calc__sum");

  function calcTotal() {
    var base = parseFloat(calcType.value) || 0;
    var mult = parseFloat(calcFabric.value) || 1;
    var total = base * mult;
    if (calcProtect.checked) total += 1500;
    if (calcUrgent.checked) total += 1000;
    total = Math.round(total / 100) * 100;
    calcSum.textContent = "от " + total.toLocaleString("ru-RU") + " ₽";
    calcSum.classList.remove("bump");
    void calcSum.offsetWidth; // перезапуск анимации
    calcSum.classList.add("bump");
  }
  [calcType, calcFabric].forEach(function (el) { el.addEventListener("change", calcTotal); });
  [calcProtect, calcUrgent].forEach(function (el) { el.addEventListener("change", calcTotal); });
  calcTotal();

  /* ---------- форма заявки (демо) ---------- */
  var form = document.getElementById("leadForm");
  var success = document.getElementById("formSuccess");
  var formError = document.getElementById("formError");
  var fName = document.getElementById("fName");
  var fPhone = document.getElementById("fPhone");
  var fFurniture = document.getElementById("fFurniture");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = fName.value.trim();
    var digits = fPhone.value.replace(/\D/g, "");
    var valid = name.length >= 2 && digits.length >= 10 && fFurniture.value !== "";
    if (!valid) {
      formError.hidden = false;
      formError.textContent = name.length < 2
        ? "Подскажите, как к вам обращаться, и оставьте телефон."
        : digits.length < 10
          ? "Проверьте номер телефона — мастеру нужно вам перезвонить."
          : "Выберите, какую мебель будем бережно чистить.";
      return;
    }
    formError.hidden = true;
    document.getElementById("successText").textContent =
      name + ", спасибо! Мастер свяжется с вами в течение 30 минут и согласует удобное время бесплатной диагностики.";
    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  });
})();
