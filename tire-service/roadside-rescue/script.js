/* ============================================================
   ШиноСпас — логика лендинга (ванильный JS, без библиотек)
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. Шапка: тень при скролле ---------- */
  var header = document.getElementById('header');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 2. Появление блоков при скролле ---------- */
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

  /* ---------- 3. Анимация счётчика «40 мин» ---------- */
  var counters = document.querySelectorAll('.js-count');
  function animateCounter(el) {
    var target = parseInt(el.dataset.target, 10) || 0;
    var duration = 1400;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- 4. Динамический счётчик свободных бригад ---------- */
  var brigadesEl = document.getElementById('brigadesCount');
  function brigadeBase() {
    var h = new Date().getHours();
    if (h >= 7 && h < 10) return 2;   // утренний час пик — все на выездах
    if (h >= 17 && h < 21) return 2;  // вечерний час пик
    if (h >= 0 && h < 6) return 4;    // ночью свободнее
    return 3;
  }
  var brigades = brigadeBase();
  function renderBrigades() {
    brigadesEl.textContent = brigades;
    brigadesEl.classList.remove('tick');
    void brigadesEl.offsetWidth; // перезапуск анимации
    brigadesEl.classList.add('tick');
  }
  renderBrigades();
  setInterval(function () {
    var base = brigadeBase();
    var delta = Math.random() < 0.5 ? -1 : 1;
    var next = brigades + delta;
    if (next < Math.max(1, base - 1) || next > base + 2) next = base;
    brigades = next;
    renderBrigades();
  }, 9000 + Math.random() * 5000);

  /* ---------- 5. Микро-анимация «маячок» при клике ---------- */
  var beacon = document.getElementById('beacon');
  document.querySelectorAll('.js-beacon').forEach(function (el) {
    el.addEventListener('click', function () {
      el.classList.remove('is-flashing');
      void el.offsetWidth;
      el.classList.add('is-flashing');
      beacon.classList.remove('is-on');
      void beacon.offsetWidth;
      beacon.classList.add('is-on');
      setTimeout(function () { beacon.classList.remove('is-on'); }, 950);
    });
  });

  /* ---------- 6. Интерактивная карта зон выезда ---------- */
  var ZONES = [
    { name: 'Центральный',        x: 290, y: 280, ring: 'green',  time: '≈ 25 мин', price: 'от 1500 ₽', dist: 'в 6 км от вас' },
    { name: 'Дзержинский',        x: 225, y: 150, ring: 'green',  time: '≈ 30 мин', price: 'от 1600 ₽', dist: 'в 8 км от вас' },
    { name: 'Ворошиловский',      x: 355, y: 175, ring: 'green',  time: '≈ 30 мин', price: 'от 1600 ₽', dist: 'в 9 км от вас' },
    { name: 'Советский',          x: 175, y: 330, ring: 'yellow', time: '≈ 35 мин', price: 'от 1700 ₽', dist: 'в 11 км от вас' },
    { name: 'Кировский',          x: 150, y: 470, ring: 'yellow', time: '≈ 40 мин', price: 'от 1800 ₽', dist: 'в 14 км от вас' },
    { name: 'Тракторозаводский',  x: 235, y: 585, ring: 'gray',   time: '≈ 45 мин', price: 'от 1900 ₽', dist: 'в 17 км от вас' },
    { name: 'Краснооктябрьский',  x: 85,  y: 205, ring: 'yellow', time: '≈ 50 мин', price: 'от 2000 ₽', dist: 'в 20 км от вас' },
    { name: 'Красноармейский',    x: 375, y: 540, ring: 'gray',   time: '≈ 55 мин', price: 'от 2200 ₽', dist: 'в 24 км от вас' }
  ];
  var RING_COLORS = { green: '#2ecc71', yellow: '#FFC527', gray: '#8a93a3' };

  var dotsLayer = document.getElementById('zoneDots');
  var zoneName = document.getElementById('zoneName');
  var zoneTime = document.getElementById('zoneTime');
  var zonePrice = document.getElementById('zonePrice');
  var zoneBrigade = document.getElementById('zoneBrigade');
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var dotEls = [];

  function selectZone(index) {
    var z = ZONES[index];
    dotEls.forEach(function (g, i) {
      g.classList.toggle('is-active', i === index);
    });
    zoneName.textContent = z.name;
    zoneTime.textContent = z.time;
    zonePrice.textContent = z.price;
    zoneBrigade.textContent = z.dist;
  }

  ZONES.forEach(function (z, i) {
    var g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'zone-dot');
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', 'Район ' + z.name + ': прибытие ' + z.time);

    var halo = document.createElementNS(SVG_NS, 'circle');
    halo.setAttribute('class', 'halo');
    halo.setAttribute('cx', z.x);
    halo.setAttribute('cy', z.y);
    halo.setAttribute('r', 20);
    halo.setAttribute('fill', RING_COLORS[z.ring]);
    halo.setAttribute('fill-opacity', '0.22');

    var core = document.createElementNS(SVG_NS, 'circle');
    core.setAttribute('class', 'core');
    core.setAttribute('cx', z.x);
    core.setAttribute('cy', z.y);
    core.setAttribute('r', 8);
    core.setAttribute('fill', RING_COLORS[z.ring]);
    core.setAttribute('stroke', '#0E1116');
    core.setAttribute('stroke-width', '2');

    var label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', z.x + 14);
    label.setAttribute('y', z.y + 4);
    label.textContent = z.name;

    g.appendChild(halo);
    g.appendChild(core);
    g.appendChild(label);

    g.addEventListener('click', function () { selectZone(i); });
    g.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectZone(i); }
    });

    dotsLayer.appendChild(g);
    dotEls.push(g);
  });
  selectZone(0);

  /* Машинка едет по маршруту на карте */
  var route = document.getElementById('carRoute');
  var mapCar = document.getElementById('mapCar');
  if (route && mapCar && route.getTotalLength) {
    var routeLen = route.getTotalLength();
    var routePos = 0;
    var routeDir = 1;
    var lastTs = null;
    function driveCar(ts) {
      if (lastTs === null) lastTs = ts;
      var dt = Math.min(ts - lastTs, 50);
      lastTs = ts;
      routePos += routeDir * dt * 0.045;
      if (routePos >= routeLen) { routePos = routeLen; routeDir = -1; }
      if (routePos <= 0) { routePos = 0; routeDir = 1; }
      var pt = route.getPointAtLength(routePos);
      mapCar.setAttribute('transform', 'translate(' + pt.x + ' ' + pt.y + ')');
      requestAnimationFrame(driveCar);
    }
    requestAnimationFrame(driveCar);
  }

  /* ---------- 7. Таймлайн: машинка едет по шагам ---------- */
  var timelineCar = document.getElementById('timelineCar');
  var timelineProgress = document.getElementById('timelineProgress');
  var stepEls = Array.prototype.slice.call(document.querySelectorAll('.timeline__step'));
  var currentStep = 0;
  // % вдоль линии: точки шагов стоят по левому краю колонок (десктоп)
  // и примерно равномерно по высоте списка (мобильная версия)
  var STEP_POSITIONS = [8, 36, 64, 92];
  var STEP_POSITIONS_DESKTOP = [0, 25, 50, 75];

  function isDesktopTimeline() {
    return window.matchMedia('(min-width: 960px)').matches;
  }

  function goToStep(n) {
    currentStep = n;
    var pos = isDesktopTimeline() ? STEP_POSITIONS_DESKTOP[n] : STEP_POSITIONS[n];
    if (isDesktopTimeline()) {
      timelineCar.style.left = pos + '%';
      timelineCar.style.top = '50%';
      timelineProgress.style.width = pos + '%';
      timelineProgress.style.height = '100%';
    } else {
      timelineCar.style.top = pos + '%';
      timelineCar.style.left = '50%';
      timelineProgress.style.height = pos + '%';
      timelineProgress.style.width = '100%';
    }
    stepEls.forEach(function (el, i) {
      el.classList.toggle('is-active', i <= n);
    });
  }
  goToStep(0);
  setInterval(function () {
    goToStep((currentStep + 1) % stepEls.length);
  }, 2400);
  window.addEventListener('resize', function () { goToStep(currentStep); });

  /* ---------- 8. Карусель отзывов ---------- */
  var REVIEWS = [
    {
      text: 'Пробил колесо ночью на трассе под дождём. Думал, до утра стоять. Мастер приехал за 35 минут, поставил жгут — и я поехал дальше. Нереально быстро.',
      name: 'Дмитрий К.', car: 'Kia Rio', time: '35 мин', letter: 'Д'
    },
    {
      text: 'Сел аккумулятор на парковке ТРЦ в мороз. Позвонил — через полчаса прикурили, ещё и давление в колёсах проверили бесплатно. Цену назвали сразу, без сюрпризов.',
      name: 'Андрей С.', car: 'Toyota Camry', time: '30 мин', letter: 'А'
    },
    {
      text: 'Спустило колесо прямо во дворе, а опаздывала на рейс. Бригада приехала за 25 минут, докачали и нашли гвоздь. Успела в аэропорт. Огромное спасибо!',
      name: 'Марина В.', car: 'Hyundai Solaris', time: '25 мин', letter: 'М'
    },
    {
      text: 'Захлопнул дверь — ключи остались в машине, двигатель работал. Вскрыли аккуратно, без единой царапины, за 15 минут на месте. Профессионалы.',
      name: 'Игорь П.', car: 'Lada Vesta', time: '40 мин', letter: 'И'
    },
    {
      text: 'Переобули все четыре колеса у подъезда, пока я пил кофе дома. Не надо никуда ехать и стоять в очереди — это просто другой уровень сервиса.',
      name: 'Сергей Т.', car: 'Volkswagen Tiguan', time: '45 мин', letter: 'С'
    }
  ];

  var track = document.getElementById('carouselTrack');
  var dotsWrap = document.getElementById('carouselDots');
  var prevBtn = document.getElementById('carouselPrev');
  var nextBtn = document.getElementById('carouselNext');
  var slideIndex = 0;
  var autoTimer = null;

  REVIEWS.forEach(function (r, i) {
    var card = document.createElement('article');
    card.className = 'review-card';
    card.innerHTML =
      '<span class="review-card__quote-mark">«</span>' +
      '<p class="review-card__text">' + r.text + '</p>' +
      '<div class="review-card__meta">' +
        '<span class="review-card__avatar">' + r.letter + '</span>' +
        '<span><span class="review-card__name">' + r.name + '</span><br>' +
        '<span class="review-card__car">' + r.car + '</span></span>' +
        '<span class="review-card__time">приехали за ' + r.time + '</span>' +
      '</div>';
    track.appendChild(card);

    var dot = document.createElement('button');
    dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
    dot.addEventListener('click', function () { goToSlide(i); restartAuto(); });
    dotsWrap.appendChild(dot);
  });
  var dotBtns = Array.prototype.slice.call(dotsWrap.children);

  function goToSlide(i) {
    slideIndex = (i + REVIEWS.length) % REVIEWS.length;
    track.style.transform = 'translateX(-' + slideIndex * 100 + '%)';
    dotBtns.forEach(function (d, k) { d.classList.toggle('is-active', k === slideIndex); });
  }
  function restartAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(function () { goToSlide(slideIndex + 1); }, 6000);
  }
  prevBtn.addEventListener('click', function () { goToSlide(slideIndex - 1); restartAuto(); });
  nextBtn.addEventListener('click', function () { goToSlide(slideIndex + 1); restartAuto(); });

  /* Свайп на мобильных */
  var touchStartX = null;
  track.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', function (e) {
    if (touchStartX === null) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 45) {
      goToSlide(slideIndex + (dx < 0 ? 1 : -1));
      restartAuto();
    }
    touchStartX = null;
  }, { passive: true });

  goToSlide(0);
  restartAuto();

});
