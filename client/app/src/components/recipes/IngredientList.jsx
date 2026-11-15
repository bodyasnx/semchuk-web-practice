// Список інгредієнтів, перерахованих на потрібну кількість порцій.
import { useMemo } from 'react';
import { scaleIngredients } from '../../utils/servings.js';
import { formatNumber, formatUnit } from '../../utils/labels.js';

export default function IngredientList({ ingredients, base, servings }) {
  // Перераховуємо лише коли змінилися порції чи рецепт, а не на кожен рендер
  const scaled = useMemo(() => scaleIngredients(ingredients, base, servings), [ingredients, base, servings]);

  return (
    <ul id="ingredients-list" className="ingredients">
      {scaled.map(({ name, amount, unit }) => (
        // назва унікальна в межах рецепта, порядок не змінюється — тож вона годиться як key
        <li key={name}>
          <span className="ingredient__name">{name}</span> —{' '}
          <span className="ingredient__amount">
            {amount === null
              ? 'за смаком'
              : <><data value={amount}>{formatNumber(amount)}</data> {formatUnit(unit, amount)}</>}
          </span>
        </li>
      ))}
    </ul>
  );
}
