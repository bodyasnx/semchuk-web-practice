// Перемикач порцій: кнопки −/+, введення числа, межі 1–20 і повідомлення, коли значення виправлено
// (висновок П3 юзабіліті-оцінки ПР 2). Число порцій — стан батька (value/onChange), а тут живе лише
// те, що потрібно самому полю: чернетка, яку людина зараз друкує, і підказка про виправлення.
import { useRef, useState } from 'react';
import { MIN_SERVINGS, MAX_SERVINGS, normalizeServings } from '../../utils/servings.js';
import { servingsWord } from '../../utils/labels.js';

const CORRECTIONS = {
  min: `Мінімум — ${MIN_SERVINGS} порція, значення виправлено.`,
  max: `Максимум — ${MAX_SERVINGS} порцій, значення виправлено.`,
  fraction: 'Кількість порцій — ціле число, значення округлено.',
  empty: `Введіть число від ${MIN_SERVINGS} до ${MAX_SERVINGS}.`,
};

export default function ServingsControl({ base, value, onChange }) {
  // draft — текст під час введення (може бути порожнім чи «0»); null — показуємо саме value.
  // Похідне значення обчислюємо під час рендеру, а не копіюємо через useEffect: так поле
  // ніколи не відстає від value на один рендер.
  const [draft, setDraft] = useState(null);
  const [note, setNote] = useState('');
  const inputRef = useRef(null);
  const text = draft ?? String(value);

  function step(delta) {
    setNote('');
    setDraft(null);
    onChange(value + delta);
  }

  // Під час введення приймаємо лише допустимі значення, не перебиваючи людину
  function handleInput(event) {
    setDraft(event.target.value);
    const result = normalizeServings(event.target.value, value);
    if (!result.reason && result.value !== value) {
      setNote('');
      onChange(result.value);
    }
  }

  // Після введення (Enter або вихід з поля) — виправляємо 0 → 1, 25 → 20 і пояснюємо чому
  function commit() {
    const result = normalizeServings(text, value);
    setNote(result.reason ? CORRECTIONS[result.reason] : '');
    setDraft(null);
    onChange(result.value);
  }

  return (
    <>
      <div className="servings">
        <label className="servings__label" htmlFor="servings">Кількість порцій</label>
        <button
          className="servings__btn"
          type="button"
          aria-controls="servings"
          aria-label="Зменшити кількість порцій"
          disabled={value <= MIN_SERVINGS}
          onClick={() => step(-1)}
        >
          −
        </button>
        <input
          className="servings__input"
          id="servings"
          ref={inputRef}
          name="servings"
          type="number"
          min={MIN_SERVINGS}
          max={MAX_SERVINGS}
          step="1"
          value={text}
          aria-describedby="servings-note"
          onChange={handleInput}
          onBlur={commit}
          onKeyDown={(event) => { if (event.key === 'Enter') commit(); }}
        />
        <button
          className="servings__btn"
          type="button"
          aria-controls="servings"
          aria-label="Збільшити кількість порцій"
          disabled={value >= MAX_SERVINGS}
          onClick={() => step(1)}
        >
          +
        </button>
      </div>
      <p className="servings-note" id="servings-note" aria-live="polite">{note}</p>
      <p className="servings-status" id="servings-status" aria-live="polite">
        Інгредієнти розраховано на {value} {servingsWord(value)}.
      </p>
      <button
        className="btn btn--ghost servings-reset"
        type="button"
        hidden={value === base}
        onClick={() => { setNote(''); setDraft(null); onChange(base); inputRef.current.focus(); }}
      >
        Як у рецепті: {base} {servingsWord(base)}
      </button>
    </>
  );
}
