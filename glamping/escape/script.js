/* ================= ESCAPE — интерактив ================= */
document.documentElement.classList.add('js');

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const fmt = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

/* ---------- даты ---------- */
const WD = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const pad = n => String(n).padStart(2, '0');
const dstr = d => `${WD[d.getDay()]} ${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;

function nextWeekday(wd) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  const diff = (wd - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  return d;
}
function addDays(d, n) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

/* ---------- данные ---------- */
const HOUSES = [
  { id: 'standart', name: 'Купол Стандарт',  price: 6900,  cap: 2, extra: 1000 },
  { id: 'kupel',    name: 'Купол с купелью', price: 9900,  cap: 2, extra: 1200 },
  { id: 'loft',     name: 'Лофт-шалаш',      price: 12900, cap: 4, extra: 900 },
  { id: 'tent',     name: 'Тент-лагерь',     price: 3900,  cap: 4, extra: 500 },
];
const GUESTS = [
  { v: 2, t: '1–2', s: 'романтика' },
  { v: 4, t: '3–4', s: 'своя банда' },
  { v: 6, t: '5–6', s: 'полный состав' },
];

function dateOptions() {
  const fri = nextWeekday(5);
  const sat = nextWeekday(6);
  const fri2 = addDays(fri, 7);
  return [
    { t: 'Эти выходные',       s: `${dstr(fri)} — ${dstr(addDays(fri, 2))} · 2 ночи`, nights: 2 },
    { t: 'Следующие выходные', s: `${dstr(fri2)} — ${dstr(addDays(fri2, 2))} · 2 ночи`, nights: 2 },
    { t: 'Только суббота',     s: `${dstr(sat)} · 1 ночь`, nights: 1 },
  ];
}

/* ---------- бургер-меню ---------- */
(function burger() {
  const btn = $('#burger'), menu = $('#mobileMenu');
  if (!btn || !menu) return;
  const close = () => {
    menu.hidden = true;
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  };
  btn.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  });
  $$('.mm-link, .mm-phone', menu).forEach(a => a.addEventListener('click', close));
})();

/* ---------- reveal при скролле ---------- */
(function reveal() {
  const els = $$('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

/* ---------- КВИЗ ---------- */
const QUESTIONS = [
  { q: 'Кто едет?', opts: [
    { v: 'duo',  t: 'Парочка 💛' },
    { v: 'gang', t: 'Банда 🔥' },
    { v: 'solo', t: 'Соло 🚶' },
  ]},
  { q: 'Какой вайб?', opts: [
    { v: 'chill', t: 'Тишина и книга 📖' },
    { v: 'fire',  t: 'Костёр и танцы 🕺' },
    { v: 'sport', t: 'Спорт и сапы 🏄' },
  ]},
  { q: 'Бюджет на ночь?', opts: [
    { v: 'low', t: 'До 7к 🙂' },
    { v: 'mid', t: '7–12к 😎' },
    { v: 'max', t: 'Без лимита 🤑' },
  ]},
];
const VIBES = {
  chill: {
    sub: 'Тихий побег: после 22:00 — только ты, книга и треск костра.',
    program: ['Гамак у ручья и чайник на углях', 'Баня на дровах без очереди', 'Завтрак в купол в 11:00'],
  },
  fire: {
    sub: 'Громкий побег: костёр-джем, танцы до последнего угля, новые друзья.',
    program: ['Костёр-джем с гитарой в пятницу', 'Маршмеллоу-баттл у общего огня', 'Виниловый сет до утра'],
  },
  sport: {
    sub: 'Активный побег: сапы на рассвете, баня, прорубь и лёгкая боль в мышцах.',
    program: ['Сапы на рассвете в 6:00', 'Сап-поло и перетягивание каната', 'Баня + прорубь после разгона'],
  },
};

const quiz = { step: 0, answers: [] };

function quizResult() {
  const [who, vibe, budget] = quiz.answers;
  let houseId;
  if (who === 'solo') houseId = budget === 'low' ? 'tent' : 'standart';
  else if (who === 'gang') houseId = budget === 'low' ? 'tent' : 'loft';
  else houseId = budget === 'low' ? 'standart' : 'kupel';
  const house = HOUSES.find(h => h.id === houseId);
  const v = VIBES[vibe];
  const guests = who === 'gang' ? 6 : 2;
  return { house, vibe: v, guests };
}

function renderQuizStep() {
  const q = QUESTIONS[quiz.step];
  $('#quizStepLabel').textContent = `Вопрос ${quiz.step + 1} из ${QUESTIONS.length}`;
  $('#quizBarFill').style.width = `${(quiz.step / QUESTIONS.length) * 100}%`;
  $('#quizQuestion').textContent = q.q;
  const box = $('#quizOptions');
  box.innerHTML = '';
  q.opts.forEach(o => {
    const b = document.createElement('button');
    b.className = 'quiz-opt';
    b.type = 'button';
    b.textContent = o.t;
    b.addEventListener('click', () => {
      $$('.quiz-opt', box).forEach(x => (x.disabled = true));
      b.classList.add('picked');
      quiz.answers[quiz.step] = o.v;
      setTimeout(() => {
        quiz.step += 1;
        if (quiz.step < QUESTIONS.length) renderQuizStep();
        else finishQuiz();
      }, 320);
    });
    box.appendChild(b);
  });
}

function finishQuiz() {
  $('#quizBarFill').style.width = '100%';
  $('#quizStepLabel').textContent = 'Готово!';
  $('#quizBody').hidden = true;
  $('#quizLoading').hidden = false;
  setTimeout(() => {
    $('#quizLoading').hidden = true;
    const r = quizResult();
    $('#qrTitle').textContent = r.house.name;
    $('#qrSub').textContent = r.vibe.sub;
    const ul = $('#qrProgram');
    ul.innerHTML = '';
    r.vibe.program.forEach(p => {
      const li = document.createElement('li');
      li.textContent = p;
      ul.appendChild(li);
    });
    $('#qrPrice').innerHTML = `${fmt(r.house.price)}<small>за ночь · вмещает до ${r.house.cap === 4 ? 6 : r.house.cap} гостей</small>`;
    $('#quizResult').hidden = false;
    quizBurst();
    const book = $('#qrBook');
    book.onclick = () => {
      bk.state.house = r.house.id;
      bk.state.guests = r.guests;
      renderBooking();
      $('#booking').scrollIntoView({ behavior: 'smooth' });
    };
  }, 1500);
}

function quizBurst() {
  const wrap = $('#quizBurst');
  wrap.innerHTML = '';
  const emojis = ['🔥', '✨', '🏕️', '🎉', '💥', '⭐'];
  for (let i = 0; i < 10; i++) {
    const s = document.createElement('span');
    s.textContent = emojis[i % emojis.length];
    s.style.left = '50%';
    s.style.top = '45%';
    s.style.setProperty('--dx', `${(Math.random() - 0.5) * 560}px`);
    s.style.setProperty('--dy', `${(Math.random() - 0.6) * 380}px`);
    s.style.setProperty('--rot', `${(Math.random() - 0.5) * 320}deg`);
    s.style.animationDelay = `${Math.random() * 0.25}s`;
    wrap.appendChild(s);
  }
}

(function initQuiz() {
  if (!$('#quizOptions')) return;
  renderQuizStep();
  $('#qrRestart').addEventListener('click', () => {
    quiz.step = 0;
    quiz.answers = [];
    $('#quizResult').hidden = true;
    $('#quizBody').hidden = false;
    renderQuizStep();
  });
})();

/* ---------- БРОНЬ ЗА 3 КЛИКА ---------- */
const bk = {
  state: { date: 0, house: 'kupel', guests: 2 },
  dates: dateOptions(),
};

function bkCalc() {
  const d = bk.dates[bk.state.date];
  const h = HOUSES.find(x => x.id === bk.state.house);
  const base = h.price * d.nights;
  const extraG = Math.max(0, bk.state.guests - h.cap);
  const extra = extraG * h.extra * d.nights;
  return { d, h, base, extraG, extra, total: base + extra };
}

function renderChips(boxId, items, isSel, onPick) {
  const box = $(boxId);
  box.innerHTML = '';
  items.forEach((it, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (isSel(it, i) ? ' selected' : '');
    b.innerHTML = it.s ? `${it.t}<small>${it.s}</small>` : it.t;
    b.addEventListener('click', () => onPick(it, i));
    box.appendChild(b);
  });
}

function renderBooking() {
  renderChips('#bkDates', bk.dates,
    (_, i) => i === bk.state.date,
    (_, i) => { bk.state.date = i; renderBooking(); });
  renderChips('#bkHouses', HOUSES.map(h => ({ t: h.name, s: `${fmt(h.price)} / ночь`, id: h.id })),
    it => it.id === bk.state.house,
    it => { bk.state.house = it.id; renderBooking(); });
  renderChips('#bkGuests', GUESTS,
    it => it.v === bk.state.guests,
    it => { bk.state.guests = it.v; renderBooking(); });

  const c = bkCalc();
  const nightsWord = c.d.nights === 1 ? 'ночь' : 'ночи';
  const lines = [
    [`${c.h.name}`, `${fmt(c.h.price)} × ${c.d.nights}`],
    [`${c.d.t.toLowerCase()} · ${c.d.s.split('·')[0].trim()}`, `${c.d.nights} ${nightsWord}`],
    [`гости`, `${bk.state.guests} чел.`],
  ];
  if (c.extra > 0) lines.push([`+${c.extraG} гостя сверх`, fmt(c.extra)]);
  $('#btLines').innerHTML = lines
    .map(([k, v]) => `<div class="bt-line"><span>${k}</span><span>${v}</span></div>`)
    .join('');
  const price = $('#btPrice');
  price.textContent = fmt(c.total);
  price.classList.remove('bump');
  void price.offsetWidth;
  price.classList.add('bump');
}

(function initBooking() {
  if (!$('#bkDates')) return;
  renderBooking();

  $('#btSubmit').addEventListener('click', () => {
    const c = bkCalc();
    $('#btSuccessText').innerHTML =
      `${c.h.name}, ${c.d.s.toLowerCase()}, гостей: ${bk.state.guests} — <b>${fmt(c.total)}</b>.<br>` +
      `Менеджер перезвонит в течение 15 минут и подтвердит слот. Если горит — звони: <b>+7 909 093-94-00</b>.`;
    $('#btCard').hidden = true;
    $('#btSuccess').hidden = false;
  });
  $('#btAgain').addEventListener('click', () => {
    $('#btSuccess').hidden = true;
    $('#btCard').hidden = false;
  });

  // кнопки «Выбрать слот» на карточках домиков
  $$('.house-pick').forEach(btn => {
    btn.addEventListener('click', () => {
      bk.state.house = btn.dataset.house;
      renderBooking();
      $$('.house-pick').forEach(x => x.classList.remove('selected'));
      btn.classList.add('selected');
      $('#booking').scrollIntoView({ behavior: 'smooth' });
    });
  });
})();

/* ---------- ЛЕНТА СОБЫТИЙ ---------- */
(function events() {
  const box = $('#eventsTrack');
  if (!box) return;
  const FRI = [
    { icon: '🔥', title: 'Костёр-джем',      desc: 'Гитара, маршмеллоу и треки, которые знает вся поляна.', tag: 'пятница, 21:00' },
    { icon: '🎶', title: 'Виниловый вечер',  desc: 'Приноси свою пластинку — поставим на общем проигрывателе.', tag: 'пятница, 20:00' },
    { icon: '🕺', title: 'Танцы у костра',   desc: 'Плейлист гостей, гирлянды и поляна как танцпол.', tag: 'пятница, 22:00' },
  ];
  const SAT = [
    { icon: '🏄', title: 'Сапы на рассвете', desc: 'Выход на воду в 6:00. Туман, тишина и чай из термосов.', tag: 'суббота, 6:00' },
    { icon: '🎬', title: 'Киноночь',         desc: 'Проектор, экран между сосен, пледы и попкорн с костра.', tag: 'суббота, 21:00' },
    { icon: '🧖', title: 'Баня + прорубь',   desc: 'Дровяная баня и ледяная купель. Жар → лёд → апельсиновый чай.', tag: 'суббота, 17:00' },
  ];
  const dates = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  for (let i = 0; dates.length < 6 && i < 32; i++) {
    const day = d.getDay();
    if (day === 5 || day === 6) dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  let fi = 0, si = 0;
  box.innerHTML = '';
  dates.forEach(dt => {
    const ev = dt.getDay() === 5 ? FRI[fi++ % FRI.length] : SAT[si++ % SAT.length];
    const card = document.createElement('article');
    card.className = 'event-card reveal';
    card.innerHTML =
      `<span class="event-date">${dstr(dt)}</span>` +
      `<span class="event-emoji" aria-hidden="true">${ev.icon}</span>` +
      `<h3>${ev.title}</h3><p>${ev.desc}</p>` +
      `<span class="event-tag">${ev.tag}</span>`;
    box.appendChild(card);
  });
  // reveal для динамических карточек
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }), { threshold: 0.1 });
    $$('.reveal', box).forEach(el => io.observe(el));
  } else {
    $$('.reveal', box).forEach(el => el.classList.add('visible'));
  }
})();

/* ---------- ОТЗЫВЫ ---------- */
const REVIEWS = [
  {
    name: 'Алина, 24', color: '#C6F24E', ava: 'А',
    msgs: [
      { t: 'приехали «на одну ночку» 😅', time: '23:14' },
      { t: 'остались на три. город отменяется 🔥', time: '23:15' },
      { t: 'купель в два ночи — это нелегально настолько хорошо', time: '23:16', right: true },
    ],
  },
  {
    name: 'Данила, 27', color: '#FF7A29', ava: 'Д',
    msgs: [
      { t: 'бронировал с телефона в пятницу в 18:00', time: '18:02' },
      { t: 'в 20:30 уже жарил маршмеллоу 🍢', time: '20:31' },
      { t: '3 клика. я серьёзно 🤯', time: '20:31', right: true },
    ],
  },
  {
    name: 'Ксюша и банда', color: '#FF4DA6', ava: 'К',
    msgs: [
      { t: 'нас было шестеро и собака 🐕', time: '12:40' },
      { t: 'лофт-шалаш — топ, винил до утра 🎶', time: '12:41' },
      { t: 'город на паузе. буквально ⏸️', time: '12:42', right: true },
    ],
  },
  {
    name: 'Марк, 31', color: '#C6F24E', ava: 'М',
    msgs: [
      { t: 'сапы в 6 утра. кто я вообще такой 😂', time: '07:05' },
      { t: 'баня и прорубь отрезвили лучше кофе 🧊', time: '18:22' },
      { t: 'вернёмся через неделю, это диагноз', time: '18:23', right: true },
    ],
  },
];

(function reviews() {
  const track = $('#revTrack');
  if (!track) return;
  let idx = 0, timer = null, msgTimers = [];

  REVIEWS.forEach(r => {
    const slide = document.createElement('div');
    slide.className = 'rev-slide';
    const msgs = r.msgs.map(m =>
      `<div class="msg${m.right ? ' right' : ''}">${m.t}<span class="msg-time">${m.time}</span></div>`
    ).join('');
    slide.innerHTML =
      `<div class="phone">` +
        `<div class="chat-head">` +
          `<span class="chat-ava" style="background:${r.color}">${r.ava}</span>` +
          `<span><span class="chat-name">${r.name}</span><br><span class="chat-status">online</span></span>` +
        `</div>` +
        `<div class="chat-body">${msgs}</div>` +
      `</div>`;
    track.appendChild(slide);
  });

  const dots = $('#revDots');
  REVIEWS.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'rev-dot';
    d.type = 'button';
    d.setAttribute('aria-label', `Отзыв ${i + 1}`);
    d.addEventListener('click', () => go(i));
    dots.appendChild(d);
  });

  function playMsgs() {
    msgTimers.forEach(clearTimeout);
    msgTimers = [];
    $$('.msg', track).forEach(m => m.classList.add('ghost'));
    const msgs = $$('.msg', track.children[idx]);
    msgs.forEach((m, i) => msgTimers.push(setTimeout(() => m.classList.remove('ghost'), 250 + i * 420)));
  }

  function go(i) {
    idx = (i + REVIEWS.length) % REVIEWS.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
    $$('.rev-dot', dots).forEach((d, j) => d.classList.toggle('active', j === idx));
    playMsgs();
    restart();
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(idx + 1), 6000);
  }

  $('#revPrev').addEventListener('click', () => go(idx - 1));
  $('#revNext').addEventListener('click', () => go(idx + 1));
  const vp = $('#revViewport');
  vp.addEventListener('mouseenter', () => clearInterval(timer));
  vp.addEventListener('mouseleave', restart);

  let x0 = null;
  vp.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; clearInterval(timer); }, { passive: true });
  vp.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
    x0 = null;
    restart();
  }, { passive: true });

  go(0);
})();

/* ---------- СЧЁТЧИК КУПОЛОВ ---------- */
(function counter() {
  const left = $('#domeLeft'), word = $('#domeWord'), count = $('#domeCount'), bar = $('#domeBar');
  if (!left) return;
  const TOTAL = 12;
  let occ = 10;

  function plural(n) {
    if (n % 10 === 1 && n % 100 !== 11) return 'КУПОЛ';
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'КУПОЛА';
    return 'КУПОЛОВ';
  }
  function render() {
    const free = TOTAL - occ;
    left.textContent = free;
    word.textContent = plural(free);
    count.textContent = `${occ} из ${TOTAL}`;
    bar.style.width = `${(occ / TOTAL) * 100}%`;
    bar.classList.remove('bump');
    void bar.offsetWidth;
    bar.classList.add('bump');
  }
  render();
  setInterval(() => {
    const r = Math.random();
    if (r < 0.6 && occ < TOTAL - 1) occ += 1;
    else if (r >= 0.6 && occ > TOTAL - 3) occ -= 1;
    else return;
    render();
  }, 9000);
})();

/* ---------- год в футере ---------- */
(function year() {
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
