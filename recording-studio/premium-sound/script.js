/* ============================================================
   ПРЕМИУМ САУНД — ванильный JS: визуализаторы, бронирование,
   переключатель до/после, карусель отзывов, reveal-анимации
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Утилиты ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const fmtPrice = (n) => n.toLocaleString('ru-RU') + ' ₽';

  /* ============================================================
     1. HEADER: тень при скролле + бургер-меню
     ============================================================ */
  const header = $('#header');
  const burger = $('#burger');
  const nav = $('#nav');

  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  $$('.nav__link', nav).forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ============================================================
     2. ЖИВЫЕ ВИЗУАЛИЗАТОРЫ: hero-бары, live-полоса, VU-стрелки
     ============================================================ */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function buildBars(container, count) {
    if (!container) return [];
    const frag = document.createDocumentFragment();
    const bars = [];
    for (let i = 0; i < count; i++) {
      const bar = document.createElement('i');
      frag.appendChild(bar);
      bars.push(bar);
    }
    container.appendChild(frag);
    return bars;
  }

  const heroBars = buildBars($('#heroBars'), 64);
  const liveBars = buildBars($('#liveBars'), 72);
  const liveDb = $('#liveDb');
  const vuL = $('#vuNeedleL');
  const vuR = $('#vuNeedleR');

  // Псевдо-музыкальный уровень: сумма синусов + шум = «трек играет»
  function levelAt(i, t, seed) {
    const bass = Math.abs(Math.sin(t * 2.2 + i * 0.08 + seed));           // басовая пульсация
    const mid = Math.abs(Math.sin(t * 3.7 + i * 0.31 + seed * 2));        // середина
    const noise = Math.abs(Math.sin(t * 9.1 + i * 1.7) * Math.cos(t * 5.3 + i * 0.9));
    const center = 1 - Math.abs(i - 32) / 46;                              // спектр ярче в центре
    return Math.min(1, (bass * 0.45 + mid * 0.3 + noise * 0.35) * (0.35 + center * 0.75) + 0.06);
  }

  let rafT = 0;
  let lastFrame = 0;
  function animateVisuals(ts) {
    requestAnimationFrame(animateVisuals);
    if (ts - lastFrame < 66) return; // ~15 fps — достаточно плавно и дёшево
    lastFrame = ts;
    rafT += 0.09;

    for (let i = 0; i < heroBars.length; i++) {
      heroBars[i].style.height = (levelAt(i, rafT, 1) * 100).toFixed(1) + '%';
    }
    let sum = 0;
    for (let i = 0; i < liveBars.length; i++) {
      const v = levelAt(i, rafT, 7);
      sum += v;
      liveBars[i].style.height = (v * 100).toFixed(1) + '%';
    }
    const avg = sum / liveBars.length;
    if (liveDb) liveDb.textContent = (-(20 - avg * 18)).toFixed(1) + ' dB';
    if (vuL) vuL.style.transform = 'rotate(' + (-46 + levelAt(8, rafT, 3) * 88).toFixed(1) + 'deg)';
    if (vuR) vuR.style.transform = 'rotate(' + (-46 + levelAt(24, rafT, 5) * 88).toFixed(1) + 'deg)';
  }
  if (!reduceMotion && (heroBars.length || liveBars.length)) {
    requestAnimationFrame(animateVisuals);
  } else {
    // Статичный спектр при reduced motion
    [...heroBars, ...liveBars].forEach((b, i) => { b.style.height = (20 + 40 * Math.abs(Math.sin(i))) + '%'; });
  }

  /* ============================================================
     3. БРОНИРОВАНИЕ: комната → инженер → день/час → цена
     ============================================================ */
  const ROOMS = [
    { id: 'vocal', name: 'Вокальная', desc: 'Кабина с Neumann U87, до 2 артистов', price: 1500 },
    { id: 'big', name: 'Большая', desc: '32 м² для живой записи, до 6 музыкантов', price: 2500 },
    { id: 'console', name: 'Пультовая', desc: 'Сведение и мастеринг на Genelec', price: 2000 },
  ];
  const ENGINEERS = [
    { id: 'artem', name: 'Артём Ветров', desc: 'Главный инженер · 15 лет', ach: '120+ релизов · радио', add: 500 },
    { id: 'maria', name: 'Мария Соколова', desc: 'Вокал-продюсер · 9 лет', ach: '300+ сессий · лейблы', add: 300 },
    { id: 'igor', name: 'Игорь Ганин', desc: 'Инженер записи · 7 лет', ach: '80+ живых сессий', add: 0 },
  ];
  const DURATIONS = [2, 3, 4];
  const HOURS = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  const DOW = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

  const state = { room: null, eng: null, day: null, slot: null, dur: 2 };

  const roomGrid = $('#roomGrid');
  const engGrid = $('#engGrid');
  const dayRow = $('#dayRow');
  const slotGrid = $('#slotGrid');
  const durRow = $('#durRow');
  const priceValue = $('#priceValue');
  const priceHint = $('#priceHint');
  const bookingSummary = $('#bookingSummary');
  const bookBtn = $('#bookBtn');
  const bookingPanel = $('#bookingPanel');
  const bookingSuccess = $('#bookingSuccess');
  const bookingNumber = $('#bookingNumber');
  const bookingDetails = $('#bookingDetails');
  const bookAgainBtn = $('#bookAgainBtn');
  const displayLeds = $$('.display__leds i');

  // --- Дни: ближайшие 7 дней ---
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }

  // Занятость слотов: детерминированный «планировщик» по дню и комнате
  function isSlotBusy(dayIndex, hour, roomId) {
    const roomShift = roomId ? roomId.length : 3;
    return ((dayIndex * 7 + hour * 3 + roomShift * 5) % 4) === 0;
  }

  function dayLabel(d, index) {
    if (index === 0) return 'сегодня';
    if (index === 1) return 'завтра';
    return DOW[d.getDay()] + ' ' + d.getDate();
  }

  // --- Рендер опций ---
  function renderRooms() {
    roomGrid.innerHTML = '';
    ROOMS.forEach((room) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'opt' + (state.room === room.id ? ' selected' : '');
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(state.room === room.id));
      btn.innerHTML =
        '<span class="opt__name">' + room.name + '</span>' +
        '<span class="opt__desc">' + room.desc + '</span>' +
        '<span class="opt__price">' + fmtPrice(room.price) + '/час</span>';
      btn.addEventListener('click', () => {
        state.room = room.id;
        state.slot = null; // занятость зависит от комнаты
        renderRooms();
        renderSlots();
        updateDisplay();
      });
      roomGrid.appendChild(btn);
    });
  }

  function renderEngineers() {
    engGrid.innerHTML = '';
    ENGINEERS.forEach((eng) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'opt' + (state.eng === eng.id ? ' selected' : '');
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(state.eng === eng.id));
      btn.innerHTML =
        '<span class="opt__name">' + eng.name + '</span>' +
        '<span class="opt__desc">' + eng.desc + '</span>' +
        '<span class="opt__ach">' + eng.ach + '</span>' +
        '<span class="opt__price">' + (eng.add ? '+' + fmtPrice(eng.add) + '/час' : 'включён в цену') + '</span>';
      btn.addEventListener('click', () => {
        state.eng = eng.id;
        renderEngineers();
        updateDisplay();
      });
      engGrid.appendChild(btn);
    });
  }

  function renderDays() {
    dayRow.innerHTML = '';
    days.forEach((d, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'day' + (state.day === i ? ' selected' : '');
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(state.day === i));
      btn.innerHTML =
        '<span class="day__dow">' + (i === 0 ? 'сег' : i === 1 ? 'завт' : DOW[d.getDay()]) + '</span>' +
        '<span class="day__num">' + d.getDate() + '</span>';
      btn.addEventListener('click', () => {
        state.day = i;
        state.slot = null;
        renderDays();
        renderSlots();
        updateDisplay();
      });
      dayRow.appendChild(btn);
    });
  }

  function renderSlots() {
    slotGrid.innerHTML = '';
    if (state.day === null) {
      slotGrid.innerHTML = '<p class="bstep__durlabel">Сначала выберите день — свободные часы подсветятся.</p>';
      return;
    }
    HOURS.forEach((h) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const busy = isSlotBusy(state.day, h, state.room);
      btn.className = 'slot' + (state.slot === h ? ' selected' : '');
      btn.textContent = String(h).padStart(2, '0') + ':00';
      btn.disabled = busy;
      btn.title = busy ? 'Занято' : 'Свободно';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(state.slot === h));
      btn.addEventListener('click', () => {
        state.slot = h;
        renderSlots();
        updateDisplay();
      });
      slotGrid.appendChild(btn);
    });
  }

  function renderDurations() {
    durRow.innerHTML = '';
    DURATIONS.forEach((dur) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dur' + (state.dur === dur ? ' selected' : '');
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(state.dur === dur));
      btn.textContent = dur + ' ч';
      btn.addEventListener('click', () => {
        state.dur = dur;
        renderDurations();
        updateDisplay();
      });
      durRow.appendChild(btn);
    });
  }

  // --- Цена и дисплей ---
  function currentRoom() { return ROOMS.find((r) => r.id === state.room) || null; }
  function currentEng() { return ENGINEERS.find((e) => e.id === state.eng) || null; }

  function updateDisplay() {
    const room = currentRoom();
    const eng = currentEng();
    const steps = [!!room, !!eng, state.day !== null, state.slot !== null, !!state.dur];
    displayLeds.forEach((led, i) => led.classList.toggle('on', steps[i]));

    const complete = room && eng && state.day !== null && state.slot !== null;
    const rate = (room ? room.price : 0) + (eng ? eng.add : 0);
    const total = rate * state.dur;

    priceValue.textContent = rate > 0 ? fmtPrice(total) : '0 ₽';
    priceValue.classList.remove('tick');
    void priceValue.offsetWidth; // перезапуск анимации
    priceValue.classList.add('tick');

    let hint;
    if (!room) hint = 'Выберите комнату';
    else if (!eng) hint = 'Выберите звукоинженера';
    else if (state.day === null) hint = 'Выберите день';
    else if (state.slot === null) hint = 'Выберите свободный час';
    else hint = 'Всё готово — можно бронировать';
    priceHint.textContent = hint;

    const lines = [];
    if (room) lines.push('ROOM  > ' + room.name + ' · ' + fmtPrice(room.price) + '/ч');
    if (eng) lines.push('ENG   > ' + eng.name + (eng.add ? ' +' + fmtPrice(eng.add) + '/ч' : ' · вкл.'));
    if (state.day !== null) lines.push('DATE  > ' + dayLabel(days[state.day], state.day));
    if (state.slot !== null) lines.push('TIME  > ' + String(state.slot).padStart(2, '0') + ':00–' + String(state.slot + state.dur).padStart(2, '0') + ':00 · ' + state.dur + ' ч');
    bookingSummary.textContent = lines.join('\n');

    bookBtn.disabled = !complete;
  }

  // --- Отправка: экран успеха с номером брони ---
  bookBtn.addEventListener('click', () => {
    const room = currentRoom();
    const eng = currentEng();
    if (!room || !eng || state.day === null || state.slot === null) return;

    const num = 'PS-' + String(Math.floor(1000 + Math.random() * 9000));
    const total = (room.price + eng.add) * state.dur;
    const endHour = state.slot + state.dur;

    bookingNumber.textContent = 'БРОНЬ № ' + num;
    bookingDetails.textContent =
      room.name + ' · ' + eng.name + ' · ' +
      dayLabel(days[state.day], state.day) + ', ' +
      String(state.slot).padStart(2, '0') + ':00–' + String(endHour).padStart(2, '0') + ':00. ' +
      'К оплате на месте: ' + fmtPrice(total) + '.';

    bookingPanel.hidden = true;
    bookingSuccess.hidden = false;
    bookingSuccess.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  });

  bookAgainBtn.addEventListener('click', () => {
    state.room = null;
    state.eng = null;
    state.day = null;
    state.slot = null;
    state.dur = 2;
    renderRooms();
    renderEngineers();
    renderDays();
    renderSlots();
    renderDurations();
    updateDisplay();
    bookingSuccess.hidden = true;
    bookingPanel.hidden = false;
    bookingPanel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });

  renderRooms();
  renderEngineers();
  renderDays();
  renderSlots();
  renderDurations();
  updateDisplay();

  /* ============================================================
     4. ДИНАМИЧЕСКОЕ «БЛИЖАЙШЕЕ СВОБОДНОЕ ОКНО»
     ============================================================ */
  const nearestSlotEl = $('#nearestSlot');
  function findNearestSlot() {
    const nowHour = new Date().getHours();
    for (let di = 0; di < days.length; di++) {
      for (const h of HOURS) {
        if (di === 0 && h <= nowHour + 1) continue; // нужен запас минимум 2 часа
        if (!isSlotBusy(di, h, 'vocal')) {
          return { dayIndex: di, hour: h };
        }
      }
    }
    return null;
  }
  const nearest = findNearestSlot();
  if (nearest && nearestSlotEl) {
    nearestSlotEl.textContent = dayLabel(days[nearest.dayIndex], nearest.dayIndex) + ', ' + String(nearest.hour).padStart(2, '0') + ':00';
  }

  /* ============================================================
     5. ПЕРЕКЛЮЧАТЕЛЬ «ДО / ПОСЛЕ СВЕДЕНИЯ»
     ============================================================ */
  const diffToggle = $('#diffToggle');
  const diffPanel = diffToggle ? diffToggle.closest('.diff__panel') : null;
  const waveBefore = $('#waveBefore');
  const waveAfter = $('#waveAfter');
  const labelBefore = $('#labelBefore');
  const labelAfter = $('#labelAfter');
  const diffTexts = $$('.diff__text');

  function setDiff(after) {
    diffToggle.setAttribute('aria-checked', String(after));
    diffPanel.classList.toggle('is-after', after);
    waveBefore.classList.toggle('is-active', !after);
    waveAfter.classList.toggle('is-active', after);
    labelBefore.classList.toggle('on', !after);
    labelAfter.classList.toggle('on', after);
    diffTexts.forEach((el) => {
      el.textContent = after ? el.dataset.after : el.dataset.before;
    });
  }
  if (diffToggle) {
    labelBefore.classList.add('on');
    diffToggle.addEventListener('click', () => {
      setDiff(diffToggle.getAttribute('aria-checked') !== 'true');
    });
  }

  /* ============================================================
     6. КАРУСЕЛЬ ОТЗЫВОВ
     ============================================================ */
  const track = $('#reviewsTrack');
  const dotsWrap = $('#revDots');
  const prevBtn = $('#revPrev');
  const nextBtn = $('#revNext');
  const reviewCount = track ? track.children.length : 0;
  let revIndex = 0;
  let revTimer = null;

  function goToReview(i) {
    revIndex = (i + reviewCount) % reviewCount;
    track.style.transform = 'translateX(-' + revIndex * 100 + '%)';
    $$('.reviews__dot', dotsWrap).forEach((dot, di) => {
      dot.classList.toggle('active', di === revIndex);
      dot.setAttribute('aria-selected', String(di === revIndex));
    });
  }
  function startAuto() {
    stopAuto();
    revTimer = setInterval(() => goToReview(revIndex + 1), 6500);
  }
  function stopAuto() {
    if (revTimer) clearInterval(revTimer);
    revTimer = null;
  }

  if (track && reviewCount > 0) {
    for (let i = 0; i < reviewCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'reviews__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
      dot.addEventListener('click', () => { goToReview(i); startAuto(); });
      dotsWrap.appendChild(dot);
    }
    prevBtn.addEventListener('click', () => { goToReview(revIndex - 1); startAuto(); });
    nextBtn.addEventListener('click', () => { goToReview(revIndex + 1); startAuto(); });
    const carousel = $('#reviewsCarousel');
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);
    if (!reduceMotion) startAuto();
  }

  /* ============================================================
     7. REVEAL-АНИМАЦИИ ПРИ СКРОЛЛЕ
     ============================================================ */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 0.08 + 's';
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }
});
