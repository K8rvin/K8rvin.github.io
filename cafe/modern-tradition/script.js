/* ============================================================
   Кафе «Шинок» — весь интерактив лендинга (ванильный JS)
   ============================================================ */
'use strict';

/* ---------- Утилиты ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ============================================================
   ДАННЫЕ МЕНЮ (7 категорий)
   art — вариант процедурной «фотографии» из styles.css
   ============================================================ */
const MENU = {
  'Закуски': [
    { name: 'Сало «Полный парад»', desc: 'Домашнего посола, бородинский хлеб, зелёный лук, горчичный соус.', price: 340, weight: '180 г', art: 'salo' },
    { name: 'Селёдка «Под шубой наоборот»', desc: 'Филе атлантической селёдки, печёная свёкла, картофельный мусс.', price: 360, weight: '200 г', art: 'borscht' },
    { name: 'Форшмак с тёплым картофелем', desc: 'По рецепту одесской бабушки шефа, с гренками и зелёным маслом.', price: 390, weight: '190 г', art: 'stozhok' },
    { name: 'Печёные овощи с брынзой', desc: 'Свёкла, морковь и тыква из дровяной печи, медовая заправка.', price: 320, weight: '220 г', art: 'pot' },
    { name: 'Соленья «Бабушкин погреб»', desc: 'Малосольные огурцы, квашеная капуста, маринованные помидоры.', price: 290, weight: '300 г', art: 'salad' },
    { name: 'Холодец с хреном', desc: 'На трёх видах мяса, с домашним хреном и чесночной сметаной.', price: 330, weight: '200 г', art: 'drink' }
  ],
  'Салаты': [
    { name: 'Салат «Стожок»', desc: 'Тёплый, с копчёной курицей, шампиньонами и картофелем пай.', price: 430, weight: '260 г', art: 'stozhok' },
    { name: 'Оливье с домашней курицей', desc: 'Классика с раковыми шейками по желанию, майонез собственный.', price: 380, weight: '220 г', art: 'salad' },
    { name: 'Винегрет с квашеной капустой', desc: 'На ароматном подсолнечном масле, с маринованным луком.', price: 310, weight: '230 г', art: 'borscht' },
    { name: 'Свёкла с черносливом и орехом', desc: 'Печёная свёкла, грецкий орех, сметанный соус с чесноком.', price: 340, weight: '210 г', art: 'dessert' }
  ],
  'Горячее': [
    { name: 'Котлета по-киевски', desc: 'С топлёным маслом и зеленью внутри, картофельное пюре.', price: 520, weight: '320 г', art: 'kiev' },
    { name: 'Стейк из мраморной говядины', desc: 'Рибай на открытом огне, соус из печёного перца, розмарин.', price: 1190, weight: '300 г', art: 'steak' },
    { name: 'Утка по-домашнему с яблоками', desc: 'Томлёная утиная ножка, карамельные антоновские яблоки.', price: 640, weight: '340 г', art: 'pot' },
    { name: 'Голубцы «Мамины»', desc: 'В капустном листе, со сметаной и томатным соусом, из печи.', price: 460, weight: '330 г', art: 'borscht' },
    { name: 'Жаркое из кабана', desc: 'С лесными грибами и молодым картофелем, в казане.', price: 720, weight: '350 г', art: 'salo' },
    { name: 'Щука запечённая в сметане', desc: 'Волжская щука, лук, укроп, хрустящая корочка.', price: 690, weight: '320 г', art: 'drink' }
  ],
  'Горшочки': [
    { name: 'Борщ с пампушками', desc: 'Наваристый, на говяжьей косточке. Сметана и чеснок — в комплекте.', price: 390, weight: '450 г', art: 'borscht' },
    { name: 'Солянка мясная сборная', desc: 'Три вида мяса, копчёности, маслины, лимон и сметана.', price: 440, weight: '420 г', art: 'salo' },
    { name: 'Щи из квашеной капусты', desc: 'Томлёные в печи всю ночь, с говядиной и сметаной.', price: 370, weight: '430 г', art: 'pot' },
    { name: 'Картофель с грибами в горшочке', desc: 'Белые грибы, сливки, расплавленный сулугуни под крышкой.', price: 480, weight: '400 г', art: 'pot' },
    { name: 'Кулеш по-походному', desc: 'Пшено, копчёная грудинка, овощи — как на костре у Волги.', price: 350, weight: '420 г', art: 'stozhok' }
  ],
  'Пельмени и вареники': [
    { name: 'Пельмени «Сибирские»', desc: 'Говядина и свинина, лепим вручную каждое утро. С бульоном.', price: 420, weight: '300 г', art: 'pelmeni' },
    { name: 'Пельмени с мраморной говядиной', desc: 'Премиальная рубленая начинка, сливочное масло, перец.', price: 540, weight: '300 г', art: 'pelmeni' },
    { name: 'Вареники с вишней', desc: 'Тонкое тесто, кисло-сладкая вишня, сметана и сахарная пудра.', price: 360, weight: '280 г', art: 'dessert' },
    { name: 'Вареники с картофелем и грибами', desc: 'Жареный лук сверху, сметана, свежий укроп.', price: 340, weight: '300 г', art: 'pot' },
    { name: 'Вареники ленивые с творогом', desc: 'Нежные, с ванильным соусом и ягодным кули.', price: 330, weight: '260 г', art: 'drink' }
  ],
  'Десерты': [
    { name: 'Медовик «Бабушкин»', desc: 'Тонкие коржи, сметанный крем, карамельная крошка.', price: 290, weight: '140 г', art: 'medovik' },
    { name: 'Сырники из печи', desc: 'Из фермерского творога, со сметаной и вареньем из облепихи.', price: 340, weight: '200 г', art: 'dessert' },
    { name: 'Киевский торт', desc: 'Ореховые безе, масляный крем — по канонам 1956 года.', price: 320, weight: '130 г', art: 'stozhok' },
    { name: 'Ватрушка с малиной', desc: 'Тёплая, из дровяной печи, с шариком сливочного пломбира.', price: 280, weight: '180 г', art: 'dessert' }
  ],
  'Напитки': [
    { name: 'Морс облепиховый', desc: 'Домашний, из свежей ягоды, кружка 400 мл.', price: 180, weight: '400 мл', art: 'drink' },
    { name: 'Квас «Хлебный»', desc: 'Собственного брожения на бородинском хлебе.', price: 160, weight: '400 мл', art: 'drink' },
    { name: 'Узвар из сухофруктов', desc: 'Груша, яблоко, шиповник — тёплый или охлаждённый.', price: 170, weight: '400 мл', art: 'pot' },
    { name: 'Чай «Шинок» на травах', desc: 'Иван-чай, чабрец, мята, мёд. Чайник на двоих.', price: 290, weight: '600 мл', art: 'salo' },
    { name: 'Какао на топлёном молоке', desc: 'Как в детстве — с пенкой и зефиром.', price: 220, weight: '300 мл', art: 'dessert' }
  ]
};

