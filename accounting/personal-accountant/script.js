/* ============================================
   «Свой бухгалтер» — интерактив лендинга
   ============================================ */
(function () {
  'use strict';

  /* ---------- бургер-меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- бейдж «сейчас на связи» по реальному времени ---------- */
  var badge = document.getElementById('onlineBadge');
  var badgeText = document.getElementById('onlineBadgeText');
  var chatStatus = document.getElementById('chatStatus');

  function updateOnlineBadge() {
    var hour = new Date().getHours();
    var online = hour >= 9 && hour < 21;
    if (!badge || !badgeText) return;
    if (online) {
      badge.classList.remove('online-badge--offline');
      badgeText.textContent = 'Сейчас на связи: Марина, бухгалтер';
      if (chatStatus) chatStatus.textContent = 'в сети · ответит за ~15 минут';
    } else {
      badge.classList.add('online-badge--offline');
      badgeText.textContent = 'Сейчас ночь — напишите, ответим первым делом утром';
      if (chatStatus) chatStatus.textContent = 'не в сети · прочтём утром';
    }
  }
  updateOnlineBadge();
  setInterval(updateOnlineBadge, 60000);

  /* ---------- hero-чат: цикл «печатает…» ---------- */
  var heroTyping = document.getElementById('heroTyping');
  var heroAnswer = document.getElementById('heroAnswer');
  var heroThanks = document.getElementById('heroThanks');

  function runChatLoop() {
    if (!heroTyping || !heroAnswer || !heroThanks) return;
    heroTyping.hidden = true;
    heroAnswer.hidden = true;
    heroThanks.hidden = true;

    setTimeout(function () { heroTyping.hidden = false; }, 1400);
    setTimeout(function () {
      heroTyping.hidden = true;
      heroAnswer.hidden = false;
    }, 3400);
    setTimeout(function () { heroThanks.hidden = false; }, 4600);
    setTimeout(runChatLoop, 10000);
  }
  runChatLoop();

  /* ---------- счётчик «спят спокойно» ---------- */
  var counterEl = document.getElementById('calmCounter');
  var counterTarget = 317;
  var counterDone = false;

  function animateCounter() {
    if (!counterEl || counterDone) return;
    counterDone = true;
    var start = null;
    var duration = 1800;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      counterEl.textContent = Math.round(counterTarget * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- reveal при скролле ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });

    if (counterEl) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter();
            cio.disconnect();
          }
        });
      }, { threshold: 0.4 });
      cio.observe(counterEl);
    }
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    animateCounter();
  }

  /* ---------- калькулятор налоговых режимов ---------- */
  var incomeRange = document.getElementById('incomeRange');
  var expenseRange = document.getElementById('expenseRange');
  var b2bRange = document.getElementById('b2bRange');

  var PATENT_MONTH = 4200; // фикс-пример: патент для мастера в среднем регионе
  var NPD_YEAR_LIMIT = 2400000;

  function fmt(n) {
    return Math.round(n).toLocaleString('ru-RU') + ' ₽';
  }

  function setRangeFill(input) {
    var min = Number(input.min);
    var max = Number(input.max);
    var val = Number(input.value);
    var pct = ((val - min) / (max - min)) * 100;
    input.style.setProperty('--fill', pct + '%');
  }

  function calc() {
    if (!incomeRange || !expenseRange || !b2bRange) return;

    var income = Number(incomeRange.value);
    var expense = Math.min(Number(expenseRange.value), income);
    var b2b = Number(b2bRange.value) / 100;

    document.getElementById('incomeOut').textContent = fmt(income);
    document.getElementById('expenseOut').textContent = fmt(expense);
    document.getElementById('b2bOut').textContent = Math.round(b2b * 100) + '%';

    // НПД: 4% с физлиц, 6% с юрлиц
    var npdAvailable = income * 12 <= NPD_YEAR_LIMIT;
    var npd = income * (1 - b2b) * 0.04 + income * b2b * 0.06;

    // УСН 6% с дохода
    var usn6 = income * 0.06;

    // УСН 15% с разницы, но не меньше 1% от дохода (минимальный налог)
    var usn15base = Math.max(income - expense, 0);
    var usn15 = Math.max(usn15base * 0.15, income * 0.01);

    // Патент — фикс
    var patent = PATENT_MONTH;

    var values = {
      npd: npdAvailable ? npd : null,
      usn6: usn6,
      usn15: usn15,
      patent: patent
    };

    document.getElementById('taxNpd').textContent = npdAvailable ? fmt(npd) : 'недоступен';
    document.getElementById('taxUsn6').textContent = fmt(usn6);
    document.getElementById('taxUsn15').textContent = fmt(usn15);
    document.getElementById('taxPatent').textContent = fmt(patent);

    document.getElementById('noteNpd').textContent = npdAvailable
      ? '4% с частных клиентов, 6% — с компаний'
      : 'лимит НПД — 2,4 млн ₽ в год, у вас ' + fmt(income * 12) + ' → нужен ИП';
    document.getElementById('noteUsn6').textContent = '6% со всего дохода, расходы не важны';
    document.getElementById('noteUsn15').textContent =
      usn15base * 0.15 >= income * 0.01
        ? '15% с разницы «доходы − расходы»'
        : 'сработал минимум: 1% от дохода';
    document.getElementById('notePatent').textContent = 'фикс для мастера, не зависит от дохода';

    // шкалы
    var maxTax = Math.max(usn6, usn15, patent, npdAvailable ? npd : 0, 1);
    document.getElementById('barNpd').style.width = npdAvailable ? (npd / maxTax) * 100 + '%' : '0%';
    document.getElementById('barUsn6').style.width = (usn6 / maxTax) * 100 + '%';
    document.getElementById('barUsn15').style.width = (usn15 / maxTax) * 100 + '%';
    document.getElementById('barPatent').style.width = (patent / maxTax) * 100 + '%';

    // лучший вариант
    var bestKey = null;
    var bestVal = Infinity;
    Object.keys(values).forEach(function (k) {
      var row = document.querySelector('.calc-row[data-regime="' + k + '"]');
      if (row) row.classList.remove('calc-row--best', 'calc-row--off');
      if (k === 'npd' && !npdAvailable) {
        if (row) row.classList.add('calc-row--off');
        return;
      }
      if (values[k] < bestVal) {
        bestVal = values[k];
        bestKey = k;
      }
    });

    var names = {
      npd: 'самозанятость (НПД)',
      usn6: 'УСН «доходы» 6%',
      usn15: 'УСН «доходы − расходы» 15%',
      patent: 'патент'
    };
    if (bestKey) {
      var bestRow = document.querySelector('.calc-row[data-regime="' + bestKey + '"]');
      if (bestRow) bestRow.classList.add('calc-row--best');
      var save = Math.max(usn6, usn15, patent, npdAvailable ? npd : 0) - bestVal;
      document.getElementById('calcVerdict').innerHTML =
        'При таких цифрах выгоднее всего — <b>' + names[bestKey] + '</b>: ' +
        fmt(bestVal) + ' в месяц. По сравнению с самым дорогим вариантом это примерно ' +
        '<b>' + fmt(save) + '</b> экономии ежемесячно.';
    }
  }

  [incomeRange, expenseRange, b2bRange].forEach(function (input) {
    if (!input) return;
    setRangeFill(input);
    input.addEventListener('input', function () {
      setRangeFill(input);
      calc();
    });
  });
  calc();

  /* ---------- карусель диалогов ---------- */
  var track = document.getElementById('dlgTrack');
  var prevBtn = document.getElementById('dlgPrev');
  var nextBtn = document.getElementById('dlgNext');
  var dotsWrap = document.getElementById('dlgDots');

  if (track && prevBtn && nextBtn && dotsWrap) {
    var slides = track.children.length;
    var index = 0;
    var autoTimer = null;

    for (var i = 0; i < slides; i++) {
      var dot = document.createElement('button');
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', 'Диалог ' + (i + 1));
      (function (n) {
        dot.addEventListener('click', function () { goTo(n); restartAuto(); });
      })(i);
      dotsWrap.appendChild(dot);
    }

    function render() {
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      Array.prototype.forEach.call(dotsWrap.children, function (d, n) {
        d.classList.toggle('is-active', n === index);
      });
    }

    function goTo(n) {
      index = (n + slides) % slides;
      render();
    }

    function restartAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(function () { goTo(index + 1); }, 6000);
    }

    prevBtn.addEventListener('click', function () { goTo(index - 1); restartAuto(); });
    nextBtn.addEventListener('click', function () { goTo(index + 1); restartAuto(); });

    var carousel = document.getElementById('dialogCarousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', function () { clearInterval(autoTimer); });
      carousel.addEventListener('mouseleave', restartAuto);
    }

    render();
    restartAuto();
  }

  /* ---------- форма: демо-отправка ---------- */
  var form = document.getElementById('leadForm');
  var success = document.getElementById('leadSuccess');
  var error = document.getElementById('leadError');

  if (form && success) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('leadName');
      var contact = document.getElementById('leadContact');
      var ok = true;

      [name, contact].forEach(function (field) {
        var filled = field.value.trim().length > 1;
        field.classList.toggle('is-invalid', !filled);
        if (!filled) ok = false;
      });

      if (!ok) {
        if (error) error.hidden = false;
        return;
      }
      if (error) error.hidden = true;

      var successText = document.getElementById('leadSuccessText');
      if (successText && name.value.trim()) {
        var hour = new Date().getHours();
        var when = (hour >= 9 && hour < 21)
          ? 'в течение 15 минут'
          : 'завтра утром, первым делом';
        successText.textContent = name.value.trim() +
          ', Марина уже читает ваше сообщение и ответит ' + when +
          ' — в телеграм или по телефону, как удобнее.';
      }

      form.hidden = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    form.addEventListener('input', function (e) {
      if (e.target.classList) e.target.classList.remove('is-invalid');
      if (error) error.hidden = true;
    });
  }
})();
