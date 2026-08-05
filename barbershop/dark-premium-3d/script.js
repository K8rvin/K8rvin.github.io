/* ============================================================
   NEON BEAUTY — интерактивность лендинга
   ============================================================ */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Переключатель темы ---------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  var savedTheme = null;
  try { savedTheme = localStorage.getItem("nb-theme"); } catch (e) { /* приватный режим */ }
  if (savedTheme === "light" || savedTheme === "dark") {
    root.setAttribute("data-theme", savedTheme);
  }
  themeToggle.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("nb-theme", next); } catch (e) { /* ignore */ }
  });

  /* ---------- Шапка при скролле ---------- */
  var header = document.getElementById("header");
  function onScrollHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  onScrollHeader();

  /* ---------- Parallax orbs при скролле ---------- */
  var orbs = Array.prototype.slice.call(document.querySelectorAll(".orb"));
  var ticking = false;
  function updateOrbs() {
    var y = window.scrollY;
    orbs.forEach(function (orb) {
      var speed = parseFloat(orb.getAttribute("data-parallax")) || 0;
      orb.style.translate = "0 " + (y * speed).toFixed(1) + "px";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    onScrollHeader();
    if (!prefersReducedMotion && !ticking) {
      ticking = true;
      requestAnimationFrame(updateOrbs);
    }
  }, { passive: true });

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById("burger");
  var mobileMenu = document.getElementById("mobileMenu");
  function closeMenu() {
    burger.classList.remove("is-open");
    mobileMenu.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
  }
  burger.addEventListener("click", function () {
    var open = !mobileMenu.classList.contains("is-open");
    burger.classList.toggle("is-open", open);
    mobileMenu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    mobileMenu.setAttribute("aria-hidden", String(!open));
  });
  mobileMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  /* ---------- Ripple-эффект на кнопках ---------- */
  document.addEventListener("click", function (e) {
    var host = e.target.closest(".ripple-host, .chatbot__fab, .chatbot__quick button");
    if (!host) return;
    var rect = host.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
    ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
    host.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 700);
  });

  /* ---------- Появление элементов при скролле ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el, i) {
      // лёгкий каскад внутри одной сетки
      el.style.setProperty("--reveal-delay", ((i % 3) * 0.12) + "s");
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Слайдер До/После ---------- */
  var baSlider = document.getElementById("baSlider");
  var baPos = 50;
  function setBaPos(pos) {
    baPos = Math.max(2, Math.min(98, pos));
    baSlider.style.setProperty("--pos", baPos + "%");
    baSlider.setAttribute("aria-valuenow", String(Math.round(baPos)));
  }
  function posFromEvent(e) {
    var rect = baSlider.getBoundingClientRect();
    return ((e.clientX - rect.left) / rect.width) * 100;
  }
  var baDragging = false;
  baSlider.addEventListener("pointerdown", function (e) {
    baDragging = true;
    baSlider.setPointerCapture(e.pointerId);
    setBaPos(posFromEvent(e));
  });
  baSlider.addEventListener("pointermove", function (e) {
    if (baDragging) setBaPos(posFromEvent(e));
  });
  ["pointerup", "pointercancel"].forEach(function (evt) {
    baSlider.addEventListener(evt, function () { baDragging = false; });
  });
  baSlider.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { e.preventDefault(); setBaPos(baPos - 4); }
    if (e.key === "ArrowRight") { e.preventDefault(); setBaPos(baPos + 4); }
    if (e.key === "Home") { e.preventDefault(); setBaPos(2); }
    if (e.key === "End") { e.preventDefault(); setBaPos(98); }
  });
  setBaPos(50);

  /* ---------- Форма записи + степпер ---------- */
  var form = document.getElementById("bookingForm");
  var successBlock = document.getElementById("bookingSuccess");
  var steps = document.querySelectorAll("#stepper .stepper__step");
  var fService = document.getElementById("fService");
  var fMaster = document.getElementById("fMaster");
  var fDate = document.getElementById("fDate");
  var fTime = document.getElementById("fTime");
  var fName = document.getElementById("fName");
  var fPhone = document.getElementById("fPhone");

  // минимальная дата — сегодня
  var today = new Date();
  var isoToday = today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");
  fDate.setAttribute("min", isoToday);

  function updateStepper() {
    var state = [
      fService.value !== "",
      fMaster.value !== "",
      fDate.value !== "" && fTime.value !== "",
      fName.value.trim().length >= 2 && fPhone.value.trim().length >= 5
    ];
    var current = state.findIndex(function (done) { return !done; });
    if (current === -1) current = 4; // всё заполнено — финальный шаг
    steps.forEach(function (step, i) {
      step.classList.toggle("is-done", i < current);
      step.classList.toggle("is-active", i === Math.min(current, 3));
    });
  }
  [fService, fMaster, fDate, fTime, fName, fPhone].forEach(function (field) {
    field.addEventListener("change", updateStepper);
    field.addEventListener("input", updateStepper);
  });
  updateStepper();

  function setFieldError(field, message) {
    var wrap = field.closest(".form-field");
    var errEl = wrap.querySelector(".form-field__error");
    if (message) {
      wrap.classList.add("is-invalid");
      errEl.textContent = message;
    } else {
      wrap.classList.remove("is-invalid");
      errEl.textContent = "";
    }
  }

  function validateForm() {
    var ok = true;
    if (!fService.value) { setFieldError(fService, "Выберите услугу"); ok = false; } else setFieldError(fService);
    if (!fMaster.value) { setFieldError(fMaster, "Выберите мастера"); ok = false; } else setFieldError(fMaster);
    if (!fDate.value) { setFieldError(fDate, "Укажите дату"); ok = false; }
    else if (fDate.value < isoToday) { setFieldError(fDate, "Дата не может быть в прошлом"); ok = false; }
    else setFieldError(fDate);
    if (!fTime.value) { setFieldError(fTime, "Выберите время"); ok = false; } else setFieldError(fTime);
    if (fName.value.trim().length < 2) { setFieldError(fName, "Введите имя (минимум 2 символа)"); ok = false; } else setFieldError(fName);
    var digits = fPhone.value.replace(/\D/g, "");
    if (digits.length < 10) { setFieldError(fPhone, "Введите корректный телефон"); ok = false; } else setFieldError(fPhone);
    return ok;
  }

  // простая маска телефона: оставляем цифры и базовые символы
  fPhone.addEventListener("input", function () {
    var digits = fPhone.value.replace(/\D/g, "").slice(0, 11);
    if (!digits) { fPhone.value = ""; return; }
    if (digits[0] === "8") digits = "7" + digits.slice(1);
    if (digits[0] !== "7") digits = "7" + digits;
    var p = "+7";
    if (digits.length > 1) p += " (" + digits.slice(1, 4);
    if (digits.length >= 4) p += ") " + digits.slice(4, 7);
    if (digits.length >= 7) p += "-" + digits.slice(7, 9);
    if (digits.length >= 9) p += "-" + digits.slice(9, 11);
    fPhone.value = p;
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateForm()) {
      var firstInvalid = form.querySelector(".form-field.is-invalid input, .form-field.is-invalid select");
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    var serviceText = fService.options[fService.selectedIndex].text;
    var masterText = fMaster.options[fMaster.selectedIndex].text;
    var dateText = fDate.value.split("-").reverse().join(".");
    document.getElementById("bookingSuccessText").textContent =
      fName.value.trim() + ", ждём вас " + dateText + " в " + fTime.value +
      ". Услуга: " + serviceText + ", мастер: " + masterText +
      ". Мы свяжемся с вами для подтверждения.";
    form.hidden = true;
    successBlock.hidden = false;
    steps.forEach(function (s) {
      s.classList.remove("is-active");
      s.classList.add("is-done");
    });
    successBlock.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
  });

  document.getElementById("bookingAgain").addEventListener("click", function () {
    form.reset();
    form.hidden = false;
    successBlock.hidden = true;
    form.querySelectorAll(".form-field").forEach(function (f) {
      f.classList.remove("is-invalid");
      f.querySelector(".form-field__error").textContent = "";
    });
    updateStepper();
    form.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
  });

  /* ---------- Чат-бот ---------- */
  var fab = document.getElementById("chatbotFab");
  var panel = document.getElementById("chatbotPanel");
  var closeBtn = document.getElementById("chatbotClose");
  var messages = document.getElementById("chatbotMessages");
  var chatForm = document.getElementById("chatbotForm");
  var chatInput = document.getElementById("chatbotInput");
  var quick = document.getElementById("chatbotQuick");
  var chatOpened = false;

  var botAnswers = [
    {
      keys: ["price", "цен", "стоим", "прайс", "сколько"],
      text: "Вот наши цены: женская стрижка — 2 500 ₽, мужская — 1 500 ₽, маникюр с гель-лаком — 2 200 ₽, педикюр — 3 200 ₽. Полный прайс — в разделе «Прайс» на сайте."
    },
    {
      keys: ["hours", "график", "время", "работа", "открыт", "когда"],
      text: "Мы работаем ежедневно с 10:00 до 21:00, без выходных и перерывов."
    },
    {
      keys: ["address", "адрес", "где", "находит", "добраться"],
      text: "Мы находимся по адресу: Москва, ул. Неоновая, 7. Вход с торца здания, есть парковка."
    },
    {
      keys: ["book", "запис", "бронь", "забронировать"],
      text: "С удовольствием! Заполните форму в разделе «Забронируйте время» — это займёт минуту. Или позвоните нам: +7 (495) 000-13-37."
    },
    {
      keys: ["мастер", "алина", "марк", "ева", "специалист"],
      text: "У нас три мастера: Алина (топ-стилист, колорист), Марк (барбер) и Ева (nail-мастер). Подробнее — в разделе «Мастера»."
    },
    {
      keys: ["привет", "здравств", "добрый", "hi", "hello"],
      text: "Здравствуйте! Рада вас видеть. Спросите про цены, график, адрес — или просто напишите, что вас интересует."
    }
  ];
  var fallbackAnswer = "Хм, не совсем поняла вопрос. Могу рассказать про цены, график работы, адрес или помочь с записью — просто нажмите кнопку ниже или напишите «записаться».";

  function scrollChat() {
    messages.scrollTop = messages.scrollHeight;
  }
  function addMessage(text, who) {
    var msg = document.createElement("div");
    msg.className = "chat-msg chat-msg--" + who;
    msg.textContent = text;
    messages.appendChild(msg);
    scrollChat();
  }
  function botReply(userText) {
    var typing = document.createElement("div");
    typing.className = "chat-msg chat-msg--bot chat-msg--typing";
    typing.innerHTML = "<i></i><i></i><i></i>";
    messages.appendChild(typing);
    scrollChat();
    var lower = userText.toLowerCase();
    var answer = fallbackAnswer;
    for (var i = 0; i < botAnswers.length; i++) {
      if (botAnswers[i].keys.some(function (k) { return lower.indexOf(k) !== -1; })) {
        answer = botAnswers[i].text;
        break;
      }
    }
    setTimeout(function () {
      typing.remove();
      addMessage(answer, "bot");
    }, prefersReducedMotion ? 100 : 700);
  }

  function openChat() {
    panel.hidden = false;
    fab.setAttribute("aria-expanded", "true");
    if (!chatOpened) {
      chatOpened = true;
      setTimeout(function () {
        addMessage("Привет! Я Неонка — виртуальный ассистент салона. Помогу с записью, ценами и адресом.", "bot");
      }, 300);
    }
    chatInput.focus();
  }
  function closeChat() {
    panel.hidden = true;
    fab.setAttribute("aria-expanded", "false");
  }
  fab.addEventListener("click", function () {
    if (panel.hidden) openChat(); else closeChat();
  });
  closeBtn.addEventListener("click", closeChat);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) closeChat();
  });

  chatForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = chatInput.value.trim();
    if (!text) return;
    addMessage(text, "user");
    chatInput.value = "";
    botReply(text);
  });

  quick.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-q]");
    if (!btn) return;
    addMessage(btn.textContent, "user");
    botReply(btn.getAttribute("data-q"));
  });
})();
