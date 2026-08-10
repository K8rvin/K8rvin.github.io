/* =====================================================
   Клининг-консьерж — вся интерактивная логика
   ===================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Шапка: фон при скролле ---------- */
  var header = document.getElementById('header');
  function onScrollHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Бургер-меню ---------- */
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');

  function toggleMenu(open) {
    var isOpen = typeof open === 'boolean' ? open : !mobileMenu.classList.contains('is-open');
    mobileMenu.classList.toggle('is-open', isOpen);
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('is-locked', isOpen);
  }

  burger.addEventListener('click', function () { toggleMenu(); });
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { toggleMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) toggleMenu(false);
  });

  /* ---------- Появление при скролле ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  // Мягкий каскад для соседних элементов внутри одного контейнера
  document.querySelectorAll('.principles__list, .formats__grid, .standards__grid, .services__grid, .stats__row, .hero__content').forEach(function (group) {
    Array.prototype.forEach.call(group.querySelectorAll('.reveal'), function (el, i) {
      el.style.setProperty('--delay', Math.min(i * 0.14, 0.7) + 's');
    });
  });

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Счётчики ---------- */
  function animateCounter(el) {
    var target = parseInt(el.dataset.target, 10) || 0;
    if (prefersReducedMotion) { el.textContent = String(target); return; }
    var duration = 1900;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll('.js-counter');
  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- Дефицит: осталось N мест на месяц ---------- */
  var MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
                'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
  var TOTAL_SLOTS = 30;
  var now = new Date();
  var monthName = MONTHS[now.getMonth()];
  var daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  // Правдоподобная имитация: места «разбирают» в течение месяца, но не меньше 2
  var elapsedRatio = Math.min(now.getDate() / daysInMonth, 1);
  var slotsLeft = Math.max(2, Math.round(TOTAL_SLOTS * (1 - elapsedRatio * 0.9)));

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  document.querySelectorAll('.js-month').forEach(function (el) { el.textContent = monthName; });
  document.querySelectorAll('.js-slots-left').forEach(function (el) {
    el.textContent = slotsLeft + ' ' + plural(slotsLeft, 'место', 'места', 'мест');
  });

  // В hero формулировка «осталось N из 30 мест» — заменим только число существительным корректно:
  // «осталось 4 места из 30 мест» читается тяжело, поэтому hero-формат: «осталось 4 из 30 мест»
  document.querySelectorAll('.hero__scarcity .js-slots-left').forEach(function (el) {
    el.textContent = String(slotsLeft);
  });

  /* ---------- Калькулятор ---------- */
  var calcArea = document.getElementById('calcArea');
  var calcAreaOut = document.getElementById('calcAreaOut');
  var calcFormats = document.querySelectorAll('.calc__format');
  var calcPriceEl = document.querySelector('.js-calc-price');
  var calcUnitEl = document.querySelector('.js-calc-unit');
  var currentPrice = 0;
  var priceAnimFrame = null;

  function formatNumber(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function getRate() {
    var active = document.querySelector('.calc__format.is-active');
    return {
      rate: parseInt(active.dataset.rate, 10),
      unit: active.dataset.unit
    };
  }

  function renderPrice(targetPrice, unit) {
    if (priceAnimFrame) cancelAnimationFrame(priceAnimFrame);
    var from = currentPrice;
    var duration = 700;
    var start = null;
    if (prefersReducedMotion || from === 0) {
      currentPrice = targetPrice;
      calcPriceEl.textContent = formatNumber(targetPrice);
      calcUnitEl.textContent = unit;
      return;
    }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var value = Math.round(from + (targetPrice - from) * eased);
      calcPriceEl.textContent = formatNumber(value);
      if (p < 1) { priceAnimFrame = requestAnimationFrame(step); }
      else { currentPrice = targetPrice; }
    }
    calcUnitEl.textContent = unit;
    priceAnimFrame = requestAnimationFrame(step);
  }

  function recalc() {
    var area = parseInt(calcArea.value, 10);
    var fmt = getRate();
    var price = Math.round(area * fmt.rate / 100) * 100;
    calcAreaOut.textContent = area + ' м²';
    var fill = ((area - calcArea.min) / (calcArea.max - calcArea.min)) * 100;
    calcArea.style.setProperty('--fill', fill + '%');
    renderPrice(price, fmt.unit);
  }

  if (calcArea) {
    calcArea.addEventListener('input', recalc);
    calcFormats.forEach(function (btn) {
      btn.addEventListener('click', function () {
        calcFormats.forEach(function (b) {
          b.classList.remove('is-active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-checked', 'true');
        recalc();
      });
    });
    recalc();
  }

  /* ---------- Карусель отзывов ---------- */
  var track = document.getElementById('carouselTrack');
  var prevBtn = document.getElementById('carouselPrev');
  var nextBtn = document.getElementById('carouselNext');
  var dotsWrap = document.getElementById('carouselDots');

  if (track) {
    var slides = track.children.length;
    var index = 0;
    var autoTimer = null;

    for (var i = 0; i < slides; i++) {
      var dot = document.createElement('button');
      dot.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
      dot.dataset.index = String(i);
      dotsWrap.appendChild(dot);
    }
    var dots = dotsWrap.querySelectorAll('.carousel__dot');

    function goTo(n) {
      index = (n + slides) % slides;
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      dots.forEach(function (d, di) { d.classList.toggle('is-active', di === index); });
    }

    function restartAuto() {
      if (prefersReducedMotion) return;
      clearInterval(autoTimer);
      autoTimer = setInterval(function () { goTo(index + 1); }, 8000);
    }

    prevBtn.addEventListener('click', function () { goTo(index - 1); restartAuto(); });
    nextBtn.addEventListener('click', function () { goTo(index + 1); restartAuto(); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () { goTo(parseInt(d.dataset.index, 10)); restartAuto(); });
    });

    var carousel = document.getElementById('carousel');
    carousel.addEventListener('mouseenter', function () { clearInterval(autoTimer); });
    carousel.addEventListener('mouseleave', restartAuto);

    // Свайп на сенсорных экранах
    var touchX = null;
    track.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 44) goTo(index + (dx < 0 ? 1 : -1));
      touchX = null;
      restartAuto();
    }, { passive: true });

    restartAuto();
  }

  /* ---------- Параллакс света и сцены на hero ---------- */
  var heroLight = document.getElementById('heroLight');
  var heroScene = document.getElementById('heroScene');
  var hero = document.getElementById('hero');

  if (heroLight && heroScene && !prefersReducedMotion) {
    var mouseX = 0, mouseY = 0;       // целевые значения -1..1
    var curX = 0, curY = 0;           // текущие (инерция)
    var ticking = false;

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      requestTick();
    });

    window.addEventListener('scroll', requestTick, { passive: true });

    function requestTick() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    }

    function updateParallax() {
      // Инерция — движение «благородное», медленное
      curX += (mouseX - curX) * 0.06;
      curY += (mouseY - curY) * 0.06;
      var scrollShift = Math.min(window.scrollY * 0.08, 60);

      heroLight.style.transform =
        'translate3d(' + (curX * 34) + 'px,' + (curY * 22 - scrollShift * 0.4) + 'px, 0)';
      heroScene.style.transform =
        'translate3d(' + (curX * -10) + 'px,' + (-scrollShift * 0.5) + 'px, 0)';

      if (Math.abs(mouseX - curX) > 0.001 || Math.abs(mouseY - curY) > 0.001) {
        requestAnimationFrame(updateParallax);
      } else {
        ticking = false;
      }
    }
  }

  /* ---------- Форма заявки ---------- */
  var leadForm = document.getElementById('leadForm');
  var formSuccess = document.getElementById('formSuccess');

  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameInput = leadForm.elements.name;
      var phoneInput = leadForm.elements.phone;
      var valid = true;

      [nameInput, phoneInput].forEach(function (input) {
        var ok = input.value.trim().length >= (input === phoneInput ? 6 : 2);
        input.classList.toggle('is-error', !ok);
        if (!ok) valid = false;
      });

      if (!valid) return;

      leadForm.hidden = true;
      formSuccess.hidden = false;
      formSuccess.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
    });

    leadForm.querySelectorAll('.cta__input').forEach(function (input) {
      input.addEventListener('input', function () { input.classList.remove('is-error'); });
    });
  }

  /* ---------- Год в футере ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
