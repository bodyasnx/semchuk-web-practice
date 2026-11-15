// Завантаження рецептів. Зараз — статичний JSON, у ПР 8 тут з'явиться адреса REST API.

const DATA_URL = 'data/recipes.json';

let cache = null;

/** Повертає масив усіх рецептів. Результат кешується, тож повторні виклики не роблять запит. */
export async function getRecipes() {
  if (cache) return cache;
  let response;
  try {
    response = await fetch(DATA_URL);
  } catch {
    // fetch відхиляє проміс лише при мережевій помилці; її текст браузер дає англійською
    throw new Error('Перевірте з\'єднання з інтернетом і спробуйте ще раз.');
  }
  if (!response.ok) {
    throw new Error(`Сервер відповів кодом ${response.status}`);
  }
  cache = await response.json();
  return cache;
}

/** Повертає один рецепт за id або null, якщо такого немає. */
export async function getRecipe(id) {
  const recipes = await getRecipes();
  return recipes.find((recipe) => recipe.id === id) ?? null;
}
