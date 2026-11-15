// Валідація форм «Додати рецепт» і «Контакти» та динамічні рядки інгредієнтів і кроків.
// Перевірка спирається на атрибути HTML (required, minlength, pattern, min/max) і Constraint
// Validation API, а повідомлення — власні, українською, під полем. Сервер (ПР 8) перевірятиме ще раз.
// Тексти виводяться через textContent, тому дані користувача ніколи не стають HTML-розміткою.
import { plural } from './labels.js';

const TEXT_TYPES = ['text', 'email', 'tel', 'search', 'textarea'];

/** Зрозуміле повідомлення для поля за його станом validity. */
function messageFor(field) {
  const { validity } = field;
  if (validity.customError) return field.validationMessage;
  if (validity.valueMissing) {
    if (field.type === 'checkbox') return 'Потрібна ваша згода.';
    if (field.type === 'radio') return 'Оберіть один із варіантів.';
    if (field.tagName === 'SELECT') return 'Оберіть варіант зі списку.';
    return 'Заповніть це поле.';
  }
  if (validity.typeMismatch && field.type === 'email') return 'Введіть email у форматі name@example.com.';
  if (validity.patternMismatch && field.type === 'tel') return 'Введіть телефон у форматі +380XXXXXXXXX: «+380» і 9 цифр без пробілів.';
  if (validity.tooShort) return `Мінімум ${field.minLength} символів (зараз ${field.value.length}).`;
  if (validity.tooLong) return `Максимум ${field.maxLength} символів.`;
  if (validity.badInput) return 'Введіть число.';
  if (validity.rangeUnderflow || validity.rangeOverflow) {
    return field.max ? `Введіть число від ${field.min} до ${field.max}.` : `Число не менше ${field.min}.`;
  }
  if (validity.stepMismatch) return field.step === '1' || field.step === '' ? 'Введіть ціле число.' : 'Не більше одного знака після коми.';
  return field.validationMessage;
}

/** Елемент, після якого показується помилка: група радіокнопок, рядок інгредієнта, абзац з полем. */
function errorAnchor(field) {
  return field.closest('.choice-group, .ingredient, .check, .step-row, p');
}

function errorId(field) {
  return field.type === 'radio' ? `${field.name}-error` : `${field.id}-error`;
}

