/* ============================================
   МЕРИДИАН — логика лендинга
   Ванильный JS, без библиотек.
   ============================================ */
'use strict';

/* ---------- демо-данные зон лаунджа ---------- */
var ZONES = {
  cabin1: { name: 'Кабина 1', type: 'VIP-кабина', bookable: true, price: 700, seats: '2 места',
    equip: ['2 станции RTX 4080', 'Мониторы 27" · 360 Гц', 'Дверь и шумоизоляция', 'Подача из бара в кабину'] },
  cabin2: { name: 'Кабина 2', type: 'VIP-кабина', bookable: true, price: 700, seats: '2 места',
    equip: ['2 станции RTX 4080', 'Мониторы 27" · 360 Гц', 'Дверь и шумоизоляция', 'Подача из бара в кабину'] },
  cabin3: { name: 'Кабина 3', type: 'VIP-кабина', bookable: true, price: 1200, seats: '4 места',
    equip: ['4 станции RTX 4080', 'Мониторы 27" · 360 Гц', 'Свой командный канал связи', 'Диван для «запасного»'] },
  cabin4: { name: 'Кабина 4', type: 'VIP-кабина', bookable: true, price: 1200, seats: '4 места',
    equip: ['4 станции RTX 4080', 'Мониторы 27" · 360 Гц', 'Свой командный канал связи', 'Диван для «запасного»'] },
  cabin5: { name: 'Кабина 5', type: 'VIP-кабина', bookable: true, price: 1600, seats: '6 мест',
    equip: ['6 станций RTX 4080', 'Мониторы 27" · 360 Гц', 'Полная пятёрка + тренер', 'Отдельный санузел рядом'] },
  cabin6: { name: 'Кабина 6', type: 'VIP-кабина', bookable: true, price: 1600, seats: '6 мест',
    equip: ['6 станций RTX 4080', 'Мониторы 27" · 360 Гц', 'Полная пятёрка + тренер', 'Отдельный санузел рядом'] },
  arena: { name: 'Боевой зал', type: '10 станций в ряд', bookable: true, price: 1900, seats: 'ряд из 5 станций',
    equip: ['5 станций RTX 4080 плечом к плечу', 'Турнирный режим и свой сервер', 'Второй ряд — по запросу', 'Подача из кухни к станциям'] },
  ps5: { name: 'Консольная зона', type: 'PS5 · диваны', bookable: true, price: 900, seats: 'до 6 гостей',
    equip: ['2 консоли PS5', 'Экран 65" · 4K · 120 Гц', 'Два глубоких дивана', '80+ игр, 4 геймпада'] },
  lounge: { name: 'Лаундж', type: 'общая зона', bookable: false, price: 0, seats: 'диваны и настолки',
    equip: ['Включён в любую бронь', 'Настольные игры и кальянная карта', 'Тихая музыка после полуночи'] },
  bar: { name: 'Кухня и бар', type: 'общая зона', bookable: false, price: 0, seats: 'шеф до 4 утра',
    equip: ['Включён в любую бронь', 'Подача прямо в кабину', 'Авторская барная карта'] }
};

var CABIN_IDS = ['cabin1', 'cabin2', 'cabin3', 'cabin4', 'cabin5', 'cabin6'];

