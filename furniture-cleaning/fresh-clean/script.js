/* ===== FreshClean — интерактив лендинга ===== */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: тень при скролле + бургер ---------- */
  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function onScrollHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  function closeMenu() {
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('.nav__link')) closeMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- Появление при скролле ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReduced) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Счётчики ---------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-counter'));
    var decimal = el.getAttribute('data-decimal') || '';
    if (prefersReduced) {
      el.textContent = formatNum(target) + decimal;
      return;
    }
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(Math.round(target * eased)) + (p === 1 ? decimal : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function formatNum(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  var counterEls = document.querySelectorAll('[data-counter]');
  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counterEls.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counterEls.forEach(animateCounter);
  }

  /* ---------- Динамический бейдж «ближайшее окно» ---------- */
  function computeSlot() {
    var now = new Date();
    var h = now.getHours();
    var slotH = Math.ceil(h + 2); // мастер освобождается минимум через 2 часа
    if (slotH % 2 !== 0) slotH += 1; // окна с шагом 2 часа
    if (slotH < 10) slotH = 10;
    if (slotH >= 21) return 'завтра ' + pad(10) + ':00';
    return 'сегодня ' + pad(slotH) + ':00';
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var slotText = computeSlot();
  ['slotTime', 'slotTimeFooter'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = slotText;
  });

  /* ---------- Драг-слайдеры до/после ---------- */
  document.querySelectorAll('[data-ba]').forEach(function (ba) {
    var handle = ba.querySelector('.ba__handle');
    var pos = 50;

    function setPos(p) {
      pos = Math.max(2, Math.min(98, p));
      ba.style.setProperty('--pos', pos + '%');
      handle.setAttribute('aria-valuenow', String(Math.round(pos)));
    }
    setPos(50);

    function posFromEvent(clientX) {
      var rect = ba.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    var dragging = false;
    ba.addEventListener('pointerdown', function (e) {
      dragging = true;
      ba.setPointerCapture(e.pointerId);
      setPos(posFromEvent(e.clientX));
      e.preventDefault();
    });
    ba.addEventListener('pointermove', function (e) {
      if (dragging) setPos(posFromEvent(e.clientX));
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (type) {
      ba.addEventListener(type, function () { dragging = false; });
    });

    handle.addEventListener('keydown', function (e) {
      var delta = 0;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -4;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = 4;
      if (e.key === 'Home') { setPos(2); e.preventDefault(); return; }
      if (e.key === 'End') { setPos(98); e.preventDefault(); return; }
      if (delta) { setPos(pos + delta); e.preventDefault(); }
    });
  });

  /* ---------- Калькулятор ---------- */
  var PRICES = {
    sofa2:  { base: 2500, name: 'Диван 2-местный',      mattress: false, sofa: true },
    corner: { base: 3500, name: 'Диван угловой',        mattress: false, sofa: true },
    mat1:   { base: 2000, name: 'Матрас односпальный',  mattress: true,  sofa: false },
    mat2:   { base: 2500, name: 'Матрас двуспальный',   mattress: true,  sofa: false },
    chair:  { base: 1200, name: 'Кресло',               mattress: false, sofa: false },
    stool:  { base: 300,  name: 'Стул / пуф',           mattress: false, sofa: false }
  };
  var DIRT = {
    light:  { k: 1,   name: 'лёгкое загрязнение' },
    medium: { k: 1.2, name: 'среднее загрязнение' },
    heavy:  { k: 1.4, name: 'сильное загрязнение' }
  };
  var EXTRA_ANTIBAC = 500;
  var EXTRA_BOTHSIDES = 700;

  var calcBox = document.getElementById('calc');
  var priceEl = document.getElementById('calcPrice');
  var noteEl = document.getElementById('calcNote');
  var promoEl = document.getElementById('calcPromo');
  var bothSidesWrap = document.getElementById('bothSidesWrap');
  var bothSidesInput = bothSidesWrap.querySelector('input');
  var orderItemSelect = document.getElementById('orderItem');

  function roundPrice(n) {
    return Math.round(n / 100) * 100;
  }

  function updateCalc() {
    var type = calcBox.querySelector('input[name="type"]:checked').value;
    var dirt = calcBox.querySelector('input[name="dirt"]:checked').value;
    var info = PRICES[type];

    // Две стороны матраса — только для матрасов
    if (info.mattress) {
      bothSidesInput.disabled = false;
      bothSidesWrap.style.opacity = '';
    } else {
      bothSidesInput.disabled = true;
      bothSidesInput.checked = false;
      bothSidesWrap.style.opacity = '.45';
    }

    var antibac = calcBox.querySelector('input[name="antibac"]').checked;
    var bothsides = info.mattress && bothSidesInput.checked;

    var total = info.base * DIRT[dirt].k;
    if (antibac) total += EXTRA_ANTIBAC;
    if (bothsides) total += EXTRA_BOTHSIDES;
    total = roundPrice(total);

    priceEl.textContent = formatNum(total);
    priceEl.classList.remove('bump');
    void priceEl.offsetWidth; // перезапуск анимации
    priceEl.classList.add('bump');

    var note = info.name + ' · ' + DIRT[dirt].name;
    var extras = [];
    if (antibac) extras.push('антибактериальная');
    if (bothsides) extras.push('две стороны');
    if (extras.length) note += ' · ' + extras.join(' + ');
    noteEl.textContent = note;

    promoEl.hidden = !info.sofa;
    if (orderItemSelect) orderItemSelect.value = info.name;
  }
  calcBox.addEventListener('change', updateCalc);
  calcBox.addEventListener('input', updateCalc);
  updateCalc();

  /* ---------- Карусель отзывов ---------- */
  var track = document.getElementById('carouselTrack');
  var prevBtn = document.getElementById('carouselPrev');
  var nextBtn = document.getElementById('carouselNext');
  var dotsBox = document.getElementById('carouselDots');
  var slides = Array.prototype.slice.call(track.children);
  var current = 0;

  slides.forEach(function (_, i) {
    var dot = document.createElement('button');
    dot.className = 'carousel__dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
    dot.addEventListener('click', function () { goTo(i); });
    dotsBox.appendChild(dot);
  });
  var dots = Array.prototype.slice.call(dotsBox.children);

  function visibleCount() {
    return window.innerWidth <= 760 ? 1 : 2;
  }
  function maxIndex() {
    return Math.max(0, slides.length - visibleCount());
  }
  function goTo(i) {
    current = Math.max(0, Math.min(maxIndex(), i));
    var slide = slides[current];
    track.scrollTo({ left: slide.offsetLeft - track.offsetLeft - 6, behavior: prefersReduced ? 'auto' : 'smooth' });
    updateDots();
  }
  function updateDots() {
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === current); });
  }
  prevBtn.addEventListener('click', function () { goTo(current - 1); });
  nextBtn.addEventListener('click', function () { goTo(current + 1 > maxIndex() ? 0 : current + 1); });

  var scrollTimer;
  track.addEventListener('scroll', function () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      var left = track.scrollLeft;
      var best = 0;
      var bestDist = Infinity;
      slides.forEach(function (s, i) {
        var dist = Math.abs(s.offsetLeft - track.offsetLeft - 6 - left);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      current = best;
      updateDots();
    }, 80);
  }, { passive: true });
  window.addEventListener('resize', function () { goTo(current); });
  updateDots();

  /* ---------- Форма заявки ---------- */
  var form = document.getElementById('orderForm');
  var success = document.getElementById('formSuccess');
  var formError = document.getElementById('formError');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.elements.name;
    var phone = form.elements.phone;
    var ok = true;

    [name, phone].forEach(function (input) {
      var valid = input.value.trim().length > 1;
      input.classList.toggle('is-invalid', !valid);
      if (!valid) ok = false;
    });
    formError.hidden = ok;
    if (!ok) return;

    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'center' });
  });
  form.addEventListener('input', function (e) {
    if (e.target.classList.contains('field__input')) {
      e.target.classList.remove('is-invalid');
      formError.hidden = true;
    }
  });
})();
