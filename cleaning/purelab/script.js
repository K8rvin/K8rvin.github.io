'use strict';

/* =========================================================
   PureLab — лаборатория чистоты
   Вся интерактивность лендинга: калькулятор, до/после,
   трекер, счётчики, карусель, абонемент, форма, пузырьки.
   ========================================================= */

(function () {

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function formatNum(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  /* ---------- Пузырьки ---------- */
  document.querySelectorAll('.bubbles').forEach(function (container) {
    var count = parseInt(container.getAttribute('data-bubbles'), 10) || 10;
    for (var i = 0; i < count; i++) {
      var b = document.createElement('span');
      b.className = 'bubble';
      var size = 8 + Math.random() * 42;
      b.style.width = size + 'px';
      b.style.height = size + 'px';
      b.style.left = (Math.random() * 100) + '%';
      b.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
      var duration = 9 + Math.random() * 12;
      b.style.animationDuration = duration + 's';
      b.style.animationDelay = (-Math.random() * duration) + 's';
      container.appendChild(b);
    }
  });

  /* ---------- Бургер-меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Появление при скролле ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });

  /* ---------- Анимированные числа ---------- */
  function animateNumber(el, target, duration, suffix) {
    if (REDUCED) { el.textContent = formatNum(target) + (suffix || ''); return; }
    var start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(target * eased) + (suffix || '');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var counted = new WeakSet();
  var numObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !counted.has(e.target)) {
        counted.add(e.target);
        animateNumber(e.target, parseInt(e.target.getAttribute('data-count'), 10), 1600);
        numObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-count]').forEach(function (el) { numObserver.observe(el); });

  /* ---------- Прогресс-бары ---------- */
  var barObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.style.width = e.target.getAttribute('data-progress') + '%';
        barObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.progress__bar').forEach(function (el) {
    if (el.id !== 'qualityBar') barObserver.observe(el);
  });

  /* =========================================================
     КАЛЬКУЛЯТОР
     ========================================================= */
  var TYPES = {
    regular:    { name: 'Поддерживающая', base: 990,  rate: 85,  room: 120, bath: 180, speed: 24 },
    general:    { name: 'Генеральная',    base: 1490, rate: 145, room: 180, bath: 260, speed: 15 },
    renovation: { name: 'После ремонта',  base: 2490, rate: 210, room: 240, bath: 340, speed: 10 },
    windows:    { name: 'Мытьё окон',     base: 890,  rate: 45,  room: 350, bath: 0,   speed: 30 }
  };
  var OPTIONS = {
    fridge:  { name: 'холодильник', price: 500 },
    oven:    { name: 'духовка',     price: 600 },
    windows: { name: 'окна',        price: 900 },
    balcony: { name: 'балкон',      price: 800 }
  };

  var calcState = { type: 'regular', area: 60, rooms: 2, baths: 1, options: {} };
  var currentPrice = 0;

  var areaRange = document.getElementById('areaRange');
  var areaOut = document.getElementById('areaOut');
  var roomsOut = document.getElementById('roomsOut');
  var bathsOut = document.getElementById('bathsOut');
  var priceOut = document.getElementById('priceOut');
  var durationOut = document.getElementById('durationOut');
  var crewOut = document.getElementById('crewOut');
  var calcDetails = document.getElementById('calcDetails');
  var priceCard = document.querySelector('.calc__price');

  function plural(n, one, few, many) {
    var m = Math.abs(n) % 100, d = m % 10;
    if (m > 10 && m < 20) return many;
    if (d > 1 && d < 5) return few;
    if (d === 1) return one;
    return many;
  }

  function calcPrice() {
    var t = TYPES[calcState.type];
    var price = t.base + t.rate * calcState.area + t.room * calcState.rooms + t.bath * calcState.baths;
    Object.keys(calcState.options).forEach(function (k) {
      if (calcState.options[k]) price += OPTIONS[k].price;
    });
    return price;
  }

  function calcDuration() {
    var t = TYPES[calcState.type];
    var hours = calcState.area / t.speed + calcState.rooms * 0.25 + calcState.baths * 0.3;
    Object.keys(calcState.options).forEach(function (k) {
      if (calcState.options[k]) hours += 0.3;
    });
    return Math.max(1, Math.round(hours * 2) / 2);
  }

  function updateRangeFill() {
    var p = ((calcState.area - 20) / (200 - 20)) * 100;
    areaRange.style.setProperty('--fill', p + '%');
  }

  var priceAnimFrame = null;
  function renderCalc(animate) {
    var target = calcPrice();
    var hours = calcDuration();
    var crew = calcState.area > 90 || calcState.type === 'renovation' ? 3 : 2;

    areaOut.textContent = calcState.area + ' м²';
    roomsOut.textContent = calcState.rooms;
    bathsOut.textContent = calcState.baths;
    durationOut.textContent = '≈ ' + String(hours).replace('.', ',') + ' ч';
    crewOut.textContent = crew;

    var parts = [TYPES[calcState.type].name, calcState.area + ' м²',
      calcState.rooms + ' ' + plural(calcState.rooms, 'комната', 'комнаты', 'комнат'),
      calcState.baths + ' ' + plural(calcState.baths, 'санузел', 'санузла', 'санузлов')];
    Object.keys(calcState.options).forEach(function (k) {
      if (calcState.options[k]) parts.push(OPTIONS[k].name);
    });
    calcDetails.textContent = parts.join(' · ');

    if (animate && !REDUCED) {
      if (priceAnimFrame) cancelAnimationFrame(priceAnimFrame);
      var from = currentPrice, start = null;
      priceCard.classList.remove('bump');
      void priceCard.offsetWidth;
      priceCard.classList.add('bump');
      (function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / 420, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        priceOut.textContent = formatNum(from + (target - from) * eased);
        if (p < 1) priceAnimFrame = requestAnimationFrame(step);
        else currentPrice = target;
      })(performance.now());
    } else {
      priceOut.textContent = formatNum(target);
      currentPrice = target;
    }

    updateSubscription();
  }

  document.querySelectorAll('.calc__types .chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.calc__types .chip').forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      calcState.type = chip.getAttribute('data-type');
      renderCalc(true);
    });
  });

  if (areaRange) {
    areaRange.addEventListener('input', function () {
      calcState.area = parseInt(areaRange.value, 10);
      updateRangeFill();
      renderCalc(true);
    });
    updateRangeFill();
  }

  document.querySelectorAll('.stepper__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-step');
      var dir = parseInt(btn.getAttribute('data-dir'), 10);
      var limits = { rooms: [1, 6], baths: [1, 4] };
      calcState[key] = Math.min(limits[key][1], Math.max(limits[key][0], calcState[key] + dir));
      renderCalc(true);
    });
  });

  document.querySelectorAll('.calc__options input').forEach(function (input) {
    input.addEventListener('change', function () {
      calcState.options[input.getAttribute('data-opt')] = input.checked;
      renderCalc(true);
    });
  });

  var bookBtn = document.getElementById('bookBtn');
  if (bookBtn) {
    bookBtn.addEventListener('click', function () {
      var formArea = document.getElementById('formArea');
      if (formArea) formArea.value = calcState.area;
      document.getElementById('order').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
      setTimeout(function () {
        var nameInput = document.getElementById('formName');
        if (nameInput) nameInput.focus({ preventScroll: true });
      }, REDUCED ? 0 : 900);
    });
  }

  /* ---------- Абонемент ---------- */
  var subAreaOut = document.getElementById('subArea');
  function updateSubscription() {
    var base = TYPES.regular.base + TYPES.regular.rate * calcState.area +
      TYPES.regular.room * calcState.rooms + TYPES.regular.bath * calcState.baths;
    var map = { week: 0.8, twoweek: 0.85, month: 0.9 };
    Object.keys(map).forEach(function (k) {
      var el = document.querySelector('[data-price-' + k + ']');
      if (el) el.textContent = formatNum(base * map[k]);
    });
    if (subAreaOut) subAreaOut.textContent = calcState.area + ' м²';
  }
  document.querySelectorAll('.sub-card').forEach(function (card) {
    card.addEventListener('click', function () {
      document.querySelectorAll('.sub-card').forEach(function (c) { c.classList.remove('is-active'); });
      card.classList.add('is-active');
    });
  });

  /* =========================================================
     ДО / ПОСЛЕ
     ========================================================= */
  var ba = document.getElementById('baSlider');
  var baBefore = document.getElementById('baBefore');
  var baHandle = document.getElementById('baHandle');
  if (ba && baBefore && baHandle) {
    function setBa(pct) {
      pct = Math.max(2, Math.min(98, pct));
      baBefore.style.width = pct + '%';
      baHandle.style.left = pct + '%';
      baHandle.setAttribute('aria-valuenow', String(Math.round(pct)));
    }
    var dragging = false;
    function pctFromEvent(clientX) {
      var r = ba.getBoundingClientRect();
      return ((clientX - r.left) / r.width) * 100;
    }
    ba.addEventListener('pointerdown', function (e) {
      dragging = true;
      ba.setPointerCapture(e.pointerId);
      setBa(pctFromEvent(e.clientX));
    });
    ba.addEventListener('pointermove', function (e) {
      if (dragging) setBa(pctFromEvent(e.clientX));
    });
    ba.addEventListener('pointerup', function () { dragging = false; });
    ba.addEventListener('pointercancel', function () { dragging = false; });
    baHandle.addEventListener('keydown', function (e) {
      var cur = parseFloat(baHandle.getAttribute('aria-valuenow')) || 50;
      if (e.key === 'ArrowLeft') { setBa(cur - 4); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setBa(cur + 4); e.preventDefault(); }
    });
    setBa(50);
    // Лёгкое демо-покачивание при первом появлении
    var baSeen = false;
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !baSeen && !REDUCED) {
          baSeen = true;
          var t = 0;
          var id = setInterval(function () {
            t += 0.05;
            if (t >= 1 || dragging) { clearInterval(id); return; }
            setBa(50 + Math.sin(t * Math.PI * 2) * 12 * (1 - t));
          }, 30);
          obs.disconnect();
        }
      });
    }, { threshold: 0.5 }).observe(ba);
  }

  /* =========================================================
     ТРЕКЕР ЗАКАЗА
     ========================================================= */
  var trackerBtn = document.getElementById('trackerBtn');
  var trackerFill = document.getElementById('trackerFill');
  var trackerDot = document.getElementById('trackerDot');
  var trackerStatus = document.getElementById('trackerStatus');
  var trackerLog = document.getElementById('trackerLog');
  var trackerSteps = document.querySelectorAll('.tracker__step');
  var trackerRunning = false;

  var TRACK = [
    { status: 'Бригада назначена', fill: 12,
      log: ['Анна и Сергей приняли заказ, инвентарь собран'] },
    { status: 'Бригада в пути', fill: 40,
      log: ['Выехали к вам, прибытие через ~25 минут'] },
    { status: 'Идёт уборка', fill: 68,
      log: ['Кухня готова · 18/40 пунктов', 'Санузел: дезинфекция завершена · 27/40 пунктов'] },
    { status: 'Фотоотчёт готов', fill: 100,
      log: ['24 фото загружены, куратор подтвердил качество'] }
  ];

  function setTrackerStep(idx, logTime) {
    trackerSteps.forEach(function (s, i) {
      s.classList.toggle('is-done', i < idx);
      s.classList.toggle('is-current', i === idx);
    });
    trackerFill.style.width = TRACK[idx].fill + '%';
    trackerDot.style.left = 'calc(' + TRACK[idx].fill + '% * 0.96 + 12px)';
    trackerStatus.textContent = TRACK[idx].status;
    TRACK[idx].log.forEach(function (msg, j) {
      setTimeout(function () {
        var p = document.createElement('p');
        var time = document.createElement('time');
        time.textContent = logTime + ':' + String(10 + idx * 9 + j * 3).padStart(2, '0');
        p.appendChild(time);
        p.appendChild(document.createTextNode(msg));
        trackerLog.appendChild(p);
      }, REDUCED ? 0 : 500 + j * 700);
    });
  }

  if (trackerBtn) {
    trackerBtn.addEventListener('click', function () {
      if (trackerRunning) return;
      trackerRunning = true;
      trackerBtn.textContent = 'Демо идёт…';
      trackerBtn.disabled = true;
      trackerLog.innerHTML = '';
      var empty = document.createElement('p');
      empty.className = 'tracker__log-empty';
      empty.textContent = 'Заказ № 48 213 — запускаем сценарий.';
      trackerLog.appendChild(empty);

      var stepDelay = REDUCED ? 200 : 2100;
      TRACK.forEach(function (_, idx) {
        setTimeout(function () {
          setTrackerStep(idx, '14:0' + (idx + 2));
          if (idx === TRACK.length - 1) {
            setTimeout(function () {
              trackerBtn.textContent = 'Запустить ещё раз';
              trackerBtn.disabled = false;
              trackerRunning = false;
            }, REDUCED ? 200 : 1800);
          }
        }, 600 + idx * stepDelay);
      });
    });
  }

  /* =========================================================
     ЧЕК-ЛИСТ КАЧЕСТВА (40 пунктов)
     ========================================================= */
  var QUALITY_ITEMS = [
    'Пыль с горизонтальных поверхностей', 'Фасады кухонных шкафов', 'Кухонный фартук',
    'Плита и духовой шкаф снаружи', 'Раковина и смеситель до блеска', 'Зеркала без разводов',
    'Сантехника с дезинфекцией', 'Швы плитки в санузле', 'Полы в два влажных прохода',
    'Плинтусы по всему периметру', 'Розетки и выключатели', 'Дверные ручки и полотна',
    'Подоконники и рамы изнутри', 'Батареи и стена за ними', 'Каркасы светильников',
    'Карнизы и верх шкафов', 'Мебель отодвинута, убрано под ней', 'Обивка пропылесошена',
    'Ковры с двух сторон', 'Холодильник снаружи и ручки', 'Микроволновка внутри и снаружи',
    'Вытяжка и фильтр снаружи', 'Столешницы обезжирены', 'Столы и стулья полностью',
    'Мусор вынесен, ведро промыто', 'Вазы и декор протёрты', 'Экраны и техника антистатикой',
    'Балконная дверь и ручки', 'Откосы окон', 'Жалюзи и рулонные шторы',
    'Обувная зона в прихожей', 'Зеркало в прихожей', 'Точечные пятна на стенах',
    'Пыль с панелей кондиционера', 'Финальный проход сухой микрофиброй', 'Запах: нейтрализация химии',
    'Фотоотчёт по каждой зоне', 'Проверка куратором по люксометру', 'Подпись клиента в акте',
    'Гарантийный талон на 24 часа'
  ];

  var qualityList = document.getElementById('qualityList');
  var qualityBar = document.getElementById('qualityBar');
  var qualityCount = document.getElementById('qualityCount');
  if (qualityList) {
    QUALITY_ITEMS.forEach(function (text) {
      var li = document.createElement('li');
      var box = document.createElement('span');
      box.className = 'q-check';
      li.appendChild(box);
      li.appendChild(document.createTextNode(text));
      qualityList.appendChild(li);
    });

    var qualityStarted = false;
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !qualityStarted) {
          qualityStarted = true;
          obs.disconnect();
          var items = qualityList.querySelectorAll('li');
          var delay = REDUCED ? 0 : 55;
          items.forEach(function (li, i) {
            setTimeout(function () {
              li.classList.add('is-checked');
              var done = i + 1;
              qualityCount.textContent = done + ' / 40';
              qualityBar.style.width = (done / 40 * 100) + '%';
            }, 300 + i * delay);
          });
        }
      });
    }, { threshold: 0.25 }).observe(qualityList);
  }

  /* =========================================================
     КАРУСЕЛЬ ОТЗЫВОВ
     ========================================================= */
  var track = document.getElementById('reviewsTrack');
  var dotsWrap = document.getElementById('revDots');
  var prevBtn = document.getElementById('revPrev');
  var nextBtn = document.getElementById('revNext');
  if (track && dotsWrap) {
    var slides = track.children.length;
    var current = 0;
    var autoTimer = null;

    for (var i = 0; i < slides; i++) {
      (function (idx) {
        var d = document.createElement('button');
        d.setAttribute('aria-label', 'Отзыв ' + (idx + 1));
        d.addEventListener('click', function () { goTo(idx); restartAuto(); });
        dotsWrap.appendChild(d);
      })(i);
    }
    var dots = dotsWrap.children;

    function goTo(idx) {
      current = (idx + slides) % slides;
      track.style.transform = 'translateX(-' + current * 100 + '%)';
      Array.prototype.forEach.call(dots, function (d, j) {
        d.classList.toggle('is-active', j === current);
      });
    }
    function restartAuto() {
      if (autoTimer) clearInterval(autoTimer);
      if (!REDUCED) autoTimer = setInterval(function () { goTo(current + 1); }, 6000);
    }
    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); restartAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); restartAuto(); });

    var carousel = document.getElementById('reviewsCarousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', function () { if (autoTimer) clearInterval(autoTimer); });
      carousel.addEventListener('mouseleave', restartAuto);
    }
    goTo(0);
    restartAuto();
  }

  /* =========================================================
     ФОРМА ЗАЯВКИ
     ========================================================= */
  var orderForm = document.getElementById('orderForm');
  if (orderForm) {
    var phoneInput = document.getElementById('formPhone');
    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        var digits = phoneInput.value.replace(/\D/g, '').replace(/^[78]/, '');
        digits = digits.slice(0, 10);
        var out = '+7';
        if (digits.length > 0) out += ' ' + digits.slice(0, 3);
        if (digits.length > 3) out += ' ' + digits.slice(3, 6);
        if (digits.length > 6) out += '-' + digits.slice(6, 8);
        if (digits.length > 8) out += '-' + digits.slice(8, 10);
        phoneInput.value = digits.length ? out : '';
      });
    }

    orderForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('formName');
      var phone = document.getElementById('formPhone');
      var area = document.getElementById('formArea');
      var ok = true;
      [name, phone, area].forEach(function (input) {
        input.classList.remove('is-error');
        var valid = input === phone
          ? input.value.replace(/\D/g, '').length === 11
          : input.value.trim().length > 0;
        if (!valid) { input.classList.add('is-error'); ok = false; }
      });
      if (!ok) return;

      var success = document.getElementById('formSuccess');
      var text = document.getElementById('formSuccessText');
      if (text) {
        text.textContent = name.value.trim() + ', перезвоним на ' + phone.value +
          ' в течение 10 минут. Предварительный расчёт для ' + area.value + ' м² — ' +
          formatNum(calcPrice()) + ' ₽.';
      }
      if (success) success.hidden = false;
    });
  }

  /* ---------- Стартовый рендер ---------- */
  renderCalc(false);

})();
