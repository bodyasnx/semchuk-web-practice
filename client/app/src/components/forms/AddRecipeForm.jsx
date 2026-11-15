// Керована форма «Додати рецепт» з динамічними рядками інгредієнтів і кроків.
// Кожен рядок має власний key (не номер!): після видалення рядка 2 рядок 3 зберігає свій key,
// тому React не переносить у нього чужий текст, а помилки й «торкання» лишаються при своєму рядку.
// Одна форма і для створення (POST /api/recipes), і для редагування (PUT /api/recipes/:id) — проп recipe.
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Field, { Checkbox, FieldError, Required, a11yProps } from './Field.jsx';
import FormStatus from './FormStatus.jsx';
import { useForm } from '../../hooks/useForm.js';
import { validateRecipe, UNITS } from '../../utils/validation.js';
import { createRecipe, updateRecipe } from '../../utils/api.js';
import { CATEGORY_NAMES, REGION_NAMES, DIFFICULTY_NAMES } from '../../utils/labels.js';

const MAX_ROWS = 30;
const INITIAL_ROWS = 3;

let lastKey = 0;
const newKey = () => {
  lastKey += 1;
  return `row-${lastKey}`;
};
const newIngredient = () => ({ key: newKey(), name: '', amount: '', unit: 'г' });
const newStep = () => ({ key: newKey(), text: '' });

/** Порожня форма або (для редагування) форма, заповнена даними рецепта; поля input — рядки. */
function createInitialValues(recipe) {
  if (!recipe) {
    return {
      title: '',
      category: '',
      region: '',
      description: '',
      servings: '4',
      cookTime: '',
      difficulty: '',
      image: null,
      ingredients: Array.from({ length: INITIAL_ROWS }, newIngredient),
      steps: Array.from({ length: INITIAL_ROWS }, newStep),
      rights: false,
    };
  }
  return {
    title: recipe.title,
    category: recipe.category,
    region: recipe.region ?? '',
    description: recipe.description ?? '',
    servings: String(recipe.servings),
    cookTime: String(recipe.cookTime),
    difficulty: recipe.difficulty,
    image: null,
    ingredients: recipe.ingredients.map((item) => ({
      key: newKey(), name: item.name, amount: item.amount === null ? '' : String(item.amount), unit: item.unit,
    })),
    steps: recipe.steps.map((text) => ({ key: newKey(), text })),
    rights: false,
  };
}

/**
 * Значення форми → тіло запиту до API: числа замість рядків, без порожніх рядків інгредієнтів і кроків.
 * rowKeys — key рядків у тому ж порядку, що й у масивах запиту: сервер називає поле за індексом
 * («ingredients.1.amount»), а форма — за key рядка, тож так ми знайдемо, під яким полем показати помилку.
 */
function toPayload(values) {
  const ingredientRows = values.ingredients.filter((row) => row.name.trim() || row.amount !== '');
  const stepRows = values.steps.filter((row) => row.text.trim());
  return {
    payload: {
      title: values.title.trim(),
      category: values.category,
      region: values.region || null,
      description: values.description.trim(),
      servings: Number(values.servings),
      cookTime: Number(values.cookTime),
      difficulty: values.difficulty,
      ingredients: ingredientRows.map((row) => ({
        name: row.name.trim(),
        amount: row.unit === 'за смаком' || row.amount === '' ? null : Number(row.amount),
        unit: row.unit,
      })),
      steps: stepRows.map((row) => row.text.trim()),
    },
    rowKeys: { ingredients: ingredientRows.map((row) => row.key), steps: stepRows.map((row) => row.key) },
  };
}