/* ============================================================
   ОТЗЫВЫ
   ============================================================ */
const REVIEWS = [
  {
    stars: 5,
    text: '«Борщ — как у моей бабушки из-под Котельниково, только подача ресторанная. Пампушки уносят с собой пакетами — и мы не исключение». ',
    author: 'Наталья и Игорь', meta: 'семейный ужин, январь 2026'
  },
  {
    stars: 5,
    text: '«Отмечали юбилей мамы в банкетном зале. Менеджер продумала всё до свечи на медовике. Гости до сих пор вспоминают сало "Полный парад"».',
    author: 'Дмитрий', meta: 'банкет на 30 гостей'
  },
  {
    stars: 5,
    text: '«Захожу на бизнес-ланч дважды в неделю: 25 минут — и суп, и горячее, и узвар. Ни разу не подвели ни по времени, ни по вкусу».',
    author: 'Ольга', meta: 'деловой обед, постоянный гость'
  },
  {
    stars: 4,
    text: '«Котлета по-киевски — отдельная любовь: масло выстреливает, как положено. Вечером шумновато в пятницу, но это только доказывает: место живое».',
    author: 'Сергей', meta: 'вечер с друзьями'
  },
  {
    stars: 5,
    text: '«Заказываем доставку домой в Спартановку. Привозят горячим, в термобоксе, пампушки отдельно в пергаменте. Минус 20% на самовывозе — честно работает».',
    author: 'Анна', meta: 'доставка, декабрь 2025'
  }
];

