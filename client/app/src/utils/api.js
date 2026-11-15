// Звернення до REST API (server/). Адреса сервера — змінна VITE_API_URL з client/app/.env;
// Vite підставляє її під час збірки. Без .env — локальний сервер на порту 3001.

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

export const NETWORK_ERROR = 'Не вдалося з\'єднатися із сервером. Перевірте інтернет або чи запущено API, і спробуйте ще раз.';

/** Помилка відповіді API: status — HTTP-код, details — помилки валідації [{ field, message }]. */
export class ApiError extends Error {
  constructor(message, status, details = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/** /api/recipes з параметрами пошуку (URLSearchParams) або без них. */
export function recipesUrl(params) {
  const query = params ? params.toString() : '';
  return `${API_URL}/api/recipes${query ? `?${query}` : ''}`;
}

export const recipeUrl = (id) => `${API_URL}/api/recipes/${encodeURIComponent(id)}`;

/** Відповідь з кодом 4xx/5xx → ApiError з повідомленням сервера (поле error) або загальним. */
export async function errorFromResponse(response) {
  let body = null;
  try {
    body = await response.json();
  } catch {
    // тіло не JSON (наприклад, сторінка помилки проксі) — візьмемо загальне повідомлення
  }
  return new ApiError(body?.error ?? `Сервер відповів кодом ${response.status}.`, response.status, body?.details ?? []);
}

/** Запит, що змінює дані (POST, PUT, DELETE). Повертає розібраний JSON або null для 204. */
async function send(method, url, data) {
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: data === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
  } catch {
    throw new ApiError(NETWORK_ERROR, 0);
  }
  if (!response.ok) throw await errorFromResponse(response);
  return response.status === 204 ? null : response.json();
}

export const createRecipe = (recipe) => send('POST', recipesUrl(), recipe);
export const updateRecipe = (id, recipe) => send('PUT', recipeUrl(id), recipe);
export const deleteRecipe = (id) => send('DELETE', recipeUrl(id));
export const sendContactMessage = (message) => send('POST', `${API_URL}/api/contact`, message);
