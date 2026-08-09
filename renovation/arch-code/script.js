/* ============================================================
   Дока Строй — интерактив лендинга
   Чистый JS, без зависимостей
   ============================================================ */
'use strict';

/* ---------- Утилиты ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/** Форматирование числа как «живой сметы»: 1 234 567 */
const fmt = (n) => Math.round(n).toLocaleString('ru-RU');

/* ============================================================
   1. Прогресс-бар скролла + тень шапки + sticky-панель
   ============================================================ */
const scrollProgress = $('#scrollProgress');
const header = $('#header');
const stickyCta = $('#stickyCta');
const heroSection = $('.hero');
const contactSection = $('#contact');

function onScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = progress + '%';

  header.classList.toggle('is-scrolled', scrollTop > 10);

  // Sticky-панель: показываем после hero, прячем у финальной формы
  const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
  const contactTop = contactSection.offsetTop;
  const show = scrollTop > heroBottom && scrollTop + window.innerHeight < contactTop + 200;
  stickyCta.classList.toggle('is-visible', show);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ============================================================
   2. Бургер-меню
   ============================================================ */
const burger = $('#burger');
const mobileMenu = $('#mobileMenu');

function toggleMenu(force) {
  const open = force !== undefined ? force : !mobileMenu.classList.contains('is-open');
  mobileMenu.classList.toggle('is-open', open);
  burger.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  document.body.style.overflow = open ? 'hidden' : '';
}
burger.addEventListener('click', () => toggleMenu());
$$('.mobile-menu__link').forEach((link) =>
  link.addEventListener('click', () => toggleMenu(false))
);

/* ============================================================
   3. Анимации появления (IntersectionObserver)
   ============================================================ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
$$('.reveal, .reveal-line').forEach((el) => revealObserver.observe(el));

/* ============================================================
   4. Счётчики цифр в hero (18 лет, 3 года)
   ============================================================ */
