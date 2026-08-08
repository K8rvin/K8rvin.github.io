/* ===== Букет за 60 — script ===== */
(function () {
  'use strict';

  /* ---------- Данные каталога ---------- */
  var BOUQUETS = [
    { id: 1, name: '«Алая страсть»', desc: '15 красных роз, гипсофила', price: 3490, old: null, stock: 3, tags: ['mid', 'loved', 'red'], colors: ['#D7263D', '#E93A7D', '#B3122F'] },
    { id: 2, name: '«Нежное утро»', desc: 'Пионовидные розы и эустома', price: 2790, old: null, stock: 5, tags: ['low', 'mom', 'tender'], colors: ['#F6A5C0', '#FBD0DC', '#E93A7D'] },
    { id: 3, name: '«Солнечный всплеск»', desc: '25 жёлтых тюльпанов, эвкалипт', price: 2390, old: 2990, stock: 7, tags: ['low', 'mom', 'colleague'], colors: ['#FFC53D', '#FFD970', '#F5A623'] },
    { id: 4, name: '«Малиновый десерт»', desc: 'Кустовые розы и маттиола', price: 4190, old: null, stock: 2, tags: ['mid', 'loved', 'tender'], colors: ['#E93A7D', '#C2255C', '#F6A5C0'] },
    { id: 5, name: '«Бизнес-класс»', desc: 'Белые каллы и зелень', price: 4990, old: null, stock: 4, tags: ['mid', 'colleague'], colors: ['#F5F1E8', '#FFFFFF', '#D8D2C4'] },
    { id: 6, name: '«Королевский»', desc: '51 красная роза премиум', price: 8990, old: null, stock: 2, tags: ['premium', 'loved', 'red'], colors: ['#B3122F', '#D7263D', '#8C0E24'] },
    { id: 7, name: '«Облако для мамы»', desc: 'Гортензии и ромашки', price: 3290, old: null, stock: 6, tags: ['mid', 'mom', 'tender'], colors: ['#B7D7F0', '#FFFFFF', '#FBD0DC'] },
    { id: 8, name: '«Первое свидание»', desc: '7 роз и шоколад в подарок', price: 1990, old: null, stock: 9, tags: ['low', 'loved', 'red'], colors: ['#E93A7D', '#D7263D', '#F6A5C0'] },
    { id: 9, name: '«Премиум-микс»', desc: 'Орхидеи, розы, протея', price: 7490, old: null, stock: 3, tags: ['premium', 'colleague'], colors: ['#9B5DE5', '#E93A7D', '#FFC53D'] },
    { id: 10, name: '«Ромашковое поле»', desc: 'Ромашки и лагурус', price: 1590, old: null, stock: 8, tags: ['low', 'mom', 'tender'], colors: ['#FFFFFF', '#FFC53D', '#F5F1E8'] },
    { id: 11, name: '«Бархатный вечер»', desc: 'Бордовые пионы, премиум-упаковка', price: 6490, old: null, stock: 4, tags: ['premium', 'loved', 'red'], colors: ['#7B1E3B', '#A62654', '#5C1229'] },
    { id: 12, name: '«Скажи спасибо»', desc: 'Ирисы и альстромерии', price: 2890, old: null, stock: 5, tags: ['low', 'colleague', 'tender'], colors: ['#6C63FF', '#B7D7F0', '#FBD0DC'] }
  ];

  var FILTERS = [
    { id: 'all', label: 'Все' },
    { id: 'low', label: 'До 3 000 ₽' },
    { id: 'mid', label: '3–5 тыс' },
    { id: 'premium', label: 'Премиум' },
    { id: 'mom', label: 'Маме' },
    { id: 'loved', label: 'Любимой' },
    { id: 'colleague', label: 'Коллеге' },
    { id: 'red', label: 'Красные' },
    { id: 'tender', label: 'Нежные' }
  ];

  var WHO = [
    { id: 'mom', label: 'Мама', tag: 'mom' },
    { id: 'wife', label: 'Жена', tag: 'loved' },
    { id: 'friend', label: 'Подруга', tag: 'tender' },
    { id: 'colleague', label: 'Коллега', tag: 'colleague' }
  ];

  var BUDGETS = [
    { id: 'b1', label: 'До 3 000 ₽', min: 0, max: 3000 },
    { id: 'b2', label: '3 000–5 000 ₽', min: 3000, max: 5000 },
    { id: 'b3', label: 'От 5 000 ₽', min: 5000, max: Infinity }
  ];

  var REVIEWS = [
    { emoji: '😍', text: 'Вспомнил про годовщину в 17:40. В 18:30 жена уже держала букет с открыткой. Вы спасли мой вечер!', name: 'Дмитрий, 34 года', tag: 'доставлено вчера' },
    { emoji: '🔥', text: 'Фото букета прислали за 15 минут до курьера — попросил добавить зелени, поправили без вопросов.', name: 'Андрей, 41 год', tag: 'доставлено вчера' },
    { emoji: '🌹', text: 'Заказывала маме анонимно. Она до утра гадала, от кого цветы. Открытка написана от руки, очень трогательно.', name: 'Ольга, 29 лет', tag: 'доставлено вчера' },
    { emoji: '⏱️', text: 'Заказ в 9:05, букет у секретарши в 9:52. Коллега была в восторге, а я — в плюсе перед начальством.', name: 'Игорь, 38 лет', tag: 'доставлено вчера' },
    { emoji: '💐', text: 'Розы стояли 9 дней! Подписался на «букет дня» — каждую пятницу теперь сюрприз жене.', name: 'Сергей, 45 лет', tag: 'доставлено вчера' }
  ];

  function fmt(n) { return n.toLocaleString('ru-RU') + ' ₽'; }
  function $(sel, root) { return (root || document).querySelector(sel); }

  /* ---------- SVG-генератор букетов ---------- */
  var svgSeed = 0;
  function flower(cx, cy, r, color, petals) {
    var s = '';
    for (var i = 0; i < petals; i++) {
      var a = (360 / petals) * i;
      s += '<ellipse cx="' + cx + '" cy="' + (cy - r * 0.72) + '" rx="' + r * 0.42 + '" ry="' + r * 0.72 +
        '" fill="' + color + '" transform="rotate(' + a + ' ' + cx + ' ' + cy + ')"/>';
    }
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r * 0.34 + '" fill="#FFC53D"/>';
    return s;
  }

  function bouquetSVG(colors, big) {
    svgSeed++;
    var gid = 'wrap' + svgSeed;
    var W = big ? 460 : 240, H = big ? 460 : 260;
    var cx = W / 2;
    var n = big ? 7 : 5;
    var spread = big ? 120 : 62;
    var topY = big ? 130 : 72;
    var flowers = '';
    var positions = [];
    for (var i = 0; i < n; i++) {
      var t = n === 1 ? 0.5 : i / (n - 1);
      positions.push({ x: cx + (t - 0.5) * 2 * spread, y: topY + Math.abs(t - 0.5) * (big ? 90 : 46), r: big ? 52 : 30 });
    }
    // центральный цветок выше и крупнее
    positions.push({ x: cx, y: topY - (big ? 60 : 32), r: big ? 62 : 36 });

    var stems = '';
    var wrapTop = big ? 210 : 118;
    var wrapBot = big ? 440 : 244;
    positions.forEach(function (p) {
      stems += '<path d="M' + p.x + ' ' + (p.y + p.r * 0.5) + ' Q' + cx + ' ' + (wrapTop + 30) + ' ' + cx + ' ' + wrapBot + '" stroke="#2F9E5F" stroke-width="' + (big ? 5 : 3.4) + '" fill="none"/>';
      flowers += flower(p.x, p.y, p.r, colors[positions.indexOf(p) % colors.length], 7);
    });

    var leaves = '<path d="M' + (cx - spread - 10) + ' ' + (wrapTop + 10) + ' q-30 -34 -8 -60 q30 20 20 56z" fill="#2F9E5F" opacity=".85"/>' +
      '<path d="M' + (cx + spread + 10) + ' ' + (wrapTop + 10) + ' q30 -34 8 -60 q-30 20 -20 56z" fill="#3CB371" opacity=".85"/>';

    return '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#FFF1F6"/><stop offset="1" stop-color="#FBD0DC"/></linearGradient></defs>' +
      stems + leaves +
      '<path d="M' + (cx - spread - 22) + ' ' + wrapTop + ' L' + cx + ' ' + wrapBot + ' L' + (cx + spread + 22) + ' ' + wrapTop +
      ' Q' + cx + ' ' + (wrapTop + (big ? 46 : 26)) + ' ' + (cx - spread - 22) + ' ' + wrapTop + ' Z" fill="url(#' + gid + ')" stroke="#E93A7D" stroke-opacity=".25"/>' +
      '<path d="M' + (cx - 30) + ' ' + (wrapTop + (big ? 58 : 34)) + ' q30 22 60 0" stroke="#E93A7D" stroke-width="' + (big ? 7 : 5) + '" fill="none" stroke-linecap="round"/>' +
      flowers + '</svg>';
  }

  /* ---------- Корзина и лепестки ---------- */
  var cart = [];
  var cartCount = $('#cartCount');
  var cartBtn = $('#cartBtn');

  function addToCart(bouquet) {
    cart.push(bouquet);
    cartCount.textContent = cart.length;
    cartCount.classList.add('bump');
    setTimeout(function () { cartCount.classList.remove('bump'); }, 260);
  }

  function flyPetals(fromEl, colors) {
    var from = fromEl.getBoundingClientRect();
    var to = cartBtn.getBoundingClientRect();
    var startX = from.left + from.width / 2;
    var startY = from.top + from.height / 2;
    var endX = to.left + to.width / 2;
    var endY = to.top + to.height / 2;
    for (var i = 0; i < 6; i++) {
      (function (i) {
        var petal = document.createElement('div');
        petal.className = 'petal';
        var size = 10 + Math.random() * 10;
        petal.style.width = size + 'px';
        petal.style.height = size * 0.8 + 'px';
        petal.style.background = colors[i % colors.length];
        petal.style.left = startX + 'px';
        petal.style.top = startY + 'px';
        document.body.appendChild(petal);
        var midX = startX + (Math.random() - 0.5) * 220;
        var midY = startY - 120 - Math.random() * 120;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            petal.style.transform = 'translate(' + (midX - startX) + 'px,' + (midY - startY) + 'px) rotate(' + (Math.random() * 360) + 'deg) scale(1.1)';
          });
        });
        setTimeout(function () {
          petal.style.transition = 'transform .7s cubic-bezier(.5,0,.8,.4), opacity .7s ease';
          petal.style.transform = 'translate(' + (endX - startX) + 'px,' + (endY - startY) + 'px) rotate(' + (Math.random() * 720) + 'deg) scale(.3)';
          petal.style.opacity = '0.4';
        }, 420 + i * 60);
        setTimeout(function () { petal.remove(); }, 1400 + i * 60);
      })(i);
    }
  }

  function bindBuyButtons(root) {
    root.querySelectorAll('[data-buy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var b = BOUQUETS.find(function (x) { return x.id === Number(btn.dataset.buy); });
        if (!b) return;
        addToCart(b);
        flyPetals(btn, b.colors);
        btn.textContent = 'В корзине ✓';
        setTimeout(function () { btn.textContent = 'В корзину'; }, 1400);
      });
    });
  }

  /* ---------- Карточка букета ---------- */
  function cardHTML(b) {
    var old = b.old ? '<s>' + fmt(b.old) + '</s>' : '';
    var stock = b.stock <= 3 ? '<span class="card__stock">осталось ' + b.stock + ' шт</span>' : '';
    return '<article class="card">' + stock +
      '<div class="card__art">' + bouquetSVG(b.colors, false) + '</div>' +
      '<div class="card__body"><h3 class="card__name">' + b.name + '</h3>' +
      '<p class="card__desc">' + b.desc + '</p>' +
      '<div class="card__row"><span class="card__price">' + old + fmt(b.price) + '</span>' +
      '<button class="card__buy" data-buy="' + b.id + '">В корзину</button></div></div></article>';
  }

  /* ---------- Каталог и фильтры ---------- */
  var chipsWrap = $('#chips');
  var grid = $('#catalogGrid');
  var emptyMsg = $('#catalogEmpty');

  FILTERS.forEach(function (f, i) {
    var chip = document.createElement('button');
    chip.className = 'chip' + (f.id === 'all' ? ' active' : '');
    chip.textContent = f.label;
    chip.dataset.filter = f.id;
    chip.style.animationDelay = (i * 45) + 'ms';
    chip.addEventListener('click', function () {
      chipsWrap.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      renderCatalog(f.id);
    });
    chipsWrap.appendChild(chip);
    requestAnimationFrame(function () { chip.classList.add('shown'); });
  });

  function renderCatalog(filter) {
    var list = filter === 'all' ? BOUQUETS : BOUQUETS.filter(function (b) { return b.tags.indexOf(filter) !== -1; });
    grid.innerHTML = list.map(function (b, i) {
      return cardHTML(b).replace('class="card"', 'class="card" style="animation-delay:' + (i * 55) + 'ms"');
    }).join('');
    emptyMsg.hidden = list.length > 0;
    bindBuyButtons(grid);
  }
  renderCatalog('all');

  /* ---------- Hero и «букет дня» иллюстрации ---------- */
  $('#heroArt').innerHTML = bouquetSVG(['#E93A7D', '#D7263D', '#F6A5C0'], true);
  $('#dayArt').innerHTML = bouquetSVG(['#FFC53D', '#FFD970', '#F5A623'], true);

  /* ---------- Бегущая строка ---------- */
  var marqueeItems = ['Доставка за 60 минут', 'Фото букета перед отправкой', 'Открытка в подарок', 'Свежесть 5 дней', 'Работаем 8:00–22:00', 'Анонимная доставка'];
  var track = $('#marqueeTrack');
  var html = '';
  for (var r = 0; r < 2; r++) {
    marqueeItems.forEach(function (t) { html += '<span><i></i>' + t + '</span>'; });
  }
  track.innerHTML = html;

  /* ---------- Таймер «букет дня» ---------- */
  function tickDayTimer() {
    var now = new Date();
    var end = new Date(now); end.setHours(23, 59, 59, 999);
    var diff = Math.max(0, end - now);
    var h = Math.floor(diff / 3600000);
    var m = Math.floor(diff % 3600000 / 60000);
    var s = Math.floor(diff % 60000 / 1000);
    $('#dtH').textContent = String(h).padStart(2, '0');
    $('#dtM').textContent = String(m).padStart(2, '0');
    $('#dtS').textContent = String(s).padStart(2, '0');
  }
  tickDayTimer();
  setInterval(tickDayTimer, 1000);

  $('#dayBuy').addEventListener('click', function () {
    var dayBouquet = BOUQUETS[2]; // «Солнечный всплеск»
    addToCart(dayBouquet);
    flyPetals(this, dayBouquet.colors);
  });

  /* ---------- Счётчик «доставлено сегодня» ---------- */
  var counterEl = $('#todayCounter');
  var base = 34 + new Date().getHours() * 4;
  var delivered = base;
  counterEl.textContent = delivered;
  function bumpCounter() {
    delivered += 1;
    counterEl.textContent = delivered;
    counterEl.style.transform = 'scale(1.25)';
    counterEl.style.display = 'inline-block';
    counterEl.style.transition = 'transform .25s';
    setTimeout(function () { counterEl.style.transform = 'none'; }, 260);
    setTimeout(bumpCounter, 8000 + Math.random() * 14000);
  }
  setTimeout(bumpCounter, 5000);

  /* ---------- Конструктор сюрприза ---------- */
  var whoChips = $('#whoChips');
  var budgetChips = $('#budgetChips');
  var cGrid = $('#constructorGrid');
  var cHint = $('#constructorHint');
  var selWho = null, selBudget = null;

  function makeCtorChip(wrap, item, onPick, idx) {
    var chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = item.label;
    chip.style.animationDelay = (idx * 45) + 'ms';
    chip.addEventListener('click', function () {
      wrap.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      onPick(item);
      renderConstructor();
    });
    wrap.appendChild(chip);
    requestAnimationFrame(function () { chip.classList.add('shown'); });
  }

  WHO.forEach(function (w, i) { makeCtorChip(whoChips, w, function (item) { selWho = item; }, i); });
  BUDGETS.forEach(function (b, i) { makeCtorChip(budgetChips, b, function (item) { selBudget = item; }, i); });

  function renderConstructor() {
    if (!selWho || !selBudget) return;
    var inBudget = BOUQUETS.filter(function (b) { return b.price >= selBudget.min && b.price < selBudget.max; });
    var picked = inBudget.filter(function (b) { return b.tags.indexOf(selWho.tag) !== -1; });
    inBudget.forEach(function (b) {
      if (picked.length < 3 && picked.indexOf(b) === -1) picked.push(b);
    });
    picked = picked.slice(0, 3);
    cHint.hidden = true;
    cGrid.innerHTML = picked.map(function (b, i) {
      return cardHTML(b).replace('class="card"', 'class="card" style="animation-delay:' + (i * 90) + 'ms"');
    }).join('');
    bindBuyButtons(cGrid);
  }

  /* ---------- Отзывы: карусель ---------- */
  var revTrack = $('#reviewsTrack');
  var revDots = $('#reviewsDots');
  var revIndex = 0;

  revTrack.innerHTML = REVIEWS.map(function (r) {
    return '<div class="review"><div class="review__emoji">' + r.emoji + '</div>' +
      '<p class="review__text">«' + r.text + '»</p>' +
      '<div class="review__meta"><b>' + r.name + '</b><span class="review__tag">✓ ' + r.tag + '</span></div></div>';
  }).join('');

  REVIEWS.forEach(function (_, i) {
    var dot = document.createElement('button');
    dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', function () { goReview(i); });
    revDots.appendChild(dot);
  });

  function goReview(i) {
    revIndex = (i + REVIEWS.length) % REVIEWS.length;
    revTrack.style.transform = 'translateX(-' + revIndex * 100 + '%)';
    revDots.querySelectorAll('button').forEach(function (d, j) {
      d.classList.toggle('active', j === revIndex);
    });
  }
  $('#revPrev').addEventListener('click', function () { goReview(revIndex - 1); });
  $('#revNext').addEventListener('click', function () { goReview(revIndex + 1); });
  var autoRev = setInterval(function () { goReview(revIndex + 1); }, 6000);
  revTrack.addEventListener('pointerdown', function () { clearInterval(autoRev); }, { once: true });

  /* ---------- Мини-карта зоны доставки ---------- */
  $('#deliveryMap').innerHTML =
    '<svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" role="img">' +
    '<rect width="420" height="240" rx="16" fill="#16191D"/>' +
    '<path d="M0 90 Q120 60 210 95 T420 80 L420 0 L0 0 Z" fill="#1E2329"/>' +
    '<path d="M0 200 Q140 170 260 195 T420 180 L420 240 L0 240 Z" fill="#1E2329"/>' +
    '<ellipse cx="150" cy="110" rx="95" ry="62" fill="#2F9E5F" opacity=".22" stroke="#2F9E5F" stroke-dasharray="5 4"/>' +
    '<ellipse cx="150" cy="110" rx="52" ry="34" fill="#2F9E5F" opacity=".3"/>' +
    '<ellipse cx="300" cy="120" rx="72" ry="56" fill="#FFC53D" opacity=".18" stroke="#FFC53D" stroke-dasharray="5 4"/>' +
    '<ellipse cx="330" cy="55" rx="70" ry="40" fill="#E93A7D" opacity=".16" stroke="#E93A7D" stroke-dasharray="5 4"/>' +
    '<circle cx="150" cy="110" r="6" fill="#E93A7D"><animate attributeName="r" values="6;8;6" dur="1.6s" repeatCount="indefinite"/></circle>' +
    '<text x="150" y="95" fill="#fff" font-size="11" font-weight="700" text-anchor="middle" font-family="Onest,sans-serif">Склад</text>' +
    '<text x="150" y="185" fill="#7BE0A8" font-size="11.5" font-weight="600" text-anchor="middle" font-family="Onest,sans-serif">Центр · 30–45 мин</text>' +
    '<text x="300" y="195" fill="#FFC53D" font-size="11.5" font-weight="600" text-anchor="middle" font-family="Onest,sans-serif">Спальный · 45–60 мин</text>' +
    '<text x="330" y="28" fill="#F27DA6" font-size="11.5" font-weight="600" text-anchor="middle" font-family="Onest,sans-serif">Окраины · 60–90 мин</text>' +
    '</svg>';

  /* ---------- Форма быстрого заказа ---------- */
  var form = $('#orderForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    ['orderPhone', 'orderAddress'].forEach(function (id) {
      var input = document.getElementById(id);
      var valid = input.value.trim().length >= (id === 'orderPhone' ? 6 : 4);
      input.classList.toggle('error', !valid);
      if (!valid) ok = false;
    });
    if (!ok) return;
    form.querySelector('button[type="submit"]').disabled = true;
    $('#orderSuccess').hidden = false;
    setTimeout(function () {
      form.reset();
      form.querySelector('button[type="submit"]').disabled = false;
      $('#orderSuccess').hidden = true;
    }, 6000);
  });
  ['orderPhone', 'orderAddress'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
      this.classList.remove('error');
    });
  });

  /* ---------- Бургер-меню ---------- */
  var burger = $('#burger');
  var nav = $('#nav');
  burger.addEventListener('click', function () {
    burger.classList.toggle('open');
    nav.classList.toggle('open');
  });
  nav.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      burger.classList.remove('open');
      nav.classList.remove('open');
    });
  });

  /* ---------- Reveal при скролле ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

})();