/* ---------- детерминированный «график занятости» ---------- */
function seededRand(seed) {
  var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function zoneIndex(id) {
  var keys = Object.keys(ZONES);
  for (var i = 0; i < keys.length; i++) { if (keys[i] === id) return i; }
  return 0;
}
/* занята ли зона в конкретный абсолютный час (непрерывность между днями) */
function isBusyAt(id, absHour) {
  return seededRand(zoneIndex(id) * 997 + absHour * 13.73) < 0.34;
}
function absHourOf(date) {
  return Math.floor(date.getTime() / 3600000);
}
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function dayLabel(date) {
  var now = new Date();
  var d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  var diff = Math.round((d1 - d0) / 86400000);
  if (diff <= 0) return 'сегодня';
  if (diff === 1) return 'завтра';
  return 'послезавтра';
}
function fmtMoney(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
}

/* статус зоны на «сейчас»: { busy, label } */
function zoneStatus(id) {
  if (!ZONES[id].bookable) return { busy: false, label: 'включена в бронь', quiet: true };
  var nowAbs = absHourOf(new Date());
  if (!isBusyAt(id, nowAbs)) return { busy: false, label: 'свободна' };
  var h = nowAbs;
  while (isBusyAt(id, h)) { h++; }
  var freeAt = new Date(h * 3600000);
  return { busy: true, label: 'до ' + pad2(freeAt.getHours()) + ':00' };
}

/* ---------- рендер статусов на карте ---------- */
function renderMapStatuses() {
  var zones = document.querySelectorAll('#loungeMap .zone');
  zones.forEach(function (g) {
    var id = g.getAttribute('data-zone');
    var st = zoneStatus(id);
    var statusEl = g.querySelector('.zone-status');
    if (statusEl) statusEl.textContent = st.label;
    g.classList.toggle('is-busy', st.busy);
    var label = ZONES[id].name + ', ' + ZONES[id].seats + ' — ' + (st.busy ? 'занята ' + st.label : st.label);
    g.setAttribute('aria-label', label);
  });
}

/* ---------- бейдж свободных кабин ---------- */
function renderFreeBadge() {
  var free = 0;
  CABIN_IDS.forEach(function (id) { if (!zoneStatus(id).busy) free++; });
  var text;
  if (free > 0) {
    text = 'Сейчас свободн' + (free === 1 ? 'а' : 'ы') + ' ' + free + ' ' + plural(free, 'кабина', 'кабины', 'кабин') + ' из 6';
  } else {
    text = 'Сейчас всё занято — ' + nearestSlotText();
  }
  var badge = document.getElementById('freeBadge');
  var hint = document.getElementById('bookingHint');
  if (badge) badge.textContent = text;
  if (hint) hint.textContent = text;
}
function plural(n, one, few, many) {
  var m = n % 10, h = n % 100;
  if (m === 1 && h !== 11) return one;
  if (m >= 2 && m <= 4 && (h < 10 || h >= 20)) return few;
  return many;
}

/* ---------- ближайшая свободная кабина ---------- */
function nearestSlotText() {
  var nowAbs = absHourOf(new Date());
  for (var h = nowAbs; h < nowAbs + 48; h++) {
    for (var i = 0; i < CABIN_IDS.length; i++) {
      if (!isBusyAt(CABIN_IDS[i], h)) {
        var d = new Date(h * 3600000);
        if (h === nowAbs) return 'свободны прямо сейчас';
        return dayLabel(d) + ' в ' + pad2(d.getHours()) + ':00';
      }
    }
  }
  return 'уточняйте по телефону';
}
function renderNearestSlot() {
  var el = document.getElementById('nearestSlot');
  if (el) el.textContent = nearestSlotText();
}

/* ---------- бронирование в 3 клика ---------- */
var booking = { zoneId: null, hours: 2 };

function selectZone(id) {
  booking.zoneId = id;
  booking.hours = 2;

  document.querySelectorAll('#loungeMap .zone').forEach(function (g) {
    g.classList.toggle('selected', g.getAttribute('data-zone') === id);
  });

  var z = ZONES[id];
  var st = zoneStatus(id);

  document.getElementById('bookingEmpty').hidden = true;
  document.getElementById('bkSuccess').hidden = true;
  document.getElementById('bookingBody').hidden = false;

  document.getElementById('bkType').textContent = z.type + ' · ' + z.seats;
  document.getElementById('bkName').textContent = z.name;

  var statusEl = document.getElementById('bkStatus');
  statusEl.textContent = st.busy ? 'Сейчас занята — ' + st.label : 'Свободна — можно заходить';
  statusEl.classList.toggle('busy', st.busy);

  var equip = document.getElementById('bkEquip');
  equip.innerHTML = '';
  z.equip.forEach(function (item) {
    var li = document.createElement('li');
    li.textContent = item;
    equip.appendChild(li);
  });

  var bookableOnly = document.querySelectorAll('.booking-price-row, .booking-hours, .booking-total, .booking-phone, #bkSubmit, .booking-note');
  bookableOnly.forEach(function (el) { el.style.display = z.bookable ? '' : 'none'; });

  if (z.bookable) {
    document.getElementById('bkPrice').textContent = fmtMoney(z.price) + '/час';
    document.querySelector('.booking-note').textContent = 'Бронь в 3 клика: кабина → часы → подтверждение.';
    updateBookingTotal();
  } else {
    var note = document.querySelector('.booking-note');
    note.style.display = '';
    note.textContent = 'Общая зона — включена в любую бронь кабины.';
  }

  var panel = document.querySelector('.booking');
  if (window.innerWidth < 1024 && panel) {
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function updateBookingTotal() {
  var z = ZONES[booking.zoneId];
  if (!z) return;
  document.getElementById('bkHours').textContent = booking.hours;
  document.getElementById('bkTotal').textContent = fmtMoney(z.price * booking.hours);
}

function submitBooking() {
  var z = ZONES[booking.zoneId];
  if (!z || !z.bookable) return;

  var phone = document.getElementById('bkPhone');
  var digits = phone.value.replace(/\D/g, '');
  if (digits.length < 10) {
    phone.classList.add('error');
    phone.focus();
    setTimeout(function () { phone.classList.remove('error'); }, 1600);
    return;
  }

  /* старт — следующий полный час */
  var start = new Date(Math.ceil(Date.now() / 3600000) * 3600000);
  var end = new Date(start.getTime() + booking.hours * 3600000);
  var span = dayLabel(start) + ' ' + pad2(start.getHours()) + ':00–' + pad2(end.getHours()) + ':00';

  document.getElementById('bkSuccessText').textContent =
    z.name + ' · ' + span + ' · ' + booking.hours + ' ' +
    plural(booking.hours, 'час', 'часа', 'часов') + ' · ' + fmtMoney(z.price * booking.hours);

  document.getElementById('bookingBody').hidden = true;
  document.getElementById('bkSuccess').hidden = false;
}

function resetBooking() {
  document.getElementById('bkSuccess').hidden = true;
  document.getElementById('bookingBody').hidden = true;
  document.getElementById('bookingEmpty').hidden = false;
  document.getElementById('bkPhone').value = '';
  document.querySelectorAll('#loungeMap .zone.selected').forEach(function (g) { g.classList.remove('selected'); });
  booking.zoneId = null;
}

/* ---------- счётчик «ночей сыграно» ---------- */
function animateCounter() {
  var el = document.getElementById('nightsCounter');
  if (!el) return;
  var now = new Date();
  var target = 118 + now.getDate() * 9; /* правдоподобное число к концу месяца */
  var start = null;
  var duration = 2200;
  function step(ts) {
    if (!start) start = ts;
    var p = Math.min((ts - start) / duration, 1);
    var eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---------- карусель отзывов ---------- */
function initCarousel() {
  var track = document.getElementById('revTrack');
  var dotsWrap = document.getElementById('revDots');
  if (!track || !dotsWrap) return;
  var slides = track.children;
  var count = slides.length;
  var index = 0;
  var timer = null;

  for (var i = 0; i < count; i++) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
    (function (n) {
      dot.addEventListener('click', function () { goTo(n); restart(); });
    })(i);
    dotsWrap.appendChild(dot);
  }
  var dots = dotsWrap.children;

  function goTo(n) {
    index = (n + count) % count;
    track.style.transform = 'translateX(-' + index * 100 + '%)';
    for (var i = 0; i < count; i++) dots[i].classList.toggle('active', i === index);
  }
  function restart() {
    if (timer) clearInterval(timer);
    timer = setInterval(function () { goTo(index + 1); }, 7000);
  }

  document.getElementById('revPrev').addEventListener('click', function () { goTo(index - 1); restart(); });
  document.getElementById('revNext').addEventListener('click', function () { goTo(index + 1); restart(); });

  goTo(0);
  restart();
}

/* ---------- появление при скролле ---------- */
function initReveal() {
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
        if (entry.target.querySelector('#nightsCounter') || entry.target.id === 'nightsCounter') {
          animateCounter();
        }
      }
    });
  }, { threshold: 0.14 });
  items.forEach(function (el, i) {
    /* лёгкий каскад внутри одной сетки */
    el.style.setProperty('--d', (i % 4) * 0.12 + 's');
    io.observe(el);
  });
}

