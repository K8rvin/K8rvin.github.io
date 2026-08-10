/* ============================================================
   VET·OS — логика лендинга (vanilla JS)
   ============================================================ */
'use strict';

/* ---------- Утилиты ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* Детерминированный генератор, чтобы расписание было стабильным */
function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const RU_DAYS = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
const RU_MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

/* ============================================================
   ДАННЫЕ
   ============================================================ */
const AV_GRADS = ['g-av1', 'g-av2', 'g-av3', 'g-av4'];

function doctorAvatar(name, gradId, size) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('');
  return `<svg class="doc-pick__avatar" viewBox="0 0 72 72" width="${size}" height="${size}" aria-hidden="true">
    <circle cx="36" cy="36" r="34" fill="url(#${gradId})" opacity="0.22"/>
    <circle cx="36" cy="36" r="34" fill="none" stroke="url(#${gradId})" stroke-width="2"/>
    <circle cx="36" cy="36" r="26" fill="#0C1220" opacity="0.55"/>
    <text x="36" y="43" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="21" fill="#F4F8FF">${initials}</text>
    <path d="M14 62 C20 52 52 52 58 62" fill="none" stroke="url(#${gradId})" stroke-width="2" opacity="0.7"/>
  </svg>`;
}

const DOCTORS = [
  { id: 'd1', name: 'Алина Соколова', spec: 'Терапевт, кардиолог', rating: 4.9, exp: 9, pets: 3210, online: true, grad: 0 },
  { id: 'd2', name: 'Марк Ветров', spec: 'Хирург, ортопед', rating: 4.8, exp: 12, pets: 4180, online: true, grad: 1 },
  { id: 'd3', name: 'Ольга Лазарева', spec: 'УЗИ-диагностика', rating: 5.0, exp: 7, pets: 2540, online: true, grad: 2 },
  { id: 'd4', name: 'Тимур Гареев', spec: 'Дерматолог, стоматолог', rating: 4.9, exp: 8, pets: 2860, online: false, grad: 3 },
];

const SERVICES = [
  { id: 'SVC-01', title: 'Терапия', desc: 'Диагностика и лечение: от ОРВИ до хронических состояний.', time: '~40 мин', price: 'от 1 800 ₽',
    icon: '<path d="M24 8v32M8 24h32" stroke="url(#g-mint)" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="24" r="17" fill="none" stroke="url(#g-mint)" stroke-width="2.4"/>' },
  { id: 'SVC-02', title: 'Хирургия', desc: 'Плановые и экстренные операции с газовым наркозом.', time: 'от 1 ч', price: 'от 6 500 ₽',
    icon: '<path d="M10 34 30 14l6 6-20 20H10z" fill="none" stroke="url(#g-mint)" stroke-width="2.4" stroke-linejoin="round"/><path d="M30 14l5-5 6 6-5 5" fill="none" stroke="#5AA9FF" stroke-width="2.4" stroke-linejoin="round"/>' },
  { id: 'SVC-03', title: 'УЗИ', desc: 'Экспертный аппарат: сердце, брюшная полость, беременность.', time: '~25 мин', price: 'от 2 200 ₽',
    icon: '<rect x="8" y="8" width="32" height="24" rx="5" fill="none" stroke="url(#g-mint)" stroke-width="2.4"/><path d="M14 20h6l3-6 4 11 3-5h4" fill="none" stroke="#5AA9FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' },
  { id: 'SVC-04', title: 'Лаборатория', desc: 'Биохимия, ОАК, ПЦР. Результат за 40 минут — сразу в Telegram.', time: '40 мин', price: 'от 1 400 ₽',
    icon: '<path d="M19 8h10v10l7 15a5 5 0 0 1-4.5 8h-15A5 5 0 0 1 12 33l7-15z" fill="none" stroke="url(#g-mint)" stroke-width="2.4" stroke-linejoin="round"/><path d="M16 30h16" stroke="#5AA9FF" stroke-width="2.2" stroke-linecap="round"/>' },
  { id: 'SVC-05', title: 'Стоматология', desc: 'Ультразвуковая чистка, удаление, лечение дёсен под седацией.', time: '~50 мин', price: 'от 3 800 ₽',
    icon: '<path d="M14 10c6-4 14-4 20 0 4 3 5 9 3 15l-3 13a3.5 3.5 0 0 1-6.8-1L25 28h-2l-2.2 9a3.5 3.5 0 0 1-6.8 1l-3-13c-2-6-1-12 3-15z" fill="none" stroke="url(#g-mint)" stroke-width="2.4" stroke-linejoin="round"/>' },
  { id: 'SVC-06', title: 'Вакцинация', desc: 'Комплексные прививки с паспортом и напоминаниями в боте.', time: '~20 мин', price: 'от 1 600 ₽',
    icon: '<path d="M28 8l12 12M18 30 8 40l2 2 2-2" stroke="url(#g-mint)" stroke-width="2.4" stroke-linecap="round"/><rect x="16" y="12" width="16" height="11" rx="3" transform="rotate(45 24 17.5)" fill="none" stroke="url(#g-mint)" stroke-width="2.4"/>' },
  { id: 'SVC-07', title: 'Выезд на дом', desc: 'Врач приедет с переносной лабораторией в течение 2 часов.', time: 'приезд 2 ч', price: 'от 2 900 ₽',
    icon: '<path d="M8 36V20L24 8l16 12v16" fill="none" stroke="url(#g-mint)" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 22v10M19 27h10" stroke="#5AA9FF" stroke-width="2.6" stroke-linecap="round"/>' },
];

