/* ============================================================
   RUSH — компьютерный клуб 24/7
   Ванильный JS: бронь в 3 клика, живая карта зала,
   даты ивентов, карусель отзывов, бургер-меню, reveal-анимации
   ============================================================ */

(function () {
  "use strict";

  /* ---------- утилиты ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const plural = (n, one, few, many) => {
    const m = Math.abs(n) % 100;
    const d = m % 10;
    if (m > 10 && m < 20) return many;
    if (d > 1 && d < 5) return few;
    if (d === 1) return one;
    return many;
  };

  const rub = (n) => n.toLocaleString("ru-RU") + " ₽";

  // детерминированный рандом, чтобы рассадка не прыгала при пересчётах
  const mulberry32 = (seed) => () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /* ============================================================
     БУРГЕР-МЕНЮ
     ============================================================ */
  const burger = $("#burger");
  const nav = $("#nav");

  if (burger && nav) {
    const setMenu = (open) => {
      burger.classList.toggle("is-open", open);
      nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    };
    burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
    $$(".nav-link, .nav-phone", nav).forEach((link) =>
      link.addEventListener("click", () => setMenu(false))
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ============================================================
     REVEAL-АНИМАЦИИ ПРИ СКРОЛЛЕ
     ============================================================ */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -30px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ============================================================
     КАРТА ЗАЛА + СЧЁТЧИК СВОБОДНЫХ МЕСТ
     ============================================================ */
  const ZONES = {
    standard: {
      name: "Обычная зона",
      desc: "Классика: RTX 4060, моники 165 Гц, рядом с баром.",
      price: "60 ₽/час днём • 90 ₽/час вечером",
      seats: []
    },
    pro: {
      name: "PRO-зона",
      desc: "27\" 240 Гц, RGB-подсветка, тише и просторнее. Для тех, кто на результат.",
      price: "90 ₽/час",
      seats: []
    },
    ps5: {
      name: "PS5-зона",
      desc: "Два дивана и большой экран. FIFA, Mortal Kombat и UFC до утра.",
      price: "60 ₽/час",
      seats: []
    }
  };

  // раскладка мест: s — экран, c — кресло/диван
  const buildLayout = () => {
    const std = [];
    [110, 180].forEach((y) => {
      [56, 144, 232, 320, 408, 496].forEach((x) => {
        std.push({ s: { x, y, w: 44, h: 26 }, c: { x: x + 22, y: y + 46, r: 10 } });
      });
    });
    ZONES.standard.seats = std;

    const pro = [];
    [110, 180].forEach((y) => {
      [628, 684, 740, 796].forEach((x) => {
        pro.push({ s: { x, y, w: 44, h: 26 }, c: { x: x + 22, y: y + 46, r: 10 } });
      });
    });
    ZONES.pro.seats = pro;

    // PS5: один большой экран на двоих + два дивана
    ZONES.ps5.tv = { x: 104, y: 348, w: 150, h: 56 };
    ZONES.ps5.seats = [
      { s: null, c: { x: 62, y: 428, w: 92, h: 26 } },
      { s: null, c: { x: 204, y: 428, w: 92, h: 26 } }
    ];
  };
  buildLayout();

  // демо-рассадка: стабильная в течение дня
  const daySeed = new Date().getFullYear() * 372 + new Date().getMonth() * 31 + new Date().getDate();
  const rand = mulberry32(daySeed);

  const hallState = []; // { zone, index, busy, el }
  const SVG_NS = "http://www.w3.org/2000/svg";
  let pickedSeat = null;
  let selectedZone = "standard";

  const seatEls = {};

  const renderHall = () => {
    Object.keys(ZONES).forEach((zoneKey) => {
      const zone = ZONES[zoneKey];
      const box = $("#seats-" + zoneKey);
      if (!box) return;
      seatEls[zoneKey] = [];

      // у PS5-зоны рисуем общий экран
      if (zone.tv) {
        const tv = document.createElementNS(SVG_NS, "rect");
        tv.setAttribute("x", zone.tv.x);
        tv.setAttribute("y", zone.tv.y);
        tv.setAttribute("width", zone.tv.w);
        tv.setAttribute("height", zone.tv.h);
        tv.setAttribute("rx", 8);
        tv.setAttribute("fill", "#FF4DA6");
        tv.setAttribute("opacity", ".85");
        tv.style.filter = "drop-shadow(0 0 12px rgba(255,77,166,.7))";
        box.appendChild(tv);
      }

      zone.seats.forEach((seat, i) => {
        const busy = rand() < 0.45;
        const g = document.createElementNS(SVG_NS, "g");
        g.setAttribute("class", "seat " + (busy ? "busy" : "free"));
        g.dataset.zone = zoneKey;
        g.dataset.index = String(i + 1);
        g.setAttribute("role", "button");
        g.setAttribute("tabindex", "0");
        g.setAttribute(
          "aria-label",
          zone.name + ", место " + (i + 1) + (busy ? " — занято" : " — свободно")
        );

        if (seat.s) {
          const scr = document.createElementNS(SVG_NS, "rect");
          scr.setAttribute("class", "seat-screen");
          scr.setAttribute("x", seat.s.x);
          scr.setAttribute("y", seat.s.y);
          scr.setAttribute("width", seat.s.w);
          scr.setAttribute("height", seat.s.h);
          scr.setAttribute("rx", 5);
          g.appendChild(scr);
        }

        if (seat.c.r) {
          const chair = document.createElementNS(SVG_NS, "circle");
          chair.setAttribute("class", "seat-chair");
          chair.setAttribute("cx", seat.c.x);
          chair.setAttribute("cy", seat.c.y);
          chair.setAttribute("r", seat.c.r);
          g.appendChild(chair);
        } else {
          const couch = document.createElementNS(SVG_NS, "rect");
          couch.setAttribute("class", "seat-chair");
          couch.setAttribute("x", seat.c.x);
          couch.setAttribute("y", seat.c.y);
          couch.setAttribute("width", seat.c.w);
          couch.setAttribute("height", seat.c.h);
          couch.setAttribute("rx", 9);
          g.appendChild(couch);
        }

        const record = { zone: zoneKey, index: i + 1, busy, el: g };
        hallState.push(record);
        seatEls[zoneKey].push(record);

        const onPick = () => pickSeat(record);
        g.addEventListener("click", (e) => {
          e.stopPropagation();
          onPick();
        });
        g.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPick();
          }
        });

        box.appendChild(g);
      });
    });
  };

  const freeByZone = (zoneKey) =>
    hallState.filter((s) => s.zone === zoneKey && !s.busy).length;

  const totalFree = () => hallState.filter((s) => !s.busy).length;

  const updateCounts = (flash) => {
    Object.keys(ZONES).forEach((zoneKey) => {
      const el = $("#count-" + zoneKey);
      if (el) {
        el.textContent =
          "свободно " + freeByZone(zoneKey) + " из " + ZONES[zoneKey].seats.length;
      }
    });

    const total = totalFree();
    const word = plural(total, "место", "места", "мест");
    const heroEl = $("#freeNowHero");
    const ctaEl = $("#freeNowCta");
    if (heroEl) heroEl.textContent = total + " " + word;
    if (ctaEl) ctaEl.textContent = (total + " " + word).toUpperCase();

    updateZonePanel(flash);
  };

  const updateZonePanel = (flash) => {
    const zone = ZONES[selectedZone];
    if (!zone) return;
    const free = freeByZone(selectedZone);
    const total = zone.seats.length;

    const nameEl = $("#zoneName");
    const freeEl = $("#zoneFree");
    const descEl = $("#zoneDesc");
    const priceEl = $("#zonePrice");
    const hintEl = $("#zoneHint");

    if (nameEl) nameEl.textContent = zone.name;
    if (freeEl) {
      freeEl.textContent = "свободно " + free + " из " + total;
      if (flash) {
        freeEl.classList.remove("flash");
        void freeEl.offsetWidth; // перезапуск анимации
        freeEl.classList.add("flash");
      }
    }
    if (descEl) descEl.textContent = zone.desc;
    if (priceEl) priceEl.textContent = zone.price;
    if (hintEl) {
      hintEl.textContent = pickedSeat
        ? "Выбрано место №" + pickedSeat.index + " (" + ZONES[pickedSeat.zone].name + ") — жми «Забронировать»."
        : "Кликни по свободному месту на схеме — выберем его для тебя.";
    }
  };

  const selectZone = (zoneKey) => {
    if (!ZONES[zoneKey]) return;
    selectedZone = zoneKey;
    $$(".zone").forEach((z) =>
      z.classList.toggle("is-selected", z.dataset.zone === zoneKey)
    );
    updateZonePanel(false);
  };

  const pickSeat = (seat) => {
    if (seat.busy) {
      selectZone(seat.zone);
      const hintEl = $("#zoneHint");
      if (hintEl) hintEl.textContent = "Это место уже гоняет катки — выбери зелёное.";
      return;
    }
    if (pickedSeat && pickedSeat.el) {
      pickedSeat.el.classList.remove("picked");
      if (!pickedSeat.busy) pickedSeat.el.classList.add("free");
    }
    if (pickedSeat === seat) {
      pickedSeat = null; // повторный клик — снять выбор
    } else {
      pickedSeat = seat;
      seat.el.classList.add("picked");
      seat.el.classList.remove("free");
    }
    selectZone(seat.zone);
  };

  renderHall();
  selectZone("standard");
  updateCounts(false);

  // клики по зонам
  $$(".zone").forEach((zoneEl) => {
    zoneEl.addEventListener("click", () => selectZone(zoneEl.dataset.zone));
    zoneEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectZone(zoneEl.dataset.zone);
      }
    });
  });

  // «живой» зал: раз в 18 секунд одно место меняет статус
  window.setInterval(() => {
    if (!hallState.length) return;
    const free = totalFree();
    let candidates;
    if (free <= 4) {
      candidates = hallState.filter((s) => s.busy); // освобождаем
    } else if (free >= hallState.length - 2) {
      candidates = hallState.filter((s) => !s.busy); // занимаем
    } else {
      candidates = hallState;
    }
    const seat = candidates[Math.floor(Math.random() * candidates.length)];
    if (pickedSeat === seat) return; // выбранное место не трогаем
    seat.busy = !seat.busy;
    seat.el.classList.toggle("busy", seat.busy);
    seat.el.classList.toggle("free", !seat.busy);
    seat.el.setAttribute(
      "aria-label",
      ZONES[seat.zone].name + ", место " + seat.index + (seat.busy ? " — занято" : " — свободно")
    );
    updateCounts(true);
  }, 18000);

  /* ============================================================
     БРОНЬ В 3 КЛИКА
     ============================================================ */
  const WHEN = {
    today: { rate: 90, hint: "Вечер будни — 90 ₽/час с места", label: "сегодня вечером" },
    tomorrow: { rate: 60, hint: "Завтра днём — 60 ₽/час с места. Днём дешевле!", label: "завтра днём" },
    weekend: { rate: 100, hint: "Выходные — 100 ₽/час с места. Зато вайб максимальный", label: "в выходные" }
  };

  const PEOPLE = {
    1: { disc: 0, hint: "Один — без скидки, зато вся катка твоя", word: "Вас один" },
    2: { disc: 0.10, hint: "Вдвоём — скидка 10% на всё", word: "Вас двое" },
    5: { disc: 0.25, hint: "Патти из пяти — скидка 25%. Максимальная выгода!", word: "Вас пятеро" }
  };

  const HOURS_HINT = {
    2: "Пара каток после пар",
    3: "Три катки — и ещё останется",
    5: "Полноценный вечер с патти",
    10: "Вся ночь. Организм, прости"
  };

  const booking = { people: 2, when: "today", hours: 3 };

  const priceOldEl = $("#priceOld");
  const priceNowEl = $("#priceNow");
  const pricePerEl = $("#pricePer");
  const priceSaveEl = $("#priceSave");

  const renderBooking = () => {
    const rate = WHEN[booking.when].rate;
    const disc = PEOPLE[booking.people].disc;
    const base = booking.people * booking.hours * rate;
    const price = Math.round(base * (1 - disc));
    const save = base - price;
    const per = Math.round(price / booking.people);

    if (priceOldEl) {
      priceOldEl.textContent = rub(base);
      priceOldEl.style.visibility = disc > 0 ? "visible" : "hidden";
    }
    if (priceNowEl) {
      priceNowEl.textContent = rub(price);
      priceNowEl.classList.remove("bump");
      void priceNowEl.offsetWidth;
      priceNowEl.classList.add("bump");
    }
    if (pricePerEl) {
      pricePerEl.textContent =
        rub(per) + " " + (booking.people > 1 ? "с человека" : "за место");
    }
    if (priceSaveEl) {
      priceSaveEl.textContent = disc > 0
        ? "Скидка за компанию −" + Math.round(disc * 100) + "%: экономите " + rub(save)
        : "Собери патти — скидка за компанию до −25%";
    }

    const peopleHint = $("#peopleHint");
    const whenHint = $("#whenHint");
    const hoursHint = $("#hoursHint");
    if (peopleHint) peopleHint.textContent = PEOPLE[booking.people].hint;
    if (whenHint) whenHint.textContent = WHEN[booking.when].hint;
    if (hoursHint) hoursHint.textContent = HOURS_HINT[booking.hours] || "";
  };

  $$(".chip[data-group]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const group = chip.dataset.group;
      const value = chip.dataset.value;
      if (group === "people") booking.people = Number(value);
      if (group === "when") booking.when = value;
      if (group === "hours") booking.hours = Number(value);
      $$('.chip[data-group="' + group + '"]').forEach((c) =>
        c.classList.toggle("is-active", c === chip)
      );
      renderBooking();
    });
  });

  renderBooking();

  const bookingCard = $("#bookingCard");
  const bookingSuccess = $("#bookingSuccess");
  const successSummary = $("#successSummary");
  const bookGo = $("#bookGo");
  const bookAgain = $("#bookAgain");

  if (bookGo && bookingCard && bookingSuccess) {
    bookGo.addEventListener("click", () => {
      const rate = WHEN[booking.when].rate;
      const disc = PEOPLE[booking.people].disc;
      const price = Math.round(booking.people * booking.hours * rate * (1 - disc));
      const hoursWord = plural(booking.hours, "час", "часа", "часов");
      const seatNote = pickedSeat
        ? " Место №" + pickedSeat.index + " (" + ZONES[pickedSeat.zone].name + ") уже ждёт."
        : "";
      if (successSummary) {
        successSummary.textContent =
          PEOPLE[booking.people].word + ", " + WHEN[booking.when].label + ", " +
          booking.hours + " " + hoursWord + " — " + rub(price) + "." + seatNote;
      }
      bookingCard.hidden = true;
      bookingSuccess.hidden = false;
      bookingSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  if (bookAgain && bookingCard && bookingSuccess) {
    bookAgain.addEventListener("click", () => {
      bookingSuccess.hidden = true;
      bookingCard.hidden = false;
      bookingCard.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ============================================================
     ИВЕНТЫ: ДАТЫ ОТ СЕГОДНЯ
     ============================================================ */
  const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  const WEEKDAYS = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

  $$(".event-card[data-dow]").forEach((card) => {
    const dow = Number(card.dataset.dow);
    const now = new Date();
    const diff = (dow - now.getDay() + 7) % 7;
    const date = new Date(now);
    date.setDate(now.getDate() + diff);

    const weekdayEl = $(".event-weekday", card);
    const dayEl = $(".event-day", card);
    const monthEl = $(".event-month", card);

    if (diff === 0) {
      card.classList.add("is-today");
      if (weekdayEl) weekdayEl.textContent = "уже";
    } else if (weekdayEl) {
      weekdayEl.textContent = WEEKDAYS[dow];
    }
    if (dayEl) dayEl.textContent = String(date.getDate());
    if (monthEl) monthEl.textContent = MONTHS[date.getMonth()] + (diff === 0 ? " · сегодня" : "");
  });

  /* ============================================================
     КАРУСЕЛЬ ОТЗЫВОВ
     ============================================================ */
  const carousel = $("#reviewsCarousel");
  const viewport = $("#revViewport");
  const track = $("#revTrack");
  const prevBtn = $("#revPrev");
  const nextBtn = $("#revNext");
  const dotsWrap = $("#revDots");

  if (carousel && viewport && track && prevBtn && nextBtn) {
    const cards = Array.from(track.children);
    const GAP = 24;
    let index = 0;
    let maxIndex = 0;
    let step = 0;
    let timer = null;

    const rebuildDots = () => {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      for (let i = 0; i <= maxIndex; i++) {
        const dot = document.createElement("button");
        dot.className = "car-dot" + (i === index ? " is-active" : "");
        dot.setAttribute("aria-label", "Отзыв " + (i + 1));
        dot.addEventListener("click", () => go(i, true));
        dotsWrap.appendChild(dot);
      }
    };

    const measure = () => {
      const cardW = cards[0].getBoundingClientRect().width;
      step = cardW + GAP;
      const visible = Math.max(1, Math.floor((viewport.clientWidth + GAP) / step));
      maxIndex = Math.max(0, cards.length - visible);
      if (index > maxIndex) index = maxIndex;
      rebuildDots();
      apply();
    };

    const apply = () => {
      track.style.transform = "translateX(" + -index * step + "px)";
      if (dotsWrap) {
        $$(".car-dot", dotsWrap).forEach((d, i) =>
          d.classList.toggle("is-active", i === index)
        );
      }
    };

    const go = (i, user) => {
      index = i > maxIndex ? 0 : i < 0 ? maxIndex : i;
      apply();
      if (user) restartAutoplay();
    };

    const startAutoplay = () => {
      stopAutoplay();
      timer = window.setInterval(() => go(index + 1, false), 6000);
    };
    const stopAutoplay = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };
    const restartAutoplay = () => startAutoplay();

    prevBtn.addEventListener("click", () => go(index - 1, true));
    nextBtn.addEventListener("click", () => go(index + 1, true));
    carousel.addEventListener("pointerenter", stopAutoplay);
    carousel.addEventListener("pointerleave", startAutoplay);
    carousel.addEventListener("focusin", stopAutoplay);
    carousel.addEventListener("focusout", startAutoplay);
    window.addEventListener("resize", measure);

    measure();
    startAutoplay();
  }

  /* ---------- мелочи ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
