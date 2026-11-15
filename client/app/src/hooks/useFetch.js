// Власний хук завантаження даних: { data, loading, error, refetch }.
// Компонент лише описує, ЩО завантажити, а стан запиту (і скасування) хук бере на себе.
// error — ApiError: error.message для людини, error.status — HTTP-код (404 → «не знайдено»).
import { useCallback, useEffect, useState } from 'react';
import { ApiError, NETWORK_ERROR, errorFromResponse } from '../utils/api.js';

export function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  // Лічильник спроб: refetch() збільшує його, і ефект нижче запускається знову
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // AbortController скасовує запит, якщо компонент зник або url змінився до відповіді,
    // тож застаріла відповідь не перезапише новіші дані. Попередні data лишаються на час
    // нового запиту — список не «блимає» лоадером при кожній зміні фільтра.
    const controller = new AbortController();
    setState((prev) => ({ data: prev.data, loading: true, error: null }));

    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw await errorFromResponse(response);
        return response.json();
      })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        // fetch відхиляє проміс з TypeError лише при мережевій помилці; її текст браузер дає англійською
        const apiError = error instanceof ApiError ? error : new ApiError(NETWORK_ERROR, 0);
        setState({ data: null, loading: false, error: apiError });
      });

    return () => controller.abort();
  }, [url, attempt]);

  const refetch = useCallback(() => setAttempt((count) => count + 1), []);

  return { ...state, refetch };
}
