/* ===== Лапы и Хвосты — интерактив ===== */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Бургер-меню ---------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });
    nav.querySelectorAll('.nav__link').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Квиз «Кто ваш пациент?» ---------- */
  const quizData = {
    cat: {
      title: 'Кот — аристократ клиники',
      desc: 'Кошек мы принимаем в отдельной зоне без собачьего лая. Сначала кот осматривает кабинет и врача, и только потом врач осматривает кота. Никто не тянет из переноски — ждём, пока выйдет сам.',
      note: 'псс: у нас есть лакомства, ради которых прощают даже термометр',
      services: ['Вакцинация', 'Стоматология', 'УЗИ', 'Анализы'],
    },
    dog: {
      title: 'Пёс — главный по вилянию',
      desc: 'Собаки у нас получают порцию обнимашек ещё в холле. Врач сначала играет и угощает, а осмотр превращается в игру «а что это у нас тут?». После прививки — обязательная медаль в виде лакомства.',
      note: 'хвостом по кабинету — наш главный показатель качества',
      services: ['Терапия', 'Вакцинация', 'Груминг', 'Чипирование'],
    },
    parrot: {
      title: 'Попугай — пернатый интеллектуал',
      desc: 'С птицами работает доктор Тимур — он знает, что «хороший мальчик» бывает не всегда хорошим. Осматриваем бережно, без лишнего стресса: клетку можно принести прямо в кабинет, чтобы всё пахло домом.',
      note: 'ваш попугай может рассказать доктору, где болит. правда.',
      services: ['Орнитолог', 'Анализы', 'Подрезка клюва', 'Консультация по корму'],
    },
    ferret: {
      title: 'Хорёк — маленький хулиган',
      desc: 'Хорьки — наши любимые сорванцы: любопытные, шустрые и вечно что-то стянувшие. Осматриваем быстро, пока пациент не убежал исследовать кабинет. Принимаем и хорьков, и других экзотов.',
      note: 'резинки и носки из чужих желудков достаём аккуратно',
      services: ['Терапия экзотов', 'Вакцинация', 'Хирургия', 'Анализы'],
    },
    other: {
      title: 'Кролик, хомяк, черепаха или дракон?',
      desc: 'Мы любим всех: грызунов, рептилий, ежей и даже пауков (наверное). Позвоните — подскажем, кто из врачей лучше всего понимает именно вашего питомца, и подготовим кабинет заранее.',
      note: 'если он вас любит — значит, и мы поладим',
      services: ['Первичный приём', 'Консультация', 'Анализы', 'Выезд на дом'],
    },
  };

  const quizPets = document.getElementById('quizPets');
  const quizInner = document.getElementById('quizResultInner');
  const quizTitle = document.getElementById('quizTitle');
  const quizDesc = document.getElementById('quizDesc');
  const quizNote = document.getElementById('quizNote');
  const quizServices = document.getElementById('quizServices');
  const formPet = document.getElementById('formPet');

  function renderQuiz(petKey) {
    const data = quizData[petKey];
    if (!data) return;
    quizTitle.textContent = data.title;
    quizDesc.textContent = data.desc;
    quizNote.textContent = data.note;
    quizServices.innerHTML = data.services
      .map((s) => '<span class="quiz-service-chip">' + s + '</span>')
      .join('');
    quizInner.classList.remove('pop');
    void quizInner.offsetWidth; /* перезапуск анимации */
    quizInner.classList.add('pop');
    if (formPet && quizData[petKey]) {
      const option = formPet.querySelector('option[value="' + petKey + '"]');
      if (option) formPet.value = petKey;
    }
  }

  if (quizPets && quizInner) {
    quizPets.querySelectorAll('.quiz-pet').forEach((btn) => {
      btn.addEventListener('click', () => {
        quizPets.querySelectorAll('.quiz-pet').forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        renderQuiz(btn.dataset.pet);
      });
    });
    renderQuiz('cat');
  }

  /* ---------- Карусель историй ---------- */
  const track = document.getElementById('storyTrack');
  const prevBtn = document.getElementById('storyPrev');
  const nextBtn = document.getElementById('storyNext');
  const dotsWrap = document.getElementById('storyDots');

  if (track && prevBtn && nextBtn && dotsWrap) {
    const slides = track.children.length;
    let current = 0;
    let autoTimer = null;

    for (let i = 0; i < slides; i += 1) {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'История ' + (i + 1));
      dot.addEventListener('click', () => goTo(i, true));
      dotsWrap.appendChild(dot);
    }
    const dots = dotsWrap.querySelectorAll('.carousel__dot');

    function goTo(index, manual) {
      current = (index + slides) % slides;
      track.style.transform = 'translateX(-' + current * 100 + '%)';
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
      if (manual) restartAuto();
    }

    function restartAuto() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1, false), 6000);
    }

    prevBtn.addEventListener('click', () => goTo(current - 1, true));
    nextBtn.addEventListener('click', () => goTo(current + 1, true));

    const carousel = document.getElementById('storiesCarousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', () => { if (autoTimer) clearInterval(autoTimer); });
      carousel.addEventListener('mouseleave', restartAuto);
    }
    restartAuto();

    /* свайп на мобильных */
    let touchX = null;
    track.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1), true);
      touchX = null;
    }, { passive: true });
  }

  /* ---------- Анимация счётчиков ---------- */
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('ru-RU');
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach((c) => counterObserver.observe(c));

  /* ---------- Появление при скролле ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------- Форма записи ---------- */
  const form = document.getElementById('bookingForm');
  const success = document.getElementById('bookingSuccess');
  const successText = document.getElementById('successText');
  const againBtn = document.getElementById('bookingAgain');
  const petNames = {
    cat: 'кота', dog: 'пса', parrot: 'попугая', ferret: 'хорька', other: 'вашего питомца',
  };

  if (form && success) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('formName');
      const phoneInput = document.getElementById('formPhone');
      const petSelect = document.getElementById('formPet');
      let valid = true;

      [nameInput, phoneInput].forEach((inp) => inp.classList.remove('error'));

      if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
        nameInput.classList.add('error');
        valid = false;
      }
      const digits = phoneInput.value.replace(/\D/g, '');
      if (digits.length < 10) {
        phoneInput.classList.add('error');
        valid = false;
      }
      if (!valid) return;

      const name = nameInput.value.trim();
      const pet = petNames[petSelect.value] || 'питомца';
      successText.textContent = name + ', мы перезвоним в течение 10 минут и подберём удобное время для ' + pet + '.';
      form.hidden = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    /* маска телефона — лёгкая */
    const phoneInput = document.getElementById('formPhone');
    if (phoneInput) {
      phoneInput.addEventListener('input', () => {
        let d = phoneInput.value.replace(/\D/g, '');
        if (d.startsWith('8')) d = '7' + d.slice(1);
        if (d && !d.startsWith('7')) d = '7' + d;
        d = d.slice(0, 11);
        let out = '';
        if (d.length > 0) out = '+7';
        if (d.length > 1) out += ' ' + d.slice(1, 4);
        if (d.length > 4) out += ' ' + d.slice(4, 7);
        if (d.length > 7) out += '-' + d.slice(7, 9);
        if (d.length > 9) out += '-' + d.slice(9, 11);
        phoneInput.value = out;
      });
    }
  }

  if (againBtn && form && success) {
    againBtn.addEventListener('click', () => {
      form.reset();
      form.hidden = false;
      success.hidden = true;
    });
  }

  /* ---------- Лапки, гуляющие по странице ---------- */
  const pawTrail = document.getElementById('pawTrail');
  if (pawTrail && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const PAW_SVG = '<svg viewBox="0 0 40 40" width="30" height="30"><ellipse cx="20" cy="26" rx="9" ry="7.5" fill="{c}"/><ellipse cx="8.5" cy="15" rx="4" ry="5" fill="{c}" transform="rotate(-20 8.5 15)"/><ellipse cx="20" cy="11" rx="4.2" ry="5.4" fill="{c}"/><ellipse cx="31.5" cy="15" rx="4" ry="5" fill="{c}" transform="rotate(20 31.5 15)"/></svg>';
    const colors = ['#FF6B5B', '#3DBE8B', '#FFC93C'];
    const steps = [];
    const COUNT = 7;

    /* змейка вдоль левого/правого края */
    for (let i = 0; i < COUNT; i += 1) {
      const paw = document.createElement('div');
      paw.className = 'trail-paw';
      const side = i % 2 === 0;
      const left = side ? (12 + (i % 3) * 10) : (82 + (i % 3) * 5);
      paw.style.left = 'calc(' + left + 'vw)';
      paw.style.top = 'calc(' + (60 + i * 4) + 'vh)';
      paw.style.setProperty('--rot', (side ? -18 : 18) + 'deg');
      paw.innerHTML = PAW_SVG.replace(/\{c\}/g, colors[i % colors.length]);
      pawTrail.appendChild(paw);
      steps.push(paw);
    }

    let ticking = false;
    function updatePaws() {
      ticking = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      const visibleCount = Math.round(progress * COUNT);
      steps.forEach((paw, i) => paw.classList.toggle('is-visible', i < visibleCount));
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updatePaws);
      }
    }, { passive: true });
    updatePaws();
  }

});
