// ===== Гранитная мастерская — спокойная логика лендинга =====
(function () {
  "use strict";

  /* ---------- Плавное появление секций ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Маска телефона +7 (___) ___-__-__ ---------- */
  var phoneInput = document.getElementById("phone");
  var form = document.getElementById("callback-form");
  var errorEl = document.getElementById("form-error");
  var successEl = document.getElementById("form-success");

  function formatPhone(raw) {
    var digits = raw.replace(/\D/g, "");

    // Нормализуем первую цифру: 8 -> 7
    if (digits.charAt(0) === "8") {
      digits = "7" + digits.slice(1);
    }
    if (digits.charAt(0) !== "7") {
      digits = "7" + digits;
    }
    digits = digits.slice(0, 11);

    var result = "+7";
    if (digits.length > 1) {
      result += " (" + digits.slice(1, 4);
    }
    if (digits.length >= 4) {
      result += ") " + digits.slice(4, 7);
    }
    if (digits.length >= 7) {
      result += "-" + digits.slice(7, 9);
    }
    if (digits.length >= 9) {
      result += "-" + digits.slice(9, 11);
    }
    return result;
  }

  function digitsCount(value) {
    return value.replace(/\D/g, "").length;
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      if (digitsCount(phoneInput.value) === 0) {
        phoneInput.value = "";
        return;
      }
      phoneInput.value = formatPhone(phoneInput.value);
      if (errorEl) { errorEl.hidden = true; }
    });

    phoneInput.addEventListener("focus", function () {
      if (phoneInput.value === "") {
        phoneInput.value = "+7 (";
      }
    });

    phoneInput.addEventListener("blur", function () {
      if (digitsCount(phoneInput.value) <= 1) {
        phoneInput.value = "";
      }
    });
  }

  /* ---------- Отправка формы (демо) ---------- */
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var value = phoneInput ? phoneInput.value : "";
      if (digitsCount(value) < 11) {
        if (errorEl) { errorEl.hidden = false; }
        if (successEl) { successEl.hidden = true; }
        if (phoneInput) { phoneInput.focus(); }
        return;
      }

      if (errorEl) { errorEl.hidden = true; }
      if (successEl) { successEl.hidden = false; }

      // Мягко убираем форму — демо, реальная отправка не выполняется
      var button = form.querySelector("button[type='submit']");
      if (button) {
        button.disabled = true;
        button.textContent = "Заявка принята";
      }
      if (phoneInput) { phoneInput.disabled = true; }
    });
  }
})();
