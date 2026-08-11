/* ============================================================
   ПЕРВЫЙ ТРЕК — вся интерактивная логика (ванильный JS)
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- бургер-меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- reveal-анимации при скролле ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- квиз «Какой у тебя вайб?» ---------- */
  var quizSteps = Array.prototype.slice.call(document.querySelectorAll('.quiz__step'));
  var quizDots = Array.prototype.slice.call(document.querySelectorAll('.quiz__dot'));
  var quizResult = document.getElementById('quizResult');
  var quizTag = document.getElementById('quizTag');
  var quizResultTitle = document.getElementById('quizResultTitle');
  var quizResultText = document.getElementById('quizResultText');
  var quizResultPrice = document.getElementById('quizResultPrice');
  var quizRestart = document.getElementById('quizRestart');
  var quizAnswers = {};
  var quizStep = 0;

  var STYLE_NAMES = { rap: 'рэп', pop: 'поп', rock: 'рок', electro: 'электроника' };

  var PACKAGES = {
    'Демка': {
      price: '2 500 ₽',
      text: 'Идеально для старта: час в студии, запись и лёгкая обработка. Уйдёшь с готовой демкой и нулевым стрессом.'
    },
    'Релиз': {
      price: '6 900 ₽',
      text: 'Запись, сведение и мастеринг — файл сразу готов для стриминга. Самый популярный выбор, не зря он хит.'
    },
    'Продюс': {
      price: '14 900 ₽',
      text: 'Полный фарш: аранжировка под тебя, продюсер ведёт за руку, обложка и релиз на площадках. По-взрослому.'
    }
  };

  function pickPackage(a) {
    var score = { 'Демка': 0, 'Релиз': 0, 'Продюс': 0 };
    if (a.exp === 'first') { score['Демка'] += 2; score['Релиз'] += 1; }
    if (a.exp === 'some') { score['Релиз'] += 2; }
    if (a.exp === 'released') { score['Продюс'] += 2; score['Релиз'] += 1; }
    if (a.goal === 'release') { score['Релиз'] += 2; score['Продюс'] += 1; }
    if (a.goal === 'content') { score['Демка'] += 1; score['Релиз'] += 1; }
    if (a.goal === 'self') { score['Демка'] += 2; }
    if (a.style === 'rock' || a.style === 'electro') { score['Продюс'] += 1; }
    var best = 'Релиз';
    var bestScore = -1;
    Object.keys(score).forEach(function (name) {
      if (score[name] > bestScore) { bestScore = score[name]; best = name; }
    });
    return best;
  }

  function showQuizStep(n) {
    quizSteps.forEach(function (step, i) {
      step.hidden = i !== n;
    });
    quizDots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === n);
      dot.classList.toggle('is-done', i < n);
    });
  }

  function showQuizResult() {
    var packName = pickPackage(quizAnswers);
    var pack = PACKAGES[packName];
    quizSteps.forEach(function (step) { step.hidden = true; });
    quizDots.forEach(function (dot) {
      dot.classList.remove('is-active');
      dot.classList.add('is-done');
    });
    quizTag.textContent = 'твой вайб: ' + (STYLE_NAMES[quizAnswers.style] || 'свой собственный');
    quizResultTitle.textContent = 'Тебе — пакет «' + packName + '»';
    quizResultText.textContent = pack.text;
    quizResultPrice.textContent = pack.price;
    quizResult.hidden = false;
    // перезапуск анимации результата
    quizResult.style.animation = 'none';
    void quizResult.offsetWidth;
    quizResult.style.animation = '';
    // подставляем рекомендованный пакет в форму брони
    var select = document.getElementById('bookPackage');
    if (select) { select.value = packName; }
  }

  document.querySelectorAll('.quiz__opt').forEach(function (btn) {
    btn.addEventListener('click', function () {
      quizAnswers[btn.dataset.q] = btn.dataset.v;
      quizStep += 1;
      if (quizStep < quizSteps.length) {
        showQuizStep(quizStep);
      } else {
        showQuizResult();
      }
    });
  });

  quizRestart.addEventListener('click', function () {
    quizAnswers = {};
    quizStep = 0;
    quizResult.hidden = true;
    showQuizStep(0);
  });

  /* ---------- бит-стор ---------- */
  var currentBeat = null;
  var beatsChosen = document.getElementById('beatsChosen');

  document.querySelectorAll('.beat').forEach(function (card) {
    var playBtn = card.querySelector('.beat__play');
    var pickBtn = card.querySelector('.beat__pick');

    playBtn.addEventListener('click', function () {
      var wasPlaying = card.classList.contains('is-playing');
      document.querySelectorAll('.beat.is-playing').forEach(function (b) {
        b.classList.remove('is-playing');
        b.querySelector('.beat__play').textContent = '▶';
      });
      if (!wasPlaying) {
        card.classList.add('is-playing');
        playBtn.textContent = '⏸';
      }
    });

    pickBtn.addEventListener('click', function () {
      document.querySelectorAll('.beat.is-picked').forEach(function (b) {
        b.classList.remove('is-picked');
        b.querySelector('.beat__pick').textContent = 'Выбрать';
      });
      card.classList.add('is-picked');
      pickBtn.textContent = 'Выбран ✓';
      currentBeat = card.dataset.beat;
      beatsChosen.textContent = '🎧 Бит «' + currentBeat + '» полетит с тобой на запись — он в подарок!';
      beatsChosen.hidden = false;
    });
  });

  /* ---------- счётчики «треков записано» ---------- */
  function animateCounter(el) {
    var target = parseInt(el.dataset.target, 10);
    var duration = 1600;
    var start = null;
    function tick(ts) {
      if (!start) { start = ts; }
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString('ru-RU');
      if (progress < 1) { requestAnimationFrame(tick); }
    }
    requestAnimationFrame(tick);
  }

  var counters = document.querySelectorAll('.counter');
  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { counterObserver.observe(c); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- карусель отзывов ---------- */
  var track = document.getElementById('reviewsTrack');
  var slides = track.children.length;
  var dotsWrap = document.getElementById('revDots');
  var revIndex = 0;
  var autoTimer = null;

  for (var i = 0; i < slides; i += 1) {
    var dot = document.createElement('button');
    dot.className = 'reviews__dot' + (i === 0 ? ' is-active' : '');
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
    (function (idx) {
      dot.addEventListener('click', function () { goToSlide(idx); restartAuto(); });
    })(i);
    dotsWrap.appendChild(dot);
  }

  function goToSlide(n) {
    revIndex = (n + slides) % slides;
    track.style.transform = 'translateX(-' + revIndex * 100 + '%)';
    Array.prototype.forEach.call(dotsWrap.children, function (d, idx) {
      d.classList.toggle('is-active', idx === revIndex);
    });
  }

  function restartAuto() {
    if (autoTimer) { clearInterval(autoTimer); }
    autoTimer = setInterval(function () { goToSlide(revIndex + 1); }, 5000);
  }

  document.getElementById('revPrev').addEventListener('click', function () { goToSlide(revIndex - 1); restartAuto(); });
  document.getElementById('revNext').addEventListener('click', function () { goToSlide(revIndex + 1); restartAuto(); });

  var carousel = document.getElementById('carousel');
  carousel.addEventListener('mouseenter', function () { if (autoTimer) { clearInterval(autoTimer); } });
  carousel.addEventListener('mouseleave', restartAuto);
  restartAuto();

  // свайп на мобильных
  var touchX = null;
  carousel.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', function (e) {
    if (touchX === null) { return; }
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) { goToSlide(revIndex + (dx < 0 ? 1 : -1)); restartAuto(); }
    touchX = null;
  }, { passive: true });

  /* ---------- бронирование ---------- */
  var DAY_NAMES = { today: 'сегодня', tomorrow: 'завтра', sat: 'в субботу', sun: 'в воскресенье' };
  var SLOTS = {
    today: [
      { t: '12:00', free: false }, { t: '14:00', free: true }, { t: '17:00', free: true },
      { t: '19:00', free: false }, { t: '21:00', free: true }
    ],
    tomorrow: [
      { t: '12:00', free: true }, { t: '14:00', free: false }, { t: '17:00', free: true },
      { t: '19:00', free: true }, { t: '21:00', free: false }
    ],
    sat: [
      { t: '12:00', free: true }, { t: '14:00', free: true }, { t: '17:00', free: false },
      { t: '19:00', free: true }, { t: '21:00', free: true }
    ],
    sun: [
      { t: '12:00', free: false }, { t: '14:00', free: true }, { t: '17:00', free: true },
      { t: '19:00', free: false }, { t: '21:00', free: true }
    ]
  };

  var bookingDays = document.getElementById('bookingDays');
  var bookingSlots = document.getElementById('bookingSlots');
  var bookingForm = document.getElementById('bookingForm');
  var bookingError = document.getElementById('bookingError');
  var bookingSuccess = document.getElementById('bookingSuccess');
  var bookingSuccessText = document.getElementById('bookingSuccessText');
  var bookingAgain = document.getElementById('bookingAgain');
  var bookName = document.getElementById('bookName');
  var bookPhone = document.getElementById('bookPhone');
  var bookPackage = document.getElementById('bookPackage');
  var selectedDay = 'today';
  var selectedSlot = null;

  function renderSlots(day) {
    bookingSlots.innerHTML = '';
    selectedSlot = null;
    SLOTS[day].forEach(function (slot) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot';
      btn.textContent = slot.t;
      btn.disabled = !slot.free;
      if (slot.free) {
        btn.addEventListener('click', function () {
          bookingSlots.querySelectorAll('.slot').forEach(function (s) { s.classList.remove('is-active'); });
          btn.classList.add('is-active');
          selectedSlot = slot.t;
          bookingError.hidden = true;
        });
      }
      bookingSlots.appendChild(btn);
    });
  }

  bookingDays.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      bookingDays.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      selectedDay = chip.dataset.day;
      renderSlots(selectedDay);
    });
  });

  renderSlots(selectedDay);

  bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = bookName.value.trim();
    var phone = bookPhone.value.trim();

    if (!selectedSlot) {
      bookingError.textContent = 'Выбери время — свободные слоты подсвечены.';
      bookingError.hidden = false;
      return;
    }
    if (name.length < 2) {
      bookingError.textContent = 'Напиши, как тебя зовут — хотя бы пару букв.';
      bookingError.hidden = false;
      bookName.focus();
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      bookingError.textContent = 'Оставь настоящий телефон, чтобы звукарь мог подтвердить запись.';
      bookingError.hidden = false;
      bookPhone.focus();
      return;
    }

    bookingError.hidden = true;
    var beatNote = currentBeat ? ' Бит «' + currentBeat + '» уже в подарке.' : '';
    bookingSuccessText.textContent = name + ', ждём тебя ' + DAY_NAMES[selectedDay] + ' в ' + selectedSlot +
      '. Пакет: «' + bookPackage.value + '».' + beatNote;
    bookingForm.hidden = true;
    bookingSuccess.hidden = false;
  });

  bookingAgain.addEventListener('click', function () {
    bookingSuccess.hidden = true;
    bookingForm.hidden = false;
    renderSlots(selectedDay);
  });

  /* ---------- кнопки пакетов подставляют пакет в форму ---------- */
  document.querySelectorAll('.pack__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.dataset.package) { bookPackage.value = btn.dataset.package; }
    });
  });
});
