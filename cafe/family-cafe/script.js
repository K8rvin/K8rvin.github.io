/* ============================================================
   Кафе «Шинок» — интерактив (ванильный JS)
   ============================================================ */
'use strict';

/* ---------- Шапка: тень при скролле + бургер ---------- */
(function initHeader() {
  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });

  // Закрываем мобильное меню при переходе по ссылке
  nav.addEventListener('click', (e) => {
    if (e.target.closest('.nav__link')) {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* ---------- Появление секций при скролле ---------- */
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach((el) => io.observe(el));
})();

/* ---------- Пасхалка: прыгающая пампушка + промокод ---------- */
(function initPampushka() {
  const buns = document.getElementById('pampushka');
  const pop = document.getElementById('promoPop');
  const hint = document.getElementById('pampushkaHint');
  let shown = false;

  const jump = () => {
    buns.classList.remove('is-jumping');
    void buns.getBoundingClientRect(); // перезапуск анимации
    buns.classList.add('is-jumping');
    if (!shown) {
      shown = true;
      setTimeout(() => {
        pop.hidden = false;
        if (hint) hint.textContent = 'промокод ваш — назовите его при заказе!';
      }, 320);
    }
  };

  buns.addEventListener('click', jump);
  buns.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); jump(); }
  });
})();

/* ---------- Деловой обед: сет недели (табы) ---------- */
(function initLunchTabs() {
  const WEEK = [
    { // Понедельник
      soup: 'Борщ со сметаной и зеленью',
      main: 'Котлета по-домашнему с пюре',
      salad: 'Витаминный из капусты и яблока',
      drink: 'Морс клюквенный'
    },
    { // Вторник
      soup: 'Суп куриный с домашней лапшой',
      main: 'Гречка с гуляшом из говядины',
      salad: 'Овощной с оливковым маслом',
      drink: 'Чай с чабрецом'
    },
    { // Среда
      soup: 'Суп-пюре тыквенный со сливками',
      main: 'Рыба запечённая с рисом',
      salad: 'Свекольный с черносливом',
      drink: 'Морс облепиховый'
    },
    { // Четверг
      soup: 'Рассольник с перловкой',
      main: 'Плов с курицей',
      salad: 'Мимоза классическая',
      drink: 'Компот из сухофруктов'
    },
    { // Пятница
      soup: 'Уха по-волжски',
      main: 'Пельмени со сметаной',
      salad: 'Цезарь с курицей',
      drink: 'Морс брусничный'
    }
  ];
  const KINDS = [['soup', 'Суп'], ['main', 'Горячее'], ['salad', 'Салат'], ['drink', 'Напиток']];

  const tabs = document.querySelectorAll('#lunchTabs .tab');
  const dayBox = document.getElementById('lunchDay');

  function renderDay(idx) {
    const day = WEEK[idx];
    dayBox.innerHTML = KINDS.map(([key, label]) => `
      <div class="lunch__day-item">
        <span class="dish-name">${day[key]}</span>
        <span class="dish-kind">${label}</span>
      </div>`).join('');
  }

  function select(idx) {
    tabs.forEach((t, i) => {
      t.classList.toggle('is-active', i === idx);
      t.setAttribute('aria-selected', String(i === idx));
    });
    renderDay(idx);
  }

  tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i)));

  // По умолчанию — текущий будний день (в выходные показываем пятницу)
  const today = new Date().getDay(); // 0=вс … 6=сб
  select(today >= 1 && today <= 5 ? today - 1 : 0);
})();

