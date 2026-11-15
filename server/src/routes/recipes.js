// CRUD рецептів: /api/recipes
import { Router } from 'express';
import { readCollection, updateCollection } from '../store.js';
import { queryRecipes } from '../lib/query.js';
import { uniqueId } from '../lib/slug.js';

const router = Router();
const NOT_FOUND = { error: 'Рецепт не знайдено.' };

/** Поля, які клієнт може задати; решту (id, createdAt, фото) встановлює сервер. */
function pickRecipe(body) {
  const {
    title, category, region, description, servings, cookTime, difficulty, ingredients, steps,
  } = body;
  return { title, category, region, description, servings, cookTime, difficulty, ingredients, steps };
}

function isRecipeBody(body) {
  return body !== null && typeof body === 'object' && !Array.isArray(body) && typeof body.title === 'string';
}

// GET /api/recipes?q=&category=&region=&time=&sort= → 200 і масив рецептів
router.get('/', async (req, res) => {
  try {
    const recipes = await readCollection('recipes');
    res.json(queryRecipes(recipes, req.query));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Внутрішня помилка сервера.' });
  }
});

// GET /api/recipes/:id → 200 і рецепт або 404
router.get('/:id', async (req, res) => {
  try {
    const recipes = await readCollection('recipes');
    const recipe = recipes.find((item) => item.id === req.params.id);
    if (!recipe) return res.status(404).json(NOT_FOUND);
    return res.json(recipe);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Внутрішня помилка сервера.' });
  }
});

// POST /api/recipes → 201, заголовок Location і створений рецепт; 400 — некоректне тіло
router.post('/', async (req, res) => {
  if (!isRecipeBody(req.body)) return res.status(400).json({ error: 'Тіло запиту має бути JSON-об\'єктом рецепта.' });
  try {
    const recipe = await updateCollection('recipes', (recipes) => {
      const created = {
        id: uniqueId(req.body.title, new Set(recipes.map((item) => item.id))),
        ...pickRecipe(req.body),
        image: null,
        imageAlt: '',
        imageCredit: null,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      return { items: [...recipes, created], result: created };
    });
    return res.status(201).location(`/api/recipes/${recipe.id}`).json(recipe);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Внутрішня помилка сервера.' });
  }
});

// PUT /api/recipes/:id → 200 і оновлений рецепт; 404 — немає такого; 400 — некоректне тіло
router.put('/:id', async (req, res) => {
  if (!isRecipeBody(req.body)) return res.status(400).json({ error: 'Тіло запиту має бути JSON-об\'єктом рецепта.' });
  try {
    const recipe = await updateCollection('recipes', (recipes) => {
      const index = recipes.findIndex((item) => item.id === req.params.id);
      if (index === -1) return { result: null };
      // id, дата створення і фото не змінюються
      const updated = { ...recipes[index], ...pickRecipe(req.body) };
      return { items: recipes.with(index, updated), result: updated };
    });
    if (!recipe) return res.status(404).json(NOT_FOUND);
    return res.json(recipe);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Внутрішня помилка сервера.' });
  }
});

// DELETE /api/recipes/:id → 204 без тіла; 404 — немає такого
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await updateCollection('recipes', (recipes) => {
      const rest = recipes.filter((item) => item.id !== req.params.id);
      return rest.length === recipes.length ? { result: false } : { items: rest, result: true };
    });
    if (!deleted) return res.status(404).json(NOT_FOUND);
    return res.status(204).end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Внутрішня помилка сервера.' });
  }
});

export default router;