function setDescribedBy(field, id, add) {
  const ids = (field.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((item) => item && item !== id);
  if (add) ids.unshift(id);
  if (ids.length) field.setAttribute('aria-describedby', ids.join(' '));
  else field.removeAttribute('aria-describedby');
}

function groupOf(field) {
  return field.type === 'radio' ? [...field.form.querySelectorAll(`input[type="radio"][name="${field.name}"]`)] : [field];
}

function showError(field, message) {
  const id = errorId(field);
  let error = document.getElementById(id);
  if (!error) {
    error = document.createElement('span'); // span, бо поле часто лежить у <p>, а <p> у <p> вкладати не можна
    error.className = 'field__error';
    error.id = id;
    errorAnchor(field)?.append(error);
  }
  error.textContent = message;
  groupOf(field).forEach((item) => {
    item.setAttribute('aria-invalid', 'true');
    setDescribedBy(item, id, true);
  });
}

function clearError(field) {
  const id = errorId(field);
  document.getElementById(id)?.remove();
  groupOf(field).forEach((item) => {
    item.removeAttribute('aria-invalid');
    setDescribedBy(item, id, false);
  });
}

/** Перевіряє одне поле; повертає true, якщо воно коректне. */
function validateField(field) {
  // required пропускає рядок із самих пробілів — це окрема перевірка
  if (TEXT_TYPES.includes(field.type) && field.value && !field.value.trim()) {
    field.setCustomValidity('Поле не може складатися лише з пробілів.');
  } else {
    field.setCustomValidity('');
  }
  if (field.validity.valid) {
    clearError(field);
    return true;
  }
  showError(field, messageFor(field));
  return false;
}

/**
 * Підключає валідацію: помилки з'являються після першої взаємодії з полем (а не одразу при відкритті)
 * і оновлюються під час введення; на submit — перевірка всіх полів і фокус на першому помилковому.
 */
function initValidation(form, { onSuccess }) {
  form.noValidate = true; // вимикаємо вбудовані підказки браузера, показуємо власні
  const status = form.querySelector('.form-status');
  const touched = new WeakSet();
  let submitted = false;

  const fields = () => [...form.elements].filter((element) => element.willValidate && element.type !== 'submit');

  // Делегування: один обробник на всю форму, а не на кожне поле (поля ще й додаються динамічно)
  const onEdit = (event) => {
    const field = event.target;
    if (!field.willValidate) return;
    touched.add(field);
    if (submitted || document.getElementById(errorId(field))) validateField(field);
  };
  form.addEventListener('input', onEdit);
  form.addEventListener('change', onEdit);
  form.addEventListener('focusout', (event) => {
    if (touched.has(event.target)) validateField(event.target);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitted = true;
    const invalid = fields().filter((field) => !validateField(field));
    if (invalid.length) {
      status.hidden = false;
      status.className = 'form-status form-status--error';
      status.textContent = `Перевірте форму: ${invalid.length} ${plural(invalid.length, ['поле потребує', 'поля потребують', 'полів потребують'])} виправлення.`;
      invalid[0].focus();
      return;
    }
    const message = onSuccess(new FormData(form));
    form.reset();
    fields().forEach(clearError);
    submitted = false;
    status.hidden = false;
    status.className = 'form-status form-status--success';
    status.textContent = message;
    status.focus();
  });

  form.addEventListener('reset', () => {
    status.hidden = true;
  });
}

/**
 * Динамічні рядки (інгредієнти, кроки): «+ Додати» і «Видалити» з перенумерацією id і підписів.
 * Перший рядок обов'язковий і не видаляється.
 */
function initRows(container, { addLabel, itemName, maxRows = 30 }) {
  const rows = () => [...container.querySelectorAll(':scope > [data-row]')];
  const initialCount = rows().length;
  const template = rows()[rows().length - 1].cloneNode(true); // чистий необов'язковий рядок

  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'btn btn--secondary rows__add';
  addButton.textContent = `+ ${addLabel}`;
  const live = document.createElement('p');
  live.className = 'visually-hidden';
  live.setAttribute('aria-live', 'polite');
  container.after(addButton, live);

  function removeButtonFor(row) {
    let button = row.querySelector('[data-action="remove-row"]');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn--ghost row-remove';
      button.dataset.action = 'remove-row';
      button.textContent = 'Видалити';
      row.append(button);
    }
    return button;
  }

  function renumber() {
    rows().forEach((row, index) => {
      const number = index + 1;
      row.querySelectorAll('[data-num]').forEach((element) => { element.textContent = String(number); });
      const fix = (value) => value.replace(/-\d+(-error)?$/, `-${number}$1`);
      row.querySelectorAll('[id]').forEach((element) => { element.id = fix(element.id); });
      row.querySelectorAll('label[for]').forEach((label) => { label.htmlFor = fix(label.htmlFor); });
      row.querySelectorAll('[aria-describedby]').forEach((element) => {
        element.setAttribute('aria-describedby', element.getAttribute('aria-describedby').split(' ').map(fix).join(' '));
      });
      if (index > 0) removeButtonFor(row).setAttribute('aria-label', `Видалити ${itemName} ${number}`);
    });
    addButton.disabled = rows().length >= maxRows;
  }

  addButton.addEventListener('click', () => {
    const row = template.cloneNode(true);
    container.append(row);
    renumber();
    row.querySelector('input, textarea').focus();
    live.textContent = `Додано ${itemName} ${rows().length}.`;
  });

  // Делегування: кнопки «Видалити» з'являються й зникають, тому слухаємо контейнер
  container.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="remove-row"]');
    if (!button) return;
    const row = button.closest('[data-row]');
    const index = rows().indexOf(row);
    row.remove();
    renumber();
    const focusTarget = rows()[Math.max(0, index - 1)]?.querySelector('input, textarea') ?? addButton;
    focusTarget.focus();
    live.textContent = `${itemName[0].toUpperCase()}${itemName.slice(1)} видалено.`;
  });

  renumber();

  /** Після успішного надсилання — повернути початкову кількість рядків. */
  return function resetRows() {
    rows().slice(initialCount).forEach((row) => row.remove());
    renumber();
  };
}

export function initAddRecipeForm() {
  const form = document.querySelector('.form');
  if (!form) return;
  const resetIngredients = initRows(document.getElementById('ingredient-rows'), { addLabel: 'Додати інгредієнт', itemName: 'інгредієнт' });
  const resetSteps = initRows(document.getElementById('step-rows'), { addLabel: 'Додати крок', itemName: 'крок' });

  initValidation(form, {
    onSuccess(data) {
      const title = data.get('title').trim();
      const ingredients = data.getAll('ingredientName').filter((name) => name.trim()).length;
      const steps = data.getAll('steps').filter((step) => step.trim()).length;
      resetIngredients();
      resetSteps();
      return `Рецепт «${title}» збережено: ${ingredients} інгр., ${steps} кр. `
        + 'Поки що це демонстрація — надсилання на сервер з\'явиться в ПР 8.';
    },
  });
}

export function initContactsForm() {
  const form = document.querySelector('.form');
  if (!form) return;
  initValidation(form, {
    onSuccess(data) {
      return `Дякуємо, ${data.get('name').trim()}! Повідомлення прийнято. `
        + 'Поки що це демонстрація — надсилання на сервер з\'явиться в ПР 8.';
    },
  });
}
