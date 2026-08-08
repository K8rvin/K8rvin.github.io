/* ===== Drive Academy — ванильный JS ===== */
(function () {
  'use strict';

  /* ---------- Шапка при скролле ---------- */
  var header = document.getElementById('header');
  function onScrollHeader() {
    header.classList.toggle('header--scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Бургер-меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('nav--open');
    burger.classList.toggle('burger--open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('nav--open');
      burger.classList.remove('burger--open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ---------- Появление при скролле ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---------- Счётчики ---------- */
  var countersDone = new WeakSet();
  function animateCounter(el) {
    var target = parseInt(el.dataset.target, 10);
    var suffix = el.dataset.suffix || '';
    var duration = 1800;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = value.toLocaleString('ru-RU') + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !countersDone.has(entry.target)) {
        countersDone.add(entry.target);
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach(function (el) {
    counterObserver.observe(el);
  });

  /* ---------- Чекпоинты трассы ---------- */
  var checkpoints = document.querySelectorAll('.checkpoint');

  checkpoints.forEach(function (cp) {
    var node = cp.querySelector('.checkpoint__node');

    function activate() {
      checkpoints.forEach(function (other) {
        var isCurrent = other === cp;
        other.classList.toggle('checkpoint--active', isCurrent);
        other.querySelector('.checkpoint__node').setAttribute('aria-expanded', String(isCurrent));
      });
    }

    cp.addEventListener('mouseenter', activate);
    node.addEventListener('click', function (e) {
      e.stopPropagation();
      if (cp.classList.contains('checkpoint--active')) {
        cp.classList.remove('checkpoint--active');
        node.setAttribute('aria-expanded', 'false');
      } else {
        activate();
      }
    });
    node.addEventListener('focus', activate);
  });

  document.addEventListener('click', function () {
    checkpoints.forEach(function (cp) {
      cp.classList.remove('checkpoint--active');
      cp.querySelector('.checkpoint__node').setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Машинка на трассе ---------- */
  var trackPath = document.getElementById('trackPath');
  var trackCar = document.getElementById('trackCar');
  var trackSvg = document.querySelector('.track__svg');

  if (trackPath && trackCar && trackSvg) {
    var pathLength = trackPath.getTotalLength();
    var carT = 0;
    var carDir = 1;
    var lastTs = null;

    function positionCar(t) {
      var point = trackPath.getPointAtLength(t * pathLength);
      // переводим координаты viewBox (1000x260) в пиксели контейнера
      var rect = trackSvg.getBoundingClientRect();
      var scaleX = rect.width / 1000;
      var scaleY = rect.height / 260;
      var x = trackSvg.offsetLeft + point.x * scaleX - trackCar.offsetWidth / 2;
      var y = trackSvg.offsetTop + point.y * scaleY - trackCar.offsetHeight + 6;
      trackCar.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    }

    function driveCar(ts) {
      if (lastTs === null) lastTs = ts;
      var dt = ts - lastTs;
      lastTs = ts;
      carT += (dt / 14000) * carDir; // полный путь туда-обратно ~28 сек
      if (carT >= 1) { carT = 1; carDir = -1; }
      if (carT <= 0) { carT = 0; carDir = 1; }
      positionCar(carT);
      requestAnimationFrame(driveCar);
    }

    window.addEventListener('resize', function () { positionCar(carT); }, { passive: true });
    positionCar(0);
    requestAnimationFrame(driveCar);
  }

  /* ---------- Карусель отзывов ---------- */
  var track = document.getElementById('carouselTrack');
  var dotsWrap = document.getElementById('carouselDots');
  var prevBtn = document.getElementById('prevReview');
  var nextBtn = document.getElementById('nextReview');

  if (track && dotsWrap) {
    var slides = track.children.length;
    var current = 0;
    var autoTimer = null;

    for (var i = 0; i < slides; i++) {
      var dot = document.createElement('button');
      dot.className = 'carousel__dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
      (function (index) {
        dot.addEventListener('click', function () {
          goTo(index);
          restartAuto();
        });
      })(i);
      dotsWrap.appendChild(dot);
    }

    var dots = dotsWrap.querySelectorAll('.carousel__dot');

    function goTo(index) {
      current = (index + slides) % slides;
      track.style.transform = 'translateX(-' + current * 100 + '%)';
      dots.forEach(function (d, di) {
        d.classList.toggle('carousel__dot--active', di === current);
      });
    }

    function restartAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(function () { goTo(current + 1); }, 6000);
    }

    prevBtn.addEventListener('click', function () { goTo(current - 1); restartAuto(); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); restartAuto(); });

    var carousel = document.getElementById('carousel');
    carousel.addEventListener('mouseenter', function () { clearInterval(autoTimer); });
    carousel.addEventListener('mouseleave', restartAuto);

    // свайп на мобильных
    var touchStartX = null;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        goTo(current + (dx < 0 ? 1 : -1));
        restartAuto();
      }
      touchStartX = null;
    }, { passive: true });

    goTo(0);
    restartAuto();
  }

  /* ---------- Выбор тарифа → подстановка в форму ---------- */
  document.querySelectorAll('.plan__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var plan = btn.dataset.plan;
      var note = document.querySelector('.cta__privacy');
      if (note && plan) {
        note.textContent = 'Выбран пакет «' + plan + '» — менеджер расскажет о нём на звонке. Нажимая кнопку, ты соглашаешься с политикой обработки персональных данных.';
      }
    });
  });

  /* ---------- Форма: валидация + имитация отправки ---------- */
  var form = document.getElementById('leadForm');
  var success = document.getElementById('formSuccess');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var nameInput = document.getElementById('leadName');
    var phoneInput = document.getElementById('leadPhone');
    var valid = true;

    [nameInput, phoneInput].forEach(function (input) {
      input.classList.remove('field--error');
    });

    if (nameInput.value.trim().length < 2) {
      nameInput.classList.add('field--error');
      valid = false;
    }

    var digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length < 10) {
      phoneInput.classList.add('field--error');
      valid = false;
    }

    if (!valid) return;

    // демо-режим: имитация отправки без реального запроса
    var submitBtn = form.querySelector('.cta__submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем…';

    setTimeout(function () {
      success.hidden = false;
      submitBtn.textContent = 'Заявка отправлена ✓';
      form.querySelectorAll('input, select').forEach(function (field) {
        field.disabled = true;
      });
    }, 900);
  });

  /* ---------- Лёгкая маска телефона ---------- */
  var phoneField = document.getElementById('leadPhone');
  phoneField.addEventListener('input', function () {
    var digits = phoneField.value.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (digits && !digits.startsWith('7')) digits = '7' + digits;
    digits = digits.slice(0, 11);

    var out = '';
    if (digits.length > 0) out = '+7';
    if (digits.length > 1) out += ' (' + digits.slice(1, 4);
    if (digits.length >= 4) out += ') ' + digits.slice(4, 7);
    if (digits.length >= 7) out += '-' + digits.slice(7, 9);
    if (digits.length >= 9) out += '-' + digits.slice(9, 11);
    phoneField.value = out;
  });
})();
