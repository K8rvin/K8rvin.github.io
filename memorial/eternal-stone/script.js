/* ============================================================
   «Вечный камень» — интерактив лендинга
   Ванильный JS: конструктор, слайдеры, spotlight, параллакс
   ============================================================ */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Форматирование цены ---------- */
  function formatPrice(value) {
    return value.toLocaleString('ru-RU') + ' ₽';
  }

  /* ============================================================
     1. КОНСТРУКТОР ПАМЯТНИКА — живой пересчёт
     ============================================================ */
  var CATALOG = {
    shape: {
      rect:   { label: 'Прямоугольная стела',          price: 14500 },
      arch:   { label: 'Стела с аркой',                price: 28000 },
      figure: { label: 'Фигурная стела',               price: 24000 },
      double: { label: 'Двойная семейная стела',       price: 42000 },
      sculpt: { label: 'Эксклюзивная скульптурная',    price: 85000 }
    },
    stone: {
      karelia: { label: 'Карелия, габбро-диабаз',      price: 0 },
      ural:    { label: 'Урал, красный гранит',        price: 6000 },
      import:  { label: 'Импорт, Absolute Black',      price: 12000 },
      marble:  { label: 'Мрамор',                      price: 4000 }
    },
    engr: {
      text:     { label: 'Надпись: имя, даты',         price: 2500 },
      portrait: { label: 'Портрет, ручная гравировка', price: 15000 },
      icon:     { label: 'Икона или символ',           price: 6000 }
    },
    decor: {
      flowerbed: { label: 'Гранитный цветник',         price: 8000 },
      tile:      { label: 'Облицовка плиткой',         price: 18000 },
      fence:     { label: 'Ограда',                    price: 22000 },
      bench:     { label: 'Лавочка и столик',          price: 12000 }
    }
  };

  var priceEl = document.getElementById('constructor-price');
  var listEl = document.getElementById('result-list');
  var constructorSection = document.getElementById('constructor');

  function readConstructorState() {
    var state = { items: [], total: 0 };
    if (!constructorSection) return state;

    ['shape', 'stone'].forEach(function (group) {
      var checked = constructorSection.querySelector('input[name="' + group + '"]:checked');
      if (checked && CATALOG[group][checked.value]) {
        state.items.push(CATALOG[group][checked.value]);
      }
    });
    ['engr', 'decor'].forEach(function (group) {
      var boxes = constructorSection.querySelectorAll('input[name="' + group + '"]:checked');
      boxes.forEach(function (box) {
        if (CATALOG[group][box.value]) state.items.push(CATALOG[group][box.value]);
      });
    });
    state.total = state.items.reduce(function (sum, item) { return sum + item.price; }, 0);
    return state;
  }

  function renderConstructor() {
    if (!priceEl || !listEl) return;
    var state = readConstructorState();
    listEl.innerHTML = state.items.map(function (item) {
      return '<li><span>' + item.label + '</span><span>' +
        (item.price === 0 ? 'включено' : '+ ' + formatPrice(item.price)) + '</span></li>';
    }).join('');
    priceEl.textContent = formatPrice(state.total);
  }

  if (constructorSection) {
    constructorSection.addEventListener('change', renderConstructor);
    renderConstructor();
  }

  /* ============================================================
     2. МУЗЕЙНАЯ ПОДСВЕТКА карточек работ (spotlight)
     ============================================================ */
  var worksGrid = document.getElementById('works-grid');
  if (worksGrid && !prefersReducedMotion) {
    worksGrid.addEventListener('pointermove', function (e) {
      var card = e.target.closest('.work-card');
      if (!card) return;
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
      card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
    });
  }

  /* ============================================================
     3. ПАРАЛЛАКС на hero-сцене (медленный, мягкий)
     ============================================================ */
  var hero = document.getElementById('hero');
  var layers = hero ? Array.prototype.slice.call(hero.querySelectorAll('.hero-layer')) : [];
  var parallaxX = 0, parallaxY = 0, targetX = 0, targetY = 0, parallaxTicking = false;

  function applyParallax() {
    parallaxX += (targetX - parallaxX) * 0.06; // инерция — без резких движений
    parallaxY += (targetY - parallaxY) * 0.06;
    layers.forEach(function (layer) {
      var speed = parseFloat(layer.getAttribute('data-speed') || '0');
      layer.style.transform = 'translate3d(' +
        (parallaxX * speed * 100).toFixed(2) + 'px,' +
        (parallaxY * speed * 100).toFixed(2) + 'px, 0)';
    });
    if (Math.abs(targetX - parallaxX) > 0.001 || Math.abs(targetY - parallaxY) > 0.001) {
      requestAnimationFrame(applyParallax);
    } else {
      parallaxTicking = false;
    }
  }

  function queueParallax() {
    if (!parallaxTicking) {
      parallaxTicking = true;
      requestAnimationFrame(applyParallax);
    }
  }

  if (hero && layers.length && !prefersReducedMotion) {
    hero.addEventListener('pointermove', function (e) {
      var rect = hero.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * -1;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * -0.6;
      queueParallax();
    });
    window.addEventListener('scroll', function () {
      var rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      targetY = (window.scrollY / Math.max(rect.height, 1)) * 0.8;
      queueParallax();
    }, { passive: true });
  }

  /* ============================================================
     4. СЛАЙДЕР МАТЕРИАЛОВ и КАРУСЕЛЬ ОТЗЫВОВ
     ============================================================ */
  function createCarousel(itemsEl, prevBtn, nextBtn, dotsBox, itemSelector) {
    if (!itemsEl || !prevBtn || !nextBtn || !dotsBox) return;
    var items = Array.prototype.slice.call(itemsEl.querySelectorAll(itemSelector));
    if (!items.length) return;
    var index = 0;

    var dots = items.map(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Слайд ' + (i + 1));
      dot.addEventListener('click', function () { show(i); });
      dotsBox.appendChild(dot);
      return dot;
    });

    function show(i) {
      index = (i + items.length) % items.length;
      items.forEach(function (item, k) { item.classList.toggle('is-active', k === index); });
      dots.forEach(function (dot, k) { dot.classList.toggle('is-active', k === index); });
    }

    prevBtn.addEventListener('click', function () { show(index - 1); });
    nextBtn.addEventListener('click', function () { show(index + 1); });
    show(0);
  }

  createCarousel(
    document.getElementById('materials-slides'),
    document.getElementById('mat-prev'),
    document.getElementById('mat-next'),
    document.getElementById('mat-dots'),
    '.slide'
  );

  createCarousel(
    document.getElementById('reviews-track'),
    document.getElementById('rev-prev'),
    document.getElementById('rev-next'),
    document.getElementById('rev-dots'),
    '.review'
  );

  /* ============================================================
     5. ФОРМА ЗАЯВКИ — демо-отправка
     ============================================================ */
  var form = document.getElementById('order-form');
  var success = document.getElementById('form-success');
  if (form && success) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#f-name');
      var phone = form.querySelector('#f-phone');
      var valid = true;
      [name, phone].forEach(function (field) {
        if (!field) return;
        var empty = !field.value.trim();
        field.style.borderColor = empty ? '#b05a5a' : '';
        if (empty) valid = false;
      });
      if (!valid) return;
      success.hidden = false;
      form.reset();
      setTimeout(function () { success.hidden = true; }, 9000);
    });
  }

  /* ============================================================
     6. ПЛАВАЮЩАЯ КНОПКА-СТЕЛА
     ============================================================ */
  var floatCta = document.getElementById('float-cta');
  if (floatCta) {
    window.addEventListener('scroll', function () {
      floatCta.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    }, { passive: true });
  }

  /* ============================================================
     7. МОБИЛЬНОЕ МЕНЮ
     ============================================================ */
  var navToggle = document.getElementById('nav-toggle');
  var mainNav = document.getElementById('main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var open = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mainNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ============================================================
     8. ПОЯВЛЕНИЕ БЛОКОВ ПРИ ПРОКРУТКЕ (мягкое)
     ============================================================ */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-revealed'); });
  }

})();
