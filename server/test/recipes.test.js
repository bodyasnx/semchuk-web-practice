// Інтеграційні тести API (node:test + вбудований fetch, без додаткових бібліотек).
// Справжній server/data/recipes.json не змінюється: перед імпортом застосунку DATA_DIR
// вказує на тимчасову копію даних, яку після тестів видаляємо.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, copyFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const realData = fileURLToPath(new URL('../data/recipes.json', import.meta.url));
let tempDir;
let server;
let baseUrl;

before(async () => {
  tempDir = await mkdtemp(path.join(tmpdir(), 'smak-api-test-'));
  await copyFile(realData, path.join(tempDir, 'recipes.json'));
  process.env.DATA_DIR = tempDir;
  // Динамічний імпорт — після того, як DATA_DIR встановлено (config.js читає його під час імпорту)
  const { createApp } = await import('../src/app.js');
  server = createApp({ logging: false }).listen(0); // 0 — будь-який вільний порт
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await rm(tempDir, { recursive: true, force: true });
});

const postJson = (url, body) => fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

test('GET /api/recipes/borshch → 200 і рецепт', async () => {
  const res = await fetch(`${baseUrl}/recipes/borshch`);
  assert.equal(res.status, 200);
  const recipe = await res.json();
  assert.equal(recipe.id, 'borshch');
  assert.ok(recipe.ingredients.length > 0);
});

test('GET /api/recipes?category=dumplings → 200 і лише вареники та галушки', async () => {
  const res = await fetch(`${baseUrl}/recipes?category=dumplings`);
  assert.equal(res.status, 200);
  const recipes = await res.json();
  assert.ok(recipes.length > 0);
  assert.ok(recipes.every((recipe) => recipe.category === 'dumplings'));
});

test('GET /api/recipes/nope → 404 з текстом помилки', async () => {
  const res = await fetch(`${baseUrl}/recipes/nope`);
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { error: 'Рецепт не знайдено.' });
});

test('POST /api/recipes з порожнім тілом → 400 і перелік помилок по полях', async () => {
  const res = await postJson(`${baseUrl}/recipes`, {});
  assert.equal(res.status, 400);
  const body = await res.json();
  const fields = body.details.map((detail) => detail.field);
  for (const field of ['title', 'category', 'servings', 'cookTime', 'difficulty', 'ingredients', 'steps']) {
    assert.ok(fields.includes(field), `очікувалась помилка для поля ${field}`);
  }
});

test('POST /api/recipes з коректним рецептом → 201, Location і запис у тимчасовий файл', async () => {
  const res = await postJson(`${baseUrl}/recipes`, {
    title: 'Тестовий борщ',
    category: 'first',
    servings: 4,
    cookTime: 90,
    difficulty: 'easy',
    ingredients: [{ name: 'Буряк', amount: 300, unit: 'г' }],
    steps: ['Зваріть бульйон протягом години.'],
  });
  assert.equal(res.status, 201);
  const created = await res.json();
  assert.equal(res.headers.get('location'), `/api/recipes/${created.id}`);

  const saved = JSON.parse(await readFile(path.join(tempDir, 'recipes.json'), 'utf8'));
  assert.ok(saved.some((recipe) => recipe.id === created.id), 'рецепт записано в тимчасову копію');
  const real = JSON.parse(await readFile(realData, 'utf8'));
  assert.ok(!real.some((recipe) => recipe.id === created.id), 'справжній recipes.json не змінено');
});
