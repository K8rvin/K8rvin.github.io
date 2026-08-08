/* ============================================================
   Ателье «Флёр» — ванильный JS
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- шапка: фон при скролле ---------- */
  var header = document.getElementById('header');
  function onScrollHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- бургер-меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ---------- появление при скролле ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- параллакс лепестков в hero ---------- */
  var petals = Array.prototype.slice.call(document.querySelectorAll('.petal'));
  if (petals.length && !reduceMotion) {
    var hero = document.getElementById('hero');
    var heroBox = { top: 0, height: 0 };
    var ticking = false;
    var measure = function () {
      var r = hero.getBoundingClientRect();
      heroBox = { top: r.top + window.scrollY, height: r.height };
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < heroBox.top + heroBox.height) {
          petals.forEach(function (p) {
            var speed = parseFloat(p.dataset.speed || '0.1');
            p.style.marginTop = (y * speed) + 'px';
          });
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- калькулятор свадебного бюджета ---------- */
  var fmt = function (n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  var calc = {
    tables: document.getElementById('calcTables'),
    tablesOut: document.getElementById('calcTablesOut'),
    girls: document.getElementById('calcBridesmaids'),
    girlsOut: document.getElementById('calcBridesmaidsOut'),
    arch: document.getElementById('calcArch'),
    photo: document.getElementById('calcPhoto'),
    presidium: document.getElementById('calcPresidium'),
    styles: document.getElementById('calcStyles'),
    sumFrom: document.getElementById('calcSumFrom'),
    sumTo: document.getElementById('calcSumTo'),
    styleNote: document.getElementById('calcStyleNote'),
    breakdown: document.getElementById('calcBreakdown')
  };

  if (calc.tables) {
    var PRICE = { brideBouquet: 12000, table: 6500, bridesmaid: 3500, arch: 45000, photo: 30000, presidium: 25000 };
    var mult = 1.2;
    var styleName = 'садовая классика';

    var paintRange = function (input) {
      var min = +input.min, max = +input.max, val = +input.value;
      input.style.setProperty('--fill', ((val - min) / (max - min) * 100) + '%');
    };

    var recalc = function () {
      var tables = +calc.tables.value;
      var girls = +calc.girls.value;
      calc.tablesOut.textContent = tables;
      calc.girlsOut.textContent = girls;
      paintRange(calc.tables);
      paintRange(calc.girls);

      var rows = [];
      var base = PRICE.brideBouquet;
      rows.push(['Букет невесты', PRICE.brideBouquet]);
      if (tables > 0) {
        base += tables * PRICE.table;
        rows.push(['Композиции на ' + tables + ' столов', tables * PRICE.table]);
      }
      if (girls > 0) {
        base += girls * PRICE.bridesmaid;
        rows.push(['Букеты подружек × ' + girls, girls * PRICE.bridesmaid]);
      }
      if (calc.arch.checked) { base += PRICE.arch; rows.push(['Церемониальная арка', PRICE.arch]); }
      if (calc.photo.checked) { base += PRICE.photo; rows.push(['Фотозона', PRICE.photo]); }
      if (calc.presidium.checked) { base += PRICE.presidium; rows.push(['Президиум', PRICE.presidium]); }

      var from = base * mult;
      var to = from * 1.15;
      calc.sumFrom.textContent = fmt(from);
      calc.sumTo.textContent = fmt(to);
      calc.styleNote.textContent = 'стиль: ' + styleName;
      calc.breakdown.innerHTML = rows.map(function (r) {
        return '<li><span>' + r[0] + '</span><span>' + fmt(r[1] * mult) + ' ₽</span></li>';
      }).join('');
    };

    [calc.tables, calc.girls].forEach(function (el) { el.addEventListener('input', recalc); });
    [calc.arch, calc.photo, calc.presidium].forEach(function (el) { el.addEventListener('change', recalc); });

    calc.styles.querySelectorAll('.chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        calc.styles.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        mult = parseFloat(chip.dataset.mult);
        styleName = chip.textContent.trim().toLowerCase();
        recalc();
      });
    });

    recalc();
  }

  /* ---------- портфолио: горизонтальный слайдер ---------- */
  var track = document.getElementById('portfolioTrack');
  var prev = document.getElementById('portfolioPrev');
  var next = document.getElementById('portfolioNext');
  if (track && prev && next) {
    var step = function () {
      var slide = track.querySelector('.slide');
      return slide ? slide.getBoundingClientRect().width + 24 : 320;
    };
    prev.addEventListener('click', function () {
      track.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    next.addEventListener('click', function () {
      track.scrollBy({ left: step(), behavior: 'smooth' });
    });
  }

  /* ---------- отзывы: карусель ---------- */
  var revTrack = document.getElementById('reviewsTrack');
  var revPrev = document.getElementById('reviewPrev');
  var revNext = document.getElementById('reviewNext');
  var dotsBox = document.getElementById('reviewDots');
  if (revTrack && revPrev && revNext && dotsBox) {
    var slides = revTrack.children.length;
    var idx = 0;
    var timer = null;

    for (var i = 0; i < slides; i++) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
      (function (n) {
        dot.addEventListener('click', function () { go(n, true); });
      })(i);
      dotsBox.appendChild(dot);
    }
    var dots = dotsBox.querySelectorAll('button');

    var paint = function () {
      revTrack.style.transform = 'translateX(-' + idx * 100 + '%)';
      dots.forEach(function (d, n) { d.classList.toggle('is-active', n === idx); });
    };
    var go = function (n, manual) {
      idx = (n + slides) % slides;
      paint();
      if (manual) restart();
    };
    var restart = function () {
      if (timer) clearInterval(timer);
      if (!reduceMotion) timer = setInterval(function () { go(idx + 1); }, 6500);
    };

    revPrev.addEventListener('click', function () { go(idx - 1, true); });
    revNext.addEventListener('click', function () { go(idx + 1, true); });
    var viewport = revTrack.parentElement;
    viewport.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
    viewport.addEventListener('mouseleave', restart);
    paint();
    restart();
  }

  /* ---------- кнопки «Заказать» / «Выбрать флориста» → прокрутка к форме ---------- */
  var scrollToForm = function (preset) {
    var dream = document.getElementById('formDream');
    if (preset && dream && !dream.value) {
      dream.value = preset;
    }
    document.getElementById('form').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  document.querySelectorAll('.card__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      scrollToForm('Хочу заказать букет «' + btn.dataset.bouquet + '».');
    });
  });
  document.querySelectorAll('.florist__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.florist__btn').forEach(function (b) {
        b.classList.remove('is-chosen');
        b.textContent = 'Выбрать флориста';
      });
      btn.classList.add('is-chosen');
      btn.textContent = 'Флорист выбран ✓';
      scrollToForm('Хочу работать с флористом ' + btn.dataset.florist + '.');
    });
  });

  /* ---------- форма: валидация и успех (демо, без отправки) ---------- */
  var form = document.getElementById('leadForm');
  if (form) {
    var nameInput = document.getElementById('formName');
    var phoneInput = document.getElementById('formPhone');
    var errorBox = document.getElementById('formError');
    var successBox = document.getElementById('formSuccess');

    [nameInput, phoneInput].forEach(function (input) {
      input.addEventListener('input', function () {
        input.classList.remove('is-invalid');
        errorBox.textContent = '';
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      if (nameInput.value.trim().length < 2) {
        nameInput.classList.add('is-invalid');
        valid = false;
      }
      var digits = phoneInput.value.replace(/\D/g, '');
      if (digits.length < 10) {
        phoneInput.classList.add('is-invalid');
        valid = false;
      }

      if (!valid) {
        errorBox.textContent = 'Проверьте имя и телефон — нам нужно знать, как к вам обращаться и куда перезвонить.';
        return;
      }

      successBox.hidden = false;
      form.reset();
      setTimeout(function () { successBox.hidden = true; }, 9000);
    });
  }

  /* ---------- плавающая кнопка-веточка ---------- */
  var floatBtn = document.getElementById('floatBtn');
  if (floatBtn) {
    var heroEl = document.getElementById('hero');
    var formSection = document.getElementById('form');
    var toggleFloat = function () {
      var past = window.scrollY > heroEl.offsetHeight * 0.6;
      var formRect = formSection.getBoundingClientRect();
      var formVisible = formRect.top < window.innerHeight && formRect.bottom > 0;
      floatBtn.classList.toggle('is-visible', past && !formVisible);
    };
    window.addEventListener('scroll', toggleFloat, { passive: true });
    toggleFloat();
  }
})();
