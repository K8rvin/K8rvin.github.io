/* ============================================================
   ШинныйОтель — ванильный JS
   Калькулятор, карусель отзывов, календарь ячеек, форма,
   параллакс склада, катящаяся шина, reveal-анимации, меню.
   ============================================================ */

(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Хедер: тень при скролле ---------- */
  var header = document.getElementById('siteHeader');

  function onScrollHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('mainNav');

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- Reveal-анимации при скролле ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !prefersReduced) {
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

  /* ---------- Калькулятор стоимости ---------- */
  var PRICE_PER_MONTH = { 15: 900, 16: 1000, 17: 1100, 18: 1250, 19: 1400, 20: 1600 };
  var TYPE_FACTOR = { assembled: 1.0, tires: 0.85 };
  var DURATION_FACTOR = { 3: 1.1, 6: 1.0, 9: 0.92 };

  var calcPriceEl = document.getElementById('calcPrice');
  var calcPerMonthEl = document.getElementById('calcPerMonth');
  var calcInputs = document.querySelectorAll(
    '#radiusGroup input, #typeGroup input, #durationGroup input'
  );

  var displayedPrice = 0;
  var targetPrice = 0;
  var priceAnimFrame = null;

  function formatNumber(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function readCalcState() {
    var radius = document.querySelector('#radiusGroup input:checked').value;
    var type = document.querySelector('#typeGroup input:checked').value;
    var duration = document.querySelector('#durationGroup input:checked').value;
    return { radius: radius, type: type, duration: Number(duration) };
  }

  function computePrice(state) {
    var base = PRICE_PER_MONTH[state.radius];
    var total = base * TYPE_FACTOR[state.type] * DURATION_FACTOR[state.duration] * state.duration;
    return Math.round(total / 50) * 50;
  }

  function animatePrice() {
    if (priceAnimFrame) cancelAnimationFrame(priceAnimFrame);
    if (prefersReduced) {
      displayedPrice = targetPrice;
      calcPriceEl.textContent = formatNumber(targetPrice);
      return;
    }
    var step = function () {
      var diff = targetPrice - displayedPrice;
      if (Math.abs(diff) < 1) {
        displayedPrice = targetPrice;
        calcPriceEl.textContent = formatNumber(targetPrice);
        priceAnimFrame = null;
        return;
      }
      displayedPrice += diff * 0.16;
      calcPriceEl.textContent = formatNumber(displayedPrice);
      priceAnimFrame = requestAnimationFrame(step);
    };
    priceAnimFrame = requestAnimationFrame(step);
  }

  function updateCalc() {
    var state = readCalcState();
    targetPrice = computePrice(state);
    animatePrice();
    var perMonth = Math.round(targetPrice / state.duration / 50) * 50;
    calcPerMonthEl.textContent = formatNumber(perMonth) + ' ₽ / месяц';
  }

  calcInputs.forEach(function (input) {
    input.addEventListener('change', updateCalc);
  });
  updateCalc();

  /* ---------- Параллакс стеллажей в hero ---------- */
  var warehouse = document.getElementById('warehouse');
  var heroVisual = document.getElementById('heroVisual');

  if (warehouse && heroVisual && !prefersReduced && window.matchMedia('(pointer: fine)').matches) {
    var shelves = warehouse.querySelectorAll('.shelf');

    heroVisual.addEventListener('mousemove', function (e) {
      var rect = heroVisual.getBoundingClientRect();
      var nx = (e.clientX - rect.left) / rect.width - 0.5;
      var ny = (e.clientY - rect.top) / rect.height - 0.5;

      warehouse.style.transform =
        'perspective(900px) rotateY(' + (nx * 5).toFixed(2) + 'deg) rotateX(' + (-ny * 5).toFixed(2) + 'deg)';

      shelves.forEach(function (shelf) {
        var depth = Number(shelf.dataset.depth) || 20;
        shelf.style.transform =
          'translate3d(' + (nx * depth).toFixed(1) + 'px, ' + (ny * depth).toFixed(1) + 'px, 0)';
      });
    });

    heroVisual.addEventListener('mouseleave', function () {
      warehouse.style.transform = '';
      shelves.forEach(function (shelf) { shelf.style.transform = ''; });
    });
  }

  /* ---------- Параллакс галереи (скролл) ---------- */
  var galleryItems = document.querySelectorAll('.gallery__item[data-speed]');

  function onScrollGallery() {
    if (prefersReduced || window.innerWidth < 768) return;
    var vh = window.innerHeight;
    galleryItems.forEach(function (item) {
      var rect = item.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      var speed = Number(item.dataset.speed) || 0.08;
      var offset = (rect.top + rect.height / 2 - vh / 2) * speed;
      var shot = item.querySelector('.shot svg');
      if (shot) shot.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
    });
  }
  window.addEventListener('scroll', onScrollGallery, { passive: true });

  /* ---------- Таймлайн: прогресс-линия ---------- */
  var timeline = document.getElementById('timeline');
  var timelineProgress = document.getElementById('timelineProgress');

  if (timeline && timelineProgress && 'IntersectionObserver' in window) {
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          timelineProgress.style.width = '100%';
          tio.unobserve(timeline);
        }
      });
    }, { threshold: 0.35 });
    tio.observe(timeline);
  } else if (timelineProgress) {
    timelineProgress.style.width = '100%';
  }

  /* ---------- Карусель отзывов ---------- */
  var track = document.getElementById('reviewTrack');
  var prevBtn = document.getElementById('revPrev');
  var nextBtn = document.getElementById('revNext');
  var dotsBox = document.getElementById('revDots');

  if (track && prevBtn && nextBtn && dotsBox) {
    var slides = track.children;
    var current = 0;
    var autoTimer = null;

    function buildDots() {
      for (var i = 0; i < slides.length; i++) {
        (function (idx) {
          var dot = document.createElement('button');
          dot.type = 'button';
          dot.setAttribute('aria-label', 'Отзыв ' + (idx + 1));
          dot.addEventListener('click', function () {
            goTo(idx);
            restartAuto();
          });
          dotsBox.appendChild(dot);
        })(i);
      }
    }

    function goTo(idx) {
      current = (idx + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + current * 100 + '%)';
      Array.prototype.forEach.call(dotsBox.children, function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function restartAuto() {
      if (autoTimer) clearInterval(autoTimer);
      if (!prefersReduced) {
        autoTimer = setInterval(function () { goTo(current + 1); }, 6000);
      }
    }

    prevBtn.addEventListener('click', function () { goTo(current - 1); restartAuto(); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); restartAuto(); });

    var carousel = document.getElementById('carousel');
    carousel.addEventListener('mouseenter', function () { if (autoTimer) clearInterval(autoTimer); });
    carousel.addEventListener('mouseleave', restartAuto);

    /* свайп на мобильных */
    var touchStartX = null;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        goTo(current + (dx < 0 ? 1 : -1));
        restartAuto();
      }
      touchStartX = null;
    }, { passive: true });

    buildDots();
    goTo(0);
    restartAuto();
  }

  /* ---------- Календарь свободных ячеек ---------- */
  var calGrid = document.getElementById('calGrid');
  var calMonthEl = document.getElementById('calMonth');
  var calPrev = document.getElementById('calPrev');
  var calNext = document.getElementById('calNext');
  var calSelected = document.getElementById('calSelected');
  var bookDateInput = document.getElementById('bookDate');

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var viewYear = today.getFullYear();
  var viewMonth = today.getMonth();
  var maxView = new Date(today.getFullYear(), today.getMonth() + 3, 1);
  var selectedDateStr = null;

  /* Детерминированная «загрузка склада»: по дате выдаёт статус ячейки */
  function cellStatus(year, month, day) {
    var seed = year * 372 + month * 31 + day;
    var v = (seed * 9301 + 49297) % 233280 / 233280;
    if (v < 0.18) return 'busy';
    if (v < 0.42) return 'few';
    return 'free';
  }

  var MONTHS_RU = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  function toISO(y, m, d) {
    return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  }

  function renderCalendar() {
    calGrid.innerHTML = '';
    calMonthEl.textContent = MONTHS_RU[viewMonth] + ' ' + viewYear;

    var firstDay = new Date(viewYear, viewMonth, 1);
    var leadBlanks = (firstDay.getDay() + 6) % 7; /* неделя с понедельника */
    var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (var b = 0; b < leadBlanks; b++) {
      var blank = document.createElement('span');
      blank.className = 'cal__day';
      calGrid.appendChild(blank);
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var cellDate = new Date(viewYear, viewMonth, d);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal__day';
      btn.textContent = d;
      var iso = toISO(viewYear, viewMonth, d);
      btn.dataset.date = iso;

      if (cellDate < today) {
        btn.classList.add('cal__day--past');
        btn.disabled = true;
      } else {
        var status = cellStatus(viewYear, viewMonth, d);
        btn.classList.add('cal__day--' + status);
        if (status === 'busy') {
          btn.disabled = true;
          btn.title = 'Все ячейки заняты';
        } else {
          btn.title = status === 'few' ? 'Осталось мало мест' : 'Много свободных ячеек';
        }
        if (iso === selectedDateStr) btn.classList.add('cal__day--selected');
      }
      calGrid.appendChild(btn);
    }

    calPrev.disabled = (viewYear === today.getFullYear() && viewMonth === today.getMonth());
    calNext.disabled = (new Date(viewYear, viewMonth, 1) >= maxView);
  }

  calGrid.addEventListener('click', function (e) {
    var btn = e.target.closest('.cal__day');
    if (!btn || btn.disabled || !btn.dataset.date) return;

    selectedDateStr = btn.dataset.date;
    var prev = calGrid.querySelector('.cal__day--selected');
    if (prev) prev.classList.remove('cal__day--selected');
    btn.classList.add('cal__day--selected');

    var parts = selectedDateStr.split('-');
    var pretty = parts[2] + '.' + parts[1] + '.' + parts[0];
    calSelected.textContent = 'Выбрано: ' + pretty;
    if (bookDateInput) bookDateInput.value = selectedDateStr;
  });

  calPrev.addEventListener('click', function () {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });

  calNext.addEventListener('click', function () {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  renderCalendar();

  /* ---------- Форма брони ---------- */
  var bookForm = document.getElementById('bookForm');
  var bookSuccess = document.getElementById('bookSuccess');

  /* Маска телефона: мягкое форматирование +7 ___ ___-__-__ */
  var phoneInput = document.getElementById('bookPhone');
  phoneInput.addEventListener('input', function () {
    var digits = phoneInput.value.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (digits && !digits.startsWith('7')) digits = '7' + digits;
    digits = digits.slice(0, 11);

    var out = '';
    if (digits.length > 0) out = '+7';
    if (digits.length > 1) out += ' ' + digits.slice(1, 4);
    if (digits.length > 4) out += ' ' + digits.slice(4, 7);
    if (digits.length > 7) out += '-' + digits.slice(7, 9);
    if (digits.length > 9) out += '-' + digits.slice(9, 11);
    phoneInput.value = out;
  });

  bookForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var nameInput = document.getElementById('bookName');
    var valid = true;

    [nameInput, phoneInput, bookDateInput].forEach(function (input) {
      input.classList.remove('is-error');
    });

    if (!nameInput.value.trim()) {
      nameInput.classList.add('is-error');
      valid = false;
    }
    if (phoneInput.value.replace(/\D/g, '').length < 11) {
      phoneInput.classList.add('is-error');
      valid = false;
    }
    if (!bookDateInput.value) {
      bookDateInput.classList.add('is-error');
      valid = false;
    }
    if (!valid) return;

    /* Демо: показываем успех без реальной отправки */
    bookSuccess.hidden = false;
    bookForm.reset();
    selectedDateStr = null;
    calSelected.textContent = '';
    renderCalendar();

    setTimeout(function () { bookSuccess.hidden = true; }, 6000);
  });

  /* ---------- Катящаяся шина между секциями ---------- */
  var tire = document.getElementById('rollingTire');
  var tireX = -60;
  var tireRot = 0;
  var lastScrollY = window.scrollY;

  if (tire && !prefersReduced) {
    var tireTick = false;
    window.addEventListener('scroll', function () {
      if (tireTick) return;
      tireTick = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        var progress = docH > 0 ? y / docH : 0;
        var maxX = window.innerWidth - 60;
        tireX = -60 + progress * (maxX + 60);
        tireRot += (y - lastScrollY) * 0.5;
        lastScrollY = y;
        tire.style.transform =
          'translateX(' + tireX.toFixed(1) + 'px)';
        tire.firstElementChild.style.transform =
          'rotate(' + tireRot.toFixed(1) + 'deg)';
        tireTick = false;
      });
    }, { passive: true });
  } else if (tire) {
    tire.style.display = 'none';
  }
})();
