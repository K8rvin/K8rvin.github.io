/* ===== Спокойные лапы — вся логика лендинга ===== */
'use strict';

/* ---------- Данные ---------- */
var DOCTORS = [
  {
    id: 'ivanova',
    name: 'Dr. Иванова',
    fullName: 'Анна Иванова',
    spec: 'Терапевт, кошачий психолог',
    exp: 'Стаж 15 лет',
    motto: '«Сначала доверие, потом осмотр. Никакой спешки».',
    palette: ['#F3E2D8', '#D98E6A', '#33424F'],
    hair: 'bob'
  },
  {
    id: 'kim',
    name: 'Dr. Ким',
    fullName: 'Дмитрий Ким',
    spec: 'Хирург, анестезиолог',
    exp: 'Стаж 12 лет',
    motto: '«Безболезненно — значит спокойно. Всегда».',
    palette: ['#E4E9EC', '#8FA5B5', '#33424F'],
    hair: 'short'
  },
  {
    id: 'orlova',
    name: 'Dr. Орлова',
    fullName: 'Мария Орлова',
    spec: 'Дерматолог, аллерголог',
    exp: 'Стаж 9 лет',
    motto: '«Тихий голос лечит не хуже лекарств».',
    palette: ['#EFE7DA', '#C9A876', '#33424F'],
    hair: 'bun'
  },
  {
    id: 'sokolov',
    name: 'Dr. Соколов',
    fullName: 'Пётр Соколов',
    spec: 'Кардиолог, УЗИ-диагностика',
    exp: 'Стаж 11 лет',
    motto: '«Видеть сердце — значит понимать питомца».',
    palette: ['#E8E3EE', '#9B8FAD', '#33424F'],
    hair: 'beard'
  }
];

var PRICES = {
  diagnostics: [
    { name: 'Первичный приём терапевта', desc: 'Осмотр, анамнез, план обследования', time: '40 мин', price: '1 500 ₽' },
    { name: 'УЗИ брюшной полости', desc: 'С заключением и снимками на руки', time: '30 мин', price: '2 800 ₽' },
    { name: 'Эхокардиография (УЗИ сердца)', desc: 'Допплер, консультация кардиолога', time: '45 мин', price: '4 200 ₽' },
    { name: 'Общий анализ крови', desc: 'Результат в день визита', time: '10 мин', price: '1 900 ₽' },
    { name: 'Рентген, 1 проекция', desc: 'Цифровой снимок и описание', time: '20 мин', price: '2 400 ₽' }
  ],
  therapy: [
    { name: 'Повторный приём', desc: 'Контроль по плану лечения', time: '30 мин', price: '1 200 ₽' },
    { name: 'Внутривенная инфузия (капельница)', desc: 'Под наблюдением в тихой комнате', time: '60–120 мин', price: 'от 1 800 ₽' },
    { name: 'Обработка ушей и глаз', desc: 'Деликатно, с паузами для питомца', time: '15 мин', price: '900 ₽' },
    { name: 'Инъекции по назначению', desc: 'Подкожно, внутримышечно', time: '10 мин', price: '500 ₽' }
  ],
  surgery: [
    { name: 'Кастрация кота', desc: 'Газовый наркоз, наблюдение до пробуждения', time: '1 день', price: '6 500 ₽' },
    { name: 'Стерилизация кошки', desc: 'Шов рассасывающийся, попона в подарок', time: '1 день', price: '9 800 ₽' },
    { name: 'Санирование полости рта', desc: 'Ультразвук под седацией', time: '60 мин', price: 'от 7 500 ₽' },
    { name: 'Удаление новообразований', desc: 'С гистологией и планом наблюдения', time: 'от 40 мин', price: 'от 8 000 ₽' }
  ],
  prevention: [
    { name: 'Комплексная вакцинация', desc: 'Вакцина + осмотр перед прививкой', time: '30 мин', price: '2 600 ₽' },
    { name: 'Чипирование', desc: 'Чип с регистрацией в базе', time: '15 мин', price: '1 800 ₽' },
    { name: 'Годовой чек-ап', desc: 'Осмотр, анализы, УЗИ — всё за один визит', time: '90 мин', price: '7 900 ₽' },
    { name: 'Стрижка когтей и гигиена', desc: 'Спокойно, без фиксации силой', time: '20 мин', price: '800 ₽' }
  ]
};