/* ---------- шапка и бургер ---------- */
function initHeader() {
  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var mobileNav = document.getElementById('mobileNav');

  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  burger.addEventListener('click', function () {
    var open = mobileNav.hidden;
    mobileNav.hidden = !open;
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  mobileNav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      mobileNav.hidden = true;
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- финальная форма ---------- */
function initCtaForm() {
  var form = document.getElementById('ctaForm');
  var success = document.getElementById('ctaSuccess');
  if (!form || !success) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var phone = document.getElementById('ctaPhone');
    var digits = phone.value.replace(/\D/g, '');
    if (digits.length < 10) {
      phone.classList.add('error');
      phone.focus();
      setTimeout(function () { phone.classList.remove('error'); }, 1600);
      return;
    }
    var name = document.getElementById('ctaName').value.trim();
    var text = 'Администратор перезвонит в течение 10 минут и подтвердит бронь';
    var slot = nearestSlotText();
    if (slot.indexOf('уточняйте') === -1) {
      text += ' — ближайшая кабина ' + slot.replace('свободны прямо сейчас', 'уже свободна');
    }
    document.getElementById('ctaSuccessText').textContent =
      (name ? name + ', спасибо! ' : 'Спасибо! ') + text + '.';
    form.hidden = true;
    success.hidden = false;
    success.classList.add('in');
  });
}

/* ---------- инициализация ---------- */
document.addEventListener('DOMContentLoaded', function () {
  renderMapStatuses();
  renderFreeBadge();
  renderNearestSlot();
  initReveal();
  initHeader();
  initCarousel();
  initCtaForm();

  document.querySelectorAll('#loungeMap .zone').forEach(function (g) {
    var id = g.getAttribute('data-zone');
    g.addEventListener('click', function () { selectZone(id); });
    g.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectZone(id); }
    });
  });

  document.getElementById('bkMinus').addEventListener('click', function () {
    if (booking.hours > 1) { booking.hours--; updateBookingTotal(); }
  });
  document.getElementById('bkPlus').addEventListener('click', function () {
    if (booking.hours < 12) { booking.hours++; updateBookingTotal(); }
  });
  document.getElementById('bkSubmit').addEventListener('click', submitBooking);
  document.getElementById('bkAgain').addEventListener('click', resetBooking);

  document.getElementById('year').textContent = new Date().getFullYear();

  /* обновляем статусы каждые 5 минут */
  setInterval(function () {
    renderMapStatuses();
    renderFreeBadge();
    renderNearestSlot();
  }, 300000);
});
