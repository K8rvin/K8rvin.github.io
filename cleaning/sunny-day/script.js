/* =====================================================
   «Солнечный день» — интерактивная логика лендинга
   ===================================================== */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Шапка при скролле ---------- */
  const header = document.getElementById('header');
  const onScrollHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Бургер-меню ---------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  const closeMenu = () => {
    burger.classList.remove('is-open');
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- Быстрый расчёт ---------- */
  const PRICES = {
    basic:   { 40: 2500, 60: 3200, 80: 3900, 100: 4800 },
    general: { 40: 4200, 60: 5500, 80: 6800, 100: 8200 }
  };
  const DAY_FACTOR = { tomorrow: 1, after: 0.95, weekend: 1.1 };

  const calcState = { area: null, type: null, day: null };

  const steps = [
    document.getElementById('calcStep1'),
    document.getElementById('calcStep2'),
    document.getElementById('calcStep3')
  ];
  const resultBlock = document.getElementById('calcResult');
  const progressBar = document.getElementById('calcProgress');
  const stepLabel = document.getElementById('calcStepLabel');
  const summaryEl = document.getElementById('calcSummary');
  const priceEl = document.getElementById('calcPrice');
  const priceOldEl = document.getElementById('calcPriceOld');
  const noteEl = document.getElementById('calcNote');
  const calcOrderBtn = document.getElementById('calcOrder');

  const STEP_TITLES = [
    'Шаг 1 из 3 — метраж',
    'Шаг 2 из 3 — тип уборки',
    'Шаг 3 из 3 — день',
    'Готово — вот ваша цена ✨'
  ];

  const formatPrice = (value) =>
    value.toLocaleString('ru-RU') + ' ₽';

  const round50 = (value) => Math.round(value / 50) * 50;

  const showStep = (index) => {
    steps.forEach((step, i) => {
      step.classList.toggle('is-active', i === index);
    });
    const isResult = index >= steps.length;
    resultBlock.classList.toggle('is-active', isResult);
    progressBar.style.width = (isResult ? 100 : ((index + 1) / 3) * 100) + '%';
    stepLabel.textContent = STEP_TITLES[Math.min(index, STEP_TITLES.length - 1)];
  };

  const computePrice = () => {
    const base = PRICES[calcState.type][calcState.area];
    const factor = DAY_FACTOR[calcState.day];
    const final = round50(base * factor);
    return { base, final, factor };
  };

  const showResult = () => {
    const { base, final, factor } = computePrice();
    const labels = [];
    document.querySelectorAll('.calc__opt.is-selected').forEach((btn) => {
      labels.push(btn.dataset.label);
    });
    summaryEl.innerHTML = labels.map((l) => `<span>${l}</span>`).join('');

    if (factor < 1) {
      priceOldEl.textContent = formatPrice(base);
      priceOldEl.style.display = '';
      noteEl.textContent = 'Скидка 5% за заказ на послезавтра уже учтена. Оплата после уборки.';
    } else if (factor > 1) {
      priceOldEl.textContent = '';
      priceOldEl.style.display = 'none';
      noteEl.textContent = 'Выходные — пиковое время, поэтому +10%. Оплата после уборки.';
    } else {
      priceOldEl.textContent = '';
      priceOldEl.style.display = 'none';
      noteEl.textContent = 'Оплата после уборки — наличными или переводом. Без предоплаты.';
    }
    priceEl.textContent = formatPrice(final);
    showStep(3);
  };

  document.querySelectorAll('.calc__opt').forEach((btn) => {
    btn.addEventListener('click', () => {
      const stepNum = Number(btn.dataset.step);
      const group = document.querySelectorAll(`.calc__opt[data-step="${stepNum}"]`);
      group.forEach((b) => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');

      if (stepNum === 1) calcState.area = Number(btn.dataset.value);
      if (stepNum === 2) calcState.type = btn.dataset.value;
      if (stepNum === 3) calcState.day = btn.dataset.value;

      // Небольшая пауза — чтобы выбор визуально «щёлкнул»
      window.setTimeout(() => {
        if (stepNum < 3) showStep(stepNum);
        else showResult();
      }, 240);
    });
  });

  document.querySelectorAll('.calc__back').forEach((btn) => {
    btn.addEventListener('click', () => {
      showStep(Number(btn.dataset.back) - 1);
    });
  });

  /* Переход из расчёта в форму */
  const orderCalcNote = document.getElementById('orderCalcNote');
  const areaSelect = document.getElementById('fArea');

  const syncAreaSelect = () => {
    if (!calcState.area) return;
    const label = calcState.area === 100 ? '100+ м²' : `до ${calcState.area} м²`;
    Array.from(areaSelect.options).forEach((opt) => {
      opt.selected = opt.value === label;
    });
  };

  calcOrderBtn.addEventListener('click', () => {
    const { final } = computePrice();
    orderCalcNote.hidden = false;
    orderCalcNote.textContent = `По расчёту: ${formatPrice(final)} — зафиксируем цену при звонке 🌞`;
    syncAreaSelect();
    document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
    window.setTimeout(() => document.getElementById('fName').focus({ preventScroll: true }), 900);
  });

  /* Кнопки «Заказать» в карточках услуг */
  document.querySelectorAll('.service-card__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      orderCalcNote.hidden = false;
      orderCalcNote.textContent = `Вы выбрали: ${btn.dataset.service} — уточним детали при звонке 🌞`;
      document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
      window.setTimeout(() => document.getElementById('fName').focus({ preventScroll: true }), 900);
    });
  });

  /* ---------- Карусель отзывов ---------- */
  const track = document.getElementById('reviewsTrack');
  const slides = Array.from(track.children);
  const dotsWrap = document.getElementById('revDots');
  let currentSlide = 0;
  let autoTimer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'reviews__dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', `Отзыв ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i, true));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function goToSlide(index, manual = false) {
    currentSlide = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === currentSlide));
    if (manual) restartAuto();
  }

  function restartAuto() {
    window.clearInterval(autoTimer);
    autoTimer = window.setInterval(() => goToSlide(currentSlide + 1), 6000);
  }

  document.getElementById('revPrev').addEventListener('click', () => goToSlide(currentSlide - 1, true));
  document.getElementById('revNext').addEventListener('click', () => goToSlide(currentSlide + 1, true));

  /* Свайп на тач-устройствах */
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 45) goToSlide(currentSlide + (dx < 0 ? 1 : -1), true);
  }, { passive: true });

  /* Пауза автопрокрутки при наведении */
  const carousel = document.querySelector('.reviews__carousel');
  carousel.addEventListener('mouseenter', () => window.clearInterval(autoTimer));
  carousel.addEventListener('mouseleave', restartAuto);
  restartAuto();

  /* ---------- Счётчик «домов почищено» ---------- */
  const counterEl = document.getElementById('counter');
  const COUNTER_TARGET = 1248;
  let counterDone = false;

  const animateCounter = () => {
    if (counterDone) return;
    counterDone = true;
    const duration = 2200;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      counterEl.textContent = Math.round(COUNTER_TARGET * eased).toLocaleString('ru-RU');
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter();
        counterObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  counterObserver.observe(document.getElementById('counterBlock'));

  /* ---------- Появление блоков при скролле ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  /* ---------- Плавающая кнопка на мобильных ---------- */
  const floatCta = document.getElementById('floatCta');
  const heroSection = document.querySelector('.hero');
  const orderSection = document.getElementById('order');

  const toggleFloatCta = () => {
    const heroBottom = heroSection.getBoundingClientRect().bottom;
    const orderTop = orderSection.getBoundingClientRect().top;
    const orderBottom = orderSection.getBoundingClientRect().bottom;
    const pastHero = heroBottom < 0;
    const inOrder = orderTop < window.innerHeight && orderBottom > 0;
    floatCta.classList.toggle('is-visible', pastHero && !inOrder);
  };
  window.addEventListener('scroll', toggleFloatCta, { passive: true });
  toggleFloatCta();

  /* ---------- Форма заказа ---------- */
  const form = document.getElementById('orderForm');
  const successBlock = document.getElementById('orderSuccess');
  const successText = document.getElementById('orderSuccessText');
  const nameInput = document.getElementById('fName');
  const phoneInput = document.getElementById('fPhone');

  /* Лёгкая маска телефона: оставляем цифры и + */
  phoneInput.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/[^\d+\s()-]/g, '');
  });

  const markError = (input, hasError) => {
    input.classList.toggle('is-error', hasError);
  };

  [nameInput, phoneInput].forEach((input) => {
    input.addEventListener('input', () => markError(input, false));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameOk = nameInput.value.trim().length >= 2;
    const digits = phoneInput.value.replace(/\D/g, '');
    const phoneOk = digits.length >= 10;

    markError(nameInput, !nameOk);
    markError(phoneInput, !phoneOk);

    if (!nameOk) { nameInput.focus(); return; }
    if (!phoneOk) { phoneInput.focus(); return; }

    const firstName = nameInput.value.trim();
    const area = areaSelect.value;
    successText.textContent = `${firstName}, перезвоним вам в течение 15 минут и подтвердим уборку (${area}). А пока — планируйте прогулку!`;

    form.hidden = true;
    successBlock.hidden = false;
    successBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.getElementById('orderAgain').addEventListener('click', () => {
    form.reset();
    form.hidden = false;
    successBlock.hidden = true;
    orderCalcNote.hidden = true;
    nameInput.focus();
  });

});
