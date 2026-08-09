/* ============================================================
   «Дока Строй» — интерактивность лендинга
   ============================================================ */
'use strict';

/* ---------- Данные: тарифы ---------- */
const TARIFFS = [
  {
    name: 'Косметический',
    price: 14900,
    desc: 'Обновить отделку без перепланировки: стены, пол, потолки.',
    includes: [
      'Демонтаж старых покрытий',
      'Поклейка обоев или покраска стен',
      'Укладка ламината / линолеума',
      'Натяжные или окрашенные потолки',
      'Замена розеток и светильников',
      'Уборка и вывоз мусора'
    ]
  },
  {
    name: 'Черновой',
    price: 18700,
    desc: 'Подготовка новостройки «под чистовую»: стяжка, штукатурка, разводка.',
    includes: [
      'Стяжка пола по маякам',
      'Штукатурка стен по маякам',
      'Разводка электрики и воды',
      'Монтаж перегородок',
      'Гидроизоляция санузлов',
      'Шпатлёвка под покраску'
    ]
  },
  {
    name: 'Новостройка',
    price: 23500,
    desc: 'Полный цикл в квартире от застройщика: от черновых работ до чистовой отделки.',
    includes: [
      'Всё из тарифа «Черновой»',
      'Чистовая отделка стен и пола',
      'Сантехника «под ключ»',
      'Установка дверей',
      'Электромонтаж с щитом',
      'Клининг после ремонта'
    ]
  },
  {
    name: 'Комфорт',
    price: 27700,
    popular: true,
    desc: 'Сбалансированный ремонт под ключ с качественными материалами среднего сегмента.',
    includes: [
      'Всё из тарифа «Новостройка»',
      'Дизайн-проект (обмерный план + планировка)',
      'Тёплые полы в санузлах',
      'Кварцвинил или инженерная доска',
      'Встроенная мебель по месту',
      'Скрытый монтаж кондиционирования'
    ]
  },
  {
    name: 'Комфорт+',
    price: 29900,
    desc: 'Комфорт с расширенным дизайн-проектом и материалами премиальных брендов.',
    includes: [
      'Всё из тарифа «Комфорт»',
      'Полный дизайн-проект с 3D-визуализацией',
      'Авторский надзор дизайнера',
      'Умный свет и сценарии освещения',
      'Бесшовные потолки, скрытые двери',
      'Комплектация: закупка и приёмка материалов'
    ]
  },
  {
    name: 'Престиж',
    price: 34000,
    desc: 'Дизайнерский ремонт премиум-класса с авторским надзором на каждом этапе.',
    includes: [
      'Всё из тарифа «Комфорт+»',
      'Индивидуальный дизайн от ведущего архитектора',
      'Натуральный камень, шпон, латунь',
      'Системы «умный дом»',
      'Мебель и свет на заказ',
      'Персональный менеджер комплектации'
    ]
  }
];

/* ---------- Данные: портфолио ---------- */
const ZHK_NAMES = { arbat: 'ЖК «Арбат»', bastion: 'ЖК «Бастион»', kokos: 'ЖК «Кокос»', bereg: 'ЖК «Берег Волги»' };
const TYPE_NAMES = { podkluch: 'под ключ', kosmeticheskiy: 'косметический', dizainerskiy: 'дизайнерский' };

const PORTFOLIO = [
  { zhk: 'kokos', type: 'podkluch', area: 84, img: 'photo-1600585154340-be6161a56a0c' },
  { zhk: 'arbat', type: 'dizainerskiy', area: 61, img: 'photo-1616486338812-3dadae4b4ace' },
  { zhk: 'bereg', type: 'podkluch', area: 47, img: 'photo-1560448204-e02f11c3d0e2' },
  { zhk: 'bastion', type: 'dizainerskiy', area: 96, img: 'photo-1600607687939-ce8a6c25118c' },
  { zhk: 'kokos', type: 'kosmeticheskiy', area: 38, img: 'photo-1556911220-bff31c812dba' },
  { zhk: 'arbat', type: 'podkluch', area: 72, img: 'photo-1600210492486-724fe5c67fb0' },
  { zhk: 'bereg', type: 'kosmeticheskiy', area: 55, img: 'photo-1522708323590-d24dbb6b0267' },
  { zhk: 'bastion', type: 'podkluch', area: 110, img: 'photo-1615873968403-89e068629265' }
];

/* ---------- Утилиты ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const formatRub = n => n.toLocaleString('ru-RU') + ' ₽';

/* ============================================================
   1. Липкая шапка + кнопка «наверх»
   ============================================================ */
const header = $('#header');
const toTop = $('#toTop');

