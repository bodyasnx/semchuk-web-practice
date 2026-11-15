// CRUD рецептів: /api/recipes
// Express 5 сам передає помилку з async-обробника в errorHandler (app.js), тому try/catch тут не потрібні.
import { Router } from 'express';
import { readCollection, updateCollection } from '../store.js';
import { queryRecipes } from '../lib/query.js';
import { uniqueId } from '../lib/slug.js';
import { validateBody } from '../middleware/validate.js';
import { validateRecipe } from '../validation/recipe.js';

const router = Router();
const NOT_FOUND = { error: 'Рецепт не знайдено.' };

// GET /api/recipes?q=&category=&region=&time=&sort= → 200 і масив рецептів
router.get('/', async (req, res) => {
  const recipes = await readCollection('recipes');
  res.json(queryRecipes(recipes, req.query));
});

// GET /api/recipes/:id → 200 і рецепт або 404
router.get('/:id', async (req, res) => {
  const recipes = await readCollection('recipes');
  const recipe = recipes.find((item) => item.id === req.params.id);
  if (!recipe) return res.status(404).json(NOT_FOUND);
  return res.json(recipe);
});

// POST /api/recipes → 201, заголовок Location і створений рецепт; 400 — помилки валідації
router.post('/', validateBody(validateRecipe), async (req, res) => {
  const recipe = await updateCollection('recipes', (recipes) => {
    const created = {
      id: uniqueId(req.validBody.title, new Set(recipes.map((item) => item.id))),
      ...req.validBody,
      image: null, // завантаження фото — поза межами ПР 8
      imageAlt: '',
      imageCredit: null,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    return { items: [...recipes, created], result: created };
  });
  res.status(201).location(`/api/recipes/${recipe.id}`).json(recipe);
});

// PUT /api/recipes/:id → 200 і оновлений рецепт; 404 — немає такого; 400 — помилки валідації
router.put('/:id', validateBody(validateRecipe), async (req, res) => {
  const recipe = await updateCollection('recipes', (recipes) => {
    const index = recipes.findIndex((item) => item.id === req.params.id);
    if (index === -1) return { result: null };
    // PUT замінює всі редаговані поля; id, дата створення і фото лишаються
    const updated = { ...recipes[index], ...req.validBody };
    return { items: recipes.with(index, updated), result: updated };
  });
  if (!recipe) return res.status(404).json(NOT_FOUND);
  return res.json(recipe);
});

// DELETE /api/recipes/:id → 204 без тіла; 404 — немає такого
router.delete('/:id', async (req, res) => {
  const deleted = await updateCollection('recipes', (recipes) => {
    const rest = recipes.filter((item) => item.id !== req.params.id);
    return rest.length === recipes.length ? { result: false } : { items: rest, result: true };
  });
  if (!deleted) return res.status(404).json(NOT_FOUND);
  return res.status(204).end();
});

export default router;