/* ============================================================
   ШАПКА: фон при скролле + бургер
   ============================================================ */
const header = $('#header');
const burger = $('#burger');
const nav = $('#nav');

const onScrollHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScrollHeader, { passive: true });
onScrollHeader();

burger.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  burger.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});
$$('.nav__link').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('is-open');
  burger.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
}));

/* ============================================================
   БЕГУЩАЯ СТРОКА — дублируем ленту для бесшовного цикла
   ============================================================ */
const marqueeTrack = $('#marqueeTrack');
marqueeTrack.innerHTML += marqueeTrack.innerHTML;

/* ============================================================
   ИНТЕРАКТИВНОЕ МЕНЮ: табы + сетка + корзина
   ============================================================ */
const tabsWrap = $('#menuTabs');
const grid = $('#menuGrid');
const categories = Object.keys(MENU);
let cartTotal = 0;

categories.forEach((cat, i) => {
  const btn = document.createElement('button');
  btn.className = 'menu-tab' + (i === 0 ? ' is-active' : '');
  btn.textContent = cat;
  btn.setAttribute('role', 'tab');
  btn.setAttribute('aria-selected', String(i === 0));
  btn.addEventListener('click', () => switchCategory(cat, btn));
  tabsWrap.appendChild(btn);
});

function renderMenu(cat) {
  grid.innerHTML = '';
  MENU[cat].forEach((dish, i) => {
    const card = document.createElement('article');
    card.className = 'menu-card';
    card.style.animationDelay = `${i * 60}ms`;
    card.innerHTML = `
      <div class="menu-card__photo dish-art dish-art--${dish.art}"></div>
      <div class="menu-card__body">
        <h3>${dish.name}</h3>
        <p>${dish.desc}</p>
        <div class="menu-card__foot">
          <span class="price menu-card__price">${dish.price.toLocaleString('ru-RU')} ₽<small>${dish.weight}</small></span>
          <button class="add-cart" type="button">В корзину</button>
        </div>
      </div>`;
    const addBtn = $('.add-cart', card);
    addBtn.addEventListener('click', () => {
      cartTotal++;
      updateCart(dish.name);
      addBtn.classList.add('is-added');
      addBtn.textContent = 'Добавлено ✓';
      setTimeout(() => {
        addBtn.classList.remove('is-added');
        addBtn.textContent = 'В корзину';
      }, 1200);
    });
    grid.appendChild(card);
  });
}

function switchCategory(cat, activeBtn) {
  $$('.menu-tab', tabsWrap).forEach(b => {
    b.classList.toggle('is-active', b === activeBtn);
    b.setAttribute('aria-selected', String(b === activeBtn));
  });
  grid.classList.add('is-switching');
  setTimeout(() => {
    renderMenu(cat);
    grid.classList.remove('is-switching');
  }, 280);
}

renderMenu(categories[0]);

/* ---------- Корзина: счётчик и тост ---------- */
const cartCount = $('#cartCount');
const cartBtn = $('#cartBtn');
const toast = $('#toast');
let toastTimer = null;

function updateCart(dishName) {
  cartCount.textContent = String(cartTotal);
  cartCount.classList.remove('bump');
  void cartCount.offsetWidth; // перезапуск анимации
  cartCount.classList.add('bump');
  showToast(`«${dishName}» — в корзине. Всего позиций: ${cartTotal}`);
}

