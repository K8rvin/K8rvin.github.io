/* ===== ПИТ-СТОП · логика ===== */
'use strict';

/* ---------- Данные ---------- */
var BRANCHES = {
  center: {
    id: 'center', num: 1, name: 'Пит-Стоп «Центр»',
    address: 'ул. Гоночная, 12', hours: '09:00–21:00',
    services: ['Переобувка', 'Балансировка', 'Правка дисков', 'Ремонт проколов', 'Хранение'],
    seed: 3
  },
  north: {
    id: 'north', num: 2, name: 'Пит-Стоп «Север»',
    address: 'пр. Скорости, 45', hours: '09:00–21:00',
    services: ['Переобувка', 'Балансировка', 'Ремонт проколов'],
    seed: 7
  },
  south: {
    id: 'south', num: 3, name: 'Пит-Стоп «Юг»',
    address: 'ш. Трасса М-7, 3 км', hours: '09:00–21:00',
    services: ['Переобувка', 'Балансировка', 'Правка дисков', 'Хранение'],
    seed: 11
  }
};

var SLOT_TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

var WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

var REVIEWS = [
  {
    text: 'Записался на 10:00, в 10:32 уже выезжал. Двое ребят работают слаженно, как на пит-лейне: один снимает, второй уже балансирует. <b>Ни минуты ожидания</b> — это лучший шиномонтаж в городе.',
    name: 'Дмитрий К.', car: 'Kia Rio · переобувка + балансировка', time: '32 мин', initials: 'ДК'
  },
  {
    text: 'В прошлом году стоял в «живой очереди» 3 часа. Здесь — <b>по записи, без очередей</b>: заехал на пост, попил кофе в зоне ожидания, уехал. Всё ровно 30 минут, как обещали.',
    name: 'Анна С.', car: 'Hyundai Solaris · переобувка', time: '30 мин', initials: 'АС'
  },
  {
    text: 'Поймал саморез по дороге на работу. Заехал без записи — втиснули в окно между слотами, зажгутовали за 12 минут. <b>Спасли мой день</b>, цена адекватная.',
    name: 'Игорь В.', car: 'Škoda Octavia · ремонт прокола', time: '12 мин', initials: 'ИВ'
  },
  {
    text: 'Отдал комплект в их шинный отель — не надо таскать резину на балкон. Прислали <b>фотоотчёт о состоянии шин</b> и напомнили о записи на переобувку. Сервис уровня дилера, цены — нет.',
    name: 'Марина Л.', car: 'Volkswagen Polo · хранение + переобувка', time: '28 мин', initials: 'МЛ'
  },
  {
    text: 'Скидка −20% за запись до 14:00 — честная, посчитали сразу. Понравилось табло с таймером: видно, сколько осталось. <b>Чувствуешь себя в болиде</b>, а не в очереди.',
    name: 'Сергей Т.', car: 'Lada Vesta · переобувка по акции', time: '29 мин', initials: 'СТ'
  }
];

/* ---------- Утилиты ---------- */
function pad2(n) { return String(n).padStart(2, '0'); }

function dayDate(offset) {
  var d = new Date();
  d.setDate(d.getDate() + offset);
  return d;
}

function formatDay(offset) {
  var d = dayDate(offset);
  var dayName = offset === 0 ? 'Сегодня' : (offset === 1 ? 'Завтра' : WEEKDAYS[d.getDay()]);
  return { week: dayName, date: d.getDate(), month: MONTHS[d.getMonth()], full: d };
}

/* Детерминированная генерация занятости слотов (имитация реальной загрузки) */
function buildSlots(branchSeed, dayOffset) {
  var now = new Date();
  return SLOT_TIMES.map(function (time, i) {
    var v = (branchSeed * 31 + dayOffset * 17 + i * 13 + dayOffset * i) % 10;
    var busy = v < 4; // ~40% занято
    if (dayOffset === 0) {
      var hour = parseInt(time, 10);
      if (hour <= now.getHours()) busy = true; // прошедшее время недоступно
    }
    return { time: time, busy: busy, booked: false };
  });
}

