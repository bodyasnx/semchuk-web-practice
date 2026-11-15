// Debounce для значення: повертає value, але лише через delay мс після ОСТАННЬОЇ зміни.
// Пошук не фільтрує список на кожну літеру, а чекає, поки людина перестане друкувати.
import { useEffect, useState } from 'react';

export function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    // Нова літера до спливання таймера → прибирання скасовує попередній таймер
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
