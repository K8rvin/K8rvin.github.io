/* ============================================================
   Здоровый дом — интерактив лендинга (ванильный JS)
   ============================================================ */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Шапка: тень при скролле ---------- */
  var header = $('#header');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Бургер-меню ---------- */
  var burger = $('#burger');
  var nav = $('#nav');
  function closeNav() {
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
  $$('.nav__link, .nav__cta', nav).forEach(function (link) {
    link.addEventListener('click', closeNav);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* ---------- Динамический индикатор свободных окон ---------- */
  function plural(n, one, few, many) {
    var m = Math.abs(n) % 100, d = m % 10;
    if (m > 10 && m < 20) return many;
    if (d > 1 && d < 5) return few;
    if (d === 1) return one;
    return many;
  }
  var now = new Date();
  var dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 864e5);
  var freeSlots = (dayOfYear % 3) + 1; // 1–3 окна, стабильно в течение дня
  var slotsText = freeSlots + ' ' + plural(freeSlots, 'окно', 'окна', 'окон');
  ['#slotsCount', '#slotsCount2'].forEach(function (sel) {
    var el = $(sel);
    if (el) el.textContent = slotsText;
  });

  /* ---------- Частички пыли в hero ---------- */
  var dustLayer = $('#dustLayer');
  if (dustLayer) {
    for (var i = 0; i < 16; i++) {
      var p = document.createElement('span');
      var size = 4 + Math.random() * 9;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = (5 + Math.random() * 90) + '%';
      p.style.top = (15 + Math.random() * 70) + '%';
      p.style.setProperty('--dx', (30 + Math.random() * 90) + 'px');
      p.style.setProperty('--dy', -(50 + Math.random() * 110) + 'px');
      p.style.animationDuration = (5 + Math.random() * 6) + 's';
      p.style.animationDelay = (Math.random() * 6) + 's';
      dustLayer.appendChild(p);
    }
  }

  /* ---------- Полоса «воздух становится чище» ---------- */
  var airFlow = $('#airFlow');
  if (airFlow) {
    for (var j = 0; j < 12; j++) {
      var f = document.createElement('i');
      var fs = 6 + Math.random() * 12;
      f.style.width = fs + 'px';
      f.style.height = fs + 'px';
      f.style.left = (Math.random() * 18) + '%';
      f.style.top = (12 + Math.random() * 76) + '%';
      f.style.setProperty('--dx', (300 + Math.random() * 500) + 'px');
      f.style.setProperty('--dy', (-25 + Math.random() * 50) + 'px');
      f.style.animationDuration = (4 + Math.random() * 5) + 's';
      f.style.animationDelay = (Math.random() * 5) + 's';
      airFlow.appendChild(f);
    }
  }

  /* ---------- Калькулятор ---------- */
  var CATALOG = {
    mattress: {
      label: 'Матрас',
      options: [
        { label: 'Односпальный', price: 2500 },
        { label: 'Полуторный', price: 2900 },
        { label: 'Двуспальный', price: 3400 },
        { label: 'Детский', price: 1900 }
      ],
      defaultOpt: 2
    },
    sofa: {
      label: 'Диван',
      options: [
        { label: '2-местный', price: 2900 },
        { label: '3-местный', price: 3400 },
        { label: 'Угловой', price: 4200 }
      ],
      defaultOpt: 1
    },
    armchair: {
      label: 'Кресло',
      options: [
        { label: 'Стандартное', price: 1500 },
        { label: 'Кресло-кровать', price: 2200 }
      ],
      defaultOpt: 0
    },
    crib: {
      label: 'Детская кроватка',
      options: [
        { label: 'Только матрас', price: 1500 },
        { label: 'Матрас + бортики', price: 2100 }
      ],
      defaultOpt: 1
    },
    pillow: {
      label: 'Подушки',
      options: [
        { label: 'Стандартная', price: 400 },
        { label: 'Анатомическая', price: 600 }
      ],
      defaultOpt: 0
    }
  };
  var DISCOUNT_FROM = 2; // скидка 10% от 2 предметов

  var calcState = { cat: 'mattress', opt: 2, qty: 1 };
  var calcCats = $('#calcCats');
  var calcOpts = $('#calcOpts');
  var calcDesc = $('#calcDesc');
  var calcTotal = $('#calcTotal');
  var calcOld = $('#calcOld');
  var calcDisc = $('#calcDisc');
  var qtyVal = $('#qtyVal');

  function formatPrice(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
  }

  function renderOptions() {
    var cat = CATALOG[calcState.cat];
    calcOpts.innerHTML = '';
    cat.options.forEach(function (opt, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'calc-opt' + (idx === calcState.opt ? ' is-active' : '');
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(idx === calcState.opt));
      btn.textContent = opt.label;
      btn.addEventListener('click', function () {
        calcState.opt = idx;
        renderOptions();
        updateCalc();
      });
      calcOpts.appendChild(btn);
    });
  }

  var priceAnimTimer = null;
  function updateCalc() {
    var cat = CATALOG[calcState.cat];
    var opt = cat.options[calcState.opt];
    var base = opt.price * calcState.qty;
    var hasDiscount = calcState.qty >= DISCOUNT_FROM;
    var total = hasDiscount ? Math.round(base * 0.9 / 10) * 10 : base;

    calcDesc.textContent = cat.label + ' · ' + opt.label.toLowerCase() + ' × ' + calcState.qty;
    qtyVal.textContent = calcState.qty;

    calcOld.hidden = !hasDiscount;
    if (hasDiscount) calcOld.textContent = formatPrice(base);
    calcDisc.hidden = !hasDiscount;

    // мягкий переход цены
    calcTotal.classList.add('is-anim');
    clearTimeout(priceAnimTimer);
    priceAnimTimer = setTimeout(function () {
      calcTotal.textContent = formatPrice(total);
      calcTotal.classList.remove('is-anim');
    }, 220);
  }

  if (calcCats) {
    $$('.calc-cat', calcCats).forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('.calc-cat', calcCats).forEach(function (b) {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        calcState.cat = btn.getAttribute('data-cat');
        calcState.opt = CATALOG[calcState.cat].defaultOpt;
        renderOptions();
        updateCalc();
      });
    });

    $('#qtyMinus').addEventListener('click', function () {
      if (calcState.qty > 1) { calcState.qty--; updateCalc(); }
    });
    $('#qtyPlus').addEventListener('click', function () {
      if (calcState.qty < 8) { calcState.qty++; updateCalc(); }
    });

    renderOptions();
    // первая отрисовка без анимации исчезновения
    var cat = CATALOG[calcState.cat];
    var opt = cat.options[calcState.opt];
    calcDesc.textContent = cat.label + ' · ' + opt.label.toLowerCase() + ' × 1';
    calcTotal.textContent = formatPrice(opt.price);
  }

  /* ---------- Драг-слайдер До/После ---------- */
  var baWrap = $('#baWrap');
  if (baWrap) {
    var baStage = $('.ba__stage', baWrap);
    var baAfter = $('#baAfter');
    var baHandle = $('#baHandle');
    var baPos = 50; // проценты

    function setBa(pct) {
      baPos = Math.max(0, Math.min(100, pct));
      baAfter.style.clipPath = 'inset(0 ' + (100 - baPos) + '% 0 0)';
      baHandle.style.left = baPos + '%';
      baHandle.setAttribute('aria-valuenow', String(Math.round(baPos)));
    }

    function pctFromEvent(clientX) {
      var rect = baStage.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    var dragging = false;
    baStage.addEventListener('pointerdown', function (e) {
      dragging = true;
      baStage.setPointerCapture(e.pointerId);
      setBa(pctFromEvent(e.clientX));
    });
    baStage.addEventListener('pointermove', function (e) {
      if (dragging) setBa(pctFromEvent(e.clientX));
    });
    ['pointerup', 'pointercancel'].forEach(function (evt) {
      baStage.addEventListener(evt, function () { dragging = false; });
    });

    baHandle.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 10 : 3;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault(); setBa(baPos - step);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault(); setBa(baPos + step);
      } else if (e.key === 'Home') {
        e.preventDefault(); setBa(0);
      } else if (e.key === 'End') {
        e.preventDefault(); setBa(100);
      }
    });

    setBa(50);
  }

  /* ---------- Карусель отзывов ---------- */
  var revTrack = $('#revTrack');
  if (revTrack) {
    var slides = $$('.review', revTrack);
    var dotsWrap = $('#revDots');
    var revIndex = 0;

    slides.forEach(function (_, idx) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel__dot' + (idx === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Отзыв ' + (idx + 1));
      dot.addEventListener('click', function () { goTo(idx); });
      dotsWrap.appendChild(dot);
    });
    var dots = $$('.carousel__dot', dotsWrap);

    function goTo(idx) {
      revIndex = (idx + slides.length) % slides.length;
      revTrack.style.transform = 'translateX(-' + revIndex * 100 + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === revIndex); });
    }
    $('#revPrev').addEventListener('click', function () { goTo(revIndex - 1); });
    $('#revNext').addEventListener('click', function () { goTo(revIndex + 1); });

    // свайп на тач-устройствах
    var swipeStartX = null;
    var viewport = $('#revViewport');
    viewport.addEventListener('pointerdown', function (e) { swipeStartX = e.clientX; });
    viewport.addEventListener('pointerup', function (e) {
      if (swipeStartX === null) return;
      var dx = e.clientX - swipeStartX;
      if (Math.abs(dx) > 40) goTo(revIndex + (dx < 0 ? 1 : -1));
      swipeStartX = null;
    });
    // клавиатура
    viewport.setAttribute('tabindex', '0');
    viewport.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(revIndex - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(revIndex + 1); }
    });
  }

  /* ---------- Счётчик «семей дышит легче» ---------- */
  var counter = $('#familiesCounter');
  if (counter && 'IntersectionObserver' in window) {
    var TARGET = 1247;
    var counted = false;
    var counterObs = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting || counted) return;
      counted = true;
      counterObs.disconnect();
      var start = null;
      var DURATION = 1800;
      function tick(ts) {
        if (!start) start = ts;
        var t = Math.min(1, (ts - start) / DURATION);
        var eased = 1 - Math.pow(1 - t, 3);
        var val = Math.round(TARGET * eased);
        counter.textContent = String(val).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    counterObs.observe(counter);
  } else if (counter) {
    counter.textContent = '1 247';
  }

  /* ---------- Анимации появления при скролле ---------- */
  var revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Форма заявки (демо) ---------- */
  var leadForm = $('#leadForm');
  var leadSuccess = $('#leadSuccess');
  var leadError = $('#leadError');
  var leadAgain = $('#leadAgain');

  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#leadName');
      var phone = $('#leadPhone');
      var agree = $('#leadAgree');
      var ok = true;

      [name, phone].forEach(function (input) {
        var valid = input.value.trim().length >= (input === phone ? 6 : 2);
        input.classList.toggle('is-invalid', !valid);
        if (!valid) ok = false;
      });
      if (!agree.checked) ok = false;

      leadError.hidden = ok;
      if (!ok) return;

      leadForm.hidden = true;
      leadSuccess.hidden = false;
      leadSuccess.setAttribute('tabindex', '-1');
      leadSuccess.focus({ preventScroll: false });
    });

    ['leadName', 'leadPhone'].forEach(function (id) {
      $('#' + id).addEventListener('input', function () {
        this.classList.remove('is-invalid');
        leadError.hidden = true;
      });
    });

    leadAgain.addEventListener('click', function () {
      leadForm.reset();
      leadSuccess.hidden = true;
      leadForm.hidden = false;
      $('#leadName').focus();
    });
  }
})();
