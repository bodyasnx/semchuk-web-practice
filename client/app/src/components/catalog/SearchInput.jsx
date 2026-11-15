// Поле пошуку з debounce: текст оновлюється одразу (керований input),
// а onSearch викликається лише через delay мс після останньої літери.
import { useEffect, useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce.js';

export default function SearchInput({ id, label, value, onSearch, delay = 300, placeholder }) {
  const [text, setText] = useState(value);
  const debounced = useDebounce(text, delay);

  // Запит змінився ззовні (кнопка «Скинути», посилання в меню) — оновлюємо поле
  useEffect(() => {
    setText(value);
  }, [value]);

  // Залежність лише debounced: ефект спрацьовує, коли людина перестала друкувати
  useEffect(() => {
    if (debounced !== value) onSearch(debounced);
  }, [debounced]);

  return (
    <p>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name="q"
        type="search"
        placeholder={placeholder}
        maxLength={100}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
    </p>
  );
}