/* ---------- Виджет: до конца обеда осталось N минут ---------- */
(function initLunchTimer() {
  const text = document.getElementById('lunchTimerText');
  const box = document.getElementById('lunchTimer');
  if (!text) return;

  const LUNCH_START = 12 * 60; // 12:00
  const LUNCH_END = 16 * 60;   // 16:00

  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  function tick() {
    const now = new Date();
    const day = now.getDay();
    const mins = now.getHours() * 60 + now.getMinutes();
    const weekday = day >= 1 && day <= 5;

    if (weekday && mins >= LUNCH_START && mins < LUNCH_END) {
      const left = LUNCH_END - mins;
      const h = Math.floor(left / 60);
      const m = left % 60;
      box.classList.remove('is-late');
      text.textContent = h > 0
        ? `до конца обеда: ${h} ч ${m} мин`
        : `до конца обеда: ${m} ${plural(m, 'минута', 'минуты', 'минут')}`;
    } else if (weekday && mins < LUNCH_START) {
      const left = LUNCH_START - mins;
      const h = Math.floor(left / 60);
      const m = left % 60;
      box.classList.add('is-late');
      text.textContent = h > 0
        ? `обеды с 12:00 — через ${h} ч ${m} мин`
        : `обеды с 12:00 — через ${m} мин`;
    } else {
      box.classList.add('is-late');
      text.textContent = weekday ? 'обеды завтра с 12:00' : 'обеды в будни с 12:00';
    }
  }

  tick();
  setInterval(tick, 30000);
})();

