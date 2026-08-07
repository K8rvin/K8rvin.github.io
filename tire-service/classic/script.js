// ===== ШиноМастер — интерактивность лендинга =====

document.addEventListener('DOMContentLoaded', () => {

  /* --- Текущий год в футере --- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --- Тень шапки при скролле --- */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* --- Мобильное меню --- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });

  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* --- Плавное появление блоков при скролле --- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* --- Переключение цен по диаметру колёс --- */
  const tabs = document.querySelectorAll('.price-tab');
  const pricedEls = document.querySelectorAll('[data-prices]');

  const formatPrice = value =>
    Number(value).toLocaleString('ru-RU') + ' ₽';

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });
      const index = Array.from(tabs).indexOf(tab);
      pricedEls.forEach(el => {
        const prices = el.dataset.prices.split('|');
        if (prices[index]) el.textContent = formatPrice(prices[index]);
      });
    });
  });

  /* --- Маска телефона --- */
  const phoneInput = document.querySelector('input[name="phone"]');

  phoneInput.addEventListener('input', () => {
    let digits = phoneInput.value.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!digits.startsWith('7')) digits = '7' + digits;
    digits = digits.slice(0, 11);

    let result = '+7';
    if (digits.length > 1) result += ' (' + digits.slice(1, 4);
    if (digits.length >= 4) result += ') ' + digits.slice(4, 7);
    if (digits.length >= 7) result += '-' + digits.slice(7, 9);
    if (digits.length >= 9) result += '-' + digits.slice(9, 11);
    phoneInput.value = result;
  });

  phoneInput.addEventListener('focus', () => {
    if (!phoneInput.value) phoneInput.value = '+7 (';
  });

  phoneInput.addEventListener('blur', () => {
    if (phoneInput.value === '+7 (' || phoneInput.value === '+7') phoneInput.value = '';
  });

  /* --- Дата записи: не раньше сегодняшнего дня --- */
  const dateInput = document.querySelector('input[name="date"]');
  dateInput.min = new Date().toISOString().split('T')[0];

  /* --- Отправка формы (без бэкенда: валидация + подтверждение) --- */
  const form = document.getElementById('bookingForm');
  const success = document.getElementById('formSuccess');

  const markValidity = field => {
    field.classList.toggle('is-invalid', !field.checkValidity());
  };

  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => markValidity(field));
  });

  form.addEventListener('submit', event => {
    event.preventDefault();

    // Телефон: проверяем, что введены все 11 цифр
    const phoneDigits = phoneInput.value.replace(/\D/g, '');
    const phoneValid = phoneDigits.length === 11;
    phoneInput.classList.toggle('is-invalid', !phoneValid);

    let formValid = phoneValid;
    form.querySelectorAll('[required]').forEach(field => {
      if (field === phoneInput) return;
      markValidity(field);
      if (!field.checkValidity()) formValid = false;
    });

    if (!formValid) {
      form.querySelector('.is-invalid')?.focus();
      return;
    }

    // Бэкенда нет — сохраняем заявку локально и показываем подтверждение
    const request = {
      name: form.name.value.trim(),
      phone: phoneInput.value,
      service: form.service.value,
      date: form.date.value,
      comment: form.comment.value.trim(),
      createdAt: new Date().toISOString(),
    };
    const saved = JSON.parse(localStorage.getItem('bookingRequests') || '[]');
    saved.push(request);
    localStorage.setItem('bookingRequests', JSON.stringify(saved));

    form.reset();
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => { success.hidden = true; }, 8000);
  });
});
