/* ===== Аутсорс.Про — интерактив лендинга ===== */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: тень при скролле ---------- */
  var header = document.getElementById('header');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Бургер-меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('.nav__link')) {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- Динамический индикатор «ближайший старт — понедельник» ---------- */
  function formatNextMonday() {
    var now = new Date();
    var day = now.getDay(); // 0 — вс, 1 — пн
    var diff = (8 - day) % 7 || 7; // всегда ближайший будущий понедельник
    var next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
    var formatted = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(next);
    return 'понедельник, ' + formatted;
  }
  var mondayText = formatNextMonday();
  var badgeDate = document.getElementById('nextStartDate');
  if (badgeDate) badgeDate.textContent = mondayText;
  var ctaStart = document.getElementById('ctaStart');
  if (ctaStart) ctaStart.innerHTML = 'Ближайший старт аудита — <strong>' + mondayText + '</strong>';
  var successStart = document.getElementById('successStart');
  if (successStart) successStart.innerHTML = 'Ближайший старт — <strong>' + mondayText + '</strong>';

  /* ---------- Появление при скролле ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !REDUCED) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Счётчики доверия ---------- */
  var counters = document.querySelectorAll('.counter');
  function animateCounter(el) {
    var target = parseInt(el.dataset.target, 10) || 0;
    if (REDUCED || target === 0) {
      el.textContent = String(target);
      return;
    }
    var duration = 1600;
    var start = null;
    function tick(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
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

  /* ---------- Карта рисков: фильтр по уровню ---------- */
  var riskFilters = document.getElementById('riskFilters');
  var riskRows = document.querySelectorAll('#riskTableBody tr');
  var riskEmpty = document.getElementById('riskEmpty');
  riskFilters.addEventListener('click', function (e) {
    var btn = e.target.closest('.risk-filter');
    if (!btn) return;
    riskFilters.querySelectorAll('.risk-filter').forEach(function (b) {
      b.classList.toggle('is-active', b === btn);
    });
    var level = btn.dataset.level;
    var visible = 0;
    riskRows.forEach(function (row) {
      var show = level === 'all' || row.dataset.level === level;
      row.classList.toggle('is-filtered-out', !show);
      if (show) visible++;
    });
    riskEmpty.hidden = visible > 0;
  });

  /* ---------- Калькулятор налоговой нагрузки ---------- */
  var PATENT_FIXED = 240000;        // патент — фиксированный платёж, ₽/год
  var PATENT_LIMIT = 60000000;      // лимит выручки для патента
  var NPD_LIMIT = 2400000;          // лимит выручки для НПД

  var calcRevenue = document.getElementById('calcRevenue');
  var calcExpense = document.getElementById('calcExpense');
  var calcRevenueValue = document.getElementById('calcRevenueValue');
  var calcExpenseValue = document.getElementById('calcExpenseValue');
  var calcClients = document.getElementById('calcClients');
  var calcVerdict = document.getElementById('calcVerdict');

  var rows = {
    usn6: { bar: document.getElementById('barUsn6'), sum: document.getElementById('sumUsn6'), el: document.querySelector('[data-regime="usn6"]') },
    usn15: { bar: document.getElementById('barUsn15'), sum: document.getElementById('sumUsn15'), el: document.querySelector('[data-regime="usn15"]') },
    npd: { bar: document.getElementById('barNpd'), sum: document.getElementById('sumNpd'), el: document.querySelector('[data-regime="npd"]') },
    patent: { bar: document.getElementById('barPatent'), sum: document.getElementById('sumPatent'), el: document.querySelector('[data-regime="patent"]') }
  };

  function formatRub(value) {
    if (value >= 1000000) {
      var mln = value / 1000000;
      var str = mln >= 100 ? String(Math.round(mln)) : mln.toFixed(1).replace('.', ',');
      return str + ' млн ₽';
    }
    return new Intl.NumberFormat('ru-RU').format(Math.round(value)) + ' ₽';
  }

  function setSliderFill(slider) {
    var min = parseFloat(slider.min);
    var max = parseFloat(slider.max);
    var pct = ((parseFloat(slider.value) - min) / (max - min)) * 100;
    slider.style.setProperty('--fill', pct + '%');
  }

  function getClientType() {
    var active = calcClients.querySelector('.calc__toggle-btn.is-active');
    return active ? active.dataset.clients : 'b2b';
  }

  function recalc() {
    var revenueMln = parseFloat(calcRevenue.value);
    var expensePct = parseFloat(calcExpense.value);
    var revenue = revenueMln * 1000000;
    var expenses = revenue * expensePct / 100;
    var clientType = getClientType();

    calcRevenueValue.textContent = revenueMln + ' млн ₽';
    calcExpenseValue.textContent = expensePct + '%';
    setSliderFill(calcRevenue);
    setSliderFill(calcExpense);

    // УСН 6% — налог со всей выручки
    var usn6 = revenue * 0.06;
    // УСН 15% — с разницы, но не меньше минимального 1% с выручки
    var usn15 = Math.max((revenue - expenses) * 0.15, revenue * 0.01);
    // НПД — 4% с платежей физлиц, 6% с юрлиц; лимит 2,4 млн ₽/год
    var npdAvailable = revenue <= NPD_LIMIT;
    var npd = npdAvailable ? revenue * (clientType === 'b2c' ? 0.04 : 0.06) : null;
    // Патент — фиксированный платёж; лимит 60 млн ₽/год
    var patentAvailable = revenue <= PATENT_LIMIT;
    var patent = patentAvailable ? PATENT_FIXED : null;

    var results = {
      usn6: { value: usn6, available: true, name: 'УСН «Доходы»' },
      usn15: { value: usn15, available: true, name: 'УСН «Доходы − расходы»' },
      npd: { value: npd, available: npdAvailable, name: 'НПД' },
      patent: { value: patent, available: patentAvailable, name: 'Патент' }
    };

    var maxValue = usn6; // шкала — по самому дорогому базовому режиму
    var bestKey = null;
    var bestValue = Infinity;

    Object.keys(results).forEach(function (key) {
      var r = results[key];
      var row = rows[key];
      row.el.classList.toggle('is-disabled', !r.available);
      if (r.available) {
        row.sum.textContent = formatRub(r.value);
        row.bar.style.width = Math.max((r.value / maxValue) * 100, 3) + '%';
        if (r.value < bestValue) {
          bestValue = r.value;
          bestKey = key;
        }
      } else {
        row.sum.textContent = 'недоступен';
        row.bar.style.width = '0%';
      }
    });

    Object.keys(rows).forEach(function (key) {
      rows[key].el.classList.toggle('is-best', key === bestKey);
    });

    if (bestKey) {
      var saving = usn6 - bestValue;
      var savingText = saving > 0
        ? ', экономия относительно УСН 6% — <strong>' + formatRub(saving) + ' в год</strong>'
        : '';
      calcVerdict.innerHTML = 'При выручке <strong>' + revenueMln + ' млн ₽</strong> и доле расходов <strong>' + expensePct +
        '%</strong> минимальную нагрузку даёт режим <strong>' + results[bestKey].name + '</strong> — около <strong>' +
        formatRub(bestValue) + ' в год</strong>' + savingText + '. Точную модель построим на экспресс-аудите.';
    }
  }

  calcRevenue.addEventListener('input', recalc);
  calcExpense.addEventListener('input', recalc);
  calcClients.addEventListener('click', function (e) {
    var btn = e.target.closest('.calc__toggle-btn');
    if (!btn) return;
    calcClients.querySelectorAll('.calc__toggle-btn').forEach(function (b) {
      b.classList.toggle('is-active', b === btn);
    });
    recalc();
  });
  recalc();

  /* ---------- Карусель отзывов ---------- */
  var track = document.getElementById('carouselTrack');
  var slides = track.children;
  var dotsWrap = document.getElementById('carouselDots');
  var prevBtn = document.getElementById('carouselPrev');
  var nextBtn = document.getElementById('carouselNext');
  var current = 0;
  var autoTimer = null;

  for (var i = 0; i < slides.length; i++) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
    dot.dataset.index = String(i);
    dotsWrap.appendChild(dot);
  }
  var dots = dotsWrap.querySelectorAll('.carousel__dot');

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + current * 100 + '%)';
    dots.forEach(function (d, idx) {
      d.classList.toggle('is-active', idx === current);
    });
  }
  function restartAuto() {
    if (autoTimer) clearInterval(autoTimer);
    if (!REDUCED) {
      autoTimer = setInterval(function () { goTo(current + 1); }, 7000);
    }
  }
  prevBtn.addEventListener('click', function () { goTo(current - 1); restartAuto(); });
  nextBtn.addEventListener('click', function () { goTo(current + 1); restartAuto(); });
  dotsWrap.addEventListener('click', function (e) {
    var dot = e.target.closest('.carousel__dot');
    if (dot) { goTo(parseInt(dot.dataset.index, 10)); restartAuto(); }
  });
  restartAuto();

  /* ---------- Форма заявки ---------- */
  var form = document.getElementById('auditForm');
  var formSuccess = document.getElementById('formSuccess');
  var formError = document.getElementById('formError');
  var formReset = document.getElementById('formReset');
  var requiredFields = [
    document.getElementById('formName'),
    document.getElementById('formPhone'),
    document.getElementById('formRevenue'),
    document.getElementById('formCompany')
  ];

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;
    requiredFields.forEach(function (field) {
      var empty = !field.value || !field.value.trim();
      field.closest('.form__field').classList.toggle('is-invalid', empty);
      if (empty) valid = false;
    });
    formError.hidden = valid;
    if (!valid) return;
    form.hidden = true;
    formSuccess.hidden = false;
    formSuccess.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
  });

  requiredFields.forEach(function (field) {
    field.addEventListener('input', function () {
      field.closest('.form__field').classList.remove('is-invalid');
      formError.hidden = true;
    });
  });

  formReset.addEventListener('click', function () {
    form.reset();
    formSuccess.hidden = true;
    form.hidden = false;
  });

  /* ---------- Год в футере ---------- */
  document.getElementById('footerYear').textContent = String(new Date().getFullYear());
})();
