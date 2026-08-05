/* ============================================================
   Салон красоты «Нюанс» — интерактивность
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: фон после скролла ---------- */
  var header = document.getElementById('header');
  function onScrollHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.querySelector('.nav');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- Hero: кроссфейд-слайдшоу ---------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero__slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero__dot'));
  var current = 0;
  var timer = null;

  function goToSlide(index) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
  }

  function startSlideshow() {
    if (reduceMotion || timer) return;
    timer = setInterval(function () { goToSlide(current + 1); }, 6000);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      goToSlide(Number(dot.getAttribute('data-slide')));
      clearInterval(timer);
      timer = null;
      startSlideshow();
    });
  });
  startSlideshow();

  /* ---------- Параллакс ---------- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var heroArt = Array.prototype.slice.call(document.querySelectorAll('.hero__art'));
  var ticking = false;

  function applyParallax() {
    ticking = false;
    if (reduceMotion) return;
    var y = window.scrollY;
    parallaxEls.forEach(function (el) {
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
      el.style.transform = 'translateY(' + (y * speed).toFixed(1) + 'px)';
    });
    // лёгкий параллакс фона hero
    if (y < window.innerHeight) {
      heroArt.forEach(function (art) {
        art.style.transform = 'translateY(' + (y * 0.12).toFixed(1) + 'px)';
      });
    }
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(applyParallax);
    }
  }, { passive: true });

  /* ---------- Появление при скролле (IntersectionObserver) ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Галерея: слайдеры «до/после» ---------- */
  document.querySelectorAll('.ba-card__compare').forEach(function (compare) {
    var range = compare.querySelector('.ba-card__range');
    function update() {
      compare.style.setProperty('--split', range.value + '%');
    }
    range.addEventListener('input', update);
    update();
  });

  /* ---------- Галерея: кнопки горизонтального скролла ---------- */
  var track = document.getElementById('galleryTrack');
  function galleryStep(dir) {
    var card = track.querySelector('.ba-card');
    var step = card ? card.getBoundingClientRect().width + 32 : 400;
    track.scrollBy({ left: dir * step, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  document.getElementById('galPrev').addEventListener('click', function () { galleryStep(-1); });
  document.getElementById('galNext').addEventListener('click', function () { galleryStep(1); });

  /* ---------- Отзывы: карусель ---------- */
  var reviews = Array.prototype.slice.call(document.querySelectorAll('.review'));
  var revDotsWrap = document.getElementById('revDots');
  var revIndex = 0;
  var revTimer = null;

  reviews.forEach(function (_, i) {
    var d = document.createElement('button');
    d.className = 'reviews__dot' + (i === 0 ? ' is-active' : '');
    d.setAttribute('aria-label', 'Отзыв ' + (i + 1));
    d.setAttribute('data-cursor', '');
    d.addEventListener('click', function () { showReview(i); restartRevTimer(); });
    revDotsWrap.appendChild(d);
  });
  var revDots = Array.prototype.slice.call(revDotsWrap.children);

  function showReview(i) {
    reviews[revIndex].classList.remove('is-active');
    revDots[revIndex].classList.remove('is-active');
    revIndex = (i + reviews.length) % reviews.length;
    reviews[revIndex].classList.add('is-active');
    revDots[revIndex].classList.add('is-active');
  }

  function restartRevTimer() {
    clearInterval(revTimer);
    if (!reduceMotion) {
      revTimer = setInterval(function () { showReview(revIndex + 1); }, 7000);
    }
  }

  document.getElementById('revPrev').addEventListener('click', function () {
    showReview(revIndex - 1); restartRevTimer();
  });
  document.getElementById('revNext').addEventListener('click', function () {
    showReview(revIndex + 1); restartRevTimer();
  });
  restartRevTimer();

  /* ---------- Мастера: предзаполнение формы ---------- */
  document.querySelectorAll('[data-master]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var master = btn.getAttribute('data-master');
      var select = document.getElementById('fService');
      // мягкий намёк в селекте по специализации
      if (master.indexOf('Ольга') !== -1) select.value = 'Маникюр';
      else if (master.indexOf('Мария') !== -1) select.value = 'Стрижка и укладка';
      else select.value = 'Окрашивание';
    });
  });

  /* ---------- Форма записи: валидация ---------- */
  var form = document.getElementById('bookingForm');
  var successMsg = document.getElementById('formSuccess');
  var dateInput = document.getElementById('fDate');

  // минимальная дата — сегодня
  var today = new Date();
  var iso = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');
  dateInput.min = iso;

  // маска телефона (мягкая)
  var phoneInput = document.getElementById('fPhone');
  phoneInput.addEventListener('input', function () {
    var digits = phoneInput.value.replace(/\D/g, '');
    if (digits.charAt(0) === '8') digits = '7' + digits.slice(1);
    if (digits && digits.charAt(0) !== '7') digits = '7' + digits;
    digits = digits.slice(0, 11);
    var out = '';
    if (digits.length > 0) out = '+7';
    if (digits.length > 1) out += ' (' + digits.slice(1, 4);
    if (digits.length >= 4) out += ') ' + digits.slice(4, 7);
    if (digits.length >= 7) out += '-' + digits.slice(7, 9);
    if (digits.length >= 9) out += '-' + digits.slice(9, 11);
    phoneInput.value = out;
  });

  function setError(input, message) {
    var field = input.closest('.form__field');
    field.classList.toggle('has-error', Boolean(message));
    field.querySelector('.form__error').textContent = message || '';
  }

  function validate() {
    var ok = true;
    var name = document.getElementById('fName');
    var service = document.getElementById('fService');

    if (name.value.trim().length < 2) {
      setError(name, 'Введите имя (минимум 2 символа)'); ok = false;
    } else setError(name, '');

    if (phoneInput.value.replace(/\D/g, '').length !== 11) {
      setError(phoneInput, 'Введите телефон полностью'); ok = false;
    } else setError(phoneInput, '');

    if (!service.value) {
      setError(service, 'Выберите услугу'); ok = false;
    } else setError(service, '');

    if (!dateInput.value) {
      setError(dateInput, 'Выберите дату'); ok = false;
    } else if (dateInput.value < iso) {
      setError(dateInput, 'Дата не может быть в прошлом'); ok = false;
    } else setError(dateInput, '');

    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;
    successMsg.hidden = false;
    form.reset();
    setTimeout(function () { successMsg.hidden = true; }, 6000);
  });

  ['fName', 'fPhone', 'fService', 'fDate'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
      setError(this, '');
    });
  });

  /* ---------- Плавающая кнопка «Записаться» ---------- */
  var fab = document.getElementById('fab');
  var fabVisible = false;
  window.addEventListener('scroll', function () {
    var should = window.scrollY > window.innerHeight * 0.5;
    if (should !== fabVisible) {
      fabVisible = should;
      fab.classList.toggle('is-visible', should);
    }
  }, { passive: true });

})();
