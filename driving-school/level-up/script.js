/* ============================================================
   LEVEL UP — автошкола. Вся интерактивная логика (ванильный JS)
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Бургер-меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  burger.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Анимация появления при скролле ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---------- Hero: шкала XP и скиллы ---------- */
  var xpFill = document.getElementById('xpFill');
  var xpValue = document.getElementById('xpValue');
  var XP_TARGET = 620; // из 1000

  function animateXp() {
    xpFill.style.width = (XP_TARGET / 10) + '%';
    var start = null;
    var duration = 1600;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      xpValue.textContent = Math.round(XP_TARGET * eased) + ' / 1000';
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  setTimeout(animateXp, 500);

  document.querySelectorAll('.skill__fill').forEach(function (fill) {
    setTimeout(function () {
      fill.style.width = fill.getAttribute('data-fill') + '%';
    }, 700);
  });

  /* ---------- Счётчик «скиллов прокачано» ---------- */
  var counter = document.getElementById('skillsCounter');
  var counterDone = false;

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !counterDone) {
        counterDone = true;
        var target = parseInt(counter.getAttribute('data-target'), 10);
        var start = null;
        var duration = 2000;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 4);
          counter.textContent = Math.round(target * eased).toLocaleString('ru-RU');
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        counterObserver.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counterObserver.observe(counter);

  /* ---------- Карта уровней ---------- */
  var LEVELS = [
    {
      lvl: 'LVL 1', title: 'Нуб', lessons: '8', skill: 'сцепление',
      desc: 'Знакомимся с машиной: педали, зеркала, посадка. Первые метры на автодроме — без паники, рядом всегда инструктор.'
    },
    {
      lvl: 'LVL 10', title: 'Пешеход с правами', lessons: '12', skill: 'теория ПДД',
      desc: 'Теория через мемы и реальные ситуации, а не зубрёжку. Знаки, разметка, приоритеты — и ты уже не боишься перекрёстков.'
    },
    {
      lvl: 'LVL 25', title: 'Парковочный ниндзя', lessons: '16', skill: 'парковка',
      desc: 'Параллельная, перпендикулярная, задом в гараж. Упражнения до автоматизма — паркуешься с закрытыми глазами (почти).'
    },
    {
      lvl: 'LVL 40', title: 'Городской гонщик', lessons: '22', skill: 'город',
      desc: 'Плотный трафик, кольца, развязки, злые маршрутки. Учимся читать дорогу и предугадывать других водителей.'
    },
    {
      lvl: 'LVL 60', title: 'Экзамен-босс', lessons: '28', skill: 'экзамен',
      desc: 'Полная репетиция госэкзамена: маршруты ГИБДД, типовые ловушки, работа с волнением. Босс повержен.'
    },
    {
      lvl: 'LVL 80', title: 'Водитель 80 lvl', lessons: '34', skill: 'уверенность',
      desc: 'Права в кармане, навыки в голове. Финальные занятия по контраварийке — и добро пожаловать в дорожную гильдию.'
    }
  ];

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var mapPath = document.getElementById('mapPath');
  var mapNodes = document.getElementById('mapNodes');
  var mapDot = document.getElementById('mapDot');
  var mapDotInner = document.getElementById('mapDotInner');
  var pathLen = mapPath.getTotalLength();

  var panelLvl = document.getElementById('panelLvl');
  var panelTitle = document.getElementById('panelTitle');
  var panelDesc = document.getElementById('panelDesc');
  var panelLessons = document.getElementById('panelLessons');
  var panelSkill = document.getElementById('panelSkill');

  var nodeElements = [];

  LEVELS.forEach(function (level, i) {
    var t = i / (LEVELS.length - 1);
    var point = mapPath.getPointAtLength(pathLen * t);

    var g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'map-node');
    g.setAttribute('role', 'button');
    g.setAttribute('tabindex', '0');
    g.setAttribute('aria-label', level.title + ', ' + level.lessons + ' занятий');

    var ring = document.createElementNS(SVG_NS, 'circle');
    ring.setAttribute('class', 'map-node__ring');
    ring.setAttribute('cx', point.x);
    ring.setAttribute('cy', point.y);
    ring.setAttribute('r', 26);

    var num = document.createElementNS(SVG_NS, 'text');
    num.setAttribute('class', 'map-node__num');
    num.setAttribute('x', point.x);
    num.setAttribute('y', point.y);
    num.textContent = i + 1;

    var label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('class', 'map-node__label');
    label.setAttribute('x', point.x);
    // чередуем подписи: снизу / сверху от узла
    label.setAttribute('y', point.y + (i % 2 === 0 ? 52 : -42));
    label.textContent = level.title;

    g.appendChild(ring);
    g.appendChild(num);
    g.appendChild(label);
    mapNodes.appendChild(g);
    nodeElements.push(g);

    function activate() { selectLevel(i); }
    g.addEventListener('click', activate);
    g.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });

  function selectLevel(i) {
    var level = LEVELS[i];
    var t = i / (LEVELS.length - 1);
    var point = mapPath.getPointAtLength(pathLen * t);

    mapDot.setAttribute('cx', point.x);
    mapDot.setAttribute('cy', point.y);
    mapDotInner.setAttribute('cx', point.x);
    mapDotInner.setAttribute('cy', point.y);

    nodeElements.forEach(function (el, idx) {
      el.classList.toggle('is-active', idx === i);
    });

    panelLvl.textContent = level.lvl;
    panelTitle.textContent = level.title;
    panelDesc.textContent = level.desc;
    panelLessons.textContent = level.lessons;
    panelSkill.textContent = level.skill;
  }

  selectLevel(0);

  /* ---------- Квиз «Какой ты водитель» ---------- */
  var QUIZ_QUESTIONS = [
    {
      q: 'Представь: ты сел(а) за руль впервые. Твоя реакция?',
      a: [
        { text: 'Где тут кнопка «вперёд»? Я готов(а)!', type: 'dare' },
        { text: 'Сначала изучу инструкцию. Всю. Дважды.', type: 'calm' },
        { text: 'А можно я пока на пассажирском посижу?', type: 'chill' }
      ]
    },
    {
      q: 'Как ты проходишь игры?',
      a: [
        { text: 'Спидраном: главное — финиш', type: 'dare' },
        { text: 'На 100%: все ачивки и коллекционки', type: 'calm' },
        { text: 'В своё удовольствие, без спешки', type: 'chill' }
      ]
    },
    {
      q: 'Пробка на 40 минут. Твой план?',
      a: [
        { text: 'Объеду по дворам, я знаю лайфхак', type: 'dare' },
        { text: 'Пересчитаю маршрут по навигатору', type: 'calm' },
        { text: 'Включу подкаст и расслаблюсь', type: 'chill' }
      ]
    },
    {
      q: 'Тебя подрезали. Что в голове?',
      a: [
        { text: '«Ну погоди» — и догоняю', type: 'dare' },
        { text: 'Записываю номер и держу дистанцию', type: 'calm' },
        { text: '«Бог ему судья», дышу глубже', type: 'chill' }
      ]
    },
    {
      q: 'Идеальная первая поездка — это…',
      a: [
        { text: 'Трасса, ночь, любимый плейлист', type: 'dare' },
        { text: 'Спокойный маршрут до дачи и обратно', type: 'calm' },
        { text: 'До ближайшего кофе. Пешком тоже норм', type: 'chill' }
      ]
    }
  ];

  var QUIZ_RESULTS = {
    dare: {
      badge: 'результат разблокирован!',
      title: 'Стритрейсер в душе',
      text: 'Ты рождён(а) для дороги, но тебе важно направить драйв в правильное русло: техника, дистанция и холодная голова. Мы научим гонять так, чтобы всё было по правилам и безопасно.',
      pack: 'УЛЬТРА'
    },
    calm: {
      badge: 'результат разблокирован!',
      title: 'Тактик-перфекционист',
      text: 'Ты будешь водить так, что экзаменатор зааплодирует. Твоя суперсила — системность: возьми пакет с максимумом практики и докачай уверенность за рулём.',
      pack: 'ПРО'
    },
    chill: {
      badge: 'результат разблокирован!',
      title: 'Философ пассажирского сиденья',
      text: 'Тебе не нужно никуда спешить — и это сила. Начни с базы в комфортном темпе: наши инструкторы не торопят и не орут, проверено тысячами нубов.',
      pack: 'СТАНДАРТ'
    }
  };

  var quizQuestion = document.getElementById('quizQuestion');
  var quizAnswers = document.getElementById('quizAnswers');
  var quizProgressLabel = document.getElementById('quizProgressLabel');
  var quizProgressFill = document.getElementById('quizProgressFill');
  var quizBody = document.getElementById('quizBody');
  var quizResult = document.getElementById('quizResult');
  var quizResultBadge = document.getElementById('quizResultBadge');
  var quizResultTitle = document.getElementById('quizResultTitle');
  var quizResultText = document.getElementById('quizResultText');
  var quizResultPack = document.getElementById('quizResultPack');
  var quizRestart = document.getElementById('quizRestart');

  var quizIndex = 0;
  var quizScore = { dare: 0, calm: 0, chill: 0 };

  function renderQuestion() {
    var item = QUIZ_QUESTIONS[quizIndex];
    quizQuestion.textContent = item.q;
    quizProgressLabel.textContent = 'Вопрос ' + (quizIndex + 1) + ' из ' + QUIZ_QUESTIONS.length;
    quizProgressFill.style.width = (quizIndex / QUIZ_QUESTIONS.length * 100) + '%';
    quizAnswers.innerHTML = '';

    item.a.forEach(function (answer) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz__answer';
      btn.textContent = answer.text;
      btn.addEventListener('click', function () {
        btn.classList.add('is-picked');
        quizScore[answer.type] += 1;
        setTimeout(nextQuestion, 280);
      });
      quizAnswers.appendChild(btn);
    });
  }

  function nextQuestion() {
    quizIndex += 1;
    if (quizIndex < QUIZ_QUESTIONS.length) {
      renderQuestion();
    } else {
      showQuizResult();
    }
  }

  function showQuizResult() {
    quizProgressFill.style.width = '100%';
    quizProgressLabel.textContent = 'Готово!';

    var winner = 'calm';
    var best = -1;
    Object.keys(quizScore).forEach(function (key) {
      if (quizScore[key] > best) {
        best = quizScore[key];
        winner = key;
      }
    });

    var result = QUIZ_RESULTS[winner];
    quizResultBadge.textContent = result.badge;
    quizResultTitle.textContent = result.title;
    quizResultText.textContent = result.text;
    quizResultPack.textContent = result.pack;

    quizBody.hidden = true;
    quizResult.hidden = false;
  }

  quizRestart.addEventListener('click', function () {
    quizIndex = 0;
    quizScore = { dare: 0, calm: 0, chill: 0 };
    quizResult.hidden = true;
    quizBody.hidden = false;
    renderQuestion();
  });

  renderQuestion();

  /* ---------- Карусель достижений ---------- */
  var REVIEWS = [
    {
      ach: 'Ачивка «Сдала с первого раза»',
      text: 'Пришла полным нубом — боялась даже педалей. Через 3 месяца сдала экзамен с первого раза. Аня объясняла всё через мемы, до сих пор помню знаки по картинкам!',
      name: 'Катя, 19 лет'
    },
    {
      ach: 'Ачивка «Парковочный ниндзя»',
      text: 'Параллельная парковка была моим кошмаром. Дима «Батя» отточил её со мной раз двести — ни разу не повысил голос. Теперь паркуюсь с полоборота руля.',
      name: 'Артём, 22 года'
    },
    {
      ach: 'Ачивка «Экзамен-босс повержен»',
      text: 'На экзамене волновался как на стриме перед тысячей зрителей. Репетиция маршрутов с Серёгой спасла — знал каждую ловушку заранее. 0 штрафных баллов.',
      name: 'Данила, 20 лет'
    },
    {
      ach: 'Ачивка «Рассрочка без боли»',
      text: 'Студент, денег впритык. Оформили рассрочку за 10 минут, платил по 3 тысячи в месяц. Первый урок был бесплатный — рискнул и не пожалел.',
      name: 'Марк, 18 лет'
    },
    {
      ach: 'Ачивка «Водитель 80 lvl»',
      text: 'Уже полгода за рулём каждый день. Здесь не просто «натаскивают на экзамен» — реально учат водить. Город, трасса, дождь, снег — всё спокойно.',
      name: 'Соня, 21 год'
    }
  ];

  var MEDAL_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 L14.5 8 L21 8.5 L16 12.8 L17.8 19 L12 15.5 L6.2 19 L8 12.8 L3 8.5 L9.5 8 Z" fill="#111"/></svg>';

  var revTrack = document.getElementById('revTrack');
  var revDots = document.getElementById('revDots');
  var revIndex = 0;
  var revTimer = null;

  REVIEWS.forEach(function (review, i) {
    var slide = document.createElement('div');
    slide.className = 'review';
    slide.innerHTML =
      '<div class="review__medal">' + MEDAL_SVG + '</div>' +
      '<div class="review__ach">' + review.ach + '</div>' +
      '<p class="review__text">' + review.text + '</p>' +
      '<div class="review__name">' + review.name + '</div>';
    revTrack.appendChild(slide);

    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel__dot';
    dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
    dot.addEventListener('click', function () { goToReview(i); resetTimer(); });
    revDots.appendChild(dot);
  });

  var dotElements = revDots.querySelectorAll('.carousel__dot');

  function goToReview(i) {
    revIndex = (i + REVIEWS.length) % REVIEWS.length;
    revTrack.style.transform = 'translateX(-' + (revIndex * 100) + '%)';
    dotElements.forEach(function (dot, idx) {
      dot.classList.toggle('is-active', idx === revIndex);
    });
  }

  function resetTimer() {
    if (revTimer) clearInterval(revTimer);
    revTimer = setInterval(function () { goToReview(revIndex + 1); }, 6000);
  }

  document.getElementById('revPrev').addEventListener('click', function () {
    goToReview(revIndex - 1);
    resetTimer();
  });
  document.getElementById('revNext').addEventListener('click', function () {
    goToReview(revIndex + 1);
    resetTimer();
  });

  goToReview(0);
  resetTimer();

  /* ---------- Форма CTA (демо-отправка) ---------- */
  var ctaForm = document.getElementById('ctaForm');
  var ctaPhone = document.getElementById('ctaPhone');
  var ctaSuccess = document.getElementById('ctaSuccess');

  ctaForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var digits = ctaPhone.value.replace(/\D/g, '');

    if (digits.length < 10) {
      ctaPhone.classList.add('is-error');
      ctaPhone.focus();
      setTimeout(function () { ctaPhone.classList.remove('is-error'); }, 1200);
      return;
    }

    ctaForm.hidden = true;
    ctaSuccess.hidden = false;
  });

  /* ---------- Плавающие стикеры (микровзаимодействие) ---------- */
  document.querySelectorAll('.sticker').forEach(function (sticker, i) {
    var base = i % 2 === 0 ? 4 : -4;
    var phase = i * 0.9;
    setInterval(function () {
      // лёгкое «дыхание» без сброса поворота из CSS
      sticker.style.marginTop = (Math.sin(Date.now() / 900 + phase) * base) + 'px';
    }, 50);
  });

});
