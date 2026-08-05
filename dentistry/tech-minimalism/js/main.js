/* ============================================================
   Прозрачная Стоматология — интерактив
   ============================================================ */
(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const fmt = (n) => n.toLocaleString('ru-RU') + ' ₽';

  /* ---------- Тёмная тема ---------- */
  const themeToggle = $('#themeToggle');
  const savedTheme = (function () {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  })();
  if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      try { localStorage.setItem('theme', 'light'); } catch (e) {}
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      try { localStorage.setItem('theme', 'dark'); } catch (e) {}
    }
  });

  /* ---------- Прогресс-бар скролла ---------- */
  const progressBar = $('#scrollProgress');
  const header = $('#header');
  const toTop = $('#toTop');

  function onScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = pct + '%';
    header.classList.toggle('is-scrolled', window.scrollY > 10);
    toTop.classList.toggle('is-visible', window.scrollY > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Бургер-меню ---------- */
  const burger = $('#burger');
  const nav = $('#nav');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- Появление при скролле + счётчики + линия шагов ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach((el) => revealObserver.observe(el));

  const stepsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        stepsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  const stepsEl = $('.steps');
  if (stepsEl) stepsObserver.observe(stepsEl);

  /* Анимированные счётчики */
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      counterObserver.unobserve(el);
      const target = parseInt(el.dataset.counter, 10);
      const duration = 1600;
      const start = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('ru-RU');
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    });
  }, { threshold: 0.6 });
  $$('[data-counter]').forEach((el) => counterObserver.observe(el));

  /* ---------- Параллакс hero ---------- */
  const parallaxEls = $$('[data-parallax]');
  if (parallaxEls.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', () => {
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.08;
        const rect = el.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          el.style.transform = 'translateY(' + (window.scrollY * speed * -1) + 'px)';
        }
      });
    }, { passive: true });
  }

  /* ---------- Услуги: раскрытие карточек ---------- */
  $$('[data-service]').forEach((card) => {
    const head = $('.service-card__head', card);
    const body = $('.service-card__body', card);
    head.addEventListener('click', () => {
      const isOpen = card.classList.toggle('is-open');
      head.setAttribute('aria-expanded', String(isOpen));
      body.style.maxHeight = isOpen ? body.scrollHeight + 'px' : '0px';
    });
  });

  /* ---------- Калькулятор ---------- */
  const calcService = $('#calcService');
  const calcQty = $('#calcQty');
  const calcTotal = $('#calcTotal');
  const calcNote = $('#calcNote');

  function updateCalc() {
    const price = parseInt(calcService.value, 10) || 0;
    let qty = parseInt(calcQty.value, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > 32) qty = 32;
    calcQty.value = qty;
    const label = calcService.selectedOptions[0].dataset.label;
    calcTotal.classList.add('is-updating');
    setTimeout(() => {
      calcTotal.textContent = fmt(price * qty);
      calcNote.textContent = label + ', ' + qty + ' шт.';
      calcTotal.classList.remove('is-updating');
    }, 150);
  }
  calcService.addEventListener('change', updateCalc);
  calcQty.addEventListener('input', updateCalc);
  $('#calcMinus').addEventListener('click', () => { calcQty.value = Math.max(1, (parseInt(calcQty.value, 10) || 1) - 1); updateCalc(); });
  $('#calcPlus').addEventListener('click', () => { calcQty.value = Math.min(32, (parseInt(calcQty.value, 10) || 1) + 1); updateCalc(); });
  updateCalc();

  /* ---------- Отзывы: карусель ---------- */
  const track = $('#reviewsTrack');
  const cards = $$('.review-card', track);
  const dotsWrap = $('#reviewDots');
  let reviewIndex = 0;
  let reviewTimer = null;

  function perView() { return window.innerWidth <= 860 ? 1 : 2; }
  function maxIndex() { return Math.max(0, cards.length - perView()); }

  function renderDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i <= maxIndex(); i++) {
      const b = document.createElement('button');
      b.setAttribute('aria-label', 'Отзывы, страница ' + (i + 1));
      b.addEventListener('click', () => { goTo(i); restartAuto(); });
      dotsWrap.appendChild(b);
    }
  }
  function goTo(i) {
    reviewIndex = Math.max(0, Math.min(i, maxIndex()));
    const gap = 24;
    const w = cards[0].getBoundingClientRect().width + gap;
    track.style.transform = 'translateX(' + (-reviewIndex * w) + 'px)';
    $$('button', dotsWrap).forEach((d, di) => d.classList.toggle('is-active', di === reviewIndex));
  }
  function restartAuto() {
    clearInterval(reviewTimer);
    reviewTimer = setInterval(() => goTo(reviewIndex >= maxIndex() ? 0 : reviewIndex + 1), 6000);
  }
  $('#reviewPrev').addEventListener('click', () => { goTo(reviewIndex - 1 < 0 ? maxIndex() : reviewIndex - 1); restartAuto(); });
  $('#reviewNext').addEventListener('click', () => { goTo(reviewIndex + 1 > maxIndex() ? 0 : reviewIndex + 1); restartAuto(); });
  window.addEventListener('resize', () => { renderDots(); goTo(reviewIndex); });

  /* Звёзды рейтинга */
  $$('.review-card__stars').forEach((wrap) => {
    const n = parseInt(wrap.dataset.stars, 10) || 5;
    let html = '';
    for (let i = 1; i <= 5; i++) {
      const fill = i <= n ? '#FFB300' : 'var(--gray-400)';
      html += '<svg viewBox="0 0 24 24"><path fill="' + fill + '" d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>';
    }
    wrap.innerHTML = html;
  });

  renderDots();
  goTo(0);
  restartAuto();

  /* ---------- Лайтбокс галереи ---------- */
  const lightbox = $('#lightbox');
  const lbMedia = $('#lightboxMedia');
  const lbTitle = $('#lightboxTitle');
  const lbDesc = $('#lightboxDesc');

  function openLightbox(item) {
    const svg = $('.ba__img', item);
    lbMedia.innerHTML = '';
    lbMedia.appendChild(svg.cloneNode(true));
    lbTitle.textContent = item.dataset.title || '';
    lbDesc.textContent = item.dataset.desc || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }
  $$('[data-lightbox]').forEach((item) => {
    item.addEventListener('click', () => openLightbox(item));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(item); }
    });
  });
  $$('[data-close-lightbox]').forEach((el) => el.addEventListener('click', closeLightbox));

  /* ---------- Модальные окна ---------- */
  const modalBooking = $('#modalBooking');
  const modalPolicy = $('#modalPolicy');
  const modalDoctorField = $('#modalDoctorField');
  const modalDoctorInput = $('#mDoctor');
  let lastFocus = null;

  function openModal(modal) {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    const input = $('input', modal);
    if (input) input.focus();
  }
  function closeModals() {
    [modalBooking, modalPolicy].forEach((m) => { m.hidden = true; });
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  $$('[data-open-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const doctor = btn.dataset.doctor;
      if (doctor) {
        modalDoctorField.hidden = false;
        modalDoctorInput.value = doctor;
      } else {
        modalDoctorField.hidden = true;
        modalDoctorInput.value = '';
      }
      openModal(modalBooking);
    });
  });
  $$('[data-close-modal]').forEach((el) => el.addEventListener('click', closeModals));
  ['policyLink', 'policyLinkFooter'].forEach((id) => {
    const link = document.getElementById(id);
    if (link) link.addEventListener('click', (e) => { e.preventDefault(); openModal(modalPolicy); });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModals(); closeLightbox(); }
  });

  /* ---------- Валидация и отправка форм ---------- */
  function validatePhone(v) {
    const digits = v.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 12;
  }
  function bindForm(form, successEl) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      $$('.form__field', form).forEach((field) => {
        const input = $('input, select', field);
        if (!input || input.readOnly || !input.required) { field.classList.remove('is-invalid'); return; }
        let ok = true;
        if (input.type === 'tel') ok = validatePhone(input.value);
        else if (input.tagName === 'SELECT') ok = input.value !== '';
        else ok = input.value.trim().length >= (parseInt(input.getAttribute('minlength'), 10) || 1);
        field.classList.toggle('is-invalid', !ok);
        if (!ok) valid = false;
      });
      if (!valid) return;
      // Имитация отправки
      const btn = $('button[type="submit"]', form);
      btn.disabled = true;
      btn.textContent = 'Отправляем…';
      setTimeout(() => {
        form.reset();
        btn.disabled = false;
        btn.textContent = btn.dataset.label || 'Записаться';
        successEl.hidden = false;
        setTimeout(() => { successEl.hidden = true; closeModals(); }, 4000);
      }, 900);
    });
    form.addEventListener('input', (e) => {
      const field = e.target.closest('.form__field');
      if (field) field.classList.remove('is-invalid');
    });
  }
  bindForm($('#bookingForm'), $('#formSuccess'));
  bindForm($('#modalForm'), $('#modalSuccess'));

  /* ---------- Видео-плейсхолдер ---------- */
  const video = $('#videoPlaceholder');
  const videoNote = $('#videoNote');
  function playVideoStub() {
    videoNote.hidden = false;
    const play = $('.video-placeholder__play', video);
    play.style.display = 'none';
    const label = $('.video-placeholder__label', video);
    if (label) label.textContent = 'Видео скоро появится';
  }
  video.addEventListener('click', playVideoStub);
  video.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playVideoStub(); }
  });

  /* ---------- Чат-бот ---------- */
  const chatFab = $('#chatFab');
  const chatPanel = $('#chatPanel');
  const chatMessages = $('#chatMessages');
  const chatForm = $('#chatForm');
  const chatText = $('#chatText');
  const chatQuick = $('#chatQuick');
  let chatStarted = false;

  const botAnswers = [
    { keys: ['цен', 'стоим', 'сколько', 'прайс', 'руб'], text: 'Профгигиена — от 7 300 ₽, лечение кариеса — от 5 800 ₽, протезирование — от 15 000 ₽. Смету фиксируем в договоре до начала лечения. Подробности — в разделе «Услуги и цены».' },
    { keys: ['режим', 'часы', 'работа', 'когда', 'открыт'], text: 'Мы работаем ежедневно: Пн–Пт с 9:00 до 20:00, Сб–Вс с 10:00 до 18:00.' },
    { keys: ['адрес', 'где', 'находитесь', 'добраться', 'еременко'], text: 'Волгоград, ул. Еременко, 25. Остановка «Улица Еременко» — 2 минуты пешком. Карта — в разделе «Как добраться».' },
    { keys: ['запис', 'приём', 'прием', 'время'], text: 'Оставьте заявку в форме записи на сайте или позвоните +7 (8442) 00-00-00 — администратор подберёт удобное окно в течение 15 минут.' },
    { keys: ['гарант', 'лиценз'], text: 'Лицензия ЛО-34-01-004321. Гарантия на пломбы — до 3 лет, на коронки — до 10 лет. Всё прописано в договоре.' },
    { keys: ['бол', 'страшн', 'анестез'], text: 'Лечим без боли: компьютерная анестезия и работа под микроскопом. Большинство пациентов отмечают, что не почувствовали даже укола.' },
    { keys: ['врач', 'доктор', 'специалист'], text: 'В клинике работают врачи со стажем 14–30 лет: терапевт, ортопед и хирург-имплантолог. Карточки врачей — в разделе «Команда».' },
    { keys: ['привет', 'здравств', 'добрый'], text: 'Здравствуйте! Чем могу помочь? Спросите о ценах, записи, адресе или режиме работы.' },
  ];
  const botFallback = 'Хороший вопрос! Чтобы дать точный ответ, лучше поговорить с администратором: +7 (8442) 00-00-00. Могу подсказать цены, адрес, режим работы или помочь записаться.';

  function addMsg(text, who) {
    const div = document.createElement('div');
    div.className = 'chat__msg chat__msg--' + who;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  function botReply(userText) {
    const typing = document.createElement('div');
    typing.className = 'chat__msg chat__msg--bot chat__msg--typing';
    typing.innerHTML = '<i></i><i></i><i></i>';
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    setTimeout(() => {
      typing.remove();
      const q = userText.toLowerCase();
      const hit = botAnswers.find((a) => a.keys.some((k) => q.includes(k)));
      addMsg(hit ? hit.text : botFallback, 'bot');
    }, 700);
  }
  function startChat() {
    if (chatStarted) return;
    chatStarted = true;
    setTimeout(() => addMsg('Здравствуйте! Я ассистент клиники. Задайте вопрос или выберите тему ниже.', 'bot'), 300);
  }
  chatFab.addEventListener('click', () => {
    const open = chatPanel.hidden;
    chatPanel.hidden = !open;
    chatFab.classList.toggle('is-open', open);
    chatFab.setAttribute('aria-expanded', String(open));
    if (open) { startChat(); chatText.focus(); }
  });
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatText.value.trim();
    if (!text) return;
    addMsg(text, 'user');
    chatText.value = '';
    botReply(text);
  });
  chatQuick.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-q]');
    if (!btn) return;
    const map = { prices: 'Сколько стоят услуги?', hours: 'Какой у вас режим работы?', address: 'Где вы находитесь?', booking: 'Как записаться на приём?' };
    const q = map[btn.dataset.q] || btn.textContent;
    addMsg(q, 'user');
    botReply(q);
  });
})();
