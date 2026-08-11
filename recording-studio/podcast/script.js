/* ГОЛОС — подкаст-студия. Вся интерактивная логика лендинга. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Данные комнат ---------- */
  var ROOMS = {
    audio:  { name: 'Аудио-рум',     price: 1900, desc: 'до 2 гостей' },
    video:  { name: 'Видео-студия',  price: 2900, desc: 'до 4 гостей' },
    stream: { name: 'Стримерская',   price: 2400, desc: '1–2 ведущих' }
  };
  var HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

  var state = { room: 'video', date: null, slot: null };

  /* Детерминированная "занятость" слотов: демо-данные, стабильные при перезагрузке. */
  function isBusy(room, date, hour) {
    var key = room + '|' + date.toISOString().slice(0, 10) + '|' + hour;
    var h = 0;
    for (var i = 0; i < key.length; i++) { h = (h * 31 + key.charCodeAt(i)) >>> 0; }
    return h % 10 < 4; // ~40% слотов занято
  }

  function fmtPrice(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  var DAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  var MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

  /* ---------- Бронирование: комнаты ---------- */
  var roomPicker = $('#roomPicker');
  Object.keys(ROOMS).forEach(function (id) {
    var r = ROOMS[id];
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'room-opt' + (id === state.room ? ' is-active' : '');
    btn.setAttribute('role', 'radio');
    btn.dataset.room = id;
    btn.innerHTML = '<i>' + fmtPrice(r.price) + '/час</i><b>' + r.name + '</b><span>' + r.desc + '</span>';
    btn.addEventListener('click', function () {
      state.room = id;
      state.slot = null;
      $$('.room-opt', roomPicker).forEach(function (el) { el.classList.toggle('is-active', el.dataset.room === id); });
      renderSlots();
      renderSummary();
    });
    roomPicker.appendChild(btn);
  });

  /* ---------- Бронирование: даты (ближайшие 7 дней) ---------- */
  var dateStrip = $('#dateStrip');
  var dates = [];
  (function () {
    var today = new Date();
    for (var i = 0; i < 7; i++) {
      var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      dates.push(d);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'date-opt' + (i === 0 ? ' is-active' : '');
      btn.setAttribute('role', 'radio');
      btn.dataset.idx = i;
      var label = i === 0 ? 'сегодня' : (i === 1 ? 'завтра' : DAYS_SHORT[d.getDay()]);
      btn.innerHTML = label + '<b>' + d.getDate() + '</b>' + MONTHS_SHORT[d.getMonth()];
      btn.addEventListener('click', function () {
        state.date = dates[Number(btn.dataset.idx)];
        state.slot = null;
        $$('.date-opt', dateStrip).forEach(function (el) { el.classList.toggle('is-active', el === btn); });
        renderSlots();
        renderSummary();
      });
      dateStrip.appendChild(btn);
    }
  })();
  state.date = dates[0];

  /* ---------- Бронирование: слоты ---------- */
  var slotGrid = $('#slotGrid');

  function renderSlots() {
    slotGrid.innerHTML = '';
    var now = new Date();
    var isToday = state.date.toDateString() === now.toDateString();
    HOURS.forEach(function (h) {
      var past = isToday && h <= now.getHours();
      var busy = past || isBusy(state.room, state.date, h);
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot ' + (busy ? 'slot--busy' : 'slot--free');
      if (state.slot === h && !busy) b.classList.add('slot--picked');
      b.textContent = pad(h) + ':00';
      b.setAttribute('role', 'radio');
      b.disabled = busy;
      if (!busy) {
        b.addEventListener('click', function () {
          state.slot = h;
          $$('.slot', slotGrid).forEach(function (el) { el.classList.remove('slot--picked'); });
          b.classList.add('slot--picked');
          renderSummary();
        });
      }
      slotGrid.appendChild(b);
    });
  }

  /* ---------- Бронирование: итог и успех ---------- */
  var priceOut = $('#priceOut');
  var summaryText = $('#summaryText');
  var bookBtn = $('#bookBtn');

  function describeDate(d) {
    var now = new Date();
    var tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    if (d.toDateString() === now.toDateString()) return 'сегодня';
    if (d.toDateString() === tomorrow.toDateString()) return 'завтра';
    return d.getDate() + ' ' + MONTHS_SHORT[d.getMonth()] + ' (' + DAYS_SHORT[d.getDay()] + ')';
  }

  function renderSummary() {
    var room = ROOMS[state.room];
    if (state.slot === null) {
      priceOut.textContent = fmtPrice(room.price) + '/час';
      summaryText.textContent = room.name + ' — выберите свободный слот';
      bookBtn.disabled = true;
      return;
    }
    priceOut.textContent = fmtPrice(room.price);
    summaryText.textContent = room.name + ', ' + describeDate(state.date) + ' в ' + pad(state.slot) + ':00';
    bookBtn.disabled = false;
  }

  var bookingSteps = $('.booking__steps');
  var bookSuccess = $('#bookSuccess');
  var successText = $('#successText');

  bookBtn.addEventListener('click', function () {
    if (state.slot === null) return;
    var room = ROOMS[state.room];
    successText.textContent = room.name + ', ' + describeDate(state.date) + ' в ' + pad(state.slot) +
      ':00 — ' + fmtPrice(room.price) + '. Мы подтвердим бронь по SMS и всё подготовим к вашему приходу.';
    bookingSteps.hidden = true;
    bookSuccess.hidden = false;
  });

  $('#bookAgain').addEventListener('click', function () {
    bookSuccess.hidden = true;
    bookingSteps.hidden = false;
    state.slot = null;
    renderSlots();
    renderSummary();
  });

  /* Ссылки "Забронировать" на карточках комнат — предвыбор комнаты */
  $$('.room-card__link').forEach(function (link) {
    link.addEventListener('click', function () {
      var id = link.dataset.room;
      if (!id || !ROOMS[id]) return;
      state.room = id;
      state.slot = null;
      $$('.room-opt', roomPicker).forEach(function (el) { el.classList.toggle('is-active', el.dataset.room === id); });
      renderSlots();
      renderSummary();
    });
  });

  renderSlots();
  renderSummary();

  /* ---------- Ближайшее свободное окно ---------- */
  function findNearest() {
    var now = new Date();
    var order = ['video', 'stream', 'audio'];
    for (var day = 0; day < 7; day++) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day);
      for (var hi = 0; hi < HOURS.length; hi++) {
        var h = HOURS[hi];
        if (day === 0 && h <= now.getHours()) continue;
        for (var ri = 0; ri < order.length; ri++) {
          if (!isBusy(order[ri], d, h)) {
            return { date: d, hour: h, room: order[ri] };
          }
        }
      }
    }
    return null;
  }

  var nearest = findNearest();
  var nearestSlotEl = $('#nearestSlot');
  if (nearest) {
    nearestSlotEl.textContent = describeDate(nearest.date) + ' в ' + pad(nearest.hour) + ':00';
    $('#nearestBtn').addEventListener('click', function () {
      state.room = nearest.room;
      var idx = dates.findIndex(function (d) { return d.toDateString() === nearest.date.toDateString(); });
      if (idx >= 0) {
        state.date = dates[idx];
        $$('.date-opt', dateStrip).forEach(function (el) { el.classList.toggle('is-active', Number(el.dataset.idx) === idx); });
      }
      state.slot = null;
      $$('.room-opt', roomPicker).forEach(function (el) { el.classList.toggle('is-active', el.dataset.room === nearest.room); });
      renderSlots();
      renderSummary();
    });
  } else {
    nearestSlotEl.textContent = 'уточняйте по телефону';
  }

  /* ---------- Индикатор «сейчас записывается» ---------- */
  var liveCount = $('#liveCount');
  var liveWord = $('#liveWord');
  function pluralStudii(n) {
    return n === 1 ? 'студия' : (n >= 2 && n <= 4 ? 'студии' : 'студий');
  }
  function tickLive() {
    var n = 1 + Math.floor(Math.random() * 3); // 1–3
    liveCount.textContent = n;
    liveWord.textContent = pluralStudii(n);
  }
  tickLive();
  setInterval(tickLive, 20000);

  /* ---------- REC-таймер на hero ---------- */
  var recTime = $('#recTime');
  var recStart = Date.now();
  setInterval(function () {
    var s = Math.floor((Date.now() - recStart) / 1000);
    var m = Math.floor(s / 60);
    recTime.textContent = pad(m) + ':' + pad(s % 60);
  }, 1000);

  /* ---------- Карусель отзывов ---------- */
  var track = $('#revTrack');
  var slides = $$('.review', track);
  var dotsWrap = $('#revDots');
  var cur = 0;

  slides.forEach(function (_, i) {
    var d = document.createElement('button');
    d.setAttribute('aria-label', 'Отзыв ' + (i + 1));
    if (i === 0) d.classList.add('is-active');
    d.addEventListener('click', function () { goTo(i); });
    dotsWrap.appendChild(d);
  });

  function goTo(i) {
    cur = (i + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + cur * 100 + '%)';
    $$('button', dotsWrap).forEach(function (el, j) { el.classList.toggle('is-active', j === cur); });
  }
  $('#revPrev').addEventListener('click', function () { goTo(cur - 1); });
  $('#revNext').addEventListener('click', function () { goTo(cur + 1); });
  setInterval(function () { goTo(cur + 1); }, 7000);

  /* свайп на мобильных */
  var touchX = null;
  track.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) goTo(cur + (dx < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });

  /* ---------- Модалка «Для бизнеса» ---------- */
  var bizModal = $('#bizModal');
  var bizForm = $('#bizForm');
  var bizSuccess = $('#bizSuccess');

  $('#bizBtn').addEventListener('click', function () {
    bizForm.hidden = false;
    bizSuccess.hidden = true;
    bizModal.hidden = false;
    document.body.classList.add('modal-open');
  });

  function closeModal() {
    bizModal.hidden = true;
    document.body.classList.remove('modal-open');
  }
  $$('[data-close]', bizModal).forEach(function (el) {
    el.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !bizModal.hidden) closeModal();
  });

  bizForm.addEventListener('submit', function (e) {
    e.preventDefault();
    bizForm.hidden = true;
    bizSuccess.hidden = false;
  });

  /* ---------- Бургер-меню ---------- */
  var burger = $('#burger');
  var nav = $('#nav');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('a', nav).forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Появление при скролле ---------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }
})();