/** Помилки сервера [{ field: 'ingredients.1.amount', … }] → { 'ingredients.<key>.amount': … }. */
function mapServerErrors(details, values) {
  const { rowKeys } = toPayload(values);
  const firstKey = (list) => rowKeys[list][0] ?? values[list][0]?.key;
  return Object.fromEntries(details.map(({ field, message }) => {
    const [list, index, ...rest] = field.split('.');
    if (list !== 'ingredients' && list !== 'steps') return [field, message];
    // помилка всього списку («додайте хоча б один») — показуємо під першим рядком
    if (index === undefined) return [list === 'ingredients' ? `ingredients.${firstKey(list)}.name` : `steps.${firstKey(list)}`, message];
    return [[list, rowKeys[list][Number(index)], ...rest].join('.'), message];
  }));
}

export default function AddRecipeForm({ recipe = null }) {
  const navigate = useNavigate();
  const isEdit = Boolean(recipe);
  const form = useForm({
    createInitialValues: () => createInitialValues(recipe),
    validate: validateRecipe,
    mapServerErrors,
    // POST або PUT; після успіху — на сторінку рецепта з повідомленням (форма тоді вже не потрібна)
    async onSubmit(values) {
      const { payload } = toPayload(values);
      const saved = isEdit ? await updateRecipe(recipe.id, payload) : await createRecipe(payload);
      navigate(`/recipes/${encodeURIComponent(saved.id)}`, {
        state: { notice: `Рецепт «${saved.title}» ${isEdit ? 'оновлено' : 'збережено'}.` },
      });
      return undefined;
    },
  });
  const { values, setValues, setField, touch, errorFor } = form;

  const [announcement, setAnnouncement] = useState('');
  const focusTarget = useRef(null); // що сфокусувати після додавання/видалення рядка
  const addButtons = { ingredients: useRef(null), steps: useRef(null) };

  // Після зміни кількості рядків DOM уже оновлено — переводимо фокус на потрібне поле
  useEffect(() => {
    const target = focusTarget.current;
    if (!target) return;
    focusTarget.current = null;
    if (target.button) addButtons[target.button].current?.focus();
    else form.formRef.current?.querySelector(`[data-row-key="${target.key}"] :is(input, textarea)`)?.focus();
  });

  const bind = (name) => ({
    name,
    value: values[name],
    onChange: (event) => setField(name, event.target.value),
    onBlur: () => touch(name),
  });

  /** Оновлює одне поле одного рядка списку (ingredients або steps), не змінюючи інші рядки. */
  function updateRow(list, key, patch) {
    setValues((prev) => ({
      ...prev,
      [list]: prev[list].map((row) => (row.key === key ? { ...row, ...patch } : row)),
    }));
    form.clearServerError(`${list}.${key}`);
  }

  function addRow(list, itemName) {
    const row = list === 'ingredients' ? newIngredient() : newStep();
    setValues((prev) => ({ ...prev, [list]: [...prev[list], row] }));
    focusTarget.current = { key: row.key };
    setAnnouncement(`Додано ${itemName} ${values[list].length + 1}.`);
  }

  function removeRow(list, key, itemName) {
    const rows = values[list];
    const index = rows.findIndex((row) => row.key === key);
    setValues((prev) => ({ ...prev, [list]: prev[list].filter((row) => row.key !== key) }));
    const previous = rows[index - 1];
    focusTarget.current = previous ? { key: previous.key } : { button: list };
    setAnnouncement(`${itemName[0].toUpperCase()}${itemName.slice(1)} видалено.`);
  }

  return (
    <form className="form" ref={form.formRef} noValidate onSubmit={form.handleSubmit}>
      <fieldset>
        <legend>1. Основне про страву</legend>
        <Field id="title" label="Назва страви" required hint="Від 3 до 100 символів." error={errorFor('title')}>
          {(a11y) => <input {...a11y} {...bind('title')} type="text" required minLength={3} maxLength={100} />}
        </Field>
        <Field id="category" label="Категорія" required hint="Розділ каталогу, у якому з'явиться рецепт." error={errorFor('category')}>
          {(a11y) => (
            <select {...a11y} {...bind('category')} required>
              <option value="">Оберіть категорію</option>
              {Object.entries(CATEGORY_NAMES).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
            </select>
          )}
        </Field>
        {/* id/name не «region»: Chrome вважає це значенням autocomplete (адреса) і показує Issue */}
        <Field id="recipe-region" label="Регіон">
          {(a11y) => (
            <select {...a11y} {...bind('region')} name="recipeRegion">
              <option value="">Не вказано</option>
              {Object.entries(REGION_NAMES).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
            </select>
          )}
        </Field>
        <Field id="description" label="Короткий опис" hint={`До 300 символів (зараз ${values.description.length}).`} error={errorFor('description')}>
          {(a11y) => <textarea {...a11y} {...bind('description')} rows={3} maxLength={300} />}
        </Field>
        <Field
          id="servings-base"
          label="Базова кількість порцій"
          required
          hint="Число від 1 до 20 — на цю кількість розраховані інгредієнти нижче."
          error={errorFor('servings')}
        >
          {(a11y) => <input {...a11y} {...bind('servings')} type="number" required min={1} max={20} step={1} />}
        </Field>
        <Field id="cook-time" label="Час приготування, хв" required error={errorFor('cookTime')}>
          {(a11y) => <input {...a11y} {...bind('cookTime')} type="number" required min={1} max={1440} step={1} />}
        </Field>
        <fieldset className="choice-group">
          <legend>Складність <Required /></legend>
          {Object.entries(DIFFICULTY_NAMES).map(([value, name], index) => (
            <span className="choice" key={value}>
              <input
                {...a11yProps(`difficulty-${value}`, errorFor('difficulty'))}
                aria-describedby={errorFor('difficulty') ? 'difficulty-error' : undefined}
                name="difficulty"
                type="radio"
                value={value}
                required={index === 0}
                checked={values.difficulty === value}
                onChange={() => { setField('difficulty', value); touch('difficulty'); }}
              />{' '}
              <label htmlFor={`difficulty-${value}`}>{name}</label>
            </span>
          ))}
          <FieldError id="difficulty-error" message={errorFor('difficulty')} />
        </fieldset>
        <Field id="image" label="Фото страви" hint="WebP, JPEG або PNG, до 2 МБ. Лише власне фото або з вільною ліцензією. Поки що фото не надсилається на сервер — рецепт збережеться з орнаментом замість фото." error={errorFor('image')}>
          {(a11y) => (
            // Файлове поле в React не можна зробити керованим (value), тому лише читаємо вибраний файл;
            // key змінюється після успішного надсилання — поле створюється заново і очищається
            <input
              {...a11y}
              key={form.resetCount}
              name="image"
              type="file"
              accept="image/webp,image/jpeg,image/png"
              onChange={(event) => { setField('image', event.target.files[0] ?? null); touch('image'); }}
            />
          )}
        </Field>
      </fieldset>

      <fieldset>
        <legend>2. Інгредієнти</legend>
        <p id="ingredients-hint">
          Кількість вказуйте на базову кількість порцій — сайт сам перерахує її.
          Для солі й спецій оберіть одиницю «за смаком» і залиште кількість порожньою.
        </p>
        <div className="rows" id="ingredient-rows">
          {values.ingredients.map((row, index) => {
            const number = index + 1;
            const path = `ingredients.${row.key}`;
            const nameError = errorFor(`${path}.name`);
            const amountError = errorFor(`${path}.amount`);
            return (
              <fieldset className="ingredient" key={row.key} data-row-key={row.key}>
                <legend>Інгредієнт {number}{index === 0 && <> <Required /></>}</legend>
                <label htmlFor={`ing-name-${number}`}>Назва</label>
                <input
                  {...a11yProps(`ing-name-${number}`, nameError)}
                  name="ingredientName"
                  type="text"
                  required={index === 0}
                  minLength={2}
                  maxLength={60}
                  value={row.name}
                  onChange={(event) => updateRow('ingredients', row.key, { name: event.target.value })}
                  onBlur={() => touch(`${path}.name`)}
                />
                <label htmlFor={`ing-amount-${number}`}>Кількість</label>
                <input
                  {...a11yProps(`ing-amount-${number}`, amountError, 'ingredients-hint')}
                  name="ingredientAmount"
                  type="number"
                  min={0}
                  max={10000}
                  step={0.1}
                  value={row.amount}
                  onChange={(event) => updateRow('ingredients', row.key, { amount: event.target.value })}
                  onBlur={() => touch(`${path}.amount`)}
                />
                <label htmlFor={`ing-unit-${number}`}>Одиниця</label>
                <select
                  id={`ing-unit-${number}`}
                  name="ingredientUnit"
                  value={row.unit}
                  onChange={(event) => updateRow('ingredients', row.key, { unit: event.target.value })}
                >
                  {UNITS.map((unit) => <option key={unit}>{unit}</option>)}
                </select>
                {index > 0 && (
                  <button
                    className="btn btn--ghost row-remove"
                    type="button"
                    aria-label={`Видалити інгредієнт ${number}`}
                    onClick={() => removeRow('ingredients', row.key, 'інгредієнт')}
                  >
                    Видалити
                  </button>
                )}
                <FieldError id={`ing-name-${number}-error`} message={nameError} />
                <FieldError id={`ing-amount-${number}-error`} message={amountError} />
              </fieldset>
            );
          })}
        </div>
        <button
          ref={addButtons.ingredients}
          className="btn btn--secondary rows__add"
          type="button"
          disabled={values.ingredients.length >= MAX_ROWS}
          onClick={() => addRow('ingredients', 'інгредієнт')}
        >
          + Додати інгредієнт
        </button>
      </fieldset>

      <fieldset>
        <legend>3. Кроки приготування</legend>
        <p id="steps-hint">Один крок — одна дія, у порядку виконання.</p>
        <ol className="rows step-rows" id="step-rows">
          {values.steps.map((row, index) => {
            const number = index + 1;
            const error = errorFor(`steps.${row.key}`);
            return (
              <li className="step-row" key={row.key} data-row-key={row.key}>
                <label htmlFor={`step-${number}`}>Крок {number}{index === 0 && <> <Required /></>}</label>
                <textarea
                  {...a11yProps(`step-${number}`, error, index === 0 && 'steps-hint')}
                  name="steps"
                  rows={2}
                  required={index === 0}
                  minLength={10}
                  maxLength={500}
                  value={row.text}
                  onChange={(event) => updateRow('steps', row.key, { text: event.target.value })}
                  onBlur={() => touch(`steps.${row.key}`)}
                />
                {index > 0 && (
                  <button
                    className="btn btn--ghost row-remove"
                    type="button"
                    aria-label={`Видалити крок ${number}`}
                    onClick={() => removeRow('steps', row.key, 'крок')}
                  >
                    Видалити
                  </button>
                )}
                <FieldError id={`step-${number}-error`} message={error} />
              </li>
            );
          })}
        </ol>
        <button
          ref={addButtons.steps}
          className="btn btn--secondary rows__add"
          type="button"
          disabled={values.steps.length >= MAX_ROWS}
          onClick={() => addRow('steps', 'крок')}
        >
          + Додати крок
        </button>
      </fieldset>
      <p className="visually-hidden" aria-live="polite">{announcement}</p>

      <Checkbox
        id="rights"
        name="rights"
        label="Підтверджую, що це мій рецепт або я маю право ним поділитися"
        required
        checked={values.rights}
        error={errorFor('rights')}
        onChange={(checked) => { setField('rights', checked); touch('rights'); }}
      />

      <p className="actions">
        <button className="btn btn--primary" type="submit" disabled={form.pending} aria-busy={form.pending}>
          {form.pending ? 'Збереження…' : isEdit ? 'Зберегти зміни' : 'Зберегти рецепт'}
        </button>
        <Link className="btn btn--secondary" to={isEdit ? `/recipes/${encodeURIComponent(recipe.id)}` : '/recipes'}>Скасувати</Link>
      </p>
      <FormStatus status={form.status} statusRef={form.statusRef} />
    </form>
  );
}
