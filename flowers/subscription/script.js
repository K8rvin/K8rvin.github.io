/* ============================================
   Зелёная привычка — интерактивная логика
   ============================================ */
(function () {
  "use strict";

  /* ---------- Шапка: тень при скролле ---------- */
  var header = document.getElementById("header");
  function onScrollHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Бургер-меню ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  function closeMenu() {
    burger.classList.remove("is-open");
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  /* ---------- Появление при скролле ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".reveal").forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---------- Счётчик ваз ---------- */
  var VASES_TARGET = 217;
  var counterEl = document.getElementById("vaseCounter");
  var counterDone = false;

  function animateCounter() {
    if (counterDone) return;
    counterDone = true;
    var duration = 1800;
    var start = null;
    function tick(now) {
      if (!start) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      counterEl.textContent = Math.round(VASES_TARGET * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter();
        counterObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  counterObserver.observe(counterEl.closest(".counter-strip"));

  /* ---------- «Растущий лист» в таймлайне ---------- */
  var timeline = document.querySelector(".timeline");
  var stemObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        timeline.classList.add("is-grown");
        stemObserver.disconnect();
      }
    });
  }, { threshold: 0.25 });
  stemObserver.observe(timeline);

  /* ---------- Переключатель периодичности тарифов ---------- */
  var periodToggle = document.querySelector(".period-toggle");
  var periodButtons = periodToggle.querySelectorAll(".period-toggle__btn");
  var priceValues = document.querySelectorAll(".tariff__value");

  function formatPrice(num) {
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function setPeriod(period, btn) {
    periodButtons.forEach(function (b) { b.classList.remove("is-active"); });
    btn.classList.add("is-active");
    periodToggle.classList.toggle("is-right", period === "biweekly");

    priceValues.forEach(function (el) {
      el.classList.add("is-flipping");
      setTimeout(function () {
        el.textContent = formatPrice(el.dataset[period]);
        el.classList.remove("is-flipping");
      }, 260);
    });
  }

  periodButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-active")) return;
      setPeriod(btn.dataset.period, btn);
    });
  });

  /* ---------- Выбор тарифа -> прокрутка к форме ---------- */
  var tariffSelect = document.getElementById("tariffSelect");
  document.querySelectorAll(".tariff__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      tariffSelect.value = btn.dataset.tariff;
      document.getElementById("order").scrollIntoView({ behavior: "smooth" });
    });
  });

  document.getElementById("bizCta").addEventListener("click", function () {
    tariffSelect.value = "Для бизнеса";
    setDestination("Бизнес");
  });

  /* ---------- Фильтры витрины растений ---------- */
  var chips = document.querySelectorAll(".chip");
  var plants = document.querySelectorAll(".plant");

  function applyFilter(filter) {
    plants.forEach(function (plant) {
      var show = filter === "all" || plant.dataset.tags.split(" ").indexOf(filter) !== -1;
      plant.classList.add("is-filtering");
      setTimeout(function () {
        plant.classList.toggle("is-hidden", !show);
        plant.classList.remove("is-filtering");
      }, 220);
    });
  }

  function setActiveChip(filter) {
    chips.forEach(function (chip) {
      chip.classList.toggle("is-active", chip.dataset.filter === filter);
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      setActiveChip(chip.dataset.filter);
      applyFilter(chip.dataset.filter);
    });
  });

  /* ---------- Квиз ---------- */
  var quizBox = document.getElementById("quizBox");
  var quizSteps = quizBox.querySelectorAll(".quiz__step");
  var quizProgress = document.getElementById("quizProgress");
  var quizResult = document.getElementById("quizResult");
  var quizResultTitle = document.getElementById("quizResultTitle");
  var quizResultText = document.getElementById("quizResultText");
  var answers = {};

  // Демо-данные рекомендаций
  var RECOMMENDATIONS = {
    "north|cats": {
      title: "Калатея",
      text: "Идеальна для северного окна и полностью безопасна для котов. Добавьте хлорофитум — он тоже переживёт и кота, и полутень.",
      filter: "cats"
    },
    "north|nocats": {
      title: "Замиокулькас",
      text: "Живёт даже в глубине комнаты и прощает забытый полив. В пару возьмите сциндапсус — самое неубиваемое комбо для тёмных квартир.",
      filter: "shade"
    },
    "half|cats": {
      title: "Хлорофитум",
      text: "Неприхотливый, безопасный для котов и быстро растущий. Коты его обожают — и это нормально, растение не пострадает.",
      filter: "cats"
    },
    "half|nocats": {
      title: "Сансевиерия",
      text: "Классика для занятых: полив раз в две недели, терпит любое освещение. Главное — не переливать.",
      filter: "easy"
    },
    "sun|cats": {
      title: "Пеперомия",
      text: "Компактная, безопасная для котов и любит светлое окно без прямого палящего солнца. Отличный первый питомец.",
      filter: "cats"
    },
    "sun|nocats": {
      title: "Сциндапсус",
      text: "Растёт так быстро, что через пару месяцев у вас будет зелёный водопад с полки. Любит свет и редкий полив.",
      filter: "easy"
    }
  };

  var EXPERIENCE_NOTE = {
    newbie: "Вы новичок, поэтому подобрали максимально неприхотливый вариант. ",
    some: "С вашим опытом справитесь легко. ",
    guru: "Для гуру можно и что-то посложнее, но начнём с беспроигрышного. "
  };

  quizSteps.forEach(function (step) {
    step.querySelectorAll(".quiz__answer").forEach(function (answer) {
      answer.addEventListener("click", function () {
        var stepNum = step.dataset.step;
        answers[stepNum] = answer.dataset.value;

        if (stepNum === "3") {
          showQuizResult();
        } else {
          step.classList.remove("is-active");
          var next = quizBox.querySelector('.quiz__step[data-step="' + (Number(stepNum) + 1) + '"]');
          next.classList.add("is-active");
          quizProgress.style.width = ((Number(stepNum) + 1) / 3 * 100) + "%";
        }
      });
    });
  });

  function showQuizResult() {
    quizSteps.forEach(function (s) { s.classList.remove("is-active"); });
    quizProgress.style.width = "100%";

    var key = (answers["1"] || "half") + "|" + (answers["3"] === "cats" ? "cats" : "nocats");
    var rec = RECOMMENDATIONS[key] || RECOMMENDATIONS["half|nocats"];

    quizResultTitle.textContent = rec.title;
    quizResultText.textContent = (EXPERIENCE_NOTE[answers["2"]] || "") + rec.text;
    quizResult.dataset.filter = rec.filter;
    quizResult.classList.add("is-visible");
  }

  document.getElementById("quizShowCollection").addEventListener("click", function () {
    var filter = quizResult.dataset.filter || "all";
    setActiveChip(filter);
    applyFilter(filter);
    document.getElementById("plants").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("quizRestart").addEventListener("click", function () {
    answers = {};
    quizResult.classList.remove("is-visible");
    quizProgress.style.width = "33.3%";
    quizBox.querySelector('.quiz__step[data-step="1"]').classList.add("is-active");
  });

  /* ---------- Карусель отзывов ---------- */
  var track = document.getElementById("revTrack");
  var slides = track.children;
  var dotsBox = document.getElementById("revDots");
  var current = 0;
  var autoTimer = null;

  for (var i = 0; i < slides.length; i++) {
    var dot = document.createElement("button");
    dot.className = "carousel__dot";
    dot.setAttribute("aria-label", "Отзыв " + (i + 1));
    dot.dataset.index = i;
    dotsBox.appendChild(dot);
  }
  var dots = dotsBox.querySelectorAll(".carousel__dot");

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = "translateX(-" + current * 100 + "%)";
    dots.forEach(function (d, idx) {
      d.classList.toggle("is-active", idx === current);
    });
    restartAuto();
  }

  function restartAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(function () { goTo(current + 1); }, 6000);
  }

  document.getElementById("revPrev").addEventListener("click", function () { goTo(current - 1); });
  document.getElementById("revNext").addEventListener("click", function () { goTo(current + 1); });
  dots.forEach(function (dot) {
    dot.addEventListener("click", function () { goTo(Number(dot.dataset.index)); });
  });

  // Свайп на мобильных
  var touchStartX = null;
  track.addEventListener("touchstart", function (e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  track.addEventListener("touchend", function (e) {
    if (touchStartX === null) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
    touchStartX = null;
  }, { passive: true });

  goTo(0);

  /* ---------- Сегмент «дом / бизнес» ---------- */
  var destination = "Домой";
  var segButtons = document.querySelectorAll(".segmented__btn");

  function setDestination(value) {
    destination = value;
    segButtons.forEach(function (btn) {
      btn.classList.toggle("is-active", btn.dataset.dest === value);
    });
  }
  segButtons.forEach(function (btn) {
    btn.addEventListener("click", function () { setDestination(btn.dataset.dest); });
  });

  /* ---------- Форма заявки ---------- */
  var form = document.getElementById("orderForm");
  var formError = document.getElementById("formError");
  var successBox = document.getElementById("orderSuccess");
  var successText = document.getElementById("orderSuccessText");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    formError.textContent = "";

    var nameInput = form.elements.name;
    var phoneInput = form.elements.phone;
    var valid = true;

    [nameInput, phoneInput].forEach(function (input) {
      input.classList.remove("is-invalid");
    });

    if (nameInput.value.trim().length < 2) {
      nameInput.classList.add("is-invalid");
      valid = false;
    }
    var digits = phoneInput.value.replace(/\D/g, "");
    if (digits.length < 10) {
      phoneInput.classList.add("is-invalid");
      valid = false;
    }

    if (!valid) {
      formError.textContent = "Пожалуйста, укажите имя и корректный телефон (минимум 10 цифр).";
      return;
    }

    // Демо-режим: без реальной отправки
    successText.textContent =
      nameInput.value.trim() + ", спасибо! Мы перезвоним в течение 30 минут, чтобы подтвердить " +
      "первую доставку по тарифу «" + tariffSelect.value + "» (" +
      (destination === "Бизнес" ? "для бизнеса" : "домой") + ").";

    form.hidden = true;
    successBox.hidden = false;
    successBox.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  document.getElementById("orderAgain").addEventListener("click", function () {
    successBox.hidden = true;
    form.hidden = false;
    form.reset();
    setDestination("Домой");
  });

})();
