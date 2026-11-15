// Панель фільтрів. Значення приходять з адреси сторінки (через CatalogPage), тож компонент
// «керований»: він не зберігає фільтри сам, а повідомляє про зміну через onChange(patch).
import { useState } from 'react';
import SearchInput from './SearchInput.jsx';
import { CATEGORY_NAMES, REGION_NAMES } from '../../utils/labels.js';
import { TIME_OPTIONS } from '../../utils/catalog.js';

export default function Filters({ filters, activeCount, onChange, onReset, onApply }) {
  const [open, setOpen] = useState(false); // розгорнуто на телефоні; на desktop CSS показує панель завжди
  const [resetCount, setResetCount] = useState(0);

  function toggleCategory(value, checked) {
    const categories = checked
      ? [...filters.categories, value]
      : filters.categories.filter((item) => item !== value);
    onChange({ categories });
  }

  function handleSubmit(event) {
    event.preventDefault();
    // на телефоні після «Застосувати» згортаємо панель і показуємо результати
    if (window.matchMedia('(max-width: 1279px)').matches) {
      setOpen(false);
      onApply?.();
    }
  }

  function handleReset() {
    setResetCount((count) => count + 1); // новий key — поле пошуку створюється заново, без недодрукованого тексту
    onReset();
  }

  return (
    <aside className="catalog__filters" aria-labelledby="filters-title">
      <details className="filters" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
        <summary>
          <h2 id="filters-title">
            Фільтри<span className="filters__count">{activeCount ? ` · ${activeCount}` : ''}</span>
          </h2>
        </summary>
        <form className="form" role="search" onSubmit={handleSubmit}>
          <SearchInput
            key={resetCount}
            id="catalog-search"
            label="Пошук за назвою або інгредієнтом"
            placeholder="Наприклад, буряк"
            value={filters.q}
            onSearch={(q) => onChange({ q })}
          />
          <fieldset className="choice-group">
            <legend>Категорія</legend>
            {Object.entries(CATEGORY_NAMES).map(([value, name]) => (
              <span className="choice" key={value}>
                <input
                  id={`cat-${value}`}
                  name="category"
                  type="checkbox"
                  value={value}
                  checked={filters.categories.includes(value)}
                  onChange={(event) => toggleCategory(value, event.target.checked)}
                />{' '}
                <label htmlFor={`cat-${value}`}>{name}</label>
              </span>
            ))}
          </fieldset>
          <p>
            <label htmlFor="catalog-region">Регіон</label>
            <select id="catalog-region" name="region" value={filters.region} onChange={(event) => onChange({ region: event.target.value })}>
              <option value="">Усі регіони</option>
              {Object.entries(REGION_NAMES).map(([value, name]) => (
                <option key={value} value={value}>{name}</option>
              ))}
            </select>
          </p>
          <fieldset className="choice-group">
            <legend>Час приготування</legend>
            {TIME_OPTIONS.map((option) => (
              <span className="choice" key={option.value || 'any'}>
                <input
                  id={`time-${option.value || 'any'}`}
                  name="time"
                  type="radio"
                  value={option.value}
                  checked={filters.time === option.value}
                  onChange={() => onChange({ time: option.value })}
                />{' '}
                <label htmlFor={`time-${option.value || 'any'}`}>{option.label}</label>
              </span>
            ))}
          </fieldset>
          <p className="actions">
            <button className="btn btn--primary" type="submit">Застосувати</button>
            <button className="btn btn--secondary" type="button" onClick={handleReset}>Скинути</button>
          </p>
        </form>
      </details>
    </aside>
  );
}
