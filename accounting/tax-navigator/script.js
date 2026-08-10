/* ===== Налоговый навигатор — script ===== */
(function () {
  'use strict';

  var fmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

  function plural(n, one, few, many) {
    var m = Math.abs(n) % 100, d = m % 10;
    if (m > 10 && m < 20) return many;
    if (d > 1 && d < 5) return few;
    if (d === 1) return one;
    return many;
  }

  /* ---------- Header ---------- */
  var header = document.querySelector('.header');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  window.addEventListener('scroll', function () {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }, { passive: true });

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

  /* ---------- Reveal-анимации ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });

  /* ---------- Счётчики ---------- */
  function animateCounter(el) {
    var target = parseFloat(el.dataset.target);
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var dur = 1800, start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = decimals
        ? val.toFixed(decimals).replace('.', ',')
        : fmt.format(Math.round(val));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        animateCounter(e.target);
        counterObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.counter').forEach(function (el) { counterObserver.observe(el); });

  /* ---------- Дедлайны: расчёт от сегодня ---------- */
  var DEADLINES = [
    { m: 0, d: 28, tag: 'НДС', title: 'НДС за 4 квартал', desc: 'Уплата и декларация для ИП на общем режиме.' },
    { m: 3, d: 25, tag: 'УСН', title: 'Декларация УСН за год', desc: 'Годовая декларация для ИП на упрощёнке.' },
    { m: 3, d: 28, tag: 'УСН / НДС', title: 'Аванс УСН и НДС за 1 кв.', desc: 'Авансовый платёж по УСН и квартальный НДС.' },
    { m: 3, d: 30, tag: '3-НДФЛ', title: 'Декларация 3-НДФЛ', desc: 'Для ИП на ОСНО и при продаже имущества.' },
    { m: 6, d: 1, tag: 'Взносы', title: '1% взносов свыше 300 тыс. ₽', desc: 'Дополнительный взнос на пенсионное страхование.' },
    { m: 6, d: 28, tag: 'УСН / НДС', title: 'Аванс УСН и НДС за 2 кв.', desc: 'Авансовый платёж по УСН и квартальный НДС.' },
    { m: 9, d: 28, tag: 'УСН / НДС', title: 'Аванс УСН и НДС за 3 кв.', desc: 'Авансовый платёж по УСН и квартальный НДС.' },
    { m: 11, d: 31, tag: 'Взносы', title: 'Фиксированные взносы ИП', desc: 'Обязательные взносы за себя за текущий год.' }
  ];

  function nextDate(m, d) {
    var now = new Date();
    var y = now.getFullYear();
    var dt = new Date(y, m, d);
    var today = new Date(y, now.getMonth(), now.getDate());
    if (dt < today) dt = new Date(y + 1, m, d);
    return dt;
  }

  function daysLeft(dt) {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((dt - today) / 86400000);
  }

  var deadlinesWrap = document.getElementById('deadlines');
  var upcoming = DEADLINES.map(function (item) {
    var dt = nextDate(item.m, item.d);
    return { item: item, dt: dt, left: daysLeft(dt) };
  }).sort(function (a, b) { return a.dt - b.dt; }).slice(0, 6);

  var monthFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });
  upcoming.forEach(function (u) {
    var cls = u.left <= 7 ? 'deadline--urgent' : (u.left <= 21 ? 'deadline--soon' : 'deadline--ok');
    var card = document.createElement('article');
    card.className = 'deadline ' + cls + ' reveal';
    card.innerHTML =
      '<div class="deadline__top">' +
        '<span class="deadline__tag">' + u.item.tag + '</span>' +
        '<span class="deadline__days">' + (u.left === 0 ? 'сегодня' : u.left + ' ' + plural(u.left, 'день', 'дня', 'дней')) + '</span>' +
      '</div>' +
      '<h3 class="deadline__title">' + u.item.title + '</h3>' +
      '<p class="deadline__desc">' + u.item.desc + '</p>' +
      '<div class="deadline__date">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" stroke-width="2"/><path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
        monthFmt.format(u.dt) +
      '</div>';
    deadlinesWrap.appendChild(card);
    revealObserver.observe(card);
  });

  /* Дни до ближайшего аванса УСН — в дашборде hero */
  var dashDays = document.getElementById('dash-days');
  var usnAdv = upcoming.filter(function (u) { return u.item.title.indexOf('Аванс УСН') === 0; })[0];
  if (dashDays && usnAdv) {
    dashDays.textContent = usnAdv.left === 0 ? 'сегодня' : usnAdv.left + ' ' + plural(usnAdv.left, 'день', 'дня', 'дней');
  }

  /* ---------- Калькулятор режима ---------- */
  var FIXED_CONTRIB = 53658;          // фиксированные взносы ИП 2025, ₽
  var EXTRA_CONTRIB_CAP = 300888;     // лимит 1% свыше 300 тыс., ₽
  var NPD_LIMIT = 2400000;            // лимит НПД в год, ₽

  var incomeInput = document.getElementById('calc-income');
  var expensesInput = document.getElementById('calc-expenses');
  var incomeOut = document.getElementById('calc-income-out');
  var expensesOut = document.getElementById('calc-expenses-out');
  var employeesSeg = document.getElementById('calc-employees');
  var activitySelect = document.getElementById('calc-activity');
  var table = document.getElementById('calc-table');
  var savingBox = document.getElementById('calc-saving');

  function contributions(annualIncome) {
    var extra = Math.min(Math.max(0, (annualIncome - 300000) * 0.01), EXTRA_CONTRIB_CAP);
    return FIXED_CONTRIB + extra;
  }

  function setRangeFill(input) {
    var min = parseFloat(input.min), max = parseFloat(input.max), v = parseFloat(input.value);
    input.style.setProperty('--fill', ((v - min) / (max - min) * 100) + '%');
  }

  function calc() {
    var income = parseFloat(incomeInput.value);
    var expenses = Math.min(parseFloat(expensesInput.value), income);
    if (parseFloat(expensesInput.value) > income) expensesInput.value = income;
    var hasEmployees = employeesSeg.querySelector('.is-active').dataset.value === 'yes';
    var opt = activitySelect.options[activitySelect.selectedIndex];
    var patentCost = parseFloat(opt.dataset.patent);
    var npdRate = parseFloat(opt.dataset.npd) / 100;

    var yIncome = income * 12;
    var yExpenses = expenses * 12;
    var contrib = contributions(yIncome);

    incomeOut.textContent = fmt.format(income) + ' ₽';
    expensesOut.textContent = fmt.format(expenses) + ' ₽';
    setRangeFill(incomeInput);
    setRangeFill(expensesInput);

    // УСН 6%: налог уменьшается на взносы (100% без сотрудников, 50% с ними)
    var usn6tax = yIncome * 0.06;
    var usn6ded = hasEmployees ? usn6tax * 0.5 : usn6tax;
    usn6ded = Math.min(usn6ded, contrib);
    var usn6 = Math.max(0, usn6tax - usn6ded) + contrib;

    // УСН 15%: минимум 1% от дохода
    var base15 = Math.max(0, yIncome - yExpenses - contrib);
    var usn15 = Math.max(base15 * 0.15, yIncome * 0.01) + contrib;

    // Патент: можно уменьшить на взносы
    var patent = hasEmployees
      ? contrib + patentCost * 0.5
      : Math.max(patentCost, contrib);

    // НПД: без взносов, только без сотрудников и в лимите
    var npdAvailable = !hasEmployees && yIncome <= NPD_LIMIT;
    var npd = yIncome * npdRate;

    var regimes = [
      { name: 'УСН «Доходы» 6%', sub: 'простая отчётность', sum: usn6, ok: true },
      { name: 'УСН «Доходы − расходы» 15%', sub: 'при доле расходов от 60%', sum: usn15, ok: true },
      { name: 'Патент', sub: 'фикс. стоимость в регионе', sum: patent, ok: true },
      { name: 'НПД (самозанятость)', sub: npdAvailable ? 'без взносов и отчётов' : (hasEmployees ? 'нельзя с сотрудниками' : 'лимит 2,4 млн ₽ в год'), sum: npd, ok: npdAvailable }
    ];

    var best = null, second = null;
    regimes.forEach(function (r) {
      if (!r.ok) return;
      if (best === null || r.sum < best.sum) { second = best; best = r; }
      else if (second === null || r.sum < second.sum) { second = r; }
    });

    // Пересобираем строки (шапку сохраняем)
    table.querySelectorAll('.calc__tr').forEach(function (row) { row.remove(); });
    regimes.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'calc__tr' + (r.ok && r === best ? ' calc__tr--best' : '') + (!r.ok ? ' calc__tr--off' : '');
      row.setAttribute('role', 'row');
      var badge = r.ok && r === best
        ? '<span class="calc__tag-best">выгоднее</span>'
        : (!r.ok ? '<span class="calc__tag-off">недоступен</span>' : '');
      row.innerHTML =
        '<span class="calc__regime"><span>' + r.name + badge + '</span><small>' + r.sub + '</small></span>' +
        '<span class="calc__sum">' + (r.ok ? fmt.format(Math.round(r.sum)) + ' ₽' : '—') + '</span>' +
        '<span class="calc__per">' + (r.ok ? fmt.format(Math.round(r.sum / 12)) + ' ₽/мес' : '—') + '</span>';
      table.appendChild(row);
    });

    if (best && second && second.sum > best.sum) {
      var diff = Math.round(second.sum - best.sum);
      savingBox.innerHTML = '<span>Экономия на оптимальном режиме:</span><span class="mono">' + fmt.format(diff) + ' ₽ в год</span>';
    } else {
      savingBox.innerHTML = '';
    }
  }

  [incomeInput, expensesInput].forEach(function (input) {
    input.addEventListener('input', calc);
  });
  employeesSeg.querySelectorAll('.seg__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      employeesSeg.querySelectorAll('.seg__btn').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      calc();
    });
  });
  activitySelect.addEventListener('change', calc);
  calc();

  /* ---------- Карусель отзывов ---------- */
  var track = document.getElementById('carousel-track');
  var slides = track.children.length;
  var dotsWrap = document.getElementById('carousel-dots');
  var idx = 0, timer = null;

  for (var i = 0; i < slides; i++) {
    var dot = document.createElement('button');
    dot.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
    dot.dataset.index = i;
    dotsWrap.appendChild(dot);
  }
  var dots = dotsWrap.querySelectorAll('.carousel__dot');

  function goTo(n) {
    idx = (n + slides) % slides;
    track.style.transform = 'translateX(-' + idx * 100 + '%)';
    dots.forEach(function (d, di) { d.classList.toggle('is-active', di === idx); });
  }
  function autoplay() {
    clearInterval(timer);
    timer = setInterval(function () { goTo(idx + 1); }, 6000);
  }

  document.getElementById('carousel-prev').addEventListener('click', function () { goTo(idx - 1); autoplay(); });
  document.getElementById('carousel-next').addEventListener('click', function () { goTo(idx + 1); autoplay(); });
  dotsWrap.addEventListener('click', function (e) {
    if (e.target.classList.contains('carousel__dot')) { goTo(parseInt(e.target.dataset.index, 10)); autoplay(); }
  });
  var carousel = document.getElementById('carousel');
  carousel.addEventListener('mouseenter', function () { clearInterval(timer); });
  carousel.addEventListener('mouseleave', autoplay);
  autoplay();

  /* ---------- Форма ---------- */
  var form = document.getElementById('lead-form');
  var success = document.getElementById('form-success');
  var error = document.getElementById('form-error');
  var nameInput = document.getElementById('form-name');
  var phoneInput = document.getElementById('form-phone');
  var turnoverSelect = document.getElementById('form-turnover');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;
    [nameInput, phoneInput].forEach(function (input) {
      var ok = input.value.trim().length >= (input === phoneInput ? 6 : 2);
      input.classList.toggle('is-invalid', !ok);
      if (!ok) valid = false;
    });
    if (!turnoverSelect.value) valid = false;
    error.hidden = valid;
    if (!valid) return;

    var num = 'НН-' + String(Math.floor(1000 + Math.random() * 9000));
    document.getElementById('form-success-id').textContent = 'Заявка №' + num + ' · ' + new Date().toLocaleDateString('ru-RU');
    form.hidden = true;
    success.hidden = false;
  });

  [nameInput, phoneInput].forEach(function (input) {
    input.addEventListener('input', function () { input.classList.remove('is-invalid'); });
  });
})();