/* ---------- Меню-витрина: данные, SVG-иллюстрации, фильтры ---------- */
const MENU = [
  { id: 'borsh', cat: 'soups', name: 'Борщ со сметаной', price: 290, weight: '350 г',
    desc: 'Наваристый, на говяжьем бульоне, с пампушкой в подарок.',
    comp: 'Говядина, свёкла, капуста, картофель, морковь, лук, томат, сметана, укроп, чеснок.',
    kbju: { kcal: 245, p: 12, f: 9, c: 28 }, hue: '#D94B3A' },
  { id: 'solyanka', cat: 'soups', name: 'Солянка мясная', price: 320, weight: '350 г',
    desc: 'Густая, с копчёностями, маслинами и ломтиком лимона.',
    comp: 'Говядина, ветчина, колбаски, маслины, лимон, огурцы солёные, томат, сметана.',
    kbju: { kcal: 310, p: 16, f: 18, c: 14 }, hue: '#C96A2E' },
  { id: 'chicken-soup', cat: 'soups', name: 'Куриный с лапшой', price: 260, weight: '350 г',
    desc: 'Домашняя лапша, фермерская курица, золотистый бульон.',
    comp: 'Курица, лапша домашняя, морковь, лук, картофель, зелень, перец горошком.',
    kbju: { kcal: 198, p: 14, f: 6, c: 22 }, hue: '#E8A53A' },
  { id: 'pumpkin-soup', cat: 'soups', name: 'Суп-пюре тыквенный', price: 280, weight: '300 г',
    desc: 'Нежный, со сливками и поджаренными семечками.',
    comp: 'Тыква, сливки, картофель, лук, чеснок, семена тыквы, мускатный орех.',
    kbju: { kcal: 175, p: 4, f: 8, c: 24 }, hue: '#E8863A' },
  { id: 'pelmeni', cat: 'mains', name: 'Пельмени со сметаной', price: 340, weight: '300 г',
    desc: 'Лепим вручную каждое утро, тесто тонкое, начинки много.',
    comp: 'Тесто пшеничное, говядина, свинина, лук, сметана, сливочное масло, укроп.',
    kbju: { kcal: 420, p: 19, f: 22, c: 36 }, hue: '#F3D9A8' },
  { id: 'kotleta', cat: 'mains', name: 'Котлета с пюре', price: 330, weight: '280 г',
    desc: 'Как у бабушки: с хрустящей корочкой и сливочным пюре.',
    comp: 'Говядина, свинина, лук, батон, молоко, картофель, сливочное масло, сливки.',
    kbju: { kcal: 460, p: 21, f: 26, c: 34 }, hue: '#B97A4A' },
  { id: 'golubtsy', cat: 'mains', name: 'Голубцы в соусе', price: 350, weight: '320 г',
    desc: 'Томятся в томатно-сметанном соусе два часа.',
    comp: 'Капуста, говяжий фарш, рис, лук, морковь, томат, сметана, лавровый лист.',
    kbju: { kcal: 380, p: 17, f: 16, c: 40 }, hue: '#7FA05C' },
  { id: 'plov', cat: 'mains', name: 'Плов с курицей', price: 310, weight: '300 г',
    desc: 'Рассыпчатый рис, сочная курица, чеснок целой головкой.',
    comp: 'Рис девзира, курица, морковь, лук, чеснок, барбарис, зира, масло.',
    kbju: { kcal: 445, p: 20, f: 15, c: 56 }, hue: '#E8B23A' },
  { id: 'vinegret', cat: 'salads', name: 'Винегрет с грибами', price: 220, weight: '200 г',
    desc: 'С маринованными опятами и ароматным маслом.',
    comp: 'Свёкла, картофель, морковь, огурцы солёные, опята маринованные, лук, масло.',
    kbju: { kcal: 160, p: 3, f: 8, c: 20 }, hue: '#A84B6B' },
  { id: 'caesar', cat: 'salads', name: 'Цезарь с курицей', price: 340, weight: '220 г',
    desc: 'Хрустящий ромэн, тёплая куриная грудка, пармезан.',
    comp: 'Курица, ромэн, пармезан, сухарики, соус цезарь, помидоры черри.',
    kbju: { kcal: 290, p: 22, f: 17, c: 12 }, hue: '#8FBF6E' },
  { id: 'olivie', cat: 'salads', name: 'Оливье с докторской', price: 240, weight: '200 г',
    desc: 'Праздничный вкус круглый год, с домашним майонезом.',
    comp: 'Колбаса докторская, картофель, морковь, яйцо, горошек, огурец, майонез.',
    kbju: { kcal: 265, p: 9, f: 19, c: 16 }, hue: '#9FBF8E' },
  { id: 'syrniki', cat: 'desserts', name: 'Сырники с мёдом', price: 270, weight: '180 г',
    desc: 'Румяные, из деревенского творога, с мёдом и сметаной.',
    comp: 'Творог, яйцо, мука, сахар, ваниль, мёд, сметана.',
    kbju: { kcal: 350, p: 16, f: 12, c: 44 }, hue: '#F0C060' },
  { id: 'napoleon', cat: 'desserts', name: 'Наполеон домашний', price: 190, weight: '120 г',
    desc: 'Двенадцать слоёв, заварной крем, тает во рту.',
    comp: 'Мука, сливочное масло, молоко, яйца, сахар, ваниль.',
    kbju: { kcal: 410, p: 7, f: 24, c: 42 }, hue: '#F6E0B8' },
  { id: 'medovik', cat: 'desserts', name: 'Медовик', price: 180, weight: '120 г',
    desc: 'На гречишном мёде, с кислинкой сметанного крема.',
    comp: 'Мёд гречишный, мука, яйца, сметана, сахар, сода.',
    kbju: { kcal: 390, p: 6, f: 18, c: 52 }, hue: '#E8A53A' },
  { id: 'kids-pancakes', cat: 'kids', name: 'Оладьи «Улыбка»', price: 190, weight: '150 г',
    desc: 'С мордочкой из ягод — дети доедают и просят добавку.',
    comp: 'Оладьи на кефире, банан, клубника, черника, сметана, мёд.',
    kbju: { kcal: 280, p: 7, f: 8, c: 46 }, hue: '#F0C453' },
  { id: 'kids-kotleta', cat: 'kids', name: 'Мини-котлетки с пюре', price: 240, weight: '200 г',
    desc: 'Паровые индюшиные котлетки и пюре-«облачко».',
    comp: 'Индейка, картофель, молоко, сливочное масло, морковь, брокколи.',
    kbju: { kcal: 260, p: 15, f: 9, c: 28 }, hue: '#D98E5B' },
  { id: 'kids-cocoa', cat: 'kids', name: 'Какао с маршмеллоу', price: 150, weight: '250 мл',
    desc: 'Густое какао на молоке с тающим маршмеллоу.',
    comp: 'Молоко, какао, сахар, маршмеллоу, ваниль.',
    kbju: { kcal: 210, p: 6, f: 7, c: 30 }, hue: '#8B5E3C' }
];

const CATS = {
  soups: 'Супы', mains: 'Горячее', salads: 'Салаты',
  desserts: 'Десерты', kids: 'Детям'
};

