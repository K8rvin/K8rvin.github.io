/* ============================================================
   «Семейная улыбка» — интерактив лендинга
   ============================================================ */
(function () {
  'use strict';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ---------- Плавная прокрутка к якорям ---------- */
  function scrollToTarget(hash) {
    const el = $(hash);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  $$('[data-scroll-to]').forEach((btn) => {
    btn.addEventListener('click', () => scrollToTarget(btn.dataset.scrollTo));
  });
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const hash = link.getAttribute('href');
      if (hash.length > 1 && $(hash)) {
        e.preventDefault();
        scrollToTarget(hash);
        closeMobileMenu();
      }
    });
  });

  /* ---------- Мобильное меню ---------- */
  const burger = $('#burger');
  const header = $('.header');
  function closeMobileMenu() {
    header.classList.remove('header--menu-open');
    burger.classList.remove('burger--open');
    burger.setAttribute('aria-expanded', 'false');
  }
  burger.addEventListener('click', () => {
    const open = header.classList.toggle('header--menu-open');
    burger.classList.toggle('burger--open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  /* ---------- Появление секций при скролле (fade-in) ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('reveal--visible'));
  }

  /* ---------- Плавающая кнопка «Записаться» после первого скролла ---------- */
  const fab = $('#fab');
  let fabShown = false;
  window.addEventListener('scroll', () => {
    if (!fabShown && window.scrollY > 200) {
      fabShown = true;
      fab.classList.add('fab--visible');
    }
  }, { passive: true });

  /* ---------- Модальные окна услуг ---------- */
  let lastFocused = null;

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    const closeBtn = $('.modal__close', modal);
    if (closeBtn) closeBtn.focus();
  }
  function closeModal(modal) {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  $$('[data-modal]').forEach((card) => {
    const open = () => openModal(card.dataset.modal);
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });

  $$('.modal').forEach((modal) => {
    $$('[data-close-modal]', modal).forEach((closer) => {
      closer.addEventListener('click', () => closeModal(modal));
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const open = $('.modal:not([hidden])');
      if (open) closeModal(open);
    }
  });

  /* ---------- Универсальный слайдер ---------- */
  function createSlider(cfg) {
    const track = $(cfg.track);
    const slides = Array.from(track.children);
    const prevBtn = $(cfg.prev);
    const nextBtn = $(cfg.next);
    const dotsWrap = $(cfg.dots);
    let index = 0;

    function perView() {
      const w = window.innerWidth;
      if (w <= 640) return cfg.perViewMobile;
      if (w <= 1020) return cfg.perViewTablet;
      return cfg.perViewDesktop;
    }
    function maxIndex() {
      return Math.max(0, slides.length - perView());
    }
    function render() {
      const slide = slides[0];
      const gap = parseFloat(getComputedStyle(slide).marginRight) || 0;
      const step = slide.getBoundingClientRect().width + gap;
      index = Math.min(index, maxIndex());
      track.style.transform = `translateX(${-index * step}px)`;
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index >= maxIndex();
      $$('button', dotsWrap).forEach((d, i) => {
        d.classList.toggle('active', i === index);
        d.setAttribute('aria-selected', String(i === index));
      });
    }
    function goTo(i) {
      index = Math.max(0, Math.min(i, maxIndex()));
      render();
    }

    // точки навигации
    if (dotsWrap) {
      const buildDots = () => {
        dotsWrap.innerHTML = '';
        for (let i = 0; i <= maxIndex(); i++) {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.setAttribute('role', 'tab');
          dot.setAttribute('aria-label', 'Слайд ' + (i + 1));
          dot.addEventListener('click', () => goTo(i));
          dotsWrap.appendChild(dot);
        }
      };
      buildDots();
      window.addEventListener('resize', () => { buildDots(); render(); });
    } else {
      window.addEventListener('resize', render);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1));

    // свайп на мобильных
    let startX = null;
    track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
      startX = null;
    }, { passive: true });

    render();
    return { goTo, next: () => goTo(index + 1 > maxIndex() ? 0 : index + 1) };
  }

  /* Слайдер работ «До/После» */
  createSlider({
    track: '#worksTrack',
    prev: '#worksPrev',
    next: '#worksNext',
    dots: '#worksDots',
    perViewDesktop: 3,
    perViewTablet: 2,
    perViewMobile: 1,
  });

  /* Карусель отзывов с автопрокруткой */
  const reviews = createSlider({
    track: '#reviewsTrack',
    prev: '#revPrev',
    next: '#revNext',
    dots: '#reviewsDots',
    perViewDesktop: 1,
    perViewTablet: 1,
    perViewMobile: 1,
  });
  let autoTimer = setInterval(autoAdvance, 6000);
  function autoAdvance() { reviews.next(); }
  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(autoAdvance, 6000);
  }
  ['#revPrev', '#revNext', '#reviewsDots'].forEach((sel) => {
    const el = $(sel);
    if (el) el.addEventListener('click', resetAuto);
  });
  const carousel = $('#reviewsCarousel');
  carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
  carousel.addEventListener('mouseleave', resetAuto);

  /* ---------- FAQ-аккордеон ---------- */
  $$('.faq__item').forEach((item) => {
    const btn = $('.faq__question', item);
    const answer = $('.faq__answer', item);
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('faq__item--open');
      // закрываем остальные
      $$('.faq__item--open').forEach((other) => {
        if (other !== item) {
          other.classList.remove('faq__item--open');
          $('.faq__question', other).setAttribute('aria-expanded', 'false');
          $('.faq__answer', other).style.maxHeight = '0px';
        }
      });
      item.classList.toggle('faq__item--open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? '0px' : answer.scrollHeight + 'px';
    });
  });

  /* ---------- Маска телефона ---------- */
  function applyPhoneMask(input) {
    input.addEventListener('input', () => {
      let digits = input.value.replace(/\D/g, '');
      if (digits.startsWith('8')) digits = '7' + digits.slice(1);
      if (digits && !digits.startsWith('7')) digits = '7' + digits;
      digits = digits.slice(0, 11);
      let out = '';
      if (digits.length > 0) out = '+7';
      if (digits.length > 1) out += ' (' + digits.slice(1, 4);
      if (digits.length >= 4) out += ') ' + digits.slice(4, 7);
      if (digits.length >= 7) out += '-' + digits.slice(7, 9);
      if (digits.length >= 9) out += '-' + digits.slice(9, 11);
      input.value = out;
    });
  }
  applyPhoneMask($('#fPhone'));
  applyPhoneMask($('#cbPhone'));

  function isValidPhone(value) {
    return value.replace(/\D/g, '').length === 11;
  }

  /* ---------- Форма записи ---------- */
  const form = $('#bookingForm');
  const formSuccess = $('#formSuccess');

  function setError(input, message) {
    const err = $(`[data-error-for="${input.id}"]`);
    if (err) err.textContent = message || '';
    input.classList.toggle('invalid', Boolean(message));
    return !message;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#fName');
    const phone = $('#fPhone');
    const service = $('#fService');

    let ok = true;
    ok = setError(name, name.value.trim().length >= 2 ? '' : 'Пожалуйста, укажите имя') && ok;
    ok = setError(phone, isValidPhone(phone.value) ? '' : 'Введите телефон полностью') && ok;
    ok = setError(service, service.value ? '' : 'Выберите услугу из списка') && ok;
    if (!ok) return;

    // имитация отправки
    const submitBtn = $('.form__submit', form);
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем…';
    setTimeout(() => {
      form.hidden = true;
      formSuccess.hidden = false;
    }, 900);
  });

  // убираем ошибку при вводе
  $$('#bookingForm input, #bookingForm select').forEach((field) => {
    field.addEventListener('input', () => setError(field, ''));
    field.addEventListener('change', () => setError(field, ''));
  });

  /* ---------- Кнопки «Записаться к этому врачу» ---------- */
  const doctorField = $('#doctorField');
  const doctorInput = $('#fDoctor');
  $$('[data-doctor]').forEach((btn) => {
    btn.addEventListener('click', () => {
      doctorField.hidden = false;
      doctorInput.value = btn.dataset.doctor;
      scrollToTarget('#booking');
    });
  });

  /* ---------- Виджет обратного звонка ---------- */
  const cbToggle = $('#callbackToggle');
  const cbPanel = $('#callbackPanel');
  const cbForm = $('#callbackForm');
  const cbSuccess = $('#callbackSuccess');

  cbToggle.addEventListener('click', () => {
    const open = cbPanel.hidden;
    cbPanel.hidden = !open;
    cbToggle.setAttribute('aria-expanded', String(open));
    if (open) $('#cbPhone').focus();
  });
  document.addEventListener('click', (e) => {
    if (!cbPanel.hidden && !e.target.closest('#callbackWidget')) {
      cbPanel.hidden = true;
      cbToggle.setAttribute('aria-expanded', 'false');
    }
  });

  cbForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = $('#cbPhone');
    if (!setError(phone, isValidPhone(phone.value) ? '' : 'Введите телефон полностью')) return;
    const btn = $('button', cbForm);
    btn.disabled = true;
    btn.textContent = 'Отправляем…';
    setTimeout(() => {
      cbForm.hidden = true;
      cbSuccess.hidden = false;
      setTimeout(() => {
        cbPanel.hidden = true;
        cbToggle.setAttribute('aria-expanded', 'false');
      }, 3000);
    }, 800);
  });
  $('#cbPhone').addEventListener('input', (e) => setError(e.target, ''));
})();