const PET_TYPES = [
  { id: 'cat', label: 'Кошка', icon: '<path d="M9 15 7 5l8 5M23 15l2-10-8 5" fill="none" stroke="#2EE6A8" stroke-width="2" stroke-linejoin="round"/><circle cx="16" cy="19" r="10" fill="none" stroke="#2EE6A8" stroke-width="2"/><circle cx="12.5" cy="18" r="1.4" fill="#2EE6A8"/><circle cx="19.5" cy="18" r="1.4" fill="#2EE6A8"/>' },
  { id: 'dog', label: 'Собака', icon: '<ellipse cx="16" cy="18" rx="10" ry="9" fill="none" stroke="#2EE6A8" stroke-width="2"/><ellipse cx="8.5" cy="12" rx="3" ry="5.5" fill="none" stroke="#5AA9FF" stroke-width="2"/><ellipse cx="23.5" cy="12" rx="3" ry="5.5" fill="none" stroke="#5AA9FF" stroke-width="2"/><circle cx="12.5" cy="17" r="1.4" fill="#2EE6A8"/><circle cx="19.5" cy="17" r="1.4" fill="#2EE6A8"/>' },
  { id: 'rodent', label: 'Грызун', icon: '<circle cx="16" cy="19" r="9" fill="none" stroke="#2EE6A8" stroke-width="2"/><circle cx="10" cy="11" r="3.4" fill="none" stroke="#5AA9FF" stroke-width="2"/><circle cx="22" cy="11" r="3.4" fill="none" stroke="#5AA9FF" stroke-width="2"/><circle cx="13" cy="18" r="1.3" fill="#2EE6A8"/><circle cx="19" cy="18" r="1.3" fill="#2EE6A8"/>' },
  { id: 'bird', label: 'Птица', icon: '<path d="M16 6c6 0 9 4.5 9 9.5S21 26 16 26 7 21 7 15.5 10 6 16 6z" fill="none" stroke="#2EE6A8" stroke-width="2"/><path d="M25 13l5 2.5-5 2.5z" fill="#5AA9FF"/><circle cx="13" cy="13" r="1.4" fill="#2EE6A8"/><path d="M12 26v4M20 26v4" stroke="#5AA9FF" stroke-width="2" stroke-linecap="round"/>' },
  { id: 'exotic', label: 'Экзот', icon: '<circle cx="16" cy="16" r="11" fill="none" stroke="#2EE6A8" stroke-width="2"/><path d="M16 5a11 11 0 0 1 0 22 7 7 0 0 1 0-15 4 4 0 0 1 0 8" fill="none" stroke="#5AA9FF" stroke-width="2" stroke-linecap="round"/>' },
];

