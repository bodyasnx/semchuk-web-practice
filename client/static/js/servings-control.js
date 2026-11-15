// Перемикач порцій на сторінці рецепта: кнопки −/+, введення числа, межі 1–20,
// повідомлення при виправленні значення (висновок П3 юзабіліті-оцінки ПР 2), збереження в localStorage.
import { MIN_SERVINGS, MAX_SERVINGS, scaleIngredients, normalizeServings } from './servings.js';
import { servingsWord } from './labels.js';
import { readStorage, writeStorage } from './storage.js';
import { ingredientItemsHtml } from './render.js';

const storageKey = (id) => `smak:servings:${id}`;

const CORRECTIONS = {
  min: `Мінімум — ${MIN_SERVINGS} порція, значення виправлено.`,
  max: `Максимум — ${MAX_SERVINGS} порцій, значення виправлено.`,
  fraction: 'Кількість порцій — ціле число, значення округлено.',
  empty: `Введіть число від ${MIN_SERVINGS} до ${MAX_SERVINGS}.`,
};

function controlHtml(base) {
  return `<div class="servings">
      <label class="servings__label" for="servings">Кількість порцій</label>
      <button class="servings__btn" type="button" data-step="-1" aria-controls="servings" aria-label="Зменшити кількість порцій">−</button>
      <input class="servings__input" id="servings" name="servings" type="number" min="${MIN_SERVINGS}" max="${MAX_SERVINGS}" step="1" value="${base}" aria-describedby="servings-note">
      <button class="servings__btn" type="button" data-step="1" aria-controls="servings" aria-label="Збільшити кількість порцій">+</button>
    </div>
    <p class="servings-note" id="servings-note" aria-live="polite"></p>
    <p class="servings-status" id="servings-status" aria-live="polite"></p>
    <button class="btn btn--ghost servings-reset" type="button" data-action="reset-servings" hidden>Як у рецепті: ${base} ${servingsWord(base)}</button>`;
}

/** Монтує перемикач у [data-servings-slot] і перераховує список #ingredients-list. */
export function mountServings(recipe, root) {
  const slot = root.querySelector('[data-servings-slot]');
  const list = root.querySelector('#ingredients-list');
  if (!slot || !list) return;
  slot.innerHTML = controlHtml(recipe.servings);

  const input = slot.querySelector('#servings');
  const minus = slot.querySelector('[data-step="-1"]');
  const plus = slot.querySelector('[data-step="1"]');
  const note = slot.querySelector('#servings-note');
  const status = slot.querySelector('#servings-status');
  const reset = slot.querySelector('[data-action="reset-servings"]');
  let current = recipe.servings;

  function apply(value, { save = true } = {}) {
    current = value;
    input.value = String(value);
    minus.disabled = value <= MIN_SERVINGS;
    plus.disabled = value >= MAX_SERVINGS;
    reset.hidden = value === recipe.servings;
    list.innerHTML = ingredientItemsHtml(scaleIngredients(recipe.ingredients, recipe.servings, value));
    status.textContent = `Інгредієнти розраховано на ${value} ${servingsWord(value)}.`;
    if (save) writeStorage(storageKey(recipe.id), value);
  }

  function showCorrection(reason) {
    note.textContent = reason ? CORRECTIONS[reason] : '';
  }

  // Делегування: один обробник на всі кнопки блоку (−, +, «Як у рецепті»)
  slot.addEventListener('click', (event) => {
    const stepButton = event.target.closest('[data-step]');
    if (stepButton) {
      showCorrection(null);
      apply(current + Number(stepButton.dataset.step));
    } else if (event.target.closest('[data-action="reset-servings"]')) {
      showCorrection(null);
      apply(recipe.servings);
      input.focus();
    }
  });

  // Під час введення оновлюємо лише допустимі значення, не перебиваючи людину
  input.addEventListener('input', () => {
    const { value, reason } = normalizeServings(input.value, current);
    if (!reason && value !== current) {
      showCorrection(null);
      apply(value);
    }
  });

  // Після введення (Enter або вихід з поля) — виправляємо 0 → 1, 25 → 20 і пояснюємо чому
  input.addEventListener('change', () => {
    const { value, reason } = normalizeServings(input.value, current);
    showCorrection(reason);
    apply(value);
  });

  const saved = normalizeServings(readStorage(storageKey(recipe.id)) ?? '', recipe.servings);
  apply(saved.reason ? recipe.servings : saved.value, { save: false });
}
