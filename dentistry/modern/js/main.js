/* ============================================================
   NovaDent — интерактив лендинга
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Липкая шапка ---------- */
  var header = document.getElementById('header');
  var onScroll = function () {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('.nav__link')) {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  /* ---------- Появление блоков при скролле ---------- */
  var revealEls = document.querySelectorAll('.reveal');
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

  /* ---------- Бегущая строка: дублируем контент для бесшовности ---------- */
  var marqueeTrack = document.getElementById('marqueeTrack');
  if (marqueeTrack) {
    marqueeTrack.innerHTML += marqueeTrack.innerHTML;
  }

  /* ---------- Табы цен ---------- */
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      document.querySelectorAll('.price-panel').forEach(function (panel) {
        var active = panel.id === 'tab-' + tab.dataset.tab;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
    });
  });

  /* ---------- Слайдер отзывов ---------- */
  var track = document.getElementById('sliderTrack');
  if (track) {
    var slides = track.children;
    var dotsWrap = document.getElementById('sliderDots');
    var current = 0;
    var timer = null;

    for (var i = 0; i < slides.length; i++) {
      var dot = document.createElement('button');
      dot.className = 'slider__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
      dot.dataset.index = i;
      dotsWrap.appendChild(dot);
    }
    var dots = dotsWrap.children;

    var goTo = function (index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + current * 100 + '%)';
      for (var j = 0; j < dots.length; j++) {
        dots[j].classList.toggle('is-active', j === current);
      }
    };

    var restartAuto = function () {
      clearInterval(timer);
      timer = setInterval(function () { goTo(current + 1); }, 6000);
    };

    document.getElementById('prevSlide').addEventListener('click', function () {
      goTo(current - 1); restartAuto();
    });
    document.getElementById('nextSlide').addEventListener('click', function () {
      goTo(current + 1); restartAuto();
    });
    dotsWrap.addEventListener('click', function (e) {
      var dot = e.target.closest('.slider__dot');
      if (dot) { goTo(Number(dot.dataset.index)); restartAuto(); }
    });

    // Свайп на тач-устройствах
    var startX = null;
    track.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { goTo(current + (dx < 0 ? 1 : -1)); restartAuto(); }
      startX = null;
    }, { passive: true });

    restartAuto();
  }

  /* ---------- Маска телефона +7 (___) ___-__-__ ---------- */
  var phoneInput = document.getElementById('phone');
  phoneInput.addEventListener('input', function () {
    var digits = phoneInput.value.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!digits.startsWith('7')) digits = '7' + digits;
    digits = digits.slice(0, 11);

    var result = '+7';
    if (digits.length > 1) result += ' (' + digits.slice(1, 4);
    if (digits.length >= 4) result += ') ' + digits.slice(4, 7);
    if (digits.length >= 7) result += '-' + digits.slice(7, 9);
    if (digits.length >= 9) result += '-' + digits.slice(9, 11);
    phoneInput.value = digits.length > 1 ? result : (digits ? '+7' : '');
  });

  /* ---------- Валидация и отправка формы ---------- */
  var form = document.getElementById('bookingForm');
  var toast = document.getElementById('toast');

  var showError = function (field, message) {
    var slot = form.querySelector('[data-error-for="' + field + '"]');
    if (slot) slot.textContent = message || '';
    var input = form.querySelector('#' + field);
    if (input && input.type !== 'checkbox') {
      input.classList.toggle('is-invalid', Boolean(message));
    }
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;

    var name = form.name.value.trim();
    if (name.length < 2) {
      showError('name', 'Введите имя (минимум 2 символа)');
      valid = false;
    } else {
      showError('name', '');
    }

    var digits = form.phone.value.replace(/\D/g, '');
    if (digits.length !== 11) {
      showError('phone', 'Введите телефон полностью');
      valid = false;
    } else {
      showError('phone', '');
    }

    if (!form.consent.checked) {
      showError('consent', 'Нужно согласие на обработку данных');
      valid = false;
    } else {
      showError('consent', '');
    }

    if (!valid) return;

    // Бэкенда нет: имитируем успешную отправку
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Отправляем…';

    setTimeout(function () {
      btn.disabled = false;
      btn.textContent = 'Записаться на приём';
      form.reset();
      toast.classList.add('is-visible');
      setTimeout(function () { toast.classList.remove('is-visible'); }, 5000);
    }, 900);
  });

  // Скрыть toast по клику
  toast.addEventListener('click', function () {
    toast.classList.remove('is-visible');
  });
})();
