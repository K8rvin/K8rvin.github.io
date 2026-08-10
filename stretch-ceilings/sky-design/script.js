/* ============================================================
   СкайДизайн — интерактив лендинга
   Конфигуратор, до/после, сценарии света, карусель отзывов,
   счётчик, формы и анимации появления.
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const fmt = (n) => new Intl.NumberFormat('ru-RU').format(Math.round(n));

  /* ---------- Шапка: тень при скролле ---------- */
  const header = $('#header');
  const onScrollHeader = () => header.classList.toggle('scrolled', window.scrollY > 12);
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- Бургер-меню ---------- */
  const burger = $('#burger');
  const nav = $('#nav');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  $$('.nav-link', nav).forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Ближайший свободный замер ---------- */
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' });
  const measureText = `завтра, ${dateStr} в 11:00`;
  const measureShort = `завтра, 11:00`;
  const badge1 = $('#nearest-measure');
  const badge2 = $('#nearest-measure-2');
  if (badge1) badge1.textContent = measureShort;
  if (badge2) badge2.textContent = measureText;
  const successText = $('#success-text');
  if (successText) {
    successText.textContent = `Перезвоним в течение 15 минут и договоримся о замере. Ближайшее свободное окно — ${measureText}.`;
  }

  /* ---------- Счётчик «потолков установлено» ---------- */
  const counter = $('#ceiling-counter');
  if (counter) {
    const target = Number(counter.dataset.target) || 0;
    let started = false;
    const animate = () => {
      const duration = 1800;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        counter.textContent = fmt(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        animate();
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(counter);
  }

  /* ---------- Конфигуратор ---------- */
  const PRICES = {
    canvas: {
      gloss: { rate: 490, name: 'Глянцевое полотно', hint: 'Отражает свет и визуально поднимает потолок.' },
      matte: { rate: 430, name: 'Матовое полотно', hint: 'Классика без бликов — как идеально ровная шпаклёвка.' },
      satin: { rate: 460, name: 'Сатиновое полотно', hint: 'Мягкий перламутровый блеск, благородно смотрится днём.' }
    },
    light: 750,
    extras: {
      pipe: { price: 400, name: 'Обход трубы' },
      cornice: { price: 2500, name: 'Скрытый карниз' },
      lines: { price: 6000, name: 'Световые линии' }
    }
  };

  const cfg = {
    area: $('#cfg-area'),
    areaOut: $('#cfg-area-out'),
    canvasBtns: $$('.seg-btn[data-canvas]'),
    canvasHint: $('#cfg-canvas-hint'),
    lightsMinus: $('#cfg-lights-minus'),
    lightsPlus: $('#cfg-lights-plus'),
    lightsOut: $('#cfg-lights-out'),
    pipe: $('#cfg-pipe'),
    cornice: $('#cfg-cornice'),
    lines: $('#cfg-lines'),
    total: $('#cfg-total'),
    perM2: $('#cfg-per-m2'),
    breakdown: $('#cfg-breakdown'),
    fixBtn: $('#cfg-fix')
  };

  const state = { area: 24, canvas: 'gloss', lights: 6 };

  function updateRangeFill() {
    const min = Number(cfg.area.min);
    const max = Number(cfg.area.max);
    const pct = ((state.area - min) / (max - min)) * 100;
    cfg.area.style.setProperty('--fill', pct + '%');
  }

  function calc() {
    const canvas = PRICES.canvas[state.canvas];
    const canvasCost = state.area * canvas.rate;
    const lightsCost = state.lights * PRICES.light;
    const extras = [];
    let extrasCost = 0;
    if (cfg.pipe.checked) { extras.push(PRICES.extras.pipe); extrasCost += PRICES.extras.pipe.price; }
    if (cfg.cornice.checked) { extras.push(PRICES.extras.cornice); extrasCost += PRICES.extras.cornice.price; }
    if (cfg.lines.checked) { extras.push(PRICES.extras.lines); extrasCost += PRICES.extras.lines.price; }
    const total = canvasCost + lightsCost + extrasCost;
    return { canvas, canvasCost, lightsCost, extras, total };
  }

  function render() {
    const r = calc();
    cfg.areaOut.textContent = `${state.area} м²`;
    cfg.lightsOut.textContent = String(state.lights);
    cfg.canvasHint.textContent = r.canvas.hint;

    const rows = [];
    rows.push(`<li><span>${r.canvas.name}, ${state.area} м² × ${fmt(r.canvas.rate)} ₽</span><span>${fmt(r.canvasCost)} ₽</span></li>`);
    if (state.lights > 0) {
      rows.push(`<li><span>Светильники, ${state.lights} шт × ${fmt(PRICES.light)} ₽</span><span>${fmt(r.lightsCost)} ₽</span></li>`);
    }
    r.extras.forEach((e) => {
      rows.push(`<li><span>${e.name}</span><span>${fmt(e.price)} ₽</span></li>`);
    });
    rows.push(`<li><span>Багет, крепёж и вывоз мусора</span><span>включено</span></li>`);
    cfg.breakdown.innerHTML = rows.join('');

    cfg.total.textContent = `${fmt(r.total)} ₽`;
    cfg.perM2.textContent = `${fmt(r.total / state.area)} ₽/м² со всеми работами`;
    cfg.total.classList.remove('bump');
    void cfg.total.offsetWidth;
    cfg.total.classList.add('bump');
    updateRangeFill();
  }

  cfg.area.addEventListener('input', () => {
    state.area = Number(cfg.area.value);
    render();
  });

  function setCanvas(key) {
    state.canvas = key;
    cfg.canvasBtns.forEach((b) => {
      const active = b.dataset.canvas === key;
      b.classList.toggle('active', active);
      b.setAttribute('aria-checked', String(active));
    });
    render();
  }
  cfg.canvasBtns.forEach((b) => b.addEventListener('click', () => setCanvas(b.dataset.canvas)));

  cfg.lightsMinus.addEventListener('click', () => {
    state.lights = Math.max(0, state.lights - 1);
    render();
  });
  cfg.lightsPlus.addEventListener('click', () => {
    state.lights = Math.min(40, state.lights + 1);
    render();
  });
  [cfg.pipe, cfg.cornice, cfg.lines].forEach((cb) => cb.addEventListener('change', render));

  /* Кнопка «Зафиксировать цену» — ведёт к форме с подставленной площадью */
  cfg.fixBtn.addEventListener('click', () => {
    const areaInput = $('#f-area');
    if (areaInput && !areaInput.value) areaInput.value = String(state.area);
    document.getElementById('cta').scrollIntoView({ behavior: 'smooth' });
    const r = calc();
    sessionStorage.setItem('skyFixedPrice', String(Math.round(r.total)));
  });

  /* Кнопки «Выбрать в расчёт» в карточках цен */
  $$('.price-pick').forEach((btn) => {
    btn.addEventListener('click', () => {
      setCanvas(btn.dataset.canvas);
      document.getElementById('config').scrollIntoView({ behavior: 'smooth' });
    });
  });

  render();

  /* ---------- До / После: драг-слайдер ---------- */
  const ba = $('#ba-slider');
  if (ba) {
    const after = $('#ba-after');
    const handle = $('#ba-handle');
    let dragging = false;

    const setPos = (clientX) => {
      const rect = ba.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(2, Math.min(98, pct));
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      handle.style.left = pct + '%';
    };
    const start = (e) => {
      dragging = true;
      setPos(e.touches ? e.touches[0].clientX : e.clientX);
    };
    const move = (e) => {
      if (!dragging) return;
      if (e.cancelable && e.type === 'touchmove') e.preventDefault();
      setPos(e.touches ? e.touches[0].clientX : e.clientX);
    };
    const stop = () => { dragging = false; };

    ba.addEventListener('mousedown', start);
    ba.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);

    ba.addEventListener('keydown', (e) => {
      const cur = parseFloat(handle.style.left) || 50;
      if (e.key === 'ArrowLeft') { e.preventDefault(); setPct(cur - 4); }
      if (e.key === 'ArrowRight') { e.preventDefault(); setPct(cur + 4); }
    });
    const setPct = (pct) => {
      pct = Math.max(2, Math.min(98, pct));
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      handle.style.left = pct + '%';
    };
    ba.tabIndex = 0;
  }

  /* ---------- Свет: дневной / вечерний ---------- */
  const scene = $('#light-scene');
  const btnDay = $('#light-day');
  const btnEvening = $('#light-evening');
  if (scene && btnDay && btnEvening) {
    const setMode = (evening) => {
      scene.classList.toggle('evening', evening);
      btnDay.classList.toggle('active', !evening);
      btnEvening.classList.toggle('active', evening);
      btnDay.setAttribute('aria-pressed', String(!evening));
      btnEvening.setAttribute('aria-pressed', String(evening));
    };
    btnDay.addEventListener('click', () => setMode(false));
    btnEvening.addEventListener('click', () => setMode(true));
  }

  /* ---------- Карусель отзывов ---------- */
  const track = $('#reviews-track');
  const dotsWrap = $('#reviews-dots');
  if (track && dotsWrap) {
    const cards = $$('.review-card', track);
    const dots = cards.map((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Отзыв ${i + 1}`);
      d.addEventListener('click', () => scrollToCard(i));
      dotsWrap.appendChild(d);
      return d;
    });

    const cardStep = () => {
      if (cards.length < 2) return track.clientWidth;
      return cards[1].offsetLeft - cards[0].offsetLeft;
    };
    const scrollToCard = (i) => {
      track.scrollTo({ left: cardStep() * i, behavior: 'smooth' });
    };
    const activeIndex = () => Math.round(track.scrollLeft / cardStep());

    track.addEventListener('scroll', () => {
      const idx = Math.min(cards.length - 1, activeIndex());
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }, { passive: true });

    $('#rev-prev').addEventListener('click', () => {
      scrollToCard(Math.max(0, activeIndex() - 1));
    });
    $('#rev-next').addEventListener('click', () => {
      scrollToCard(Math.min(cards.length - 1, activeIndex() + 1));
    });
  }

  /* ---------- Форма финального CTA ---------- */
  const form = $('#cta-form');
  const success = $('#form-success');
  if (form && success) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#f-name');
      const phone = $('#f-phone');
      let ok = true;
      [name, phone].forEach((inp) => inp.classList.remove('error'));
      if (!name.value.trim()) { name.classList.add('error'); ok = false; }
      const digits = phone.value.replace(/\D/g, '');
      if (digits.length < 10) { phone.classList.add('error'); ok = false; }
      if (!ok) return;
      success.hidden = false;
    });
    $('#success-back').addEventListener('click', () => {
      success.hidden = true;
      form.reset();
      $('#f-name').focus();
    });
  }

  /* ---------- Анимации появления при скролле ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const ro = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          ro.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => ro.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ---------- Год в футере ---------- */
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
});