/* ---------- Виджет записи ---------- */
function BookingWidget(root) {
  this.root = root;
  this.branch = BRANCHES[root.getAttribute('data-branch')] || BRANCHES.center;
  this.dayOffset = 0;
  this.days = [];
  for (var i = 0; i < 7; i++) {
    this.days.push(buildSlots(this.branch.seed, i));
  }
  this.selected = null; // {day, time}
  this.render();
}

BookingWidget.prototype.render = function () {
  var self = this;
  var b = this.branch;
  this.root.innerHTML =
    '<div class="bw__branch">Филиал: <b>' + b.name + '</b> · ' + b.address + ' · ежедневно ' + b.hours + '</div>' +
    '<div class="bw__days"></div>' +
    '<div class="bw__slots"></div>' +
    '<div class="bw__legend">' +
      '<span><i class="l-free"></i>свободно</span>' +
      '<span><i class="l-busy"></i>занято</span>' +
    '</div>' +
    '<div class="bw__summary">Выбери день и время, чтобы забронировать пит-стоп.</div>' +
    '<form class="bw__form" novalidate>' +
      '<div class="bw__field"><label>Ваше имя</label><input type="text" name="name" placeholder="Алексей" autocomplete="name"></div>' +
      '<div class="bw__field"><label>Телефон</label><input type="tel" name="phone" placeholder="+7 900 000-00-00" autocomplete="tel"></div>' +
      '<button class="btn btn--red" type="submit" disabled>Забронировать</button>' +
    '</form>' +
    '<div class="bw__success">' +
      '<div class="bw__success-flag"></div>' +
      '<h3>Финиш! Слот забронирован</h3>' +
      '<p class="bw__success-text"></p>' +
      '<button class="btn btn--ghost" type="button" data-reset>Записать ещё одну машину</button>' +
    '</div>';

  this.daysEl = this.root.querySelector('.bw__days');
  this.slotsEl = this.root.querySelector('.bw__slots');
  this.summaryEl = this.root.querySelector('.bw__summary');
  this.formEl = this.root.querySelector('.bw__form');
  this.successEl = this.root.querySelector('.bw__success');
  this.submitBtn = this.root.querySelector('button[type="submit"]');

  this.renderDays();
  this.renderSlots();

  this.formEl.addEventListener('submit', function (e) {
    e.preventDefault();
    self.book();
  });
  this.root.querySelector('[data-reset]').addEventListener('click', function () {
    self.successEl.classList.remove('is-visible');
    self.formEl.style.display = '';
    self.summaryEl.style.display = '';
    self.formEl.reset();
    self.selected = null;
    self.updateSummary();
  });
};

BookingWidget.prototype.renderDays = function () {
  var self = this;
  this.daysEl.innerHTML = '';
  this.days.forEach(function (slots, i) {
    var info = formatDay(i);
    var free = slots.filter(function (s) { return !s.busy && !s.booked; }).length;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bw__day' + (i === self.dayOffset ? ' is-active' : '');
    btn.innerHTML =
      '<span class="bw__day-week">' + info.week + '</span>' +
      '<span class="bw__day-date">' + info.date + '</span>' +
      '<span class="bw__day-free">' + (free > 0 ? free + ' слот' + plural(free, '', 'а', 'ов') : 'нет окон') + '</span>';
    btn.addEventListener('click', function () {
      self.dayOffset = i;
      self.selected = null;
      self.renderDays();
      self.renderSlots();
      self.updateSummary();
    });
    self.daysEl.appendChild(btn);
  });
};

function plural(n, one, few, many) {
  var m = Math.abs(n) % 100, d = m % 10;
  if (m > 10 && m < 20) return many;
  if (d > 1 && d < 5) return few;
  if (d === 1) return one;
  return many;
}