function animateCount(el) {
  const target = Number(el.dataset.count);
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    el.textContent = String(Math.round(target * eased));
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
$$('[data-count]').forEach((el) => countObserver.observe(el));

/* ============================================================
   5. Плитки «Какой объект планируете?» (аккордеон-плитки)
   ============================================================ */
$$('[data-obj]').forEach((card) => {
  const head = $('.obj-card__head', card);
  head.addEventListener('click', () => {
    const isOpen = card.classList.contains('is-open');
    // Закрываем остальные — режим аккордеона
    $$('[data-obj]').forEach((c) => {
      c.classList.remove('is-open');
      $('.obj-card__head', c).setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      card.classList.add('is-open');
      head.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ============================================================
   6. Калькулятор сметы
   ============================================================ */
const areaRange = $('#areaRange');
const areaInput = $('#areaInput');
const calcSumMin = $('#calcSumMin');
const calcSumMax = $('#calcSumMax');
const calcDays = $('#calcDays');
const calcPerM = $('#calcPerM');

function getSelectedTariff() {
  return document.querySelector('input[name="tariff"]:checked');
}

/** Живой пересчёт: вилка -5% / +10%, срок по коэффициенту тарифа */
function recalc() {
  const tariff = getSelectedTariff();
  if (!tariff) return;
  const price = Number(tariff.value);
  const daysPerM2 = Number(tariff.dataset.days);
  let area = Number(areaInput.value) || 0;
  area = Math.max(20, Math.min(300, area));

  const min = price * area * 0.95;
  const max = price * area * 1.1;
  const days = Math.round(area * daysPerM2);

  calcSumMin.textContent = fmt(min);
  calcSumMax.textContent = fmt(max);
  calcDays.textContent = fmt(days);
  calcPerM.textContent = fmt(price);
}

areaRange.addEventListener('input', () => {
  areaInput.value = areaRange.value;
  recalc();
});
areaInput.addEventListener('input', () => {
  let v = Number(areaInput.value) || 20;
  areaRange.value = Math.max(20, Math.min(300, v));
  recalc();
});
areaInput.addEventListener('blur', () => {
  let v = Number(areaInput.value) || 20;
  v = Math.max(20, Math.min(300, v));
  areaInput.value = v;
  areaRange.value = v;
  recalc();
});
$$('input[name="tariff"]').forEach((radio) => radio.addEventListener('change', recalc));
recalc();

/* ============================================================
   7. Портфолио: данные, рендер, фильтры
   ============================================================ */
const PROJECTS = [
  {
    title: 'ЖК «Арбат»',
    type: 'flat', style: 'neoclassic',
    typeLabel: 'Квартира', styleLabel: 'Неоклассика',
    area: 118, days: 95,
    desc: 'Трёхкомнатная квартира в неоклассике: лепнина, паркет, скрытые двери вровень со стеной.',
    img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=900&auto=format&fit=crop',
  },
  {
    title: 'ЖК «Бастион»',
    type: 'flat', style: 'minimal',
    typeLabel: 'Квартира', styleLabel: 'Минимализм',
    area: 74, days: 68,
    desc: 'Минимализм для молодой семьи: микроцемент, встроенные системы хранения, тёплый свет.',
    img: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=900&auto=format&fit=crop',
  },
  {
    title: 'ЖК «Кокос»',
    type: 'flat', style: 'loft',
    typeLabel: 'Квартира', styleLabel: 'Лофт',
    area: 92, days: 80,
    desc: 'Лофт с кирпичной кладкой и чёрными металлоконструкциями. Открытая проводка в гофре — по проекту.',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=900&auto=format&fit=crop',
  },
  {
    title: 'ЖК «Берег Волги»',
    type: 'flat', style: 'minimal',
    typeLabel: 'Квартира', styleLabel: 'Минимализм',
    area: 136, days: 110,
    desc: 'Панорамные окна на Волгу. Квартира-шоурум: камень, шпон ореха, сценарное освещение.',
    img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=900&auto=format&fit=crop',
  },
  {
    title: 'Дом в Зелёном',
    type: 'house', style: 'minimal',
    typeLabel: 'Дом', styleLabel: 'Минимализм',
    area: 210, days: 150,
    desc: 'Коттедж с вторым светом: инженерия «под ключ», тёплые полы, умный дом базового уровня.',
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=900&auto=format&fit=crop',
  },
  {
    title: 'Дом у леса',
    type: 'house', style: 'neoclassic',
    typeLabel: 'Дом', styleLabel: 'Неоклассика',
    area: 260, days: 175,
    desc: 'Классическая загородная усадьба: мрамор, массив дуба, каминный зал с порталом.',
    img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=900&auto=format&fit=crop',
  },
  {
    title: 'Офис IT-компании',
    type: 'office', style: 'loft',
    typeLabel: 'Офис', styleLabel: 'Лофт',
    area: 340, days: 90,
    desc: 'Open-space на 60 рабочих мест, переговорные, кофе-поинт. Работали ночами — офис не останавливался.',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=900&auto=format&fit=crop',
  },
  {
    title: 'Ресторан «Печь»',
    type: 'office', style: 'loft',
    typeLabel: 'Коммерция', styleLabel: 'Лофт',
    area: 180, days: 75,
    desc: 'Гастробар с открытой кухней: медь, бетон, винтажная мебель. Согласовали с УК и арендодателем.',
    img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=900&auto=format&fit=crop',
  },
  {
    title: 'Штаб-квартира банка',
    type: 'office', style: 'minimal',
    typeLabel: 'Офис', styleLabel: 'Минимализм',
    area: 520, days: 120,
    desc: 'Представительский этаж: переговорные в шпоне эбена, акустика, скрытая климатизация.',
    img: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=900&auto=format&fit=crop',
  },
];

const portfolioGrid = $('#portfolioGrid');

function renderPortfolio() {
  portfolioGrid.innerHTML = PROJECTS.map((p, i) => `
    <article class="project-card reveal" data-type="${p.type}" data-style="${p.style}" data-index="${i}" tabindex="0" role="button" aria-label="Открыть проект ${p.title}">
      <div class="project-card__img" style="background-image: linear-gradient(rgba(20,23,26,0.08), rgba(20,23,26,0.2)), url('${p.img}')">
        <span class="project-card__badge">под ключ</span>
      </div>
      <div class="project-card__body">
        <h3 class="project-card__title">${p.title}</h3>
        <p class="project-card__meta">${p.typeLabel} · ${p.styleLabel} · ${p.area} м² · ${p.days} дней</p>
      </div>
    </article>
  `).join('');

  // Карточки открывают модалку «до/после»
  $$('.project-card', portfolioGrid).forEach((card) => {
    const open = () => openProjectModal(Number(card.dataset.index));
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
    revealObserver.observe(card);
  });
}
renderPortfolio();

// Фильтры: по типу объекта или по стилю — единая активная группа
$$('.filter').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('.filter').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const f = btn.dataset.filter;
    $$('.project-card', portfolioGrid).forEach((card) => {
      const match = f === 'all' || card.dataset.type === f || card.dataset.style === f;
      card.classList.toggle('is-hidden', !match);
    });
  });
});

/* ============================================================
   8. Модалка проекта со слайдером «до/после»
   ============================================================ */
const projectModal = $('#projectModal');
const estimateModal = $('#estimateModal');
const baBefore = $('#baBefore');
const baAfter = $('#baAfter');
const baHandle = $('#baHandle');
const baRange = $('#baRange');

function openProjectModal(index) {
  const p = PROJECTS[index];
  $('#projectModalTitle').textContent = p.title;
  $('#projectModalDesc').textContent = p.desc;
  $('#projectModalMeta').textContent = `${p.typeLabel} · ${p.styleLabel} · ${p.area} м² · ${p.days} рабочих дней`;
  baAfter.style.backgroundImage =
    `linear-gradient(rgba(20,23,26,0.05), rgba(20,23,26,0.1)), url('${p.img}')`;
  setBaPosition(50);
  baRange.value = 50;
  openModal(projectModal);
}

function setBaPosition(pct) {
  baBefore.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
  baHandle.style.left = pct + '%';
}
baRange.addEventListener('input', () => setBaPosition(Number(baRange.value)));

/* ---------- Общая логика модалок ---------- */
let lastFocused = null;

function openModal(modal) {
  lastFocused = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  $('.modal__close', modal).focus();
}
function closeModal(modal) {
  modal.hidden = true;
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}

$$('.modal').forEach((modal) => {
  $$('[data-close]', modal).forEach((el) =>
    el.addEventListener('click', () => closeModal(modal))
  );
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    $$('.modal').forEach((m) => { if (!m.hidden) closeModal(m); });
    toggleMenu(false);
  }
});

$('#openEstimateModal').addEventListener('click', () => openModal(estimateModal));

/* ============================================================
   9. Таймлайн: линия «построения» при скролле
   ============================================================ */
const timeline = $('.timeline');
// Оранжевая «строящаяся» линия поверх серой
const lineFill = document.createElement('div');
lineFill.className = 'timeline__line-fill';
timeline.prepend(lineFill);

const steps = $$('.timeline__step');

function updateTimeline() {
  const rect = timeline.getBoundingClientRect();
  const triggerY = window.innerHeight * 0.65; // линия «дорисовывается» до 65% экрана
  const drawn = Math.max(0, Math.min(triggerY - rect.top, rect.height));
  lineFill.style.height = drawn + 'px';

  steps.forEach((step) => {
    const stepTop = step.getBoundingClientRect().top + 44; // центр номера
    step.classList.toggle('is-active', stepTop < triggerY);
  });
}
window.addEventListener('scroll', updateTimeline, { passive: true });
window.addEventListener('resize', updateTimeline);
updateTimeline();

/* ============================================================
   10. Отзывы: карусель
   ============================================================ */
const REVIEWS = [
  {
    text: 'Заказывали ремонт квартиры в ЖК «Арбат», жили в это время в другом городе. Раз в неделю получали фотоотчёт, два раза созванивались по видео с объекта. Сдали на неделю раньше срока — впервые вижу такое у строителей.',
    name: 'Дмитрий и Анна',
    project: 'ЖК «Арбат», 118 м², тариф «Престиж»',
  },
  {
    text: 'Смета ни разу не выросла за четыре месяца работ. Одно изменение по электрике согласовывали отдельно — с ценой и сроком, письменно, до начала работ. Именно так, как обещали на первой встрече.',
    name: 'Игорь В.',
    project: 'ЖК «Бастион», 74 м², тариф «Комфорт»',
  },
  {
    text: 'Делали офис без остановки работы компании — бригады работали по ночам и в выходные, сдавали зонами. Отдельное спасибо за согласования с управляющей компанией, всё взяли на себя.',
    name: 'Ольга С.',
    project: 'Офис 340 м², open-space на 60 мест',
  },
  {
    text: 'Дом 210 м² под ключ за пять месяцев. Что особенно ценно — один человек отвечал за всё: за бригаду, за закупки, за график. Мы просто приезжали на приёмку этапов раз в две недели.',
    name: 'Семья Ковалёвых',
    project: 'Коттедж 210 м², тариф «Комфорт+»',
  },
  {
    text: 'Квартира в историческом доме с охранным обязательством. Другие компании отказывались, «Дока Строй» начала с обследования перекрытий и согласований. Лепнину отреставрировали, а не снесли.',
    name: 'Марина П.',
    project: 'Исторический центр, 96 м², тариф «Престиж»',
  },
];

const carouselTrack = $('#carouselTrack');
const carouselDots = $('#carouselDots');
let currentSlide = 0;
let autoTimer = null;

function renderCarousel() {
  carouselTrack.innerHTML = REVIEWS.map((r) => `
    <div class="carousel__slide">
      <p class="carousel__text">«${r.text}»</p>
      <div class="carousel__author">
        <span class="carousel__name">${r.name}</span>
        <span class="carousel__project">${r.project}</span>
      </div>
    </div>
  `).join('');

  carouselDots.innerHTML = REVIEWS.map((_, i) =>
    `<button class="carousel__dot${i === 0 ? ' is-active' : ''}" data-slide="${i}" aria-label="Отзыв ${i + 1}"></button>`
  ).join('');

  $$('.carousel__dot', carouselDots).forEach((dot) =>
    dot.addEventListener('click', () => goToSlide(Number(dot.dataset.slide), true))
  );
}

function goToSlide(index, manual = false) {
  currentSlide = (index + REVIEWS.length) % REVIEWS.length;
  carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  $$('.carousel__dot', carouselDots).forEach((d, i) =>
    d.classList.toggle('is-active', i === currentSlide)
  );
  if (manual) restartAutoplay();
}

function restartAutoplay() {
  clearInterval(autoTimer);
  autoTimer = setInterval(() => goToSlide(currentSlide + 1), 7000);
}

renderCarousel();
$('#carouselPrev').addEventListener('click', () => goToSlide(currentSlide - 1, true));
$('#carouselNext').addEventListener('click', () => goToSlide(currentSlide + 1, true));
restartAutoplay();
// Пауза автопрокрутки при наведении
$('#carousel').addEventListener('mouseenter', () => clearInterval(autoTimer));
$('#carousel').addEventListener('mouseleave', restartAutoplay);

/* ============================================================
   11. FAQ-аккордеон
   ============================================================ */
$$('.faq-item').forEach((item) => {
  const q = $('.faq-item__q', item);
  const a = $('.faq-item__a', item);
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');
    $$('.faq-item').forEach((i) => {
      i.classList.remove('is-open');
      $('.faq-item__q', i).setAttribute('aria-expanded', 'false');
      $('.faq-item__a', i).style.maxHeight = '';
    });
    if (!isOpen) {
      item.classList.add('is-open');
      q.setAttribute('aria-expanded', 'true');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

/* ============================================================
   12. Финальная форма
   ============================================================ */
const contactForm = $('#contactForm');
const formSuccess = $('#formSuccess');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  let valid = true;
  const name = contactForm.elements.name;
  const phone = contactForm.elements.phone;
  const type = contactForm.elements.objectType;

  [name, phone, type].forEach((f) => f.classList.remove('is-error'));

  if (!name.value.trim()) { name.classList.add('is-error'); valid = false; }
  if (!/^[\d\s()+\-]{10,}$/.test(phone.value.trim())) { phone.classList.add('is-error'); valid = false; }
  if (!type.value) { type.classList.add('is-error'); valid = false; }

  if (!valid) return;

  formSuccess.hidden = false;
  contactForm.reset();
  setTimeout(() => { formSuccess.hidden = true; }, 8000);
});

/* ============================================================
   13. Плавный скролл по якорям (с учётом фиксированной шапки)
   ============================================================ */
$$('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
