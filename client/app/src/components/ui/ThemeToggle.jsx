// Перемикач світлої / темної теми. Вибір зберігається через useLocalStorage,
// а поки людина нічого не обрала — діє налаштування системи (prefers-color-scheme).
import { useEffect, useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

export default function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('smak:theme', null); // 'light' | 'dark' | null
  const [systemDark, setSystemDark] = useState(() => darkQuery().matches);

  // Підписка на зміну теми системи; функція прибирання знімає слухача
  useEffect(() => {
    const query = darkQuery();
    const onChange = (event) => setSystemDark(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // Синхронізація з DOM: атрибут data-theme на <html> перемикає CSS-токени
  useEffect(() => {
    if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
  }, [theme]);

  const isDark = theme ? theme === 'dark' : systemDark;
  // Підпис — дія, яку виконає кнопка: у темній темі «Світла тема», у світлій — «Темна тема»
  const label = isDark ? 'Світла тема' : 'Темна тема';

  return (
    <button
      className="btn btn--secondary btn--icon"
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <span aria-hidden="true">◐</span>
    </button>
  );
}
