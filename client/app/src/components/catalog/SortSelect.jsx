import { SORT_OPTIONS } from '../../utils/catalog.js';

/** Сортування застосовується одразу при виборі, тому кнопка «Сортувати» в React-версії не потрібна. */
export default function SortSelect({ value, onChange }) {
  return (
    <form className="sort" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="catalog-sort">Сортування</label>
      <select id="catalog-sort" name="sort" value={value} onChange={(event) => onChange(event.target.value)}>
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </form>
  );
}