BookingWidget.prototype.renderSlots = function () {
  var self = this;
  var slots = this.days[this.dayOffset];
  this.slotsEl.innerHTML = '';
  slots.forEach(function (slot, i) {
    var btn = document.createElement('button');
    btn.type = 'button';
    var isBusy = slot.busy || slot.booked;
    btn.className = 'bw__slot' + (isBusy ? ' bw__slot--busy' : '');
    btn.textContent = slot.time;
    btn.disabled = isBusy;
    btn.title = isBusy ? 'Слот занят' : 'Свободно — нажми, чтобы выбрать';
    if (!isBusy) {
      btn.addEventListener('click', function () {
        self.slotsEl.querySelectorAll('.bw__slot').forEach(function (el) {
          el.classList.remove('is-selected');
        });
        btn.classList.add('is-selected');
        self.selected = { day: self.dayOffset, time: slot.time, index: i };
        self.updateSummary();
      });
    }
    self.slotsEl.appendChild(btn);
  });
};

BookingWidget.prototype.updateSummary = function () {
  if (this.selected) {
    var info = formatDay(this.selected.day);
    this.summaryEl.innerHTML = 'Выбрано: <b>' + info.week.toLowerCase() + ', ' + info.date + ' ' + info.month +
      ' в ' + this.selected.time + '</b> · филиал «' + this.branch.name + '»';
    this.submitBtn.disabled = false;
  } else {
    this.summaryEl.textContent = 'Выбери день и время, чтобы забронировать пит-стоп.';
    this.submitBtn.disabled = true;
  }
};

BookingWidget.prototype.book = function () {
  if (!this.selected) return;
  var name = this.formEl.elements.name.value.trim() || 'Гость';
  var info = formatDay(this.selected.day);
  // помечаем слот как забронированный (имитация записи на сервере)
  this.days[this.selected.day][this.selected.index].booked = true;

  this.root.querySelector('.bw__success-text').innerHTML =
    name + ', ждём тебя <b>' + info.week.toLowerCase() + ', ' + info.date + ' ' + info.month +
    ' в ' + this.selected.time + '</b> в филиале «' + this.branch.name + '» (' + this.branch.address + ').<br>' +
    'Это демо-запись — бронь никуда не отправляется. По-настоящему записаться: ' +
    '<a class="link-lime" href="tel:+79090939400">+7 909 093-94-00</a>.';

  this.formEl.style.display = 'none';
  this.summaryEl.style.display = 'none';
  this.successEl.classList.add('is-visible');
  this.selected = null;
  this.renderDays();
  this.renderSlots();
};

/* ---------- Таймер до ближайшего окна ---------- */
function findNextWindow() {
  var now = new Date();
  for (var d = 0; d < 7; d++) {
    var slots = buildSlots(BRANCHES.center.seed, d);
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].busy) continue;
      var target = dayDate(d);
      var parts = slots[i].time.split(':');
      target.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
      if (target > now) return { target: target, time: slots[i].time, dayOffset: d };
    }
  }
  return null;
}