function onScroll() {
  header.classList.toggle('is-scrolled', window.scrollY > 10);
  toTop.classList.toggle('is-visible', window.scrollY > 600);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ============================================================
   2. Бургер-меню
   ============================================================ */
const burger = $('#burger');
const nav = $('#nav');

burger.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  burger.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
});
// Закрываем меню при клике по ссылке
$$('.nav__link').forEach(link =>
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  })
);

/* ============================================================
   3. Калькулятор сметы (живой пересчёт)
   ============================================================ */
const areaRange = $('#areaRange');
const areaValue = $('#areaValue');
const calcPriceEl = $('#calcPrice');
const calcTermEl = $('#calcTerm');
const calcNoteEl = $('#calcNote');
const calcTariffs = $('#calcTariffs');

let currentTariff = $('.calc-tariff.is-active', calcTariffs);

function updateRangeFill() {
  const min = Number(areaRange.min);
  const max = Number(areaRange.max);
  const val = Number(areaRange.value);
  const pct = ((val - min) / (max - min)) * 100;
  areaRange.style.setProperty('--fill', pct + '%');
}

function recalc() {
  const area = Number(areaRange.value);
  const pricePerM2 = Number(currentTariff.dataset.price);
  const daysPerM2 = Number(currentTariff.dataset.days);
  const name = currentTariff.dataset.name;

  const total = area * pricePerM2;
  // Срок: дни на м² + 10 дней на подготовку, округляем до недель
  const weeks = Math.max(2, Math.round((area * daysPerM2 + 10) / 7));

  areaValue.textContent = area + ' м²';
  calcPriceEl.textContent = formatRub(total);
  calcTermEl.textContent = 'Срок: ≈ ' + weeks + ' нед.';
  calcNoteEl.textContent = `Тариф «${name}», ${area} м²`;

  // Короткая подсветка обновления
  calcPriceEl.classList.add('is-updating');
  setTimeout(() => calcPriceEl.classList.remove('is-updating'), 150);

  updateRangeFill();
}

areaRange.addEventListener('input', recalc);

calcTariffs.addEventListener('click', e => {
  const btn = e.target.closest('.calc-tariff');
  if (!btn) return;
  $$('.calc-tariff', calcTariffs).forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  currentTariff = btn;
  recalc();
});

recalc(); // первичный расчёт

/* ============================================================
   4. Карточки тарифов с аккордеонами «что входит»
   ============================================================ */
const tariffsGrid = $('#tariffsGrid');

tariffsGrid.innerHTML = TARIFFS.map((t, i) => `
  <article class="tariff-card reveal ${t.popular ? 'tariff-card--popular' : ''}" data-delay="${i % 3}">
    ${t.popular ? '<span class="tariff-card__badge">Выбирают чаще</span>' : ''}
    <h3 class="tariff-card__name">${t.name}</h3>
    <p class="tariff-card__price">от ${formatRub(t.price)}<small>/м²</small></p>
    <p class="tariff-card__desc">${t.desc}</p>
    <details>
      <summary>Что входит</summary>
      <ul class="tariff-card__includes">
        ${t.includes.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </details>
    <a href="#calculator" class="btn btn--ghost tariff-card__btn" data-tariff="${t.name}">Рассчитать</a>
  </article>
`).join('');

// Клик «Рассчитать» в карточке тарифа — выбирает тариф в калькуляторе
tariffsGrid.addEventListener('click', e => {
  const btn = e.target.closest('[data-tariff]');
  if (!btn) return;
  const match = $$('.calc-tariff', calcTariffs).find(b => b.dataset.name === btn.dataset.tariff);
  if (match) match.click();
});

// Открытый аккордеон — только один на всю сетку тарифов
tariffsGrid.addEventListener('toggle', e => {
  if (e.target.tagName !== 'DETAILS' || !e.target.open) return;
  $$('details', tariffsGrid).forEach(d => { if (d !== e.target) d.open = false; });
}, true);

/* ============================================================
   5. Портфолио: карточки + фильтры
   ============================================================ */
const portfolioGrid = $('#portfolioGrid');
const portfolioEmpty = $('#portfolioEmpty');

portfolioGrid.innerHTML = PORTFOLIO.map((p, i) => `
  <article class="portfolio-card reveal" data-zhk="${p.zhk}" data-type="${p.type}" data-delay="${i % 4}">
    <div class="portfolio-card__img"
         style="background-image: linear-gradient(rgba(217,185,138,0.05), rgba(217,185,138,0.05)), url('https://images.unsplash.com/${p.img}?auto=format&fit=crop&w=640&q=60')"
         role="img" aria-label="${ZHK_NAMES[p.zhk]}, ${TYPE_NAMES[p.type]}, ${p.area} м²"></div>
    <div class="portfolio-card__body">
      <p class="portfolio-card__title">${ZHK_NAMES[p.zhk]}, ${TYPE_NAMES[p.type]}, ${p.area} м²</p>
      <p class="portfolio-card__meta">Сдано в срок · гарантия 3 года</p>
    </div>
  </article>
`).join('');

