/* ============================================================
   «Море цветов» — интерактив лендинга (ванильный JS)
   1. Индикатор «Сейчас открыто / Закрыто» по режиму 9:00–20:00
   2. Плавное появление секций при скролле (IntersectionObserver)
   3. Лёгкий параллакс лепестков на hero
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 1. Индикатор «открыто/закрыто» ---------- */
  var OPEN_HOUR = 9;   // открываемся в 9:00
  var CLOSE_HOUR = 20; // закрываемся в 20:00

  function updateOpenBadge(badge) {
    if (!badge) return;
    var now = new Date();
    var hour = now.getHours();
    var isOpen = hour >= OPEN_HOUR && hour < CLOSE_HOUR;

    var textEl = badge.querySelector(".open-badge__text");
    if (textEl) {
      textEl.textContent = isOpen
        ? "Сейчас открыто · до 20:00"
        : "Сейчас закрыто · откроемся в 9:00";
    }
    badge.classList.toggle("open-badge--closed", !isOpen);
  }

  function initOpenBadges() {
    var badges = [
      document.getElementById("openBadgeHeader"),
      document.getElementById("openBadgeContacts")
    ];
    badges.forEach(updateOpenBadge);
    // обновляем раз в минуту — статус может смениться, пока страница открыта
    setInterval(function () {
      badges.forEach(updateOpenBadge);
    }, 60000);
  }

  /* ---------- 2. Появление при скролле ---------- */
  function initReveal() {
    var elements = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      elements.forEach(function (el) { el.classList.add("reveal--visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal--visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- 3. Параллакс лепестков на hero ---------- */
  function initPetalParallax() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var hero = document.querySelector(".hero");
    var petals = document.querySelectorAll(".petal");
    if (!hero || petals.length === 0) return;

    var factors = [0.05, 0.09, 0.14, 0.07]; // глубина параллакса для каждого лепестка
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var rect = hero.getBoundingClientRect();
        // параллакс действует, только пока hero в пределах экрана
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          var offset = -rect.top;
          petals.forEach(function (petal, i) {
            var shift = offset * (factors[i] || 0.06);
            petal.style.marginTop = shift.toFixed(1) + "px";
          });
        }
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Инициализация ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initOpenBadges();
    initReveal();
    initPetalParallax();
  });
})();