cartBtn.addEventListener('click', () => {
  showToast(cartTotal === 0
    ? 'Корзина пока пуста — загляните в меню!'
    : `В корзине ${cartTotal} поз. Позвоните +7 (962) 760-15-17 — оформим доставку.`);
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

/* ============================================================
   ПОД ВАШ СЛУЧАЙ — раскрывающийся блок
   ============================================================ */
const OCCASIONS = {
  family: {
    title: 'Семейный ужин — всё для детей и родителей',
    text: 'В «Шинке» дети — желанные гости, а не помеха. Пока взрослые неспешно ужинают, малышам есть чем заняться.',
    list: [
      'Детское меню: котлетки из индейки, пельмешки-мини, морс — от 190 ₽',
      'Стульчики, раскраски и набор пластилина в каждом зале',
      'По воскресеньям с 14:00 — мастер-класс «Лепим вареники» (бесплатно)'
    ]
  },
  business: {
    title: 'Деловой обед — ровно 25 минут или кофе за наш счёт',
    text: 'С 12:00 до 16:00 в будни собираем комплексные сеты: суп, горячее, салат и напиток. Тихий зал с розетками и Wi-Fi.',
    list: [
      'Сет «Классика»: щи + голубцы + узвар — 490 ₽',
      'Сет «По-европейски»: крем-суп + стейк из курицы + морс — 590 ₽',
      'Счёт и чеки — сразу, без ожидания'
    ]
  },
  party: {
    title: 'Корпоратив или торжество — банкетный зал до 60 гостей',
    text: 'Отдельный зал с печью, своя звуковая система и личный менеджер банкета. Предзаказ меню — от 1 800 ₽ с гостя.',
    list: [
      'Три банкетных меню на выбор, дегустация перед праздником',
      'Музыкальное сопровождение и ведущий — поможем с подбором',
      'Торт от нашей пекарни — в подарок при банкете от 20 гостей'
    ]
  },
  friends: {
    title: 'Вечер с друзьями — пивная карта и закуски к пенному',
    text: 'Разливной квас и крафтовое пиво волгоградских пивоварен, к ним — гренки с чесноком, сало и крылья из печи.',
    list: [
      'Пивной сет на компанию: 4 закуски + 2 л пива — 1 490 ₽',
      'Настольные игры: «Уно», «Дженга», шашки — бесплатно',
      'По четвергам — живая музыка: гитара и песни у печи'
    ]
  }
};

const occDetail = $('#occDetail');
const occDetailInner = $('#occDetailInner');
let activeTile = null;

$$('.occ-tile').forEach(tile => {
  tile.addEventListener('click', () => {
    const key = tile.dataset.occ;

    // повторный клик — свернуть
    if (tile === activeTile) {
      occDetail.hidden = true;
      tile.classList.remove('is-active');
      tile.setAttribute('aria-expanded', 'false');
      activeTile = null;
      return;
    }

    if (activeTile) {
      activeTile.classList.remove('is-active');
      activeTile.setAttribute('aria-expanded', 'false');
    }
    tile.classList.add('is-active');
    tile.setAttribute('aria-expanded', 'true');
    activeTile = tile;

    const data = OCCASIONS[key];
    occDetailInner.innerHTML = `
      <div>
        <h3>${data.title}</h3>
        <p>${data.text}</p>
        <ul>${data.list.map(item => `<li>${item}</li>`).join('')}</ul>
      </div>
      <a href="#booking" class="btn btn--light">Забронировать</a>`;
    occDetail.hidden = false;
  });
});

/* ============================================================
   ТАЙМЕР АКЦИИ «Самовывоз −20%» — до конца текущих суток
   ============================================================ */
const tHours = $('#tHours');
const tMin = $('#tMin');
const tSec = $('#tSec');

function tickPromoTimer() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const diff = Math.max(0, end - now);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  tHours.textContent = String(h).padStart(2, '0');
  tMin.textContent = String(m).padStart(2, '0');
  tSec.textContent = String(s).padStart(2, '0');
}
tickPromoTimer();
setInterval(tickPromoTimer, 1000);

/* ============================================================
   КАРУСЕЛЬ ОТЗЫВОВ
   ============================================================ */
const revTrack = $('#revTrack');
const revDots = $('#revDots');
let revIndex = 0;
let revAuto = null;

REVIEWS.forEach((rev, i) => {
  const slide = document.createElement('div');
  slide.className = 'review';
  slide.innerHTML = `
    <div class="review__stars">${'★'.repeat(rev.stars)}${'☆'.repeat(5 - rev.stars)}</div>
    <p class="review__text">${rev.text}</p>
    <p class="review__author"><strong>${rev.author}</strong>${rev.meta}</p>`;
  revTrack.appendChild(slide);

  const dot = document.createElement('button');
  dot.setAttribute('role', 'tab');
  dot.setAttribute('aria-label', `Отзыв ${i + 1}`);
  dot.addEventListener('click', () => goToReview(i));
  revDots.appendChild(dot);
});

function goToReview(i) {
  revIndex = (i + REVIEWS.length) % REVIEWS.length;
  revTrack.style.transform = `translateX(-${revIndex * 100}%)`;
  $$('button', revDots).forEach((d, j) => d.classList.toggle('is-active', j === revIndex));
  restartAuto();
}

function restartAuto() {
  clearInterval(revAuto);
  revAuto = setInterval(() => goToReview(revIndex + 1), 7000);
}

$('#revPrev').addEventListener('click', () => goToReview(revIndex - 1));
$('#revNext').addEventListener('click', () => goToReview(revIndex + 1));
goToReview(0);

/* ============================================================
   ФОРМА БРОНИРОВАНИЯ — валидация + успех
   ============================================================ */
const form = $('#bookingForm');
const formSuccess = $('#formSuccess');

// дата — не раньше сегодняшнего дня
const dateInput = $('#bDate');
dateInput.min = new Date().toISOString().split('T')[0];

function setError(input, message) {
  const slot = $(`.form-error[data-for="${input.id}"]`);
  if (slot) slot.textContent = message;
  input.classList.toggle('is-invalid', Boolean(message));
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  const name = $('#bName');
  if (name.value.trim().length < 2) {
    setError(name, 'Представьтесь, пожалуйста — хотя бы два символа.');
    valid = false;
  } else setError(name, '');

  const phone = $('#bPhone');
  const digits = phone.value.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 12) {
    setError(phone, 'Введите телефон полностью, например +7 (917) 123-45-67.');
    valid = false;
  } else setError(phone, '');

  if (!dateInput.value) {
    setError(dateInput, 'Выберите дату визита.');
    valid = false;
  } else setError(dateInput, '');

  const time = $('#bTime');
  if (!time.value) {
    setError(time, 'Выберите время.');
    valid = false;
  } else setError(time, '');

  const guests = $('#bGuests');
  if (!guests.value) {
    setError(guests, 'Сколько вас будет?');
    valid = false;
  } else setError(guests, '');

  if (!valid) return;

  formSuccess.hidden = false;
  form.querySelectorAll('input, select, button').forEach(el => { el.disabled = true; });
  showToast('Заявка на бронь отправлена!');
});

/* ============================================================
   ПЛАВАЮЩАЯ КНОПКА «Забронировать стол»
   ============================================================ */
const fab = $('#fab');
const heroSection = $('.hero');

const onScrollFab = () => {
  const past = window.scrollY > heroSection.offsetHeight * 0.6;
  fab.classList.toggle('is-visible', past);
};
window.addEventListener('scroll', onScrollFab, { passive: true });
onScrollFab();

/* ============================================================
   ПОЯВЛЕНИЕ СЕКЦИЙ ПРИ СКРОЛЛЕ (IntersectionObserver)
   ============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

$$('.reveal').forEach(el => revealObserver.observe(el));

/* ============================================================
   ПАСХАЛКА: пять кликов по логотипу — промокод
   ============================================================ */
const logo = $('#logo');
let eggClicks = 0;
let eggTimer = null;

logo.addEventListener('click', (e) => {
  eggClicks++;
  clearTimeout(eggTimer);
  eggTimer = setTimeout(() => { eggClicks = 0; }, 1500);

  if (eggClicks >= 5) {
    e.preventDefault();
    eggClicks = 0;
    showToast('Пасхалка найдена! Промокод БОРЩ10 — скидка 10% по брони. Тсс…');
  }
});