var REVIEWS = [
  {
    text: '«Кот всю жизнь шипел на врачей. Здесь он сам вышел из переноски и пошёл знакомиться. Я до сих пор не верю, что так бывает».',
    author: 'Ольга М.',
    pet: 'кот Барсик, 7 лет'
  },
  {
    text: '«Записались на 11:00, в 11:00 уже были в кабинете. Никакой очереди из лающих собак — отдельный вход, тишина, порядок».',
    author: 'Сергей и Анна',
    pet: 'спаниель Луна, 3 года'
  },
  {
    text: '«После операции пёс ночевал в стационаре. Смотрела на него через веб-камеру и получала отчёты два раза в день. Спала спокойно».',
    author: 'Марина В.',
    pet: 'корги Тайфун, 5 лет'
  },
  {
    text: '«Врач 40 минут была только с нами: всё объяснила, показала на снимках, расписала план. Вечером прислала отчёт в мессенджер».',
    author: 'Игорь К.',
    pet: 'кошка Муся, 11 лет'
  }
];

/* ---------- Утилиты ---------- */
function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

/* Детерминированный псевдо-рандом: одинаковые "занятые" слоты для одного дня/врача */
function seededRandom(seedStr) {
  var h = 0;
  for (var i = 0; i < seedStr.length; i++) {
    h = (h << 5) - h + seedStr.charCodeAt(i);
    h |= 0;
  }
  return function () {
    h = (h * 1103515245 + 12345) | 0;
    return ((h >>> 16) & 0x7fff) / 0x7fff;
  };
}

function formatPhone(v) {
  var d = v.replace(/\D/g, '');
  if (d.charAt(0) === '8') d = '7' + d.slice(1);
  if (d.charAt(0) !== '7') d = '7' + d;
  d = d.slice(0, 11);
  var out = '+7';
  if (d.length > 1) out += ' ' + d.slice(1, 4);
  if (d.length > 4) out += ' ' + d.slice(4, 7);
  if (d.length > 7) out += '-' + d.slice(7, 9);
  if (d.length > 9) out += '-' + d.slice(9, 11);
  return out;
}

/* SVG-портрет врача — спокойный, минималистичный */
function doctorAvatar(doc) {
  var bg = doc.palette[0], accent = doc.palette[1], ink = doc.palette[2];
  var hair = '';
  if (doc.hair === 'bob') {
    hair = '<path d="M30 44c-2-16 8-28 20-28s22 12 20 28c0 6-2 10-4 12 2-14-4-24-16-24S32 42 34 56c-2-2-4-6-4-12Z" fill="' + ink + '"/>';
  } else if (doc.hair === 'short') {
    hair = '<path d="M32 38c0-12 8-20 18-20s18 8 18 20c-4-8-10-12-18-12s-14 4-18 12Z" fill="' + ink + '"/>';
  } else if (doc.hair === 'bun') {
    hair = '<path d="M32 40c-2-14 7-24 18-24s20 10 18 24c-2-10-9-16-18-16S34 30 32 40Z" fill="' + ink + '"/><circle cx="50" cy="12" r="7" fill="' + ink + '"/>';
  } else {
    hair = '<path d="M32 38c0-12 8-20 18-20s18 8 18 20c-4-8-10-12-18-12s-14 4-18 12Z" fill="' + ink + '"/><path d="M38 58c4 8 8 12 12 12s8-4 12-12c-2 10-6 16-12 16s-10-6-12-16Z" fill="' + ink + '"/>';
  }
  return '<svg viewBox="0 0 100 100" fill="none" aria-hidden="true">' +
    '<rect width="100" height="100" fill="' + bg + '"/>' +
    '<circle cx="50" cy="116" r="34" fill="' + accent + '"/>' +
    '<path d="M36 78c0 8 6 12 14 12s14-4 14-12v-8H36Z" fill="#F1C8A8"/>' +
    '<circle cx="50" cy="46" r="22" fill="#F6D4B8"/>' +
    hair +
    '<circle cx="42" cy="44" r="2.4" fill="' + ink + '"/>' +
    '<circle cx="58" cy="44" r="2.4" fill="' + ink + '"/>' +
    '<path d="M44 55c2 2.4 4 3.4 6 3.4s4-1 6-3.4" stroke="' + ink + '" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M50 74v6" stroke="#F1C8A8" stroke-width="8"/>' +
    '<path d="M30 100c2-12 10-18 20-18s18 6 20 18" fill="' + accent + '"/>' +
    '<path d="M46 84h8" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>' +
    '</svg>';
}

