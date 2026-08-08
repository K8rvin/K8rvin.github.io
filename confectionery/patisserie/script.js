/* ============================================================
   Maison Douce — интерактив лендинга (vanilla JS)
   ============================================================ */
(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------
     Конфетти (canvas, палитра лендинга)
  --------------------------------------------------------- */
  var confetti = (function () {
    var canvas = $("#confettiCanvas");
    var ctx = canvas.getContext("2d");
    var particles = [];
    var rafId = null;
    var COLORS = ["#C9A227", "#E9D18A", "#F6DFDA", "#B8C4A9", "#4A2C2A", "#FFFFFF"];

    function resize() {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    }
    window.addEventListener("resize", resize);
    resize();

    function tick() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.vy += 0.16;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 1;
        if (p.life <= 0 || p.y > window.innerHeight + 30) {
          particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.min(1, p.life / 40);
        ctx.fillStyle = p.color;
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }
      if (particles.length > 0) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    }

    function burst(x, y, count) {
      for (var i = 0; i < count; i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = 3 + Math.random() * 7;
        particles.push({
          x: x, y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 4,
          vr: (Math.random() - 0.5) * 0.3,
          rot: Math.random() * Math.PI,
          size: 6 + Math.random() * 8,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          shape: Math.random() > 0.5 ? "circle" : "rect",
          life: 90 + Math.random() * 70
        });
      }
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    function rain(count) {
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: -20 - Math.random() * 120,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 1.5 + Math.random() * 2.5,
          vr: (Math.random() - 0.5) * 0.2,
          rot: Math.random() * Math.PI,
          size: 6 + Math.random() * 9,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          shape: Math.random() > 0.5 ? "circle" : "rect",
          life: 200 + Math.random() * 120
        });
      }
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    return { burst: burst, rain: rain };
  })();

  /* ---------------------------------------------------------
     Шапка: тень при скролле + бургер-меню
  --------------------------------------------------------- */
  var header = $("#header");
  var burger = $("#burger");
  var nav = $("#nav");

  function onHeaderScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", onHeaderScroll, { passive: true });
  onHeaderScroll();

  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("a", nav).forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------------------------------------------------------
     Hero: параллакс при скролле и за курсором
  --------------------------------------------------------- */
  var heroArt = $("#heroArt");
  var hero = $("#hero");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          heroArt.style.transform = "translateY(" + y * 0.18 + "px)";
        }
        ticking = false;
      });
    }, { passive: true });

    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - 0.5;
      var dy = (e.clientY - r.top) / r.height - 0.5;
      heroArt.style.transition = "transform .18s ease-out";
      heroArt.style.transform = "translate(" + dx * 18 + "px," + (window.scrollY * 0.18 + dy * 12) + "px)";
    });
    hero.addEventListener("mouseleave", function () {
      heroArt.style.transition = "transform .5s ease";
    });
  }

  /* ---------------------------------------------------------
     Пасхалка: «погладьте тортик» — 5 кликов по торту
  --------------------------------------------------------- */
  var heroCake = $("#heroCake");
  var heroHint = $("#heroHint");
  var patCount = 0;
  var PAT_PHRASES = ["мур…", "ещё!", "приятно ♡", "почти…", ""];
  heroCake.addEventListener("click", function () {
    patCount++;
    heroCake.classList.remove("wiggle");
    void heroCake.getBoundingClientRect(); // перезапуск анимации
    heroCake.classList.add("wiggle");
    var r = heroCake.getBoundingClientRect();
    confetti.burst(r.left + r.width / 2, r.top + r.height / 3, 24);
    if (patCount < 5) {
      heroHint.textContent = PAT_PHRASES[patCount - 1];
    } else {
      heroHint.textContent = "вы нашли пасхалку: скидка 5% по слову «МАКАРУН» ♡";
      confetti.rain(160);
      patCount = 0;
      setTimeout(function () { heroHint.textContent = "погладьте тортик…"; }, 9000);
    }
  });

  /* ---------------------------------------------------------
     Витрина: чипсы-фильтры и горизонтальный слайдер
  --------------------------------------------------------- */
  var chips = $$("#chips .chip");
  var cards = $$("#shelf .cloche-card");
  var shelf = $("#shelf");
  var shelfEmpty = $("#shelfEmpty");

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      var filter = chip.dataset.filter;
      var visible = 0;
      cards.forEach(function (card) {
        var show = filter === "all" || (card.dataset.cat || "").split(" ").indexOf(filter) !== -1;
        card.classList.toggle("is-hidden", !show);
        if (show) visible++;
      });
      shelfEmpty.hidden = visible > 0;
      shelf.scrollTo({ left: 0, behavior: "smooth" });
      updateVitrineButtons();
    });
  });

  var prevBtn = $("#vitrinePrev");
  var nextBtn = $("#vitrineNext");

  function cardStep() {
    var first = cards.filter(function (c) { return !c.classList.contains("is-hidden"); })[0];
    return first ? first.offsetWidth + 28 : 300;
  }
  prevBtn.addEventListener("click", function () {
    shelf.scrollBy({ left: -cardStep(), behavior: "smooth" });
  });
  nextBtn.addEventListener("click", function () {
    shelf.scrollBy({ left: cardStep(), behavior: "smooth" });
  });

  function updateVitrineButtons() {
    var max = shelf.scrollWidth - shelf.clientWidth - 4;
    prevBtn.disabled = shelf.scrollLeft <= 4;
    nextBtn.disabled = shelf.scrollLeft >= max;
  }
  shelf.addEventListener("scroll", updateVitrineButtons, { passive: true });
  window.addEventListener("resize", updateVitrineButtons);
  updateVitrineButtons();

  /* ---------------------------------------------------------
     Ссылки «Заказать» подставляют повод в форму
  --------------------------------------------------------- */
  $$("[data-fill-povod]").forEach(function (el) {
    el.addEventListener("click", function () {
      var select = $("#fPovod");
      var value = el.dataset.fillPovod;
      $$("option", select).forEach(function (opt) {
        if (opt.textContent === value) select.value = opt.value || opt.textContent;
      });
    });
  });

  /* ---------------------------------------------------------
     Торт дня: время готовности + бронирование
  --------------------------------------------------------- */
  var cakeDayTime = $("#cakeDayTime");
  var now = new Date();
  cakeDayTime.textContent = now.getHours() < 15 ? "сегодня к 18:00" : "завтра к 12:00";

  var reserveBtn = $("#reserveBtn");
  var reserveNote = $("#reserveNote");
  reserveBtn.addEventListener("click", function () {
    var r = reserveBtn.getBoundingClientRect();
    confetti.burst(r.left + r.width / 2, r.top, 90);
    reserveNote.hidden = false;
    reserveBtn.textContent = "Забронировано ✓";
    reserveBtn.disabled = true;
    reserveBtn.style.opacity = "0.75";
  });

  /* ---------------------------------------------------------
     Свадебный калькулятор: 1 кг ≈ 5 гостей
  --------------------------------------------------------- */
  var PRICE_PER_KG = 3200;
  var guestsRange = $("#guestsRange");
  var guestsOut = $("#guestsOut");
  var weightOut = $("#weightOut");
  var tiersOut = $("#tiersOut");
  var priceOut = $("#priceOut");

  function formatPrice(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function animateNumber(el, to, suffix) {
    var from = parseInt((el.textContent || "0").replace(/[^\d]/g, ""), 10) || 0;
    if (from === to) { el.textContent = formatPrice(to) + (suffix || ""); return; }
    var start = null;
    var DURATION = 420;
    function step(ts) {
      if (!start) start = ts;
      var k = Math.min(1, (ts - start) / DURATION);
      var eased = 1 - Math.pow(1 - k, 3);
      el.textContent = formatPrice(Math.round(from + (to - from) * eased)) + (suffix || "");
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function recalcWedding() {
    var guests = parseInt(guestsRange.value, 10);
    guestsOut.textContent = guests;
    // вес округляем вверх до 0,5 кг
    var weight = Math.ceil((guests / 5) * 2) / 2;
    var tiers = Math.max(1, Math.min(5, Math.round(weight / 3)));
    var price = weight * PRICE_PER_KG;
    weightOut.textContent = String(weight).replace(".", ",");
    tiersOut.textContent = tiers;
    animateNumber(priceOut, price);
    var pct = ((guests - guestsRange.min) / (guestsRange.max - guestsRange.min)) * 100;
    guestsRange.style.setProperty("--fill", pct + "%");
  }
  guestsRange.addEventListener("input", recalcWedding);
  recalcWedding();

  /* ---------------------------------------------------------
     Карусель отзывов
  --------------------------------------------------------- */
  var revTrack = $("#revTrack");
  var slides = $$(".review-slide", revTrack);
  var dotsWrap = $("#revDots");
  var revIndex = 0;
  var revTimer = null;

  slides.forEach(function (_, i) {
    var dot = document.createElement("button");
    dot.setAttribute("aria-label", "Отзыв " + (i + 1));
    if (i === 0) dot.classList.add("is-active");
    dot.addEventListener("click", function () { goToReview(i); restartAuto(); });
    dotsWrap.appendChild(dot);
  });
  var dots = $$("button", dotsWrap);

  function goToReview(i) {
    revIndex = (i + slides.length) % slides.length;
    revTrack.style.transform = "translateX(-" + revIndex * 100 + "%)";
    dots.forEach(function (d, j) { d.classList.toggle("is-active", j === revIndex); });
  }
  $("#revPrev").addEventListener("click", function () { goToReview(revIndex - 1); restartAuto(); });
  $("#revNext").addEventListener("click", function () { goToReview(revIndex + 1); restartAuto(); });

  function restartAuto() {
    clearInterval(revTimer);
    revTimer = setInterval(function () { goToReview(revIndex + 1); }, 6000);
  }
  if (!reduceMotion) restartAuto();
  revTrack.addEventListener("mouseenter", function () { clearInterval(revTimer); });
  revTrack.addEventListener("mouseleave", function () { if (!reduceMotion) restartAuto(); });

  /* ---------------------------------------------------------
     Форма заказа: валидация + успех + конфетти
  --------------------------------------------------------- */
  var form = $("#orderForm");
  var formSuccess = $("#formSuccess");

  function setError(input, errEl, on) {
    errEl.hidden = !on;
    input.closest(".field").classList.toggle("has-error", on);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("#fName");
    var phone = $("#fPhone");
    var nameOk = name.value.trim().length >= 2;
    var phoneDigits = phone.value.replace(/\D/g, "");
    var phoneOk = phoneDigits.length >= 10 && phoneDigits.length <= 12;
    setError(name, $("#errName"), !nameOk);
    setError(phone, $("#errPhone"), !phoneOk);
    if (!nameOk || !phoneOk) return;

    formSuccess.hidden = false;
    var r = form.getBoundingClientRect();
    confetti.burst(r.left + r.width / 2, r.top + r.height / 2, 120);
    confetti.rain(80);
  });

  ["fName", "fPhone"].forEach(function (id) {
    $("#" + id).addEventListener("input", function () {
      var err = $("#err" + id.slice(1));
      setError(this, err, false);
    });
  });

  $("#successClose").addEventListener("click", function () {
    formSuccess.hidden = true;
    form.reset();
  });

  /* ---------------------------------------------------------
     Плавающий макарун «Заказать торт»
  --------------------------------------------------------- */
  var fab = $("#macaronFab");
  function onFabScroll() {
    var past = window.scrollY > window.innerHeight * 0.6;
    var nearOrder = false;
    var orderRect = $("#order").getBoundingClientRect();
    if (orderRect.top < window.innerHeight && orderRect.bottom > 0) nearOrder = true;
    fab.classList.toggle("is-visible", past && !nearOrder);
  }
  window.addEventListener("scroll", onFabScroll, { passive: true });
  onFabScroll();

  /* ---------------------------------------------------------
     Появление секций при скролле
  --------------------------------------------------------- */
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
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
})();
