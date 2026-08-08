/* ============================================================
   Дорожный пропуск — вся интерактивная логика лендинга
   ============================================================ */
(function () {
  'use strict';

  /* ---------- утилиты ---------- */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function formatPrice(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  /* ---------- 1. Бургер-меню ---------- */
  var burger = $('#burger');
  var nav = $('#nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    $$('.nav__link, .nav__cta', nav).forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- 2. Появление при скролле ---------- */
  var revealEls = $$('.reveal');
  var timelineFill = $('#timelineFill');
  var cabinetBar = $('#cabinetBar');
  var cabinetPct = $('#cabinetPct');
  var cabinetAnimated = false;

  function animateCabinet() {
    if (cabinetAnimated || !cabinetBar) return;
    cabinetAnimated = true;
    var target = 68;
    cabinetBar.style.width = target + '%';
    var start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / 1500, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      cabinetPct.textContent = Math.round(eased * target) + '%';
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        if (entry.target.id === 'cabinetCard') animateCabinet();
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });

    var timelineEl = $('.timeline');
    if (timelineEl && timelineFill) {
      var ioT = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            timelineFill.style.width = '100%';
            ioT.disconnect();
          }
        });
      }, { threshold: 0.35 });
      ioT.observe(timelineEl);
    }
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    if (timelineFill) timelineFill.style.width = '100%';
    animateCabinet();
  }

  /* ---------- 3. Калькулятор стоимости ---------- */
  var calcState = {
    category: 'B',
    transmission: 'akpp',
    lessons: 'standard',
    theory: 'online'
  };

  var PRICES = {
    B: { akpp: 38000, mkpp: 35000 },
    A: { base: 27000 }
  };
  var LESSON_PACKS = {
    base:     { add: 0,     label: '28 занятий (минимум по программе)', termShift: 0.5 },
    standard: { add: 8000,  label: '36 занятий (стандарт)',             termShift: 0 },
    max:      { add: 16000, label: '44 занятия (максимум)',             termShift: -0.5 }
  };
  var THEORY = {
    online: { add: 0,    termShift: 0 },
    'class': { add: 3000, termShift: 0.5 }
  };
  var BASE_TERM = { B: 4, A: 2.5 };
  var INSTALLMENT_MONTHS = 3;

  var priceEl = $('#calcPrice');
  var termEl = $('#calcTerm');
  var lessonsEl = $('#calcLessons');
  var installmentEl = $('#calcInstallment');
  var transmissionGroup = $('#transmissionGroup');
  var displayedPrice = 0;

  function formatTerm(months) {
    var m = Math.round(months * 2) / 2;
    if (m === Math.floor(m)) {
      var w = Math.floor(m);
      var tail = w % 10 === 1 && w % 100 !== 11 ? 'месяц' : (w % 10 >= 2 && w % 10 <= 4 && (w % 100 < 10 || w % 100 >= 20) ? 'месяца' : 'месяцев');
      return '≈ ' + w + ' ' + tail;
    }
    return '≈ ' + String(m).replace('.', ',') + ' месяца';
  }

  function animatePrice(from, to) {
    var start = null;
    var dur = 550;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      priceEl.textContent = formatPrice(Math.round(from + (to - from) * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function recalc() {
    var base = calcState.category === 'A'
      ? PRICES.A.base
      : PRICES.B[calcState.transmission];
    var pack = LESSON_PACKS[calcState.lessons];
    var theory = THEORY[calcState.theory];
    var total = base + pack.add + theory.add;

    var term = BASE_TERM[calcState.category];
    if (calcState.category === 'B') term += pack.termShift + theory.termShift;
    else term += theory.termShift * 0.6;

    animatePrice(displayedPrice, total);
    displayedPrice = total;
    termEl.textContent = formatTerm(term);
    lessonsEl.textContent = calcState.category === 'A' ? '16 занятий (по программе)' : pack.label;
    installmentEl.textContent = 'от ' + formatPrice(Math.ceil(total / INSTALLMENT_MONTHS / 100) * 100) + ' ₽/мес × ' + INSTALLMENT_MONTHS;

    if (transmissionGroup) {
      transmissionGroup.classList.toggle('is-disabled', calcState.category === 'A');
    }
  }

  $$('.segmented').forEach(function (seg) {
    seg.addEventListener('click', function (e) {
      var btn = e.target.closest('.segmented__btn');
      if (!btn) return;
      $$('.segmented__btn', seg).forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      calcState[seg.getAttribute('data-group')] = btn.getAttribute('data-value');
      recalc();
    });
  });
  if (priceEl) recalc();

  /* ---------- 4. Виджет расписания ---------- */
  var INSTRUCTORS = [
    { name: 'Сергей Мельников', exp: 'стаж 12 лет · спокойный стиль', car: 'Kia Rio', meta: 'АКПП · 2023 · дублирующие педали', initials: 'СМ' },
    { name: 'Ольга Тарасова', exp: 'стаж 9 лет · экзаменационные маршруты', car: 'Hyundai Solaris', meta: 'МКПП · 2022 · дублирующие педали', initials: 'ОТ' },
    { name: 'Андрей Котов', exp: 'стаж 7 лет · интенсивы и вечерние занятия', car: 'Škoda Rapid', meta: 'АКПП · 2024 · дублирующие педали', initials: 'АК' }
  ];
  var SLOT_TIMES = ['08:00', '10:00', '12:00', '15:00', '17:00', '19:00'];
  var DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  var scheduleGrid = $('#scheduleGrid');
  var scheduleEmpty = $('#scheduleEmpty');
  var scheduleDetails = $('#scheduleDetails');
  var selectedSlotBtn = null;

  // Детерминированный «случайный» генератор занятости слотов
  function slotHash(dayIdx, timeIdx) {
    var x = (dayIdx + 3) * 73856093 ^ (timeIdx + 5) * 19349663;
    x = Math.abs(x);
    return x % 100;
  }

  function buildSchedule() {
    if (!scheduleGrid) return;
    scheduleGrid.innerHTML = '';

    var today = new Date();
    var monday = new Date(today);
    var dow = (today.getDay() + 6) % 7; // 0 = понедельник
    monday.setDate(today.getDate() - dow);

    // уголок + заголовки дней
    var corner = document.createElement('div');
    corner.className = 'sched-corner';
    scheduleGrid.appendChild(corner);

    var days = [];
    for (var d = 0; d < 6; d++) {
      var date = new Date(monday);
      date.setDate(monday.getDate() + d);
      days.push(date);
      var head = document.createElement('div');
      head.className = 'sched-day' + (date.toDateString() === today.toDateString() ? ' is-today' : '');
      head.innerHTML = DAY_NAMES[d] + '<small>' + date.getDate() + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '</small>';
      scheduleGrid.appendChild(head);
    }

    SLOT_TIMES.forEach(function (time, tIdx) {
      var timeCell = document.createElement('div');
      timeCell.className = 'sched-time';
      timeCell.textContent = time;
      scheduleGrid.appendChild(timeCell);

      days.forEach(function (date, dIdx) {
        var cell = document.createElement('div');
        cell.className = 'sched-cell';
        var btn = document.createElement('button');
        btn.type = 'button';
        var isPast = date.toDateString() === today.toDateString() &&
          parseInt(time, 10) <= today.getHours();
        var free = !isPast && slotHash(dIdx, tIdx) < 55; // ~55% окон свободны
        if (free) {
          var instr = INSTRUCTORS[slotHash(tIdx, dIdx) % INSTRUCTORS.length];
          btn.className = 'sched-slot sched-slot--free';
          btn.textContent = 'свободно';
          btn.setAttribute('aria-label', 'Свободное окно: ' + DAY_NAMES[dIdx] + ' ' + time);
          btn.addEventListener('click', function () {
            selectSlot(btn, date, dIdx, time, instr);
          });
        } else {
          btn.className = 'sched-slot sched-slot--busy';
          btn.textContent = 'занято';
          btn.disabled = true;
        }
        cell.appendChild(btn);
        scheduleGrid.appendChild(cell);
      });
    });
  }

  function selectSlot(btn, date, dayIdx, time, instr) {
    if (selectedSlotBtn) selectedSlotBtn.classList.remove('is-selected');
    selectedSlotBtn = btn;
    btn.classList.add('is-selected');

    var dateStr = DAY_NAMES[dayIdx] + ', ' + date.getDate() + '.' +
      ('0' + (date.getMonth() + 1)).slice(-2) + ' · ' + time + '–' +
      ('0' + (parseInt(time, 10) + 2)).slice(-2) + ':00';

    $('#slotWhen').textContent = dateStr;
    $('#slotAvatar').textContent = instr.initials;
    $('#slotInstructor').textContent = instr.name;
    $('#slotExp').textContent = instr.exp;
    $('#slotCar').textContent = instr.car;
    $('#slotCarMeta').textContent = instr.meta;

    scheduleEmpty.hidden = true;
    scheduleDetails.hidden = false;
    scheduleDetails.style.animation = 'none';
    void scheduleDetails.offsetWidth; // перезапуск анимации
    scheduleDetails.style.animation = 'fadeInUp .35s ease';
  }

  buildSchedule();

  /* ---------- 5. Карусель отзывов ---------- */
  // звёзды
  $$('.review-card__stars').forEach(function (el) {
    var count = parseInt(el.getAttribute('data-stars'), 10) || 5;
    var html = '';
    for (var i = 0; i < 5; i++) {
      var fill = i < count ? '#F7B500' : '#E2E8F0';
      html += '<svg viewBox="0 0 20 20" fill="' + fill + '" aria-hidden="true">' +
        '<path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z"/></svg>';
    }
    el.innerHTML = html;
  });

  var track = $('#reviewsTrack');
  var prevBtn = $('#revPrev');
  var nextBtn = $('#revNext');
  var dotsWrap = $('#revDots');
  var revIndex = 0;

  function cards() { return $$('.review-card', track); }

  function cardStep() {
    var list = cards();
    if (list.length < 2) return 0;
    return list[1].offsetLeft - list[0].offsetLeft;
  }

  function maxIndex() {
    if (!track) return 0;
    var step = cardStep();
    if (!step) return 0;
    var visible = Math.max(1, Math.floor((track.clientWidth + 20) / step));
    return Math.max(0, cards().length - visible);
  }

  function renderDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    for (var i = 0; i <= maxIndex(); i++) {
      (function (idx) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'К отзыву ' + (idx + 1));
        if (idx === revIndex) b.classList.add('is-active');
        b.addEventListener('click', function () { goTo(idx); });
        dotsWrap.appendChild(b);
      })(i);
    }
  }

  function goTo(idx) {
    var max = maxIndex();
    revIndex = Math.max(0, Math.min(idx, max));
    track.scrollTo({ left: revIndex * cardStep(), behavior: 'smooth' });
    renderDots();
  }

  if (track && prevBtn && nextBtn) {
    prevBtn.addEventListener('click', function () { goTo(revIndex - 1); });
    nextBtn.addEventListener('click', function () { goTo(revIndex >= maxIndex() ? 0 : revIndex + 1); });
    track.addEventListener('scroll', function () {
      var step = cardStep();
      if (!step) return;
      var idx = Math.round(track.scrollLeft / step);
      if (idx !== revIndex) { revIndex = Math.min(idx, maxIndex()); renderDots(); }
    }, { passive: true });
    window.addEventListener('resize', function () { goTo(revIndex); });
    renderDots();
  }

  /* ---------- 6. FAQ-аккордеон ---------- */
  $$('.faq__item').forEach(function (item) {
    var q = $('.faq__q', item);
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      $$('.faq__item.is-open').forEach(function (other) {
        other.classList.remove('is-open');
        $('.faq__q', other).setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- 7. Форма CTA ---------- */
  var form = $('#ctaForm');
  var success = $('#formSuccess');
  if (form && success) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#fName');
      var phone = $('#fPhone');
      var ok = true;

      [name, phone].forEach(function (input) {
        input.classList.remove('is-error');
        var digits = input.value.replace(/\D/g, '');
        var valid = input === name ? input.value.trim().length >= 2 : digits.length >= 10;
        if (!valid) {
          input.classList.add('is-error');
          ok = false;
        }
      });
      if (!ok) return;

      success.hidden = false;
    });
  }

  /* ---------- 8. Небольшой tilt-эффект карточки кабинета ---------- */
  var cabinet = $('#cabinetCard');
  if (cabinet && window.matchMedia('(pointer: fine)').matches) {
    cabinet.addEventListener('mousemove', function (e) {
      var r = cabinet.getBoundingClientRect();
      var rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
      var ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
      cabinet.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
    });
    cabinet.addEventListener('mouseleave', function () {
      cabinet.style.transform = '';
      cabinet.style.transition = 'transform .5s ease';
      setTimeout(function () { cabinet.style.transition = ''; }, 500);
    });
  }
})();