/* ---------- Шапка и бургер ---------- */
function initHeader() {
  var header = $('#header');
  var burger = $('#burger');
  var nav = $('#nav');

  window.addEventListener('scroll', function () {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }, { passive: true });

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });

  $all('.nav__link', nav).forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Появление при скролле ---------- */
function initReveal() {
  var els = $all('.reveal');
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

/* ---------- Индикатор «Сейчас принимает» (по реальному времени) ---------- */
function initOnDuty() {
  var box = $('#on-duty');
  var text = $('#on-duty-text');
  if (!box || !text) return;

  /* Кто работает по дням недели (0 = воскресенье) */
  var schedule = {
    0: ['Dr. Орлова', 'Dr. Соколов'],
    1: ['Dr. Иванова', 'Dr. Ким'],
    2: ['Dr. Иванова', 'Dr. Орлова'],
    3: ['Dr. Ким', 'Dr. Соколов'],
    4: ['Dr. Иванова', 'Dr. Ким'],
    5: ['Dr. Орлова', 'Dr. Соколов'],
    6: ['Dr. Иванова', 'Dr. Соколов']
  };

  function update() {
    var now = new Date();
    var h = now.getHours();
    var pair = schedule[now.getDay()];
    if (h >= 9 && h < 21) {
      /* Второй врач сменяется в середине дня для ощущения «живого» расписания */
      var second = h < 15 ? pair[1] : pair[0];
      var first = h < 15 ? pair[0] : pair[1];
      box.classList.remove('on-duty--closed');
      text.textContent = 'Сейчас принимает: ' + first + ' и ' + second;
    } else {
      box.classList.add('on-duty--closed');
      text.textContent = 'Сейчас тихий час · приём с 9:00';
    }
  }
  update();
  setInterval(update, 60000);
}

/* Часы в «веб-камере» стационара */
function initWebcamClock() {
  var el = $('#webcam-clock');
  if (!el) return;
  function tick() {
    var d = new Date();
    el.textContent = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }
  tick();
  setInterval(tick, 30000);
}

/* ---------- Виджет записи ---------- */
function initBooking() {
  var widget = $('#booking-widget');
  if (!widget) return;

  var steps = $all('.booking__step', widget);
  var panes = {
    1: $('#pane-doctors'),
    2: $('#pane-days'),
    3: $('#pane-slots'),
    4: $('#pane-done')
  };
  var doctorsBox = $('#booking-doctors');
  var daysBox = $('#booking-days');
  var slotsBox = $('#booking-slots');
  var daysHint = $('#days-hint');
  var slotsHint = $('#slots-hint');
  var form = $('#booking-form');
  var errorBox = $('#booking-error');
  var doneText = $('#done-text');

  var state = { doctor: null, day: null, slot: null };
  var DOW = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var SLOT_TIMES = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

  function goTo(step) {
    steps.forEach(function (s) {
      var n = Number(s.getAttribute('data-step'));
      s.classList.toggle('is-active', n === step);
      s.classList.toggle('is-done', n < step);
    });
    Object.keys(panes).forEach(function (n) {
      panes[n].classList.toggle('is-active', Number(n) === step);
    });
  }

  /* Шаг 1: карточки врачей */
  DOCTORS.forEach(function (doc) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'doc-card';
    btn.innerHTML =
      '<span class="doc-card__avatar">' + doctorAvatar(doc) + '</span>' +
      '<span>' +
        '<span class="doc-card__name">' + doc.fullName + '</span>' +
        '<span class="doc-card__spec">' + doc.spec + '</span>' +
        '<span class="doc-card__approach">' + doc.motto + '</span>' +
      '</span>';
    btn.addEventListener('click', function () {
      state.doctor = doc;
      state.day = null;
      state.slot = null;
      $all('.doc-card', doctorsBox).forEach(function (c) { c.classList.remove('is-selected'); });
      btn.classList.add('is-selected');
      renderDays();
      goTo(2);
    });
    doctorsBox.appendChild(btn);
  });

  /* Шаг 2: ближайшие 7 дней */
  function renderDays() {
    daysBox.innerHTML = '';
    daysHint.innerHTML = 'Врач: <strong>' + state.doctor.fullName + '</strong> · ' + state.doctor.spec;
    var today = new Date();
    for (var i = 0; i < 7; i++) {
      (function (offset) {
        var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'day-card';
        var label = offset === 0 ? 'Сегодня' : (offset === 1 ? 'Завтра' : DOW[d.getDay()]);
        btn.innerHTML =
          '<span class="day-card__dow">' + label + '</span>' +
          '<span class="day-card__num">' + d.getDate() + '</span>' +
          '<span class="day-card__month">' + MONTHS[d.getMonth()] + '</span>';
        /* Детерминированный «выходной» врача: иногда день недоступен */
        var rnd = seededRandom(state.doctor.id + d.toDateString());
        if (rnd() < 0.14 && offset > 1) btn.disabled = true;
        btn.addEventListener('click', function () {
          state.day = d;
          state.slot = null;
          renderSlots();
          goTo(3);
        });
        daysBox.appendChild(btn);
      })(i);
    }
  }

  /* Шаг 3: слоты */
  function renderSlots() {
    slotsBox.innerHTML = '';
    errorBox.textContent = '';
    var dateLabel = state.day.getDate() + ' ' + MONTHS[state.day.getMonth()];
    slotsHint.innerHTML = '<strong>' + state.doctor.fullName + '</strong> · ' + dateLabel + ' · свободное время:';
    var rnd = seededRandom(state.doctor.id + state.day.toDateString() + 'slots');
    var now = new Date();
    var isToday = state.day.toDateString() === now.toDateString();

    SLOT_TIMES.forEach(function (t) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot';
      btn.textContent = t;
      var busy = rnd() < 0.32;
      var past = false;
      if (isToday) {
        var hh = Number(t.slice(0, 2));
        past = hh <= now.getHours();
      }
      if (busy || past) btn.disabled = true;
      btn.addEventListener('click', function () {
        state.slot = t;
        $all('.slot', slotsBox).forEach(function (s) { s.classList.remove('is-selected'); });
        btn.classList.add('is-selected');
        errorBox.textContent = '';
      });
      slotsBox.appendChild(btn);
    });
  }

  /* Кнопки «назад» */
  $all('.booking__back', widget).forEach(function (btn) {
    btn.addEventListener('click', function () {
      goTo(Number(btn.getAttribute('data-back')));
    });
  });

  /* Подтверждение */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#bk-name').value.trim();
    var phone = $('#bk-phone').value.replace(/\D/g, '');
    if (!state.slot) {
      errorBox.textContent = 'Пожалуйста, выберите удобное время.';
      return;
    }
    if (name.length < 2) {
      errorBox.textContent = 'Подскажите, как к вам обращаться.';
      return;
    }
    if (phone.length < 11) {
      errorBox.textContent = 'Проверьте номер телефона — нам нужно подтвердить запись.';
      return;
    }
    errorBox.textContent = '';
    var dateLabel = state.day.getDate() + ' ' + MONTHS[state.day.getMonth()];
    doneText.innerHTML = name + ', ждём вас и питомца <strong>' + dateLabel + ' в ' + state.slot + '</strong> у врача <strong>' + state.doctor.fullName + '</strong>.';
    goTo(4);
  });

  $('#booking-restart').addEventListener('click', function () {
    state = { doctor: null, day: null, slot: null };
    form.reset();
    $all('.doc-card', doctorsBox).forEach(function (c) { c.classList.remove('is-selected'); });
    goTo(1);
  });
}

