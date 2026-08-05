/* ============================================================
   ART DENT — интерактив лендинга
   ============================================================ */
(function () {
  "use strict";

  var isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Кастомный курсор ---------- */
  if (isFinePointer) {
    var dot = document.getElementById("cursorDot");
    var ring = document.getElementById("cursorRing");
    var mx = -100, my = -100, rx = -100, ry = -100;

    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + (mx - 3.5) + "px," + (my - 3.5) + "px)";
    });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = "translate(" + (rx - ring.offsetWidth / 2) + "px," + (ry - ring.offsetHeight / 2) + "px)";
      requestAnimationFrame(loop);
    })();

    document.querySelectorAll("a, button, .video-card, .ba-compare__handle").forEach(function (el) {
      el.addEventListener("mouseenter", function () { ring.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { ring.classList.remove("is-hover"); });
    });
    document.body.style.cursor = "none";
    document.querySelectorAll("a, button").forEach(function (el) { el.style.cursor = "none"; });
  } else {
    var cd = document.getElementById("cursorDot");
    var cr = document.getElementById("cursorRing");
    if (cd) cd.remove();
    if (cr) cr.remove();
  }

  /* ---------- Шапка при скролле ---------- */
  var header = document.getElementById("header");
  function onScrollHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    document.body.classList.toggle("no-scroll", open);
  });
  nav.querySelectorAll(".nav__link").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("is-open");
      burger.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
    });
  });

  /* ---------- Параллакс ---------- */
  var heroBg = document.getElementById("heroBg");
  var decors = Array.prototype.slice.call(document.querySelectorAll(".decor"));
  var ticking = false;
  function parallax() {
    var y = window.scrollY;
    if (heroBg) heroBg.style.transform = "translateY(" + y * 0.35 + "px)";
    decors.forEach(function (el) {
      var speed = parseFloat(el.getAttribute("data-speed")) || 0.2;
      el.style.transform = "translateY(" + y * speed * -1 + "px)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
  }, { passive: true });

  /* ---------- Появление при скролле ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { revealObserver.observe(el); });

  /* ---------- Эффект печатной машинки ---------- */
  var tw = document.getElementById("typewriter");
  if (tw) {
    var phrases = (tw.getAttribute("data-phrases") || "").split("|").filter(Boolean);
    var pIdx = 0, cIdx = 0, deleting = false;
    function typeStep() {
      var phrase = phrases[pIdx];
      if (!deleting) {
        cIdx++;
        tw.textContent = phrase.slice(0, cIdx);
        if (cIdx === phrase.length) {
          deleting = true;
          setTimeout(typeStep, 2100);
          return;
        }
        setTimeout(typeStep, 55 + Math.random() * 45);
      } else {
        cIdx--;
        tw.textContent = phrase.slice(0, cIdx);
        if (cIdx === 0) {
          deleting = false;
          pIdx = (pIdx + 1) % phrases.length;
          setTimeout(typeStep, 420);
          return;
        }
        setTimeout(typeStep, 26);
      }
    }
    typeStep();
  }

  /* ---------- Видео-плейсхолдер ---------- */
  var videoCard = document.getElementById("videoCard");
  if (videoCard) {
    var noteTimer;
    var showNote = function () {
      videoCard.classList.add("is-noted");
      clearTimeout(noteTimer);
      noteTimer = setTimeout(function () { videoCard.classList.remove("is-noted"); }, 2800);
    };
    videoCard.addEventListener("click", showNote);
    videoCard.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showNote(); }
    });
  }

  /* ---------- Слайдер «До/После» ---------- */
  var track = document.getElementById("baTrack");
  if (track) {
    var slides = Array.prototype.slice.call(track.children);
    var dotsWrap = document.getElementById("baDots");
    var current = 0;

    slides.forEach(function (_, i) {
      var d = document.createElement("button");
      d.type = "button";
      d.setAttribute("aria-label", "Работа " + (i + 1));
      if (i === 0) d.classList.add("is-active");
      d.addEventListener("click", function () { goTo(i); });
      dotsWrap.appendChild(d);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function goTo(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, idx) {
        s.style.transform = "translateX(" + (-100 * current) + "%)";
      });
      dots.forEach(function (d, idx) { d.classList.toggle("is-active", idx === current); });
    }
    document.getElementById("baPrev").addEventListener("click", function () { goTo(current - 1); });
    document.getElementById("baNext").addEventListener("click", function () { goTo(current + 1); });

    /* Перетаскивание разделителя «до/после» */
    document.querySelectorAll("[data-compare]").forEach(function (cmp) {
      var dragging = false;
      function setSplit(clientX) {
        var rect = cmp.getBoundingClientRect();
        var pct = ((clientX - rect.left) / rect.width) * 100;
        pct = Math.max(4, Math.min(96, pct));
        cmp.style.setProperty("--split", pct + "%");
      }
      cmp.addEventListener("pointerdown", function (e) {
        dragging = true;
        cmp.setPointerCapture(e.pointerId);
        setSplit(e.clientX);
      });
      cmp.addEventListener("pointermove", function (e) { if (dragging) setSplit(e.clientX); });
      ["pointerup", "pointercancel"].forEach(function (ev) {
        cmp.addEventListener(ev, function () { dragging = false; });
      });
    });
  }

  /* ---------- Календарь записи ---------- */
  var calTitle = document.getElementById("calTitle");
  var calDays = document.getElementById("calDays");
  var calSlots = document.getElementById("calSlots");
  var fDate = document.getElementById("fDate");
  var fTime = document.getElementById("fTime");
  var calPrev = document.getElementById("calPrev");
  var calNext = document.getElementById("calNext");

  var MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
                "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  var SLOTS = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30"];

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var viewYear = today.getFullYear();
  var viewMonth = today.getMonth();
  var maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 3);
  var selectedDate = null;
  var selectedTime = null;

  function fmtDate(d) {
    var dd = String(d.getDate()).padStart(2, "0");
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    return dd + "." + mm + "." + d.getFullYear();
  }

  function renderCalendar() {
    calTitle.textContent = MONTHS[viewMonth] + " " + viewYear;
    calDays.innerHTML = "";

    var first = new Date(viewYear, viewMonth, 1);
    var startOffset = (first.getDay() + 6) % 7; // понедельник = 0
    var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (var i = 0; i < startOffset; i++) {
      var empty = document.createElement("button");
      empty.type = "button";
      empty.className = "is-empty";
      empty.tabIndex = -1;
      calDays.appendChild(empty);
    }

    for (var day = 1; day <= daysInMonth; day++) {
      (function (day) {
        var date = new Date(viewYear, viewMonth, day);
        var btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = day;
        var isPast = date < today;
        var isBeyond = date > maxDate;
        var isSunday = date.getDay() === 0; // воскресенье — короткий день, без записи онлайн
        if (isPast || isBeyond || isSunday) btn.disabled = true;
        if (date.getTime() === today.getTime()) btn.classList.add("is-today");
        if (selectedDate && date.getTime() === selectedDate.getTime()) btn.classList.add("is-selected");
        btn.addEventListener("click", function () {
          selectedDate = date;
          selectedTime = null;
          fDate.value = fmtDate(date);
          fTime.value = "";
          renderCalendar();
          renderSlots();
          clearError("datetime");
        });
        calDays.appendChild(btn);
      })(day);
    }

    var atMin = viewYear === today.getFullYear() && viewMonth === today.getMonth();
    var atMax = viewYear === maxDate.getFullYear() && viewMonth === maxDate.getMonth();
    calPrev.disabled = atMin;
    calNext.disabled = atMax;
  }

  function renderSlots() {
    calSlots.innerHTML = "";
    if (!selectedDate) {
      var hint = document.createElement("p");
      hint.style.cssText = "font-size:13px;color:rgba(232,213,183,.45);width:100%";
      hint.textContent = "Сначала выберите дату";
      calSlots.appendChild(hint);
      return;
    }
    var now = new Date();
    var isToday = selectedDate.getTime() === today.getTime();
    SLOTS.forEach(function (slot, idx) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = slot;
      if (isToday) {
        var h = parseInt(slot.split(":")[0], 10);
        if (h <= now.getHours()) b.disabled = true;
      }
      // имитация занятых окон
      if ((selectedDate.getDate() + idx) % 5 === 0) b.disabled = true;
      if (selectedTime === slot) b.classList.add("is-selected");
      b.addEventListener("click", function () {
        selectedTime = slot;
        fTime.value = slot;
        renderSlots();
        clearError("datetime");
      });
      calSlots.appendChild(b);
    });
  }

  calPrev.addEventListener("click", function () {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  calNext.addEventListener("click", function () {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  renderCalendar();
  renderSlots();

  /* ---------- Форма: валидация и имитация отправки ---------- */
  var form = document.getElementById("bookingForm");
  var success = document.getElementById("formSuccess");
  var successText = document.getElementById("successText");

  function setError(key, msg) {
    var el = form.querySelector('[data-error="' + key + '"]');
    if (el) el.textContent = msg;
    var field = el && el.closest(".form-field");
    if (field) field.classList.add("has-error");
  }
  function clearError(key) {
    var el = form.querySelector('[data-error="' + key + '"]');
    if (el) el.textContent = "";
    var field = el && el.closest(".form-field");
    if (field) field.classList.remove("has-error");
  }

  var phoneInput = document.getElementById("fPhone");
  phoneInput.addEventListener("input", function () {
    var digits = phoneInput.value.replace(/\D/g, "");
    if (digits.startsWith("8")) digits = "7" + digits.slice(1);
    if (digits && !digits.startsWith("7")) digits = "7" + digits;
    digits = digits.slice(0, 11);
    var out = "";
    if (digits.length > 0) out = "+7";
    if (digits.length > 1) out += " (" + digits.slice(1, 4);
    if (digits.length >= 4) out += ")";
    if (digits.length > 4) out += " " + digits.slice(4, 7);
    if (digits.length > 7) out += "-" + digits.slice(7, 9);
    if (digits.length > 9) out += "-" + digits.slice(9, 11);
    phoneInput.value = out;
    clearError("phone");
  });
  document.getElementById("fName").addEventListener("input", function () { clearError("name"); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    var name = document.getElementById("fName").value.trim();
    var phoneDigits = phoneInput.value.replace(/\D/g, "");

    if (name.length < 2) { setError("name", "Укажите имя (минимум 2 буквы)"); ok = false; } else clearError("name");
    if (phoneDigits.length !== 11) { setError("phone", "Введите телефон полностью"); ok = false; } else clearError("phone");
    if (!fDate.value || !fTime.value) { setError("datetime", "Выберите дату и время в календаре"); ok = false; } else clearError("datetime");

    if (!ok) return;

    successText.textContent = "Спасибо, " + name + "! Вы записаны на " + fDate.value + " в " + fTime.value +
      ". Администратор перезвонит на " + phoneInput.value + " для подтверждения.";
    success.hidden = false;
  });

  document.getElementById("successReset").addEventListener("click", function () {
    success.hidden = true;
    form.reset();
    selectedDate = null;
    selectedTime = null;
    fDate.value = "";
    fTime.value = "";
    renderCalendar();
    renderSlots();
  });

  /* ---------- Предвыбор услуги из карточек ---------- */
  var serviceSelect = document.getElementById("fService");
  document.querySelectorAll("[data-service]").forEach(function (link) {
    link.addEventListener("click", function () {
      var value = link.getAttribute("data-service");
      Array.prototype.forEach.call(serviceSelect.options, function (opt) {
        if (opt.value === value) serviceSelect.value = value;
      });
    });
  });

  /* ---------- Плавающая кнопка ---------- */
  var fab = document.getElementById("fab");
  var bookingSection = document.getElementById("booking");
  var heroSection = document.getElementById("hero");

  function updateFab() {
    var past = window.scrollY > heroSection.offsetHeight * 0.7;
    var rect = bookingSection.getBoundingClientRect();
    var bookingVisible = rect.top < window.innerHeight && rect.bottom > 0;
    fab.classList.toggle("is-visible", past && !bookingVisible);
  }
  window.addEventListener("scroll", updateFab, { passive: true });
  updateFab();
})();
