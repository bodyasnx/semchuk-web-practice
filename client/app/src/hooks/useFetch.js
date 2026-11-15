// Власний хук завантаження даних: { data, loading, error, refetch }.
// Компонент лише описує, ЩО завантажити, а стан запиту (і скасування) хук бере на себе.
import { useCallback, useEffect, useState } from 'react';

const NETWORK_ERROR = 'Перевірте з\'єднання з інтернетом і спробуйте ще раз.';

export function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  // Лічильник спроб: refetch() збільшує його, і ефект нижче запускається знову
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // AbortController скасовує запит, якщо компонент зник або url змінився до відповіді,
    // тож застаріла відповідь не перезапише новіші дані
    const controller = new AbortController();
    setState((prev) => ({ data: prev.data, loading: true, error: null }));

    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Сервер відповів кодом ${response.status}.`);
        return response.json();
      })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        // fetch відхиляє проміс з TypeError лише при мережевій помилці; її текст браузер дає англійською
        const message = error instanceof TypeError ? NETWORK_ERROR : error.message;
        setState({ data: null, loading: false, error: new Error(message) });
      });

    return () => controller.abort();
  }, [url, attempt]);

  const refetch = useCallback(() => setAttempt((count) => count + 1), []);

  return { ...state, refetch };
}