/* ---------- Цены: табы ---------- */
function initPrices() {
  var tabs = $all('.prices__tab');
  var menu = $('#prices-menu');
  if (!menu) return;

  function render(group) {
    menu.innerHTML = '';
    /* Перезапуск анимации */
    menu.style.animation = 'none';
    void menu.offsetWidth;
    menu.style.animation = '';
    PRICES[group].forEach(function (item) {
      var row = document.createElement('div');
      row.className = 'price-row';
      row.innerHTML =
        '<div class="price-row__name">' + item.name +
          '<div class="price-row__desc">' + item.desc + '</div>' +
        '</div>' +
        '<span class="price-row__time">' + item.time + '</span>' +
        '<span class="price-row__dots"></span>' +
        '<span class="price-row__price">' + item.price + '</span>';
      menu.appendChild(row);
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      render(tab.getAttribute('data-group'));
    });
  });

  render('diagnostics');
}

/* ---------- Врачи: профили ---------- */
function initDoctors() {
  var grid = $('#doctors-grid');
  if (!grid) return;
  DOCTORS.forEach(function (doc) {
    var card = document.createElement('article');
    card.className = 'doc-profile reveal';
    card.innerHTML =
      '<div class="doc-profile__avatar">' + doctorAvatar(doc) + '</div>' +
      '<h3 class="doc-profile__name">' + doc.fullName + '</h3>' +
      '<p class="doc-profile__spec">' + doc.spec + '</p>' +
      '<p class="doc-profile__exp">' + doc.exp + '</p>' +
      '<p class="doc-profile__motto">' + doc.motto + '</p>';
    grid.appendChild(card);
  });
}