/* Процедурная SVG-иллюстрация блюда: цвет и форма зависят от категории */
function dishArt(dish) {
  const h = dish.hue;
  const steam = `
    <g stroke="#B9A98C" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.85">
      <path d="M96 78 q-6 -12 0 -22 q6 -10 0 -20"/>
      <path d="M130 74 q-6 -12 0 -22 q6 -10 0 -20"/>
    </g>`;

  const shapes = {
    soups: `
      <ellipse cx="160" cy="190" rx="120" ry="18" fill="#000" opacity="0.06"/>
      <ellipse cx="160" cy="176" rx="110" ry="34" fill="#FFFDF8" stroke="#EFE3CB" stroke-width="4"/>
      <ellipse cx="160" cy="170" rx="86" ry="24" fill="${h}"/>
      <ellipse cx="140" cy="164" rx="22" ry="8" fill="#FFFDF8" opacity="0.85"/>
      <circle cx="186" cy="170" r="6" fill="#4A7C59"/>
      <circle cx="118" cy="172" r="5" fill="#4A7C59"/>
      ${steam}`,
    mains: `
      <ellipse cx="160" cy="192" rx="120" ry="18" fill="#000" opacity="0.06"/>
      <ellipse cx="160" cy="176" rx="110" ry="38" fill="#FFFDF8" stroke="#EFE3CB" stroke-width="4"/>
      <ellipse cx="160" cy="170" rx="80" ry="24" fill="#FDF3DC"/>
      <ellipse cx="132" cy="168" rx="30" ry="16" fill="${h}"/>
      <ellipse cx="192" cy="172" rx="34" ry="14" fill="#F3E0B8"/>
      <circle cx="176" cy="158" r="5" fill="#4A7C59"/>
      <path d="M110 160 q12 -8 24 0" stroke="#FFF3D9" stroke-width="4" fill="none" stroke-linecap="round"/>
      ${steam}`,
    salads: `
      <ellipse cx="160" cy="192" rx="110" ry="16" fill="#000" opacity="0.06"/>
      <path d="M60 150 Q160 128 260 150 L248 190 Q160 208 72 190 Z" fill="#FFFDF8" stroke="#EFE3CB" stroke-width="4"/>
      <ellipse cx="160" cy="150" rx="96" ry="20" fill="${h}"/>
      <circle cx="120" cy="146" r="9" fill="#E8574A"/>
      <circle cx="190" cy="150" r="9" fill="#E8574A"/>
      <circle cx="156" cy="140" r="7" fill="#F6C453"/>
      <path d="M92 146 q12 -8 24 0 M206 144 q12 -8 22 0" stroke="#3D6B4B" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    desserts: `
      <ellipse cx="160" cy="192" rx="110" ry="16" fill="#000" opacity="0.06"/>
      <ellipse cx="160" cy="180" rx="100" ry="22" fill="#FFFDF8" stroke="#EFE3CB" stroke-width="4"/>
      <path d="M112 172 L160 96 L208 172 Q160 186 112 172 Z" fill="${h}"/>
      <path d="M124 152 L196 152 M136 132 L184 132" stroke="#FFFDF8" stroke-width="6" stroke-linecap="round" opacity="0.85"/>
      <circle cx="160" cy="94" r="9" fill="#E8574A"/>
      <path d="M160 88 q6 -10 12 -12" stroke="#4A7C59" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    kids: `
      <ellipse cx="160" cy="192" rx="110" ry="16" fill="#000" opacity="0.06"/>
      <ellipse cx="160" cy="178" rx="100" ry="26" fill="#FFFDF8" stroke="#EFE3CB" stroke-width="4"/>
      <circle cx="160" cy="156" r="38" fill="${h}"/>
      <circle cx="146" cy="150" r="5" fill="#2E2A26"/>
      <circle cx="174" cy="150" r="5" fill="#2E2A26"/>
      <path d="M146 164 q14 10 28 0" stroke="#2E2A26" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="128" cy="162" r="6" fill="#F0A08A" opacity="0.7"/>
      <circle cx="192" cy="162" r="6" fill="#F0A08A" opacity="0.7"/>
      <circle cx="160" cy="116" r="8" fill="#E8574A"/>`
  };

  const bgByCat = {
    soups: '#FDEBDD', mains: '#FDF3DC', salads: '#E9F2E7',
    desserts: '#FBEAE4', kids: '#FFF4CE'
  };

  return `
  <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="320" height="220" fill="${bgByCat[dish.cat]}"/>
    <circle cx="268" cy="40" r="26" fill="#FFFDF8" opacity="0.5"/>
    <circle cx="36" cy="188" r="18" fill="#FFFDF8" opacity="0.5"/>
    ${shapes[dish.cat]}
  </svg>`;
}