const REVIEWS = [
  {
    text: 'Кот перестал есть ночью, записалась в 8 утра — <b>в 9:20 уже были результаты биохимии</b>. В другой клинике это заняло бы два дня. Врач показала всё на экране и объяснила по-человечески.',
    name: 'Марина К.', meta: 'КОТ ТЕО · КЛИЕНТ С 2024', badge: 'АНАЛИЗЫ ЗА 40 МИН', grad: 'g-av1',
  },
  {
    text: 'Собаку прооперировали в день обращения. Всю операцию следил по статусам в Telegram-боте: «наркоз → операция → просыпается». <b>Это какой-то космос уровня человеческой медицины.</b>',
    name: 'Дмитрий Л.', meta: 'КОРГИ РИЧ · КЛИЕНТ С 2023', badge: 'СТАТУСЫ В БОТЕ', grad: 'g-av2',
  },
  {
    text: 'Паника в час ночи: хорьку плохо. Позвонила — ответили на второй гудок, <b>через 15 минут мы уже были на УЗИ</b>. Врач спокойно всё объяснил, к утру экзот отпустило. Теперь только сюда.',
    name: 'Соня В.', meta: 'ХОРЁК МОТЯ · КЛИЕНТ С 2025', badge: 'ПРИЁМ НОЧЬЮ', grad: 'g-av3',
  },
  {
    text: 'Медкарта в телефоне — гениально. Не надо везти папку документов: прививки, анализы, назначения — всё перед глазами. <b>Запись занимает реально секунд тридцать</b>, проверено на трёх питомцах.',
    name: 'Игорь и Ася', meta: 'КОШКИ БУСЯ И ФЛОСС · С 2024', badge: 'МЕДКАРТА 24/7', grad: 'g-av4',
  },
];

/* ============================================================
   ШАПКА И МЕНЮ
   ============================================================ */
(function initHeader() {
  const header = $('#header');
  const burger = $('#burger');
  const nav = $('#nav');

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  $$('.nav__link, .nav__phone', nav).forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ============================================================
   ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ
   ============================================================ */
(function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));
})();

/* ============================================================
   HERO: пульс и «следующий визит» в медкарте
   ============================================================ */
(function initMedcard() {
  const hr = $('#heart-rate');
  if (hr) {
    let current = 128;
    setInterval(() => {
      const target = 122 + Math.round(Math.random() * 12);
      current += Math.sign(target - current);
      hr.textContent = current;
    }, 900);
  }
  const nv = $('#next-visit');
  if (nv) {
    const d = new Date();
    d.setDate(d.getDate() + 12);
    nv.textContent = `${d.getDate()} ${RU_MONTHS[d.getMonth()]} · 11:20`;
  }
})();

/* ============================================================
   СТАТУС: свободные врачи и ближайшее окно
   ============================================================ */
function computeNearestSlot(now) {
  const d = new Date(now);
  const step = 40; // шаг слотов, мин
  const mins = d.getHours() * 60 + d.getMinutes();
  let next = Math.ceil((mins + 20) / step) * step;
  if (d.getHours() >= 20) {
    d.setDate(d.getDate() + 1);
    next = 9 * 60;
    const hh = String(Math.floor(next / 60)).padStart(2, '0');
    return `завтра ${hh}:00`;
  }
  next = Math.max(next, 9 * 60);
  const hh = String(Math.floor(next / 60)).padStart(2, '0');
  const mm = String(next % 60).padStart(2, '0');
  return `сегодня ${hh}:${mm}`;
}

(function initStatus() {
  const freeEl = $('#free-doctors-count');
  const slotEl = $('#nearest-slot');
  const ctaSlotEl = $('#cta-nearest-slot');
  function update() {
    const now = new Date();
    const rnd = seededRandom(now.getHours() * 100 + now.getMinutes());
    const free = 2 + Math.floor(rnd() * 4); // 2..5 из 7
    if (freeEl) freeEl.textContent = free;
    const slot = computeNearestSlot(now);
    if (slotEl) slotEl.textContent = slot;
    if (ctaSlotEl) ctaSlotEl.textContent = slot;
  }
  update();
  setInterval(update, 60000);
})();

/* ============================================================
   УСЛУГИ
   ============================================================ */
(function initServices() {
  const grid = $('#services-grid');
  if (!grid) return;
  grid.innerHTML = SERVICES.map(s => `
    <article class="service reveal">
      <div class="service__top">
        <div class="service__icon">
          <svg viewBox="0 0 48 48" width="28" height="28" aria-hidden="true">${s.icon}</svg>
        </div>
        <span class="service__id">${s.id}</span>
      </div>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
      <div class="service__meta">
        <span class="service__time">${s.time}</span>
        <span class="service__price">${s.price}</span>
      </div>
    </article>`).join('');

  // повторно подключаем анимацию появления к вставленным карточкам
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  $$('.reveal', grid).forEach(el => io.observe(el));
})();

/* ============================================================
   ВРАЧИ (секция)
   ============================================================ */
