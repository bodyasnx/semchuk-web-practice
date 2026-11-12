// Поведінка low-fi прототипу: сітка, меню, перерахунок порцій, форма.
// Звичайний скрипт (не модуль), щоб сторінки працювали і з file://.
(function () {
  'use strict';

  const GRID_KEY = 'wf-show-grid';
  const MIN_SERVINGS = 1;
  const MAX_SERVINGS = 20;

  function readGridPref() {
    try {
      return localStorage.getItem(GRID_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function saveGridPref(isOn) {
    try {
      localStorage.setItem(GRID_KEY, isOn ? '1' : '0');
    } catch (e) {
      // localStorage недоступний (приватний режим) — просто не запам'ятовуємо
    }
  }

  // Кнопка «Показати сітку»: накладає 12 (desktop) або 4 (mobile) колонки
  function initGrid() {
    const frame = document.querySelector('.wf-frame');
    const button = document.querySelector('[data-grid-toggle]');
    if (!frame || !button) return;

    const cols = parseInt(getComputedStyle(document.body).getPropertyValue('--cols'), 10) || 12;
    const overlay = document.createElement('div');
    overlay.className = 'wf-grid-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    for (let i = 1; i <= cols; i += 1) {
      const col = document.createElement('span');
      col.textContent = String(i);
      overlay.appendChild(col);
    }
    frame.appendChild(overlay);

    function apply(isOn) {
      document.body.classList.toggle('show-grid', isOn);
      button.setAttribute('aria-pressed', String(isOn));
      button.textContent = isOn ? 'Сховати сітку' : 'Показати сітку';
    }

    apply(readGridPref());
    button.addEventListener('click', function () {
      const isOn = !document.body.classList.contains('show-grid');
      apply(isOn);
      saveGridPref(isOn);
    });
  }

  // Кнопки, що відкривають/закривають блок (бургер-меню, панель фільтрів)
  function initToggles() {
    document.querySelectorAll('[data-toggle]').forEach(function (button) {
      const target = document.getElementById(button.getAttribute('aria-controls'));
      if (!target) return;
      button.addEventListener('click', function () {
        const isOpen = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!isOpen));
        target.hidden = isOpen;
      });
    });
  }

  // Правила округлення з розділу 8 ТЗ
  function roundAmount(value, unit) {
    switch (unit) {
      case 'г':
      case 'мл':
        return value > 100 ? Math.round(value / 5) * 5 : Math.round(value);
      case 'кг':
      case 'л':
        return Math.round(value * 10) / 10;
      case 'шт':
      case 'зубчик':
        return Math.max(0.5, Math.round(value * 2) / 2);
      case 'ст. л.':
      case 'ч. л.':
        return Math.round(value * 2) / 2;
      default:
        return value;
    }
  }

  function formatAmount(value) {
    return value.toLocaleString('uk-UA', { maximumFractionDigits: 1 });
  }

  // Перемикач порцій на сторінці рецепта
  function initServings() {
    document.querySelectorAll('[data-servings]').forEach(function (box) {
      const base = Number(box.getAttribute('data-servings'));
      const input = box.querySelector('input');
      const minus = box.querySelector('[data-step="-1"]');
      const plus = box.querySelector('[data-step="1"]');
      const status = box.querySelector('[data-servings-status]');
      const list = document.querySelector(box.getAttribute('data-target'));
      if (!input || !list) return;
      const amounts = list.querySelectorAll('[data-amount]');

      function render(rawValue, announce) {
        const parsed = Math.round(Number(rawValue));
        const servings = Number.isFinite(parsed)
          ? Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, parsed))
          : base;
        input.value = String(servings);
        amounts.forEach(function (el) {
          const scaled = (Number(el.dataset.amount) * servings) / base;
          el.textContent = formatAmount(roundAmount(scaled, el.dataset.unit));
        });
        minus.disabled = servings <= MIN_SERVINGS;
        plus.disabled = servings >= MAX_SERVINGS;
        if (announce && status) {
          status.textContent = 'Інгредієнти перераховано на ' + servings + ' порц.';
        }
      }

      box.querySelectorAll('[data-step]').forEach(function (button) {
        button.addEventListener('click', function () {
          render(Number(input.value) + Number(button.dataset.step), true);
        });
      });
      input.addEventListener('change', function () {
        render(input.value, true);
      });
      render(base, false);
    });
  }

  // Каталог: підставити запит із пошуку на головній (?q=...)
  function initPrefill() {
    const params = new URLSearchParams(window.location.search);
    document.querySelectorAll('[data-prefill]').forEach(function (field) {
      const value = params.get(field.getAttribute('data-prefill'));
      if (value) field.value = value;
    });
  }

  // «+ Додати інгредієнт» / «+ Додати крок»: копія першого рядка з новими id
  function initAddRows() {
    document.querySelectorAll('[data-add-row]').forEach(function (button) {
      const list = document.getElementById(button.getAttribute('data-add-row'));
      if (!list) return;
      button.addEventListener('click', function () {
        const rows = list.querySelectorAll('[data-row]');
        const num = rows.length + 1;
        const clone = rows[0].cloneNode(true);
        clone.querySelectorAll('[id]').forEach(function (el) {
          el.id = el.id.replace(/-\d+$/, '-' + num);
        });
        clone.querySelectorAll('label[for]').forEach(function (el) {
          el.htmlFor = el.htmlFor.replace(/-\d+$/, '-' + num);
        });
        clone.querySelectorAll('[data-num]').forEach(function (el) {
          el.textContent = String(num);
        });
        clone.querySelectorAll('input, textarea, select').forEach(function (el) {
          if (el.tagName === 'SELECT') el.selectedIndex = 0;
          else el.value = '';
          el.removeAttribute('required');
          el.removeAttribute('aria-invalid');
          el.removeAttribute('aria-describedby');
        });
        clone.querySelectorAll('.field-error, .req').forEach(function (el) {
          el.remove();
        });
        list.appendChild(clone);
        clone.querySelector('input, textarea').focus();
      });
    });
  }

  // Демо-валідація форми «Додати рецепт» (дані нікуди не надсилаються)
  function initForms() {
    document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
      const status = form.querySelector('[data-form-status]');
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        let firstInvalid = null;
        form.querySelectorAll('[required]').forEach(function (field) {
          const isEmpty = !field.value.trim();
          const error = document.getElementById(field.id + '-error');
          field.setAttribute('aria-invalid', String(isEmpty));
          if (error) error.textContent = isEmpty ? field.dataset.error || 'Заповніть це поле' : '';
          if (isEmpty && !firstInvalid) firstInvalid = field;
        });
        if (firstInvalid) {
          status.textContent = 'Форма містить помилки — перевірте позначені поля.';
          firstInvalid.focus();
        } else {
          status.textContent = 'Рецепт збережено (у прототипі дані нікуди не надсилаються).';
        }
      });
    });
  }

  initGrid();
  initToggles();
  initServings();
  initPrefill();
  initAddRows();
  initForms();
})();
