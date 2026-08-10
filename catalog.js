/* ============================================================
   КАТАЛОГ РАБОТ И КОНТАКТЫ
   Новая тематика или работа добавляется одной записью ниже —
   сайт пересоберёт витрину автоматически.
   ============================================================ */

const CONTACTS = {
  telegram: "https://t.me/AndyMokhov",
  telegramLabel: "@AndyMokhov",
  email: "k8rvin@yandex.ru",
  phone: "+7 (909) 394-00-58",
};

// path — путь к папке лендинга относительно корня сайта
const WORKS = [
  // --- Стоматология ---
  {
    category: "Стоматология",
    title: "Премиум комфорт",
    style: "Элегантный и статусный",
    path: "dentistry/premium-comfort/",
  },
  {
    category: "Стоматология",
    title: "Прозрачность и технологии",
    style: "Современный минимализм",
    path: "dentistry/tech-minimalism/",
  },
  {
    category: "Стоматология",
    title: "Семейная забота",
    style: "Тёплый и доверительный",
    path: "dentistry/family-care/",
  },
  {
    category: "Стоматология",
    title: "Современный",
    style: "Чистый универсальный",
    path: "dentistry/modern/",
  },

  // --- Парикмахерская ---
  {
    category: "Парикмахерская",
    title: "Минималистичный люкс",
    style: "Сдержанная роскошь",
    path: "barbershop/minimal-luxe/",
  },
  {
    category: "Парикмахерская",
    title: "Тёмный премиум",
    style: "3D и стекло",
    path: "barbershop/dark-premium-3d/",
  },
  {
    category: "Парикмахерская",
    title: "Яркий и дерзкий",
    style: "Смелые акценты",
    path: "barbershop/bright-bold/",
  },

  // --- Шиномонтаж ---
  {
    category: "Шиномонтаж",
    title: "Шиномонтажка",
    style: "Быстрый и понятный",
    path: "tire-service/classic/",
  },
  {
    category: "Шиномонтаж",
    title: "Пит-стоп",
    style: "Гоночная энергия для сети шиномонтажей",
    path: "tire-service/pit-stop/",
  },
  {
    category: "Шиномонтаж",
    title: "Служба спасения на дороге",
    style: "Мобильный выездной шиномонтаж 24/7",
    path: "tire-service/roadside-rescue/",
  },
  {
    category: "Шиномонтаж",
    title: "Шинный отель",
    style: "Премиум-хранение и сезонный сервис",
    path: "tire-service/tire-hotel/",
  },

  // --- Кафе ---
  {
    category: "Кафе",
    title: "Вечерний гастро-бар",
    style: "Тёмный, атмосферный, взрослый",
    path: "cafe/gastro-bar/",
  },
  {
    category: "Кафе",
    title: "Светлое семейное кафе",
    style: "Дневной, дружелюбный, для обедов и семей",
    path: "cafe/family-cafe/",
  },
  {
    category: "Кафе",
    title: "Современная слобода",
    style: "Тёплая традиция в новом прочтении",
    path: "cafe/modern-tradition/",
  },

  // --- Кухни на заказ ---
  {
    category: "Кухни на заказ",
    title: "Ателье кухонь",
    style: "Премиум, тёмный, как журнал",
    path: "kitchens/atelier/",
  },
  {
    category: "Кухни на заказ",
    title: "Конструктор мечты",
    style: "Интерактивный, технологичный, светлый",
    path: "kitchens/constructor/",
  },
  {
    category: "Кухни на заказ",
    title: "Семейный очаг",
    style: "Тёплый, эмоциональный, скандинавский",
    path: "kitchens/family-hearth/",
  },

  // --- Кондитерская ---
  {
    category: "Кондитерская",
    title: "Бенто-Поп",
    style: "Яркий, дерзкий, молодёжный",
    path: "confectionery/bento-pop/",
  },
  {
    category: "Кондитерская",
    title: "Как дома",
    style: "Натуральность, тепло, крафт",
    path: "confectionery/like-home/",
  },
  {
    category: "Кондитерская",
    title: "Патиссерия",
    style: "Французская витрина, премиум-элегантность",
    path: "confectionery/patisserie/",
  },

  // --- Автошкола ---
  {
    category: "Автошкола",
    title: "Drive Academy",
    style: "Тёмный неоновый премиум, ночной город",
    path: "driving-school/drive-academy/",
  },
  {
    category: "Автошкола",
    title: "Дорожный пропуск",
    style: "Светлый, технологичный, прозрачные цены",
    path: "driving-school/road-pass/",
  },
  {
    category: "Автошкола",
    title: "LVL UP школа",
    style: "Яркий, дерзкий, геймификация",
    path: "driving-school/level-up/",
  },

  // --- Цветы ---
  {
    category: "Цветы",
    title: "Цветочное ателье",
    style: "Свадебная и премиум-флористика",
    path: "flowers/atelier/",
  },
  {
    category: "Цветы",
    title: "Букет за 60 минут",
    style: "Яркая доставка подарков",
    path: "flowers/bouquet-60/",
  },
  {
    category: "Цветы",
    title: "Подписка на цветы",
    style: "Городские джунгли, дом и бизнес",
    path: "flowers/subscription/",
  },
  {
    category: "Цветы",
    title: "Море цветов",
    style: "Элегантный, простой — локальный магазин",
    path: "flowers/more-flowers/",
  },

  // --- Ремонт квартир ---
  {
    category: "Ремонт квартир",
    title: "Архитектурный код",
    style: "Премиум, инженерная графика",
    path: "renovation/arch-code/",
  },
  {
    category: "Ремонт квартир",
    title: "Свет и прозрачность",
    style: "Светлый, доверительный, как у застройщика",
    path: "renovation/light-clarity/",
  },
  {
    category: "Ремонт квартир",
    title: "Журнальный",
    style: "Редакционный, истории проектов",
    path: "renovation/magazine/",
  },

  // --- Ветклиника ---
  {
    category: "Ветклиника",
    title: "VET·OS",
    style: "Цифровая клиника, hi-tech",
    path: "vet-clinic/vet-os/",
  },
  {
    category: "Ветклиника",
    title: "Лапы и Хвосты",
    style: "Яркий, игривый, эмоциональный",
    path: "vet-clinic/paws-play/",
  },
  {
    category: "Ветклиника",
    title: "Спокойные лапы",
    style: "Скандинавский минимализм, без стресса",
    path: "vet-clinic/calm-paws/",
  },

  // --- Клининг ---
  {
    category: "Клининг",
    title: "PureLab",
    style: "Лаборатория чистоты, технологичный",
    path: "cleaning/purelab/",
  },
  {
    category: "Клининг",
    title: "Клининг-консьерж",
    style: "Тёмный премиум, отельный сервис",
    path: "cleaning/concierge/",
  },
  {
    category: "Клининг",
    title: "Солнечный день",
    style: "Яркий, семейный, быстрый заказ",
    path: "cleaning/sunny-day/",
  },

  // --- Натяжные потолки ---
  {
    category: "Натяжные потолки",
    title: "СкайДизайн",
    style: "Светлый, технологичный, конфигуратор",
    path: "stretch-ceilings/sky-design/",
  },
  {
    category: "Натяжные потолки",
    title: "СВЕТАРХ",
    style: "Тёмный дизайнерский, архитектура света",
    path: "stretch-ceilings/light-lines/",
  },
  {
    category: "Натяжные потолки",
    title: "Потолок за один день",
    style: "Яркий, конверсионный, честная цена",
    path: "stretch-ceilings/one-day/",
  },
];