(function initDoctors() {
  const grid = $('#doctors-grid');
  if (!grid) return;
  grid.innerHTML = DOCTORS.map(d => `
    <article class="doctor reveal">
      <div class="doctor__online ${d.online ? '' : 'doctor__online--off'}">
        <span class="pulse-dot"></span>${d.online ? 'ПРИНИМАЕТ' : 'ЗАВТРА'}
      </div>
      ${doctorAvatar(d.name, AV_GRADS[d.grad], 84)}
      <div class="doctor__name">${d.name}</div>
      <div class="doctor__spec">${d.spec}</div>
      <div class="doctor__stats">
        <div class="doctor__stat"><b>${d.exp} лет</b><span>стаж</span></div>
        <div class="doctor__stat"><b>${d.pets.toLocaleString('ru-RU')}</b><span>питомцев принято</span></div>
        <div class="doctor__stat"><b>★ ${d.rating.toFixed(1)}</b><span>рейтинг</span></div>
      </div>
    </article>`).join('');

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  $$('.reveal', grid).forEach(el => io.observe(el));
})();

/* ============================================================
   СЛАЙДЕРЫ (помещения + отзывы)
   ============================================================ */
function makeSlider(trackEl, count, prevBtn, nextBtn, dotsWrap, autoplayMs) {
  let index = 0;
  let timer = null;

  const dots = [];
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', `Слайд ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
    dots.push(dot);
  }

  function goTo(i) {
    index = (i + count) % count;
    trackEl.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, k) => d.classList.toggle('is-active', k === index));
    restart();
  }
  function restart() {
    if (!autoplayMs) return;
    clearInterval(timer);
    timer = setInterval(() => goTo(index + 1), autoplayMs);
  }

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));
  restart();

  trackEl.closest('.slider, .reviews__carousel').addEventListener('pointerenter', () => clearInterval(timer));
  trackEl.closest('.slider, .reviews__carousel').addEventListener('pointerleave', restart);
}

(function initSliders() {
  const roomsTrack = $('#rooms-track');
  if (roomsTrack) {
    makeSlider(roomsTrack, 3, $('#rooms-prev'), $('#rooms-next'), $('#rooms-dots'), 7000);
  }

  const revTrack = $('#reviews-track');
  if (revTrack) {
    revTrack.innerHTML = REVIEWS.map(r => `
      <blockquote class="review">
        <p class="review__text">${r.text}</p>
        <div class="review__author">
          <div class="review__ava" style="background: linear-gradient(135deg, var(--mint), var(--blue))">${r.name[0]}</div>
          <div>
            <div class="review__name">${r.name}</div>
            <div class="review__meta">${r.meta}</div>
          </div>
          <span class="review__badge">${r.badge}</span>
        </div>
      </blockquote>`).join('');
    makeSlider(revTrack, REVIEWS.length, $('#rev-prev'), $('#rev-next'), $('#rev-dots'), 6000);
  }
})();

/* ============================================================
   ВИДЖЕТ ОНЛАЙН-ЗАПИСИ
   ============================================================ */