(function initMenu() {
  const grid = document.getElementById('menuGrid');
  const chips = document.querySelectorAll('#menuFilters .chip');

  function render(cat) {
    const list = cat === 'all' ? MENU : MENU.filter((d) => d.cat === cat);
    grid.innerHTML = list.map((d, i) => `
      <article class="dish-card" data-id="${d.id}" style="animation-delay:${i * 0.05}s" tabindex="0" role="button" aria-label="${d.name}, ${d.price} рублей — подробнее">
        <div class="dish-card__art">${dishArt(d)}</div>
        <div class="dish-card__body">
          <h3 class="dish-card__name">${d.name}</h3>
          <p class="dish-card__desc">${d.desc}</p>
          <div class="dish-card__row">
            <span class="dish-card__price">${d.price}&nbsp;₽</span>
            <span class="dish-card__weight">${d.weight}</span>
          </div>
        </div>
      </article>`).join('');
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      // пружинистая анимация нажатия
      chip.classList.remove('is-pressed');
      void chip.offsetWidth;
      chip.classList.add('is-pressed');

      chips.forEach((c) => c.classList.toggle('is-active', c === chip));
      render(chip.dataset.cat);
    });
  });

  render('all');

  // Модальное окно блюда
  const modal = document.getElementById('dishModal');
  let lastFocus = null;

  function openModal(dish) {
    document.getElementById('modalArt').innerHTML = dishArt(dish);
    document.getElementById('modalCat').textContent = CATS[dish.cat];
    document.getElementById('modalTitle').textContent = dish.name;
    document.getElementById('modalDesc').textContent = dish.desc;
    document.getElementById('modalComposition').textContent = dish.comp;
    document.getElementById('modalPrice').textContent = `${dish.price} ₽`;
    document.getElementById('modalNutrition').innerHTML = `
      <span><b>${dish.kbju.kcal}</b> ккал</span>
      <span>Белки <b>${dish.kbju.p}</b> г</span>
      <span>Жиры <b>${dish.kbju.f}</b> г</span>
      <span>Углеводы <b>${dish.kbju.c}</b> г</span>
      <span>Порция <b>${dish.weight}</b></span>`;
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.querySelector('.modal__close').focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocus) lastFocus.focus();
  }

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.dish-card');
    if (!card) return;
    const dish = MENU.find((d) => d.id === card.dataset.id);
    if (dish) openModal(dish);
  });
  grid.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('dish-card')) {
      e.preventDefault();
      const dish = MENU.find((d) => d.id === e.target.dataset.id);
      if (dish) openModal(dish);
    }
  });
  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-modal-close]')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
})();

