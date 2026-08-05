/* ============================================================
   КАТАЛОГ РАБОТ И КОНТАКТЫ
   Новая тематика или работа добавляется одной записью ниже —
   сайт пересоберёт витрину автоматически.
   ============================================================ */

// ЗАМЕНИТЕ на свои контакты
const CONTACTS = {
  telegram: "https://t.me/your_nickname",
  telegramLabel: "@your_nickname",
  email: "you@example.com",
  phone: "+7 (900) 000-00-00",
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
    path: "tire-service/",
  },
];