function startNextWindowTimer() {
  var timerEl = document.getElementById('nextWindowTimer');
  var infoEl = document.getElementById('nextWindowInfo');
  if (!timerEl) return;

  function tick() {
    var win = findNextWindow();
    if (!win) {
      timerEl.textContent = '--:--:--';
      infoEl.textContent = 'на неделе всё занято — звоните';
      return;
    }
    var diff = Math.max(0, win.target - new Date());
    var h = Math.floor(diff / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    timerEl.textContent = pad2(h) + ':' + pad2(m) + ':' + pad2(s);
    var info = formatDay(win.dayOffset);
    infoEl.textContent = 'окно ' + info.week.toLowerCase() + ' в ' + win.time + ' · филиал «Центр»';
  }
  tick();
  setInterval(tick, 1000);
}

/* ---------- Счётчик переобутых машин ---------- */
function startCarsCounter() {
  var el = document.getElementById('carsCounter');
  if (!el) return;
  var now = new Date();
  // базовое значение: растёт в течение рабочего дня
  var hoursOpen = Math.max(0, Math.min(now.getHours() - 9, 12));
  var value = 14 + hoursOpen * 7 + (now.getDate() % 5);
  el.textContent = value;

  function bump() {
    value += 1;
    el.textContent = value;
    el.parentElement.style.transition = 'transform .2s ease';
    el.parentElement.style.transform = 'scale(1.12)';
    setTimeout(function () { el.parentElement.style.transform = ''; }, 220);
    setTimeout(bump, 12000 + Math.random() * 26000);
  }
  setTimeout(bump, 9000 + Math.random() * 9000);
}

/* ---------- Карта филиалов ---------- */
function initBranchesMap() {
  var info = document.getElementById('branchInfo');
  if (!info) return;
  var points = document.querySelectorAll('.map-point');

  function render(branchId) {
    var b = BRANCHES[branchId];
    var slots = buildSlots(b.seed, 0);
    var freeToday = slots.filter(function (s) { return !s.busy; });
    var nearest = freeToday.length ? freeToday[0].time : '—';
    info.innerHTML =
      '<div class="bi__name">' + b.name + '</div>' +
      '<div class="bi__addr">Адрес: <b>' + b.address + '</b><br>Режим: ежедневно ' + b.hours + '</div>' +
      '<div class="bi__row"><span>Свободно окон сегодня</span><b>' + freeToday.length + '</b></div>' +
      '<div class="bi__row"><span>Ближайшее окно</span><b>' + nearest + '</b></div>' +
      '<div class="bi__services">' +
        b.services.map(function (s) { return '<span>' + s + '</span>'; }).join('') +
      '</div>' +
      '<div class="bi__cta"><a class="btn btn--red" href="tel:+79090939400">Записаться: +7 909 093-94-00</a></div>';

    points.forEach(function (p) {
      p.classList.toggle('is-active', p.getAttribute('data-branch') === branchId);
    });
  }

  points.forEach(function (p) {
    var id = p.getAttribute('data-branch');
    p.addEventListener('click', function () { render(id); });
    p.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); render(id); }
    });
  });

  render('center');
}

/* ---------- Карусель отзывов ---------- */
function initCarousel() {
  var track = document.getElementById('carouselTrack');
  var dotsWrap = document.getElementById('carouselDots');
  if (!track || !dotsWrap) return;
  var index = 0, timer = null;

  REVIEWS.forEach(function (r, i) {
    var card = document.createElement('article');
    card.className = 'review-card';
    card.innerHTML =
      '<div class="review-card__stars">★★★★★</div>' +
      '<p class="review-card__text">' + r.text + '</p>' +
      '<div class="review-card__meta">' +
        '<div class="review-card__avatar">' + r.initials + '</div>' +
        '<div><div class="review-card__name">' + r.name + '</div>' +
        '<div class="review-card__car">' + r.car + '</div></div>' +
        '<div class="review-card__time">⏱ ' + r.time + '</div>' +
      '</div>';
    track.appendChild(card);

    var dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
    dot.addEventListener('click', function () { go(i); restart(); });
    dotsWrap.appendChild(dot);
  });

  var dots = dotsWrap.querySelectorAll('button');

  function go(i) {
    index = (i + REVIEWS.length) % REVIEWS.length;
    track.style.transform = 'translateX(-' + index * 100 + '%)';
    dots.forEach(function (d, j) { d.classList.toggle('is-active', j === index); });
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(function () { go(index + 1); }, 6000);
  }

  document.getElementById('carouselPrev').addEventListener('click', function () { go(index - 1); restart(); });
  document.getElementById('carouselNext').addEventListener('click', function () { go(index + 1); restart(); });

  var viewport = track.parentElement;
  viewport.addEventListener('mouseenter', function () { clearInterval(timer); });
  viewport.addEventListener('mouseleave', restart);

  go(0);
  restart();
}

/* ---------- Появление при скролле ---------- */
function initReveal() {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { io.observe(el); });
}

/* ---------- Мобильное меню ---------- */
function initBurger() {
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (!burger || !nav) return;
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Инициализация ---------- */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.booking-widget').forEach(function (root) {
    new BookingWidget(root);
  });
  startNextWindowTimer();
  startCarsCounter();
  initBranchesMap();
  initCarousel();
  initReveal();
  initBurger();
});