/* ---------- Карусель отзывов ---------- */
(function initReviews() {
  const REVIEWS = [
    { emoji: '😊', text: 'Обедаю здесь каждый будний день. Обед приносят минут через десять, борщ — как дома, только лучше. Пятый обед по карте — бесплатно, приятно!',
      author: 'Дмитрий', meta: 'офис рядом, обедает с марта' },
    { emoji: '👨‍👩‍👧', text: 'Пришли с двойняшками в воскресенье — детям обеды подарили, стульчики принесли сразу, ещё и пампушки угостили. Теперь это наша семейная традиция.',
      author: 'Марина', meta: 'мама двойняшек, 4 года' },
    { emoji: '🤩', text: 'Заказывали доставку в офис на 12 человек. Привезли всё горячим и аккуратно упакованным, каждый обед подписан. Плов — объедение!',
      author: 'Ольга', meta: 'офис-менеджер, Краснооктябрьский район' },
    { emoji: '🥰', text: 'Светло, чисто, официанты улыбаются. Сырники с мёдом — лучшее, что я ела в Волгограде. Дочка в восторге от оладий «Улыбка».',
      author: 'Екатерина', meta: 'гость с ребёнком 6 лет' },
    { emoji: '👍', text: 'Самовывоз со скидкой 20% — честная экономия. Звонишь по дороге с работы, через 15 минут пакет уже ждёт. Рекомендую голубцы.',
      author: 'Сергей', meta: 'забирает ужин по пятницам' }
  ];

  const track = document.getElementById('reviewsTrack');
  const dotsBox = document.getElementById('reviewsDots');
  let index = 0;
  let timer = null;

  track.innerHTML = REVIEWS.map((r) => `
    <div class="review-slide">
      <div class="review-slide__emoji" aria-hidden="true">${r.emoji}</div>
      <p class="review-slide__text">«${r.text}»</p>
      <div class="review-slide__author">${r.author}</div>
      <div class="review-slide__meta">${r.meta}</div>
    </div>`).join('');

  dotsBox.innerHTML = REVIEWS.map((_, i) =>
    `<button class="reviews__dot${i === 0 ? ' is-active' : ''}" role="tab" aria-label="Отзыв ${i + 1}" data-i="${i}"></button>`).join('');
  const dots = dotsBox.querySelectorAll('.reviews__dot');

  function go(i) {
    index = (i + REVIEWS.length) % REVIEWS.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, j) => d.classList.toggle('is-active', j === index));
  }

  function restartAuto() {
    clearInterval(timer);
    timer = setInterval(() => go(index + 1), 6000);
  }

  document.getElementById('revPrev').addEventListener('click', () => { go(index - 1); restartAuto(); });
  document.getElementById('revNext').addEventListener('click', () => { go(index + 1); restartAuto(); });
  dotsBox.addEventListener('click', (e) => {
    const dot = e.target.closest('.reviews__dot');
    if (dot) { go(Number(dot.dataset.i)); restartAuto(); }
  });

  // Пауза автопрокрутки при наведении
  const carousel = document.getElementById('reviewsCarousel');
  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', restartAuto);

  // Свайп на мобильных
  let startX = null;
  carousel.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { go(index + (dx < 0 ? 1 : -1)); restartAuto(); }
    startX = null;
  }, { passive: true });

  restartAuto();
})();

/* ---------- Форма брони: валидация + успех ---------- */
(function initBookingForm() {
  const form = document.getElementById('bookingForm');
  const nameInput = document.getElementById('bfName');
  const phoneInput = document.getElementById('bfPhone');
  const success = document.getElementById('bookingSuccess');

  // Мягкая маска телефона +7 (XXX) XXX-XX-XX
  phoneInput.addEventListener('input', () => {
    let digits = phoneInput.value.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!digits.startsWith('7')) digits = '7' + digits;
    digits = digits.slice(0, 11);
    const p = digits.slice(1);
    let out = '+7';
    if (p.length > 0) out += ' (' + p.slice(0, 3);
    if (p.length >= 3) out += ') ' + p.slice(3, 6);
    if (p.length >= 6) out += '-' + p.slice(6, 8);
    if (p.length >= 8) out += '-' + p.slice(8, 10);
    phoneInput.value = out;
  });

  function setError(input, msg) {
    const field = input.closest('.field');
    const err = field.querySelector('.field__error');
    field.classList.toggle('is-invalid', Boolean(msg));
    err.textContent = msg || '';
  }

  nameInput.addEventListener('input', () => setError(nameInput, ''));
  phoneInput.addEventListener('input', () => setError(phoneInput, ''));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;

    if (nameInput.value.trim().length < 2) {
      setError(nameInput, 'Подскажите, как к вам обращаться');
      ok = false;
    }
    const digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length !== 11) {
      setError(phoneInput, 'Введите телефон полностью: +7 (___) ___-__-__');
      ok = false;
    }
    if (!ok) return;

    form.querySelector('.booking__submit').hidden = true;
    form.querySelector('.booking__note').hidden = true;
    success.hidden = false;
    form.querySelectorAll('input, select').forEach((el) => { el.disabled = true; });
  });
})();
