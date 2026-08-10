/* ============================================================
   Потолок за один день — script.js
   Ванильный JS: калькулятор, бейдж бригад, карусель, FAQ,
   таймлайн, модалка, формы, reveal-анимации.
   ============================================================ */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Утилиты ---------- */
  function formatPrice(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
  }
  function plural(n, one, few, many) {
    var m = Math.abs(n) % 100, d = m % 10;
    if (m > 10 && m < 20) return many;
    if (d > 1 && d < 5) return few;
    if (d === 1) return one;
    return many;
  }
  function isValidPhone(v) {
    var digits = v.replace(/\D/g, '');
    return digits.length >= 10;
  }

  /* ---------- Header: тень при скролле ---------- */
  var header = $('#header');
  function onHeaderScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onHeaderScroll, { passive: true });
  onHeaderScroll();

  /* ---------- Бургер-меню ---------- */
  var burger = $('#burger');
  var nav = $('#nav');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('.nav__link', nav).forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ---------- Динамический бейдж свободных бригад ---------- */
  var brigadesBadge = $('#brigadesBadge');
  var brigadesCount = $('#brigadesCount');
  var brigades = 2 + Math.floor(Math.random() * 2); // 2 или 3 при загрузке
  function renderBrigades() {
    brigadesCount.textContent = brigades + ' ' + plural(brigades, 'бригада', 'бригады', 'бригад');
  }
  renderBrigades();
  setInterval(function () {
    var next = Math.random() < 0.5 ? 2 : 3;
    if (next === brigades) return;
    brigades = next;
    brigadesBadge.classList.add('is-updating');
    setTimeout(function () {
      renderBrigades();
      brigadesBadge.classList.remove('is-updating');
    }, 320);
  }, 20000);

  /* ---------- Калькулятор ---------- */
  var PROMO_COEF = 0.77;      // скидка нового клиента (~−23%)
  var PENSIONER_COEF = 0.8;   // пенсионерам −20%

  var state = {
    area: 15,
    rate: 450,
    typeName: 'глянец',
    pensioner: false
  };

  var areaButtons = $$('#areaButtons .calc__area');
  var typeButtons = $$('#calcTypes .calc__type');
  var customArea = $('#customArea');
  var customAreaValue = $('#customAreaValue');
  var pensionerCheck = $('#pensionerCheck');
  var priceEl = $('#calcPrice');
  var priceOldEl = $('#calcPriceOld');
  var discountNote = $('#calcDiscountNote');

  function calcPrice() {
    var base = state.area * state.rate;
    var price = base * PROMO_COEF * (state.pensioner ? PENSIONER_COEF : 1);
    return {
      price: Math.round(price / 50) * 50,
      old: Math.round(base / 50) * 50
    };
  }

  function renderPrice(animate) {
    var p = calcPrice();
    var apply = function () {
      priceEl.textContent = formatPrice(p.price);
      priceOldEl.textContent = formatPrice(p.old);
      discountNote.textContent = state.pensioner
        ? 'Учтены скидка нового клиента и пенсионная −20%'
        : 'Скидка нового клиента уже учтена';
    };
    if (animate) {
      priceEl.classList.add('is-bumping');
      setTimeout(function () {
        apply();
        priceEl.classList.remove('is-bumping');
      }, 200);
    } else {
      apply();
    }
  }

  function setArea(area, source) {
    state.area = area;
    areaButtons.forEach(function (b) {
      b.classList.toggle('is-active', Number(b.dataset.area) === area);
    });
    if (source !== 'range') {
      customArea.value = String(Math.min(60, Math.max(5, area)));
      updateRangeFill();
      customAreaValue.textContent = customArea.value + ' м²';
    }
    renderPrice(true);
  }

  function updateRangeFill() {
    var min = Number(customArea.min), max = Number(customArea.max);
    var pct = ((Number(customArea.value) - min) / (max - min)) * 100;
    customArea.style.setProperty('--fill', pct + '%');
  }

  areaButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setArea(Number(btn.dataset.area), 'button');
    });
  });

  customArea.addEventListener('input', function () {
    updateRangeFill();
    customAreaValue.textContent = customArea.value + ' м²';
    setArea(Number(customArea.value), 'range');
  });

  typeButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      typeButtons.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      state.rate = Number(btn.dataset.rate);
      state.typeName = btn.textContent.trim().toLowerCase();
      renderPrice(true);
    });
  });

  pensionerCheck.addEventListener('change', function () {
    state.pensioner = pensionerCheck.checked;
    renderPrice(true);
  });

  updateRangeFill();
  renderPrice(false);

  // Кнопки «Выбрать …» в карточках видов → ставим тип и скроллим к расчёту
  var typeMap = { gloss: 0, matte: 1, satin: 2 };
  $$('[data-type-choose]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var idx = typeMap[btn.dataset.typeChoose];
      if (typeof idx === 'number' && typeButtons[idx]) typeButtons[idx].click();
      document.getElementById('calc').scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- Модалка заказа ---------- */
  var modal = $('#orderModal');
  var modalBody = $('#modalBody');
  var modalSuccess = $('#modalSuccess');
  var modalPrice = $('#modalPrice');
  var modalDetails = $('#modalDetails');
  var lastFocus = null;

  function openModal() {
    var p = calcPrice();
    modalPrice.textContent = formatPrice(p.price);
    modalDetails.textContent = state.area + ' м², ' + state.typeName + (state.pensioner ? ', льгота −20%' : '');
    modalBody.hidden = false;
    modalSuccess.hidden = true;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    lastFocus = document.activeElement;
    setTimeout(function () { $('#modalPhone').focus(); }, 60);
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  $('#orderByPrice').addEventListener('click', openModal);
  $$('[data-modal-close]', modal).forEach(function (el) {
    el.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  $('#modalForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var phone = $('#modalPhone');
    if (!isValidPhone(phone.value)) {
      phone.classList.add('is-error');
      phone.focus();
      setTimeout(function () { phone.classList.remove('is-error'); }, 1200);
      return;
    }
    modalBody.hidden = true;
    modalSuccess.hidden = false;
  });

  /* ---------- Форма финального CTA ---------- */
  var ctaForm = $('#ctaForm');
  var ctaPhone = $('#ctaPhone');
  var ctaSuccess = $('#ctaSuccess');
  ctaForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!isValidPhone(ctaPhone.value)) {
      ctaPhone.classList.add('is-error');
      ctaPhone.focus();
      setTimeout(function () { ctaPhone.classList.remove('is-error'); }, 1200);
      return;
    }
    ctaForm.hidden = true;
    ctaSuccess.hidden = false;
  });

  /* ---------- Маска телефона (мягкая) ---------- */
  [ctaPhone, $('#modalPhone')].forEach(function (input) {
    if (!input) return;
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '');
      if (d.startsWith('8')) d = '7' + d.slice(1);
      if (d && !d.startsWith('7')) d = '7' + d;
      d = d.slice(0, 11);
      var out = '';
      if (d.length > 0) out = '+7';
      if (d.length > 1) out += ' (' + d.slice(1, 4);
      if (d.length >= 4) out += ') ' + d.slice(4, 7);
      if (d.length >= 7) out += '-' + d.slice(7, 9);
      if (d.length >= 9) out += '-' + d.slice(9, 11);
      input.value = out;
    });
  });

  /* ---------- Карусель отзывов ---------- */
  var track = $('#carouselTrack');
  var slides = $$('.review', track);
  var dotsWrap = $('#carouselDots');
  var current = 0;
  var autoTimer = null;

  slides.forEach(function (_, i) {
    var dot = document.createElement('button');
    dot.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
    dot.addEventListener('click', function () { goTo(i); restartAuto(); });
    dotsWrap.appendChild(dot);
  });
  var dots = $$('.carousel__dot', dotsWrap);

  function goTo(i) {
    current = (i + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + current * 100 + '%)';
    dots.forEach(function (d, j) { d.classList.toggle('is-active', j === current); });
  }
  function restartAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(function () { goTo(current + 1); }, 7000);
  }
  $('#prevReview').addEventListener('click', function () { goTo(current - 1); restartAuto(); });
  $('#nextReview').addEventListener('click', function () { goTo(current + 1); restartAuto(); });
  restartAuto();

  // Свайп на мобильных
  var startX = null;
  var viewport = $('.carousel__viewport');
  viewport.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  viewport.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 45) goTo(current + (dx < 0 ? 1 : -1));
    startX = null;
    restartAuto();
  }, { passive: true });

  /* ---------- FAQ-аккордеон с плавной анимацией ---------- */
  var faqItems = $$('.faq__item');
  faqItems.forEach(function (item) {
    var summary = $('summary', item);
    var answer = $('.faq__answer', item);
    summary.addEventListener('click', function (e) {
      e.preventDefault();
      if (item.open) {
        collapse(item, answer);
      } else {
        faqItems.forEach(function (other) {
          if (other !== item && other.open) collapse(other, $('.faq__answer', other));
        });
        expand(item, answer);
      }
    });
  });
  function expand(item, answer) {
    item.open = true;
    var h = answer.scrollHeight;
    answer.style.height = '0px';
    answer.style.opacity = '0';
    requestAnimationFrame(function () {
      answer.style.transition = 'height .38s cubic-bezier(.22,1,.36,1), opacity .3s';
      answer.style.height = h + 'px';
      answer.style.opacity = '1';
    });
    answer.addEventListener('transitionend', function te() {
      answer.style.height = '';
      answer.style.transition = '';
      answer.removeEventListener('transitionend', te);
    });
  }
  function collapse(item, answer) {
    var h = answer.scrollHeight;
    answer.style.height = h + 'px';
    requestAnimationFrame(function () {
      answer.style.transition = 'height .3s ease, opacity .25s';
      answer.style.height = '0px';
      answer.style.opacity = '0';
    });
    answer.addEventListener('transitionend', function tc() {
      item.open = false;
      answer.style.height = '';
      answer.style.transition = '';
      answer.style.opacity = '';
      answer.removeEventListener('transitionend', tc);
    });
  }

  /* ---------- Таймлайн: прогресс и маркер по скроллу ---------- */
  var timeline = $('#timeline');
  var tlProgress = $('#timelineProgress');
  var tlMarker = $('#timelineMarker');
  function updateTimeline() {
    var rect = timeline.getBoundingClientRect();
    var vh = window.innerHeight;
    // 0 — секция вошла снизу, 1 — дошла до середины экрана
    var total = rect.height + vh * 0.55;
    var passed = vh * 0.85 - rect.top;
    var pct = Math.min(1, Math.max(0, passed / total));
    tlProgress.style.height = (pct * 100).toFixed(2) + '%';
    tlMarker.style.top = (pct * 100).toFixed(2) + '%';
  }
  window.addEventListener('scroll', updateTimeline, { passive: true });
  window.addEventListener('resize', updateTimeline);
  updateTimeline();

  /* ---------- Reveal-анимации при скролле ---------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
