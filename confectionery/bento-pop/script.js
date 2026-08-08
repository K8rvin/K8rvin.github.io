/* ========== Бенто-Поп: интерактив ========== */
(function () {
  'use strict';

  var COLORS = ['#FF4D8D', '#FFD93D', '#4DC9FF', '#FFFFFF'];

  /* ---------- Конфетти ---------- */
  function confetti(x, y) {
    for (var i = 0; i < 26; i++) {
      var p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
      document.body.appendChild(p);
      var angle = Math.random() * Math.PI * 2;
      var dist = 60 + Math.random() * 130;
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist - 60;
      var rot = (Math.random() - 0.5) * 720;
      var anim = p.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: 'translate(' + dx + 'px,' + (dy + 260) + 'px) rotate(' + rot + 'deg)', opacity: 0 }
      ], { duration: 900 + Math.random() * 600, easing: 'cubic-bezier(.2,.8,.4,1)' });
      anim.onfinish = (function (el) { return function () { el.remove(); }; })(p);
    }
  }

  document.querySelectorAll('.confetti-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      confetti(e.clientX, e.clientY);
    });
  });

  /* ---------- Тост ---------- */
  var toast = document.getElementById('toast');
  var toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 3200);
  }

  /* ---------- Плавный скролл по data-scroll ---------- */
  document.querySelectorAll('[data-scroll]').forEach(function (el) {
    el.addEventListener('click', function () {
      var target = document.querySelector(el.getAttribute('data-scroll'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- Кнопки «В заказ» ---------- */
  var orderNote = document.getElementById('order-note');
  var orderItems = [];
  document.querySelectorAll('.add-order').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.getAttribute('data-item');
      if (orderItems.indexOf(item) === -1) orderItems.push(item);
      showToast('Добавлено: ' + item + ' — теперь жми WhatsApp или Telegram 👇');
      orderNote.textContent = 'В твоём заказе: ' + orderItems.join(' + ');
    });
  });

  /* ---------- Фильтр-чипсы ---------- */
  var chips = document.querySelectorAll('#chips .chip');
  var cards = document.querySelectorAll('#catalog-grid .card');
  var emptyMsg = document.getElementById('catalog-empty');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      var filter = chip.getAttribute('data-filter');
      var visible = 0;
      cards.forEach(function (card) {
        var tags = card.getAttribute('data-tags').split(' ');
        var show = filter === 'all' || tags.indexOf(filter) !== -1;
        card.classList.toggle('hidden-card', !show);
        if (show) visible++;
      });
      emptyMsg.hidden = visible > 0;
    });
  });

  /* ---------- Мокап с надписью ---------- */
  var mockupToggle = document.getElementById('mockup-toggle');
  var mockupForm = document.getElementById('mockup-form');
  var mockupInput = document.getElementById('mockup-input');
  var mockupText = document.getElementById('mockup-text');

  mockupToggle.addEventListener('click', function () {
    mockupForm.hidden = !mockupForm.hidden;
    if (!mockupForm.hidden) mockupInput.focus();
  });

  mockupForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var val = mockupInput.value.trim();
    if (!val) return;
    mockupText.textContent = val.toUpperCase();
    // подгоняем размер шрифта под длину надписи
    var len = val.length;
    mockupText.style.fontSize = len <= 8 ? '20px' : len <= 16 ? '16px' : '12px';
    var cake = document.getElementById('mockup-cake');
    cake.classList.remove('wiggle');
    void cake.offsetWidth; // перезапуск анимации
    cake.classList.add('wiggle');
    var r = cake.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + r.height / 3);
  });

  /* ---------- Пасхалка: откусывание торта ---------- */
  var biteMsg = document.getElementById('bite-msg');
  var biteTimer = null;

  function biteCake(cake) {
    var bitten = cake.classList.contains('bitten');
    var bitten2 = cake.classList.contains('bitten-2');

    if (!bitten) {
      cake.classList.add('bitten');
      showBiteMsg('НЯМ! 🐹');
    } else if (!bitten2) {
      cake.classList.add('bitten-2');
      showBiteMsg('ЕЩЁ НЯМ! 😋');
    } else {
      cake.classList.remove('bitten');
      cake.classList.remove('bitten-2');
      showBiteMsg('Новый испекли, не благодари 🎂');
    }
    cake.classList.remove('wiggle');
    void cake.offsetWidth;
    cake.classList.add('wiggle');
  }

  function showBiteMsg(text) {
    biteMsg.textContent = text;
    biteMsg.classList.add('show');
    clearTimeout(biteTimer);
    biteTimer = setTimeout(function () { biteMsg.classList.remove('show'); }, 1600);
  }

  ['hero-cake', 'mockup-cake'].forEach(function (id) {
    var cake = document.getElementById(id);
    if (cake) cake.addEventListener('click', function () { biteCake(cake); });
  });

  /* ---------- Конструктор бенто ---------- */
  var builderState = { size: 1500, filling: 0, color: 0, text: false };
  var builderLabels = { size: '0.5 кг', filling: 'Ваниль-малина', color: 'Кислотный розовый' };
  var TEXT_PRICE = 300;
  var builderPriceEl = document.getElementById('builder-price');
  var builderLines = document.getElementById('builder-lines');
  var builderTextInput = document.getElementById('builder-text');
  var builderCakeText = document.getElementById('builder-cake-text');
  var builderCake = document.getElementById('builder-cake');

  var CREAM_COLORS = {
    'Кислотный розовый': ['#FF4D8D', '#d63a75', '#FFFFFF'],
    'Солнечный жёлтый': ['#FFD93D', '#e0b62a', '#1E1E24'],
    'Голубой': ['#4DC9FF', '#2aa8e0', '#FFFFFF'],
    'Графитовый': ['#1E1E24', '#0f0f13', '#FFFFFF']
  };

  function fmt(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function recalcBuilder() {
    var total = builderState.size + builderState.filling + builderState.color + (builderState.text ? TEXT_PRICE : 0);
    var html =
      '<div class="line"><span>Размер: ' + builderLabels.size + '</span><span>' + fmt(builderState.size) + ' ₽</span></div>' +
      '<div class="line"><span>Начинка: ' + builderLabels.filling + '</span><span>+' + fmt(builderState.filling) + ' ₽</span></div>' +
      '<div class="line"><span>Крем: ' + builderLabels.color + '</span><span>+' + fmt(builderState.color) + ' ₽</span></div>';
    if (builderState.text) {
      html += '<div class="line"><span>Надпись кремом</span><span>+' + fmt(TEXT_PRICE) + ' ₽</span></div>';
    }
    builderLines.innerHTML = html;
    builderPriceEl.textContent = fmt(total) + ' ₽';
  }

  document.querySelectorAll('.opts').forEach(function (group) {
    var groupName = group.getAttribute('data-group');
    group.querySelectorAll('.opt').forEach(function (opt) {
      opt.addEventListener('click', function () {
        group.querySelectorAll('.opt').forEach(function (o) { o.classList.remove('active'); });
        opt.classList.add('active');
        builderState[groupName] = parseInt(opt.getAttribute('data-price'), 10);
        builderLabels[groupName] = opt.getAttribute('data-label');
        if (groupName === 'color') paintBuilderCake(opt.getAttribute('data-label'));
        recalcBuilder();
      });
    });
  });

  function paintBuilderCake(label) {
    var c = CREAM_COLORS[label];
    if (!c) return;
    builderCake.querySelector('.cake-top').style.background = c[0];
    builderCake.querySelector('.cake-body').style.background = 'linear-gradient(' + c[0] + ',' + c[1] + ')';
    builderCakeText.style.color = c[2];
    builderCakeText.style.textShadow = label === 'Солнечный жёлтый' ? 'none' : '2px 2px 0 rgba(30,30,36,.35)';
  }

  builderTextInput.addEventListener('input', function () {
    var val = builderTextInput.value.trim();
    builderState.text = val.length > 0;
    builderCakeText.textContent = val ? val.toUpperCase() : 'ВАШ\nТЕКСТ';
    var len = val.length;
    builderCakeText.style.fontSize = len <= 8 ? '20px' : len <= 16 ? '16px' : '12px';
    recalcBuilder();
  });

  document.getElementById('builder-order').addEventListener('click', function () {
    var desc = 'Бенто ' + builderLabels.size + ', ' + builderLabels.filling +
      ', крем «' + builderLabels.color + '»' +
      (builderState.text ? ', надпись «' + builderTextInput.value.trim().toUpperCase() + '»' : '');
    showToast('Заказ готов: ' + desc + ' — ' + builderPriceEl.textContent + '. Жми кнопку мессенджера ниже 👇');
    orderNote.textContent = 'Твой конструктор: ' + desc + ' — ' + builderPriceEl.textContent;
    document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
  });

  recalcBuilder();

  /* ---------- Счётчик тортов ---------- */
  var counter = document.getElementById('cake-counter');
  var counterDone = false;
  function animateCounter() {
    if (counterDone) return;
    counterDone = true;
    var target = parseInt(counter.getAttribute('data-target'), 10);
    var start = null;
    var duration = 1800;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCounter(); io.disconnect(); }
      });
    }, { threshold: 0.4 });
    io.observe(counter);
  } else {
    animateCounter();
  }
})();
