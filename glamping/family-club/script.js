/* ===== Солнечная Поляна — script ===== */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Шапка: тень при скролле ---------- */
  var header = $('#header');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Бургер-меню ---------- */
  var burger = $('#burger');
  var nav = $('#nav');
  function closeNav() {
    nav.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
  });
  $$('.nav__link, .nav__call', nav).forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  /* ---------- Появление при скролле ---------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = el.parentElement ? $$('.reveal', el.parentElement) : [];
        var idx = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = (Math.min(idx, 4) * 90) + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Счётчик «семей отдохнуло этим летом» ---------- */
  var counterEl = $('#familiesCounter');
  var COUNTER_TARGET = 327;
  var counterDone = false;
  function animateCounter() {
    if (counterDone) return;
    counterDone = true;
    var start = null;
    var dur = 1700;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      counterEl.textContent = String(Math.round(COUNTER_TARGET * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { animateCounter(); cio.disconnect(); }
    }, { threshold: 0.4 });
    cio.observe(counterEl);
  } else {
    animateCounter();
  }

  /* ---------- Пакеты: раскрытие «что входит» ---------- */
  $$('.pack').forEach(function (pack) {
    var toggle = $('.pack__toggle', pack);
    var label = $('.pack__toggle-text', toggle);
    toggle.addEventListener('click', function () {
      var open = pack.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      label.textContent = open ? 'Свернуть список' : 'Что ещё входит';
    });
  });

  /* ---------- Кнопки бронирования пакетов/домиков ---------- */
  var formCard = $('#formCard');
  var fPack = $('#fPack');
  function goToBooking() {
    formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    formCard.classList.remove('flash');
    void formCard.offsetWidth;
    formCard.classList.add('flash');
  }
  $$('[data-book-pack]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pack = btn.getAttribute('data-book-pack');
      if (fPack && pack) fPack.value = pack;
      goToBooking();
    });
  });

  /* ---------- Календарь заездов ---------- */
  var MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
    'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
  var MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var MAX_AHEAD = 3; // месяцев вперёд

  var calState = {
    viewY: today.getFullYear(),
    viewM: today.getMonth(),
    start: null,
    end: null
  };

  var calGrid = $('#calGrid');
  var calMonth = $('#calMonth');
  var calPrev = $('#calPrev');
  var calNext = $('#calNext');
  var calHint = $('#calHint');
  var calResult = $('#calResult');
  var calResultDates = $('#calResultDates');
  var calResultFree = $('#calResultFree');
  var calBook = $('#calBook');
  var fDates = $('#fDates');

  /* детерминированная «загрузка» домиков по дате */
  function freeFor(date) {
    var key = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    var h = 0;
    for (var i = 0; i < key.length; i++) {
      h = (h * 33 + key.charCodeAt(i)) >>> 0;
    }
    var table = [4, 2, 5, 1, 3, 0, 2, 6, 1, 3];
    return table[h % 10];
  }

  function pluralHouses(n) {
    var mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'домик';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'домика';
    return 'домиков';
  }

  function fmtDate(d) {
    return d.getDate() + ' ' + MONTHS_GEN[d.getMonth()];
  }

  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function renderCalendar() {
    var y = calState.viewY, m = calState.viewM;
    calMonth.textContent = MONTHS[m] + ' ' + y;

    // кнопки навигации
    var curIdx = today.getFullYear() * 12 + today.getMonth();
    var viewIdx = y * 12 + m;
    calPrev.disabled = viewIdx <= curIdx;
    calNext.disabled = viewIdx >= curIdx + MAX_AHEAD;

    calGrid.innerHTML = '';
    var firstDow = (new Date(y, m, 1).getDay() + 6) % 7; // пн = 0
    var daysInMonth = new Date(y, m + 1, 0).getDate();

    for (var e = 0; e < firstDow; e++) {
      var empty = document.createElement('span');
      empty.className = 'cal__cell is-empty';
      calGrid.appendChild(empty);
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var date = new Date(y, m, d);
      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cal__cell';
      cell.textContent = String(d);

      var dow = date.getDay();
      var isPast = date < today;
      var free = freeFor(date);

      if (dow === 0 || dow === 6) cell.classList.add('is-weekend');
      if (sameDay(date, today)) cell.classList.add('is-today');

      var dot = document.createElement('i');
      dot.className = 'cal__dot ' + (free === 0 ? 'dot--none' : free <= 3 ? 'dot--few' : 'dot--many');
      cell.appendChild(dot);

      if (isPast) {
        cell.classList.add('is-past');
        cell.disabled = true;
      } else {
        if (calState.start && sameDay(date, calState.start)) cell.classList.add('is-selected');
        if (calState.end && sameDay(date, calState.end)) cell.classList.add('is-selected');
        if (calState.start && calState.end && date > calState.start && date < calState.end) {
          cell.classList.add('in-range');
        }
        (function (dt) {
          cell.setAttribute('aria-label', dt.getDate() + ' ' + MONTHS[dt.getMonth()] + ', свободно ' + free + ' ' + pluralHouses(free));
          cell.addEventListener('click', function () { pickDate(dt); });
        })(date);
      }

      calGrid.appendChild(cell);
    }
  }

  function pickDate(date) {
    if (!calState.start || (calState.start && calState.end)) {
      calState.start = date;
      calState.end = null;
      calResult.hidden = true;
      calHint.textContent = 'Заезд ' + fmtDate(date) + '. Теперь выберите дату выезда.';
    } else if (date > calState.start) {
      calState.end = date;
      showResult();
    } else {
      calState.start = date;
      calState.end = null;
      calResult.hidden = true;
      calHint.textContent = 'Заезд ' + fmtDate(date) + '. Теперь выберите дату выезда.';
    }
    renderCalendar();
  }

  function showResult() {
    var nights = Math.round((calState.end - calState.start) / 86400000);
    var minFree = 8;
    var cursor = new Date(calState.start);
    for (var i = 0; i < nights; i++) {
      minFree = Math.min(minFree, freeFor(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    calResultDates.textContent = 'Заезд ' + fmtDate(calState.start) +
      ' — выезд ' + fmtDate(calState.end) + ' · ' + nights + ' ' +
      (nights === 1 ? 'ночь' : nights < 5 ? 'ночи' : 'ночей');
    if (minFree > 0) {
      calResultFree.textContent = 'На эти даты свободно ' + minFree + ' ' + pluralHouses(minFree) + ' из 8 — успейте забронировать.';
    } else {
      calResultFree.textContent = 'На эти даты всё занято. Оставьте заявку — подберём ближайшие свободные.';
    }
    calResult.hidden = false;
    calHint.textContent = 'Хотите другие даты? Просто нажмите на новую дату заезда.';
  }

  calPrev.addEventListener('click', function () {
    calState.viewM--;
    if (calState.viewM < 0) { calState.viewM = 11; calState.viewY--; }
    renderCalendar();
  });
  calNext.addEventListener('click', function () {
    calState.viewM++;
    if (calState.viewM > 11) { calState.viewM = 0; calState.viewY++; }
    renderCalendar();
  });

  calBook.addEventListener('click', function () {
    if (calState.start && calState.end && fDates) {
      fDates.value = fmtDate(calState.start) + ' — ' + fmtDate(calState.end) + ' ' + calState.end.getFullYear();
    }
    goToBooking();
  });

  renderCalendar();

  /* ---------- Карусель отзывов ---------- */
  var track = $('#carouselTrack');
  var slides = $$('.review', track);
  var dotsWrap = $('#carDots');
  var carIdx = 0;
  var carTimer = null;

  slides.forEach(function (_, i) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel__dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
    dot.addEventListener('click', function () { goSlide(i); restartAuto(); });
    dotsWrap.appendChild(dot);
  });
  var dots = $$('.carousel__dot', dotsWrap);

  function goSlide(i) {
    carIdx = (i + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + carIdx * 100 + '%)';
    dots.forEach(function (dot, j) { dot.classList.toggle('active', j === carIdx); });
  }
  function restartAuto() {
    clearInterval(carTimer);
    carTimer = setInterval(function () { goSlide(carIdx + 1); }, 6500);
  }
  $('#carPrev').addEventListener('click', function () { goSlide(carIdx - 1); restartAuto(); });
  $('#carNext').addEventListener('click', function () { goSlide(carIdx + 1); restartAuto(); });

  var carousel = $('#carousel');
  carousel.addEventListener('mouseenter', function () { clearInterval(carTimer); });
  carousel.addEventListener('mouseleave', restartAuto);

  var touchX = null;
  track.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) { goSlide(carIdx + (dx < 0 ? 1 : -1)); restartAuto(); }
    touchX = null;
  }, { passive: true });

  restartAuto();

  /* ---------- Маска телефона ---------- */
  var fPhone = $('#fPhone');
  fPhone.addEventListener('input', function () {
    var digits = fPhone.value.replace(/\D/g, '');
    if (digits.charAt(0) === '8') digits = '7' + digits.slice(1);
    if (digits && digits.charAt(0) !== '7') digits = '7' + digits;
    digits = digits.slice(0, 11);
    var out = '';
    if (digits.length > 0) out = '+7';
    if (digits.length > 1) out += ' (' + digits.slice(1, 4);
    if (digits.length >= 4) out += ') ' + digits.slice(4, 7);
    if (digits.length >= 7) out += '-' + digits.slice(7, 9);
    if (digits.length >= 9) out += '-' + digits.slice(9, 11);
    fPhone.value = out;
  });

  /* ---------- Форма бронирования ---------- */
  var form = $('#bookForm');
  var formError = $('#formError');
  var formSuccess = $('#formSuccess');
  var formSuccessText = $('#formSuccessText');
  var fName = $('#fName');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = fName.value.trim();
    var phoneDigits = fPhone.value.replace(/\D/g, '');
    var ok = true;

    fName.classList.toggle('invalid', !name);
    fPhone.classList.toggle('invalid', phoneDigits.length < 10);
    if (!name || phoneDigits.length < 10) ok = false;

    formError.hidden = ok;
    if (!ok) return;

    var firstName = name.split(' ')[0];
    var datesText = fDates.value.trim();
    formSuccessText.innerHTML = 'Спасибо, ' + escapeHtml(firstName) + '! Перезвоним в течение 20 минут' +
      (datesText ? ' и подтвердим даты «' + escapeHtml(datesText) + '»' : ' и подтвердим бронь') +
      '. Если хотите быстрее — позвоните нам: <a href="tel:+79090939400">+7 909 093-94-00</a>.';

    form.hidden = true;
    formSuccess.hidden = false;
    formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  $('#formAgain').addEventListener('click', function () {
    form.reset();
    fName.classList.remove('invalid');
    fPhone.classList.remove('invalid');
    formError.hidden = true;
    formSuccess.hidden = true;
    form.hidden = false;
  });
})();
