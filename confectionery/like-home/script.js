/* ===== Как дома — интерактив (vanilla JS) ===== */
(function () {
  'use strict';

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Пасхалка: прыгающая ягода в hero ---------- */
  var heroBerry = document.getElementById('heroBerry');
  if (heroBerry) {
    heroBerry.addEventListener('click', function () {
      heroBerry.classList.remove('is-jumping');
      void heroBerry.offsetWidth; // перезапуск анимации
      heroBerry.classList.add('is-jumping');
      launchConfetti(28, heroBerry);
    });
  }

  /* ---------- Калькулятор торта ---------- */
  var calcState = {};
  var chipsGroups = document.querySelectorAll('.chips');
  var priceEl = document.getElementById('calcPrice');
  var summaryEl = document.getElementById('calcSummary');
  var dreamField = document.getElementById('fDream');
  var GROUP_NAMES = {
    weight: 'Вес',
    filling: 'Начинка',
    decor: 'Декор',
    urgency: 'Срок'
  };

  function formatPrice(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function recalc() {
    var total = 0;
    var html = '';
    Object.keys(calcState).forEach(function (key) {
      var item = calcState[key];
      total += item.price;
      html += '<li><strong>' + GROUP_NAMES[key] + ':</strong> ' + item.label +
        (item.price > 0 && key !== 'weight' ? ' <em>(+' + formatPrice(item.price) + ' ₽)</em>' : '') + '</li>';
    });
    if (summaryEl) summaryEl.innerHTML = html;
    if (priceEl) {
      priceEl.textContent = formatPrice(total);
      priceEl.classList.remove('bump');
      void priceEl.offsetWidth;
      priceEl.classList.add('bump');
    }
    return total;
  }

  chipsGroups.forEach(function (group) {
    var groupName = group.getAttribute('data-group');
    var active = group.querySelector('.chip.is-active');
    if (active) {
      calcState[groupName] = {
        price: parseInt(active.getAttribute('data-price'), 10) || 0,
        label: active.getAttribute('data-label') || active.textContent.trim()
      };
    }
    group.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      group.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      calcState[groupName] = {
        price: parseInt(chip.getAttribute('data-price'), 10) || 0,
        label: chip.getAttribute('data-label') || chip.textContent.trim()
      };
      recalc();
    });
  });
  recalc();

  // «Оформить заказ» — переносим выбор в форму
  var calcOrderBtn = document.getElementById('calcOrderBtn');
  if (calcOrderBtn) {
    calcOrderBtn.addEventListener('click', function () {
      if (!dreamField) return;
      var parts = [];
      Object.keys(calcState).forEach(function (key) {
        parts.push(GROUP_NAMES[key].toLowerCase() + ' — ' + calcState[key].label);
      });
      var total = priceEl ? priceEl.textContent : '';
      dreamField.value = 'Хочу торт: ' + parts.join(', ') + '. По калькулятору — от ' + total + ' ₽.';
    });
  }

  /* ---------- Карусель отзывов ---------- */
  var track = document.getElementById('revTrack');
  var prevBtn = document.getElementById('revPrev');
  var nextBtn = document.getElementById('revNext');
  var dotsWrap = document.getElementById('revDots');
  if (track && prevBtn && nextBtn && dotsWrap) {
    var slides = track.children;
    var index = 0;
    var timer = null;

    for (var i = 0; i < slides.length; i++) {
      (function (i) {
        var dot = document.createElement('button');
        dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
        dot.addEventListener('click', function () { goTo(i); restart(); });
        dotsWrap.appendChild(dot);
      })(i);
    }
    var dots = dotsWrap.children;

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      for (var d = 0; d < dots.length; d++) {
        dots[d].classList.toggle('is-active', d === index);
      }
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(function () { goTo(index + 1); }, 6000);
    }
    prevBtn.addEventListener('click', function () { goTo(index - 1); restart(); });
    nextBtn.addEventListener('click', function () { goTo(index + 1); restart(); });
    goTo(0);
    restart();
  }

  /* ---------- Счётчик «кг ягод в этом сезоне» ---------- */
  var counterEl = document.getElementById('berryCounter');
  if (counterEl && 'IntersectionObserver' in window) {
    var counted = false;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || counted) return;
        counted = true;
        observer.disconnect();
        var target = parseInt(counterEl.getAttribute('data-target'), 10) || 0;
        var duration = 1800;
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          counterEl.textContent = String(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    observer.observe(counterEl);
  } else if (counterEl) {
    counterEl.textContent = counterEl.getAttribute('data-target');
  }

  /* ---------- Форма заказа ---------- */
  var form = document.getElementById('orderForm');
  var okMsg = document.getElementById('orderOk');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      ['fName', 'fPhone', 'fDate'].forEach(function (id) {
        var input = document.getElementById(id);
        if (!input) return;
        var bad = !input.value.trim();
        input.classList.toggle('is-error', bad);
        if (bad) valid = false;
      });
      if (!valid) return;
      if (okMsg) okMsg.hidden = false;
      launchConfetti(160);
      form.reset();
      setTimeout(function () { if (okMsg) okMsg.hidden = true; }, 6000);
    });
    // снимаем подсветку ошибки при вводе
    form.addEventListener('input', function (e) {
      if (e.target.classList) e.target.classList.remove('is-error');
    });
  }

  // минимальная дата — сегодня
  var dateInput = document.getElementById('fDate');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  /* ---------- Конфетти ---------- */
  var canvas = document.getElementById('confettiCanvas');
  var ctx = canvas ? canvas.getContext('2d') : null;
  var particles = [];
  var rafId = null;
  var CONFETTI_COLORS = ['#C68B59', '#8A9B6E', '#B5484D', '#F2D68F', '#FBF6EE'];

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);

  function launchConfetti(count, originEl) {
    if (!canvas || !ctx) return;
    resizeCanvas();
    canvas.style.display = 'block';
    var ox = canvas.width / 2;
    var oy = canvas.height * 0.35;
    if (originEl) {
      var r = originEl.getBoundingClientRect();
      ox = r.left + r.width / 2;
      oy = r.top + r.height / 2;
    }
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 4 + Math.random() * 8;
      particles.push({
        x: ox, y: oy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        size: 5 + Math.random() * 7,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.25,
        life: 90 + Math.random() * 60
      });
    }
    if (!rafId) tick();
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(function (p) { return p.life > 0 && p.y < canvas.height + 30; });
    particles.forEach(function (p) {
      p.vy += 0.18; // гравитация
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.rot += p.vr;
      p.life--;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.min(1, p.life / 40);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    if (particles.length) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
      canvas.style.display = 'none';
    }
  }
})();