const filterState = { zhk: 'all', type: 'all' };

function applyPortfolioFilters() {
  let visible = 0;
  $$('.portfolio-card', portfolioGrid).forEach(card => {
    const ok =
      (filterState.zhk === 'all' || card.dataset.zhk === filterState.zhk) &&
      (filterState.type === 'all' || card.dataset.type === filterState.type);
    card.classList.toggle('is-hidden', !ok);
    if (ok) visible++;
  });
  portfolioEmpty.hidden = visible > 0;
}

function bindFilterGroup(groupId, key, dataAttr) {
  const group = $(groupId);
  group.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $$('.chip', group).forEach(c => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    filterState[key] = chip.dataset[dataAttr];
    applyPortfolioFilters();
  });
}
bindFilterGroup('#filterZhK', 'zhk', 'zhk');
bindFilterGroup('#filterType', 'type', 'type');

/* ============================================================
   6. Карусель отзывов
   ============================================================ */
const track = $('#carouselTrack');
const slides = $$('.review-slide', track);
const dotsWrap = $('#carouselDots');
let currentSlide = 0;
let autoTimer = null;

// Точки-индикаторы
slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
  dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
  dot.addEventListener('click', () => goToSlide(i));
  dotsWrap.appendChild(dot);
});
const dots = $$('.carousel__dot', dotsWrap);

function goToSlide(i) {
  currentSlide = (i + slides.length) % slides.length;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  dots.forEach((d, idx) => d.classList.toggle('is-active', idx === currentSlide));
  restartAuto();
}

function restartAuto() {
  clearInterval(autoTimer);
  autoTimer = setInterval(() => goToSlide(currentSlide + 1), 7000);
}

$('#prevReview').addEventListener('click', () => goToSlide(currentSlide - 1));
$('#nextReview').addEventListener('click', () => goToSlide(currentSlide + 1));
restartAuto();

// Свайп на мобильных
let touchX = null;
track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) goToSlide(currentSlide + (dx < 0 ? 1 : -1));
  touchX = null;
}, { passive: true });

/* ============================================================
   7. Видео-отзывы: модальное окно
   ============================================================ */
const videoModal = $('#videoModal');

$$('.video-review').forEach(btn =>
  btn.addEventListener('click', () => {
    videoModal.hidden = false;
    document.body.style.overflow = 'hidden';
  })
);

videoModal.addEventListener('click', e => {
  if (e.target.closest('[data-close]')) {
    videoModal.hidden = true;
    document.body.style.overflow = '';
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !videoModal.hidden) {
    videoModal.hidden = true;
    document.body.style.overflow = '';
  }
});

/* ============================================================
   8. Анимации при скролле (IntersectionObserver)
   ============================================================ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

$$('.reveal').forEach(el => revealObserver.observe(el));

/* ============================================================
   9. Счётчики в полосе доверия
   ============================================================ */
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.target);
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))); // ease-out cubic
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.6 });

$$('.counter').forEach(el => counterObserver.observe(el));

/* ============================================================
   10. FAQ: один открытый пункт
   ============================================================ */
const faqList = $('#faqList');
faqList.addEventListener('toggle', e => {
  if (e.target.tagName !== 'DETAILS' || !e.target.open) return;
  $$('details', faqList).forEach(d => { if (d !== e.target) d.open = false; });
}, true);

/* ============================================================
   11. Форма: валидация + успешная отправка
   ============================================================ */
const leadForm = $('#leadForm');
const leadSuccess = $('#leadSuccess');

function setInvalid(field, invalid) {
  field.closest('.form-field').classList.toggle('is-invalid', invalid);
  return !invalid;
}

leadForm.addEventListener('submit', e => {
  e.preventDefault();

  const name = $('#fName');
  const phone = $('#fPhone');
  const zhk = $('#fZhK');
  const area = $('#fArea');

  const digits = phone.value.replace(/\D/g, '');
  const areaNum = Number(area.value);

  let ok = true;
  ok = setInvalid(name, name.value.trim().length < 2) && ok;
  ok = setInvalid(phone, digits.length < 10 || digits.length > 12) && ok;
  ok = setInvalid(zhk, !zhk.value) && ok;
  ok = setInvalid(area, !areaNum || areaNum < 10 || areaNum > 500) && ok;

  if (!ok) return;

  // «Отправка»: показываем экран успеха (бэкенда у статического лендинга нет)
  leadSuccess.hidden = false;
  leadForm.reset();
});

// Сброс ошибки при вводе
$$('.form-field input, .form-field select', leadForm).forEach(input =>
  input.addEventListener('input', () => input.closest('.form-field').classList.remove('is-invalid'))
);
