// Модульні тести перевірки CORS-адрес (ПР 10): адреса Netlify, «/» у кінці, шаблон deploy preview.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseOrigins, isAllowedOrigin } from '../src/lib/origins.js';

const allowed = parseOrigins(' http://localhost:5173 , https://smak-tradytsii.netlify.app/ ,, https://*--smak-tradytsii.netlify.app');

test('CLIENT_ORIGIN: пробіли, порожні елементи і «/» у кінці прибрано', () => {
  assert.deepEqual(allowed, [
    'http://localhost:5173',
    'https://smak-tradytsii.netlify.app',
    'https://*--smak-tradytsii.netlify.app',
  ]);
});

test('адреса Netlify і localhost дозволені, чужі сайти — ні', () => {
  assert.ok(isAllowedOrigin('https://smak-tradytsii.netlify.app', allowed));
  assert.ok(isAllowedOrigin('http://localhost:5173', allowed));
  assert.ok(!isAllowedOrigin('http://localhost:5174', allowed));
  assert.ok(!isAllowedOrigin('https://other.netlify.app', allowed));
  assert.ok(!isAllowedOrigin('http://smak-tradytsii.netlify.app', allowed)); // http замість https
});

test('шаблон * — лише deploy preview цього сайту, без підміни домену', () => {
  assert.ok(isAllowedOrigin('https://deploy-preview-5--smak-tradytsii.netlify.app', allowed));
  assert.ok(!isAllowedOrigin('https://evil.com/--smak-tradytsii.netlify.app', allowed));
  assert.ok(!isAllowedOrigin('https://a.b--smak-tradytsii.netlify.app', allowed));
  assert.ok(!isAllowedOrigin('https://x--smak-tradytsii.netlify.app.evil.com', allowed));
});
