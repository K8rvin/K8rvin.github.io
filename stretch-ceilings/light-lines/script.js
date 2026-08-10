/* ============================================================
   СВЕТАРХ — ванильный JS: зажигание света, сценарии, карусель
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Текущий год в футере ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- «Зажигание» световых линий hero при загрузке ---------- */
  function ignite() {
    requestAnimationFrame(function () {
      document.body.classList.add('is-lit');
    });
  }
  if (document.readyState === 'complete') ignite();
  else window.addEventListener('load', ignite);
  /* страховка, если load задержится из-за шрифтов */
  setTimeout(function () { document.body.classList.add('is-lit'); }, 1500);

  /* ---------- Header: фон при скролле ---------- */
  var header = document.getElementById('header');
  function onScroll() {
    if (window.scrollY > 30) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Бургер-меню ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var siteNav = document.getElementById('site-nav');

  function closeNav() {
    navToggle.classList.remove('is-open');
    siteNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Открыть меню');
    document.body.style.overflow = '';
  }
  navToggle.addEventListener('click', function () {
    var open = siteNav.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  siteNav.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeNav();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && siteNav.classList.contains('is-open')) closeNav();
  });

  /* ---------- Появление при скролле + «зажигание» линий секций ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  var igniteEls = document.querySelectorAll('.cards, #steps');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });

    var ioLines = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-lit');
        ioLines.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
    igniteEls.forEach(function (el) { ioLines.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
    igniteEls.forEach(function (el) { el.classList.add('is-lit'); });
  }

  /* ---------- Сценарии света: режимы + ползунок яркости ---------- */
  var scene = document.getElementById('room-scene');
  var modeDesc = document.getElementById('mode-desc');
  var brightRange = document.getElementById('bright-range');
  var brightOut = document.getElementById('bright-out');
  var modeBtns = document.querySelectorAll('.mode-btn');

  var MODES = {
    cold:   { bright: 90, text: 'Рабочий ритм. Ровный свет 5000 К — как дневной, только лучше.' },
    warm:   { bright: 62, text: 'Отдых. Янтарные 2700 К — свет мягко стелется по потолку.' },
    cinema: { bright: 16, text: 'Почти темно: только экран и тонкая линия акцента над головой.' }
  };

  function setBright(percent) {
    var p = Math.max(8, Math.min(100, percent));
    scene.style.setProperty('--bright', (p / 100).toFixed(2));
    brightRange.value = String(p);
    brightRange.style.setProperty('--fill', p + '%');
    brightOut.textContent = p + '%';
  }

  function setMode(mode, announce) {
    if (!MODES[mode]) return;
    scene.classList.remove('scene--cold', 'scene--warm', 'scene--cinema');
    scene.classList.add('scene--' + mode);
    modeBtns.forEach(function (btn) {
      var active = btn.dataset.mode === mode;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    if (announce !== false) {
      modeDesc.style.opacity = '0';
      setTimeout(function () {
        modeDesc.textContent = MODES[mode].text;
        modeDesc.style.opacity = '1';
      }, 220);
    } else {
      modeDesc.textContent = MODES[mode].text;
    }
    setBright(MODES[mode].bright);
  }

  modeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { setMode(btn.dataset.mode); });
  });
  brightRange.addEventListener('input', function () {
    setBright(parseInt(brightRange.value, 10));
  });
  setMode('cold', false);

  /* ---------- Карусель отзывов ---------- */
  var track = document.getElementById('reviews-track');
  var prevBtn = document.getElementById('rev-prev');
  var nextBtn = document.getElementById('rev-next');
  var dotsWrap = document.getElementById('rev-dots');
  var slides = track.children;
  var total = slides.length;
  var index = 0;
  var timer = null;

  for (var i = 0; i < total; i++) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
    (function (n) {
      dot.addEventListener('click', function () { goTo(n, true); });
    })(i);
    dotsWrap.appendChild(dot);
  }
  var dots = dotsWrap.children;

  function goTo(n, manual) {
    index = (n + total) % total;
    track.style.transform = 'translateX(-' + index * 100 + '%)';
    for (var d = 0; d < total; d++) {
      dots[d].classList.toggle('is-active', d === index);
      dots[d].setAttribute('aria-selected', String(d === index));
    }
    if (manual) restartAuto();
  }
  function restartAuto() {
    if (timer) clearInterval(timer);
    timer = setInterval(function () { goTo(index + 1, false); }, 6500);
  }

  prevBtn.addEventListener('click', function () { goTo(index - 1, true); });
  nextBtn.addEventListener('click', function () { goTo(index + 1, true); });

  var carousel = document.getElementById('carousel');
  carousel.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
  carousel.addEventListener('mouseleave', restartAuto);

  /* свайп на мобильных */
  var touchX = null;
  track.addEventListener('touchstart', function (e) {
    touchX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1), true);
    touchX = null;
  }, { passive: true });

  goTo(0, false);
  restartAuto();

  /* ---------- Форма заявки: демо-отправка ---------- */
  var form = document.getElementById('lead-form');
  var success = document.getElementById('form-success');
  var againBtn = document.getElementById('form-again');
  var nameInput = document.getElementById('f-name');
  var phoneInput = document.getElementById('f-phone');

  /* лёгкая маска телефона: только цифры, +, скобки, дефисы, пробел */
  phoneInput.addEventListener('input', function () {
    var cleaned = phoneInput.value.replace(/[^\d+\-() ]/g, '');
    if (cleaned !== phoneInput.value) phoneInput.value = cleaned;
    phoneInput.classList.remove('is-error');
  });
  nameInput.addEventListener('input', function () {
    nameInput.classList.remove('is-error');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;

    if (nameInput.value.trim().length < 2) {
      nameInput.classList.add('is-error');
      ok = false;
    }
    var digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length < 10) {
      phoneInput.classList.add('is-error');
      ok = false;
    }
    if (!ok) return;

    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  againBtn.addEventListener('click', function () {
    form.reset();
    success.hidden = true;
    form.hidden = false;
    nameInput.focus();
  });
})();