(function initBooking() {
  const widget = $('#booking-widget');
  if (!widget) return;

  const state = {
    step: 1,
    doctor: null,   // объект врача
    day: null,      // {date, label}
    slot: null,     // 'HH:MM'
    pet: null,      // {id, label}
  };

  const stepsEl = $$('.bstep', widget);
  const panesEl = $$('.booking__pane', widget);
  const backBtn = $('#booking-back');
  const nextBtn = $('#booking-next');
  const hintEl = $('#booking-hint');
  const footerEl = $('#booking-footer');
  const bodyEl = $('#booking-body');
  const successEl = $('#booking-success');

  /* --- дни: сегодня + 6 дней --- */
  function buildDays() {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        date: d,
        key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
        dow: i === 0 ? 'СЕГОДНЯ' : (i === 1 ? 'ЗАВТРА' : RU_DAYS[d.getDay()]),
        num: d.getDate(),
        month: RU_MONTHS[d.getMonth()],
      });
    }
    return days;
  }
  const days = buildDays();

  /* --- слоты для врача+день (детерминированно) --- */
  function slotsFor(doctorId, day) {
    const seed = doctorId.charCodeAt(1) * 1000 + day.date.getDate() * 31 + day.date.getMonth() * 7;
    const rnd = seededRandom(seed);
    const slots = [];
    const now = new Date();
    const isToday = day.date.toDateString() === now.toDateString();
    for (let m = 9 * 60; m <= 19 * 60 + 20; m += 40) {
      const hh = String(Math.floor(m / 60)).padStart(2, '0');
      const mm = String(m % 60).padStart(2, '0');
      const past = isToday && m <= now.getHours() * 60 + now.getMinutes() + 20;
      slots.push({ time: `${hh}:${mm}`, free: !past && rnd() > 0.38 });
    }
    return slots;
  }

  /* --- рендер шага 1: врачи --- */
  function renderDoctors() {
    const list = $('#doctor-list');
    list.innerHTML = DOCTORS.map(d => `
      <div class="doc-pick ${state.doctor && state.doctor.id === d.id ? 'is-selected' : ''}" data-id="${d.id}" role="button" tabindex="0">
        ${doctorAvatar(d.name, AV_GRADS[d.grad], 64)}
        <div class="doc-pick__name">${d.name}</div>
        <div class="doc-pick__spec">${d.spec}</div>
        <div class="doc-pick__rating mono">★ ${d.rating.toFixed(1)} · ${d.online ? 'принимает сегодня' : 'приём завтра'}</div>
      </div>`).join('');
    $$('.doc-pick', list).forEach(card => {
      const pick = () => {
        const doc = DOCTORS.find(d => d.id === card.dataset.id);
        if (state.doctor && state.doctor.id === doc.id) return;
        state.doctor = doc;
        state.day = null;
        state.slot = null;
        $$('.doc-pick', list).forEach(c => c.classList.remove('is-selected'));
        card.classList.add('is-selected');
        updateFooter();
      };
      card.addEventListener('click', pick);
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
  }

  /* --- рендер шага 2: дни и слоты --- */
  function renderDays() {
    const list = $('#day-list');
    list.innerHTML = days.map((day, i) => {
      const free = slotsFor(state.doctor.id, day).filter(s => s.free).length;
      return `
      <div class="day-pick ${state.day && state.day.key === day.key ? 'is-selected' : ''}" data-idx="${i}" role="button" tabindex="0">
        <div class="day-pick__dow">${day.dow}</div>
        <div class="day-pick__num">${day.num}</div>
        <div class="day-pick__free ${free ? '' : 'day-pick__free--none'}">${free ? `${free} окон` : 'занято'}</div>
      </div>`;
    }).join('');
    $$('.day-pick', list).forEach(el => {
      const pick = () => {
        state.day = days[Number(el.dataset.idx)];
        state.slot = null;
        $$('.day-pick', list).forEach(c => c.classList.remove('is-selected'));
        el.classList.add('is-selected');
        renderSlots();
        updateFooter();
      };
      el.addEventListener('click', pick);
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
  }

  function renderSlots() {
    const wrap = $('#slot-list');
    const nameEl = $('#slots-doctor-name');
    if (!state.day) {
      nameEl.textContent = '';
      wrap.innerHTML = '<div class="booking__slots-empty">Сначала выберите день ↑</div>';
      return;
    }
    nameEl.textContent = `· ${state.doctor.name.split(' ')[0]}, ${state.day.num} ${state.day.month}`;
    const slots = slotsFor(state.doctor.id, state.day);
    const freeCount = slots.filter(s => s.free).length;
    if (!freeCount) {
      wrap.innerHTML = '<div class="booking__slots-empty">На этот день всё занято — выберите другой.</div>';
      return;
    }
    wrap.innerHTML = slots.map(s => `
      <button class="slot ${s.free ? 'slot--free' : 'slot--busy'} ${state.slot === s.time ? 'is-selected' : ''}"
        data-time="${s.time}" ${s.free ? '' : 'disabled'}>${s.time}</button>`).join('');
    $$('.slot--free', wrap).forEach(el => {
      el.addEventListener('click', () => {
        state.slot = el.dataset.time;
        $$('.slot', wrap).forEach(c => c.classList.remove('is-selected'));
        el.classList.add('is-selected');
        updateFooter();
      });
    });
  }

  /* --- рендер шага 3: питомцы + итог --- */
  function renderPets() {
    const list = $('#pet-list');
    list.innerHTML = PET_TYPES.map(p => `
      <button class="pet-pick ${state.pet && state.pet.id === p.id ? 'is-selected' : ''}" data-id="${p.id}">
        <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">${p.icon}</svg>
        ${p.label}
      </button>`).join('');
    $$('.pet-pick', list).forEach(el => {
      el.addEventListener('click', () => {
        state.pet = PET_TYPES.find(p => p.id === el.dataset.id);
        $$('.pet-pick', list).forEach(c => c.classList.remove('is-selected'));
        el.classList.add('is-selected');
        renderSummary();
        updateFooter();
      });
    });
  }

  function renderSummary() {
    const el = $('#booking-summary');
    if (!state.doctor || !state.day || !state.slot) { el.innerHTML = ''; return; }
    el.innerHTML =
      `<span class="sum-mint">// ПРОВЕРЬТЕ ДАННЫЕ ЗАПИСИ</span><br>` +
      `Врач: <b>${state.doctor.name}</b> — ${state.doctor.spec}<br>` +
      `Когда: <b>${state.day.dow.toLowerCase()}, ${state.day.num} ${state.day.month} в ${state.slot}</b><br>` +
      `Питомец: <b>${state.pet ? state.pet.label : 'не выбран'}</b><br>` +
      `Приём: <b>первичный · 40 минут · от 1 800 ₽</b>`;
  }

  /* --- навигация по шагам --- */
  function canProceed() {
    if (state.step === 1) return !!state.doctor;
    if (state.step === 2) return !!(state.day && state.slot);
    if (state.step === 3) return !!state.pet;
    return false;
  }

  const HINTS = {
    1: 'Выберите врача, чтобы продолжить',
    2: 'Выберите день и свободное окно',
    3: 'Укажите питомца и подтвердите запись',
  };

  function updateFooter() {
    backBtn.disabled = state.step === 1;
    nextBtn.disabled = !canProceed();
    nextBtn.textContent = state.step === 3 ? 'Подтвердить запись ✓' : 'Далее →';
    hintEl.textContent = canProceed()
      ? (state.step === 3 ? 'Всё готово — осталось подтвердить' : 'Отлично, идём дальше')
      : HINTS[state.step];
  }

  function goToStep(n) {
    state.step = n;
    stepsEl.forEach(s => {
      const k = Number(s.dataset.step);
      s.classList.toggle('is-active', k === n);
      s.classList.toggle('is-done', k < n);
    });
    panesEl.forEach(p => p.classList.toggle('is-active', Number(p.dataset.pane) === n));
    if (n === 2) { renderDays(); renderSlots(); }
    if (n === 3) { renderPets(); renderSummary(); }
    updateFooter();
  }

  /* --- экран успеха + QR --- */
  function renderQr() {
    const qr = $('#qr-grid');
    const rnd = seededRandom(Date.now() % 100000);
    let html = '';
    const inFinder = (r, c) =>
      (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7);
    for (let r = 0; r < 21; r++) {
      for (let c = 0; c < 21; c++) {
        let on;
        if (inFinder(r, c)) {
          const rr = r % 14, cc = c % 14; // локальные координаты в угловом квадрате 7×7
          const edge = rr === 0 || rr === 6 || cc === 0 || cc === 6;
          const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4;
          on = edge || core;
        } else {
          on = rnd() > 0.52;
        }
        html += `<i class="${on ? 'on' : ''}"></i>`;
      }
    }
    qr.innerHTML = html;
  }

  function showSuccess() {
    const bookingId = 'VET-' + String(Math.floor(1000 + Math.random() * 9000));
    bodyEl.hidden = true;
    footerEl.hidden = true;
    successEl.hidden = false;
    stepsEl.forEach(s => {
      const k = Number(s.dataset.step);
      s.classList.toggle('is-done', k < 4);
      s.classList.toggle('is-active', k === 4);
    });
    $('#success-pet').textContent = state.pet.label.toLowerCase() + ' и вы';
    $('#success-details').innerHTML =
      `НОМЕР ЗАПИСИ ......... <b>${bookingId}</b><br>` +
      `ВРАЧ ................ <b>${state.doctor.name}</b><br>` +
      `ДАТА ................ <b>${state.day.num} ${state.day.month}, ${state.day.dow.toLowerCase()}</b><br>` +
      `ВРЕМЯ ............... <b>${state.slot}</b>`;
    renderQr();
  }

  nextBtn.addEventListener('click', () => {
    if (!canProceed()) return;
    if (state.step < 3) goToStep(state.step + 1);
    else showSuccess();
  });
  backBtn.addEventListener('click', () => {
    if (state.step > 1) goToStep(state.step - 1);
  });

  $('#booking-again').addEventListener('click', () => {
    state.step = 1;
    state.doctor = null; state.day = null; state.slot = null; state.pet = null;
    successEl.hidden = true;
    bodyEl.hidden = false;
    footerEl.hidden = false;
    renderDoctors();
    goToStep(1);
  });

  renderDoctors();
  goToStep(1);
})();

/* ============================================================
   ФУТЕР: год
   ============================================================ */
(function initYear() {
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();