/* ---------- Отзывы: карусель ---------- */
function initReviews() {
  var track = $('#reviews-track');
  if (!track) return;
  var dotsBox = $('#reviews-dots');
  var index = 0;
  var timer = null;

  REVIEWS.forEach(function (r, i) {
    var slide = document.createElement('figure');
    slide.className = 'review';
    slide.innerHTML =
      '<svg class="review__quote-mark" viewBox="0 0 42 42" fill="currentColor" aria-hidden="true"><path d="M12 28c-3.4 0-6-2.8-6-6.6C6 15 10.5 9.6 17 7l2 3.4c-4 2-6.4 4.6-6.8 7.2.6-.3 1.4-.4 2.2-.4 3 0 5.2 2.2 5.2 5.2 0 3.2-2.6 5.6-6 5.6h-1.6Zm17 0c-3.4 0-6-2.8-6-6.6 0-6.4 4.5-11.8 11-14.4l2 3.4c-4 2-6.4 4.6-6.8 7.2.6-.3 1.4-.4 2.2-.4 3 0 5.2 2.2 5.2 5.2 0 3.2-2.6 5.6-6 5.6H29Z"/></svg>' +
      '<blockquote class="review__text">' + r.text + '</blockquote>' +
      '<figcaption><div class="review__author">' + r.author + '</div><div class="review__pet">' + r.pet + '</div></figcaption>';
    track.appendChild(slide);

    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'reviews__dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
    dot.addEventListener('click', function () { go(i); restart(); });
    dotsBox.appendChild(dot);
  });

  var dots = $all('.reviews__dot', dotsBox);

  function go(i) {
    index = (i + REVIEWS.length) % REVIEWS.length;
    track.style.transform = 'translateX(-' + index * 100 + '%)';
    dots.forEach(function (d, n) { d.classList.toggle('is-active', n === index); });
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(function () { go(index + 1); }, 7000);
  }

  $('#rev-prev').addEventListener('click', function () { go(index - 1); restart(); });
  $('#rev-next').addEventListener('click', function () { go(index + 1); restart(); });

  var carousel = $('#reviews-carousel');
  carousel.addEventListener('mouseenter', function () { clearInterval(timer); });
  carousel.addEventListener('mouseleave', restart);

  /* Свайп на мобильных */
  var startX = null;
  track.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    startX = null;
    restart();
  }, { passive: true });

  restart();
}

/* ---------- Форма в контактах ---------- */
function initContactForm() {
  var form = $('#contact-form');
  if (!form) return;
  var errorBox = $('#contact-error');
  var success = $('#contact-success');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#cf-name').value.trim();
    var phone = $('#cf-phone').value.replace(/\D/g, '');
    if (name.length < 2) {
      errorBox.textContent = 'Подскажите, как к вам обращаться.';
      return;
    }
    if (phone.length < 11) {
      errorBox.textContent = 'Проверьте номер телефона, пожалуйста.';
      return;
    }
    errorBox.textContent = '';
    success.hidden = false;
  });

  /* Мягкая маска телефона в обеих формах */
  ['#cf-phone', '#bk-phone'].forEach(function (sel) {
    var input = $(sel);
    if (!input) return;
    input.addEventListener('input', function () {
      var digits = input.value.replace(/\D/g, '');
      input.value = digits ? formatPhone(digits) : '';
    });
  });
}

/* ---------- Запуск ---------- */
document.addEventListener('DOMContentLoaded', function () {
  initHeader();
  initDoctors();   /* до initReveal — чтобы профили тоже анимировались */
  initReveal();
  initOnDuty();
  initWebcamClock();
  initBooking();
  initPrices();
  initReviews();
  initContactForm();
});
