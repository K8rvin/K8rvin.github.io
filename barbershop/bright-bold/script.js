/* ===== ДЁРЗО — интерактивность ===== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Typewriter в hero ---------- */
  var typewriterEl = document.getElementById('typewriter');
  var heroText = 'ТВОЙ СТИЛЬ. ТВОИ ПРАВИЛА.';

  function renderFinalTitle() {
    // «ПРАВИЛА.» — градиентным
    var idx = heroText.indexOf('ПРАВИЛА.');
    typewriterEl.innerHTML = '';
    typewriterEl.appendChild(document.createTextNode(heroText.slice(0, idx)));
    var span = document.createElement('span');
    span.className = 'grad-word';
    span.textContent = heroText.slice(idx);
    typewriterEl.appendChild(span);
  }

  if (typewriterEl) {
    if (reduceMotion) {
      renderFinalTitle();
    } else {
      var i = 0;
      var plainBefore = heroText.slice(0, heroText.indexOf('ПРАВИЛА.'));
      var gradWord = heroText.slice(heroText.indexOf('ПРАВИЛА.'));
      (function type() {
        if (i <= plainBefore.length) {
          typewriterEl.textContent = plainBefore.slice(0, i);
        } else {
          var g = i - plainBefore.length;
          typewriterEl.innerHTML = '';
          typewriterEl.appendChild(document.createTextNode(plainBefore));
          var span = document.createElement('span');
          span.className = 'grad-word';
          span.textContent = gradWord.slice(0, g);
          typewriterEl.appendChild(span);
        }
        i++;
        if (i <= heroText.length) {
          setTimeout(type, 65 + Math.random() * 70);
        }
      })();
    }
  }

  /* ---------- Бургер-меню ---------- */
  var burger = document.getElementById('burger');
  var mobileNav = document.getElementById('mobileNav');
  if (burger && mobileNav) {
    burger.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        mobileNav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Появление при скролле ---------- */
  var revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Счётчики ---------- */
  var counters = document.querySelectorAll('.counter');
  function animateCounter(el) {
    var target = parseInt(el.dataset.target, 10);
    if (reduceMotion) { el.textContent = target.toLocaleString('ru-RU'); return; }
    var duration = 1800;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString('ru-RU');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- Параллакс декора ---------- */
  var decorItems = document.querySelectorAll('.decor__item');
  if (decorItems.length && !reduceMotion) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        decorItems.forEach(function (item) {
          var speed = parseFloat(item.dataset.speed || '0.1');
          item.style.transform = 'translateY(' + (y * speed).toFixed(1) + 'px)';
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Табы «Подбери образ» ---------- */
  var tabs = document.querySelectorAll('.tab');
  var panels = document.querySelectorAll('.look__panel');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });
      panels.forEach(function (panel) {
        var active = panel.dataset.panel === tab.dataset.tab;
        panel.hidden = !active;
        panel.classList.toggle('is-active', active);
      });
    });
  });

  /* ---------- Лайтбокс галереи ---------- */
  var galleryTiles = Array.prototype.slice.call(document.querySelectorAll('.gallery__masonry .tile'));
  var lightbox = document.getElementById('lightbox');
  var lightboxContent = document.getElementById('lightboxContent');
  var currentIndex = 0;
  var lastFocused = null;

  function openLightbox(index) {
    currentIndex = (index + galleryTiles.length) % galleryTiles.length;
    var tile = galleryTiles[currentIndex];
    lightboxContent.innerHTML = '';
    var clone = tile.cloneNode(true);
    clone.removeAttribute('tabindex');
    clone.removeAttribute('role');
    lightboxContent.appendChild(clone);
    if (lightbox.hidden) {
      lastFocused = document.activeElement;
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    }
    document.getElementById('lightboxClose').focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  galleryTiles.forEach(function (tile, index) {
    tile.addEventListener('click', function () { openLightbox(index); });
    tile.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', function () { openLightbox(currentIndex - 1); });
  document.getElementById('lightboxNext').addEventListener('click', function () { openLightbox(currentIndex + 1); });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox(currentIndex - 1);
    if (e.key === 'ArrowRight') openLightbox(currentIndex + 1);
  });

  /* ---------- Горизонтальный скролл мастеров ---------- */
  var mastersScroll = document.getElementById('mastersScroll');
  var scrollStep = 320;
  document.getElementById('mastersPrev').addEventListener('click', function () {
    mastersScroll.scrollBy({ left: -scrollStep, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  document.getElementById('mastersNext').addEventListener('click', function () {
    mastersScroll.scrollBy({ left: scrollStep, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Виджет мессенджеров ---------- */
  var chatBtn = document.getElementById('chatBtn');
  var chatLinks = document.getElementById('chatLinks');
  chatBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = chatLinks.hidden;
    chatLinks.hidden = !open;
    chatBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', function (e) {
    if (!chatLinks.hidden && !document.getElementById('chatWidget').contains(e.target)) {
      chatLinks.hidden = true;
      chatBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- Форма записи ---------- */
  var form = document.getElementById('bookingForm');
  var successMsg = document.getElementById('formSuccess');

  // дата не раньше сегодняшнего дня
  var dateInput = document.getElementById('fDate');
  var today = new Date();
  var iso = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');
  dateInput.min = iso;

  function setError(input, message) {
    var field = input.closest('.field');
    field.classList.toggle('has-error', Boolean(message));
    field.querySelector('.field__error').textContent = message || '';
  }

  function validate() {
    var ok = true;
    var name = document.getElementById('fName');
    var phone = document.getElementById('fPhone');
    var service = document.getElementById('fService');

    if (name.value.trim().length < 2) {
      setError(name, 'Введи имя (минимум 2 буквы).');
      ok = false;
    } else setError(name, '');

    var digits = phone.value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) {
      setError(phone, 'Введи корректный номер телефона.');
      ok = false;
    } else setError(phone, '');

    if (!service.value) {
      setError(service, 'Выбери услугу из списка.');
      ok = false;
    } else setError(service, '');

    if (!dateInput.value) {
      setError(dateInput, 'Выбери дату визита.');
      ok = false;
    } else if (dateInput.value < iso) {
      setError(dateInput, 'Дата уже прошла — выбери другую.');
      ok = false;
    } else setError(dateInput, '');

    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    successMsg.hidden = true;
    if (!validate()) return;
    successMsg.hidden = false;
    form.reset();
    form.querySelectorAll('.field').forEach(function (f) {
      f.classList.remove('has-error');
      f.querySelector('.field__error').textContent = '';
    });
    successMsg.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  });

  // убираем ошибку при вводе
  form.addEventListener('input', function (e) {
    if (e.target.closest('.field')) setError(e.target, '');
  });
})();
