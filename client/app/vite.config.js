import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Плагін react вмикає JSX і швидке оновлення компонентів (Fast Refresh) під час npm run dev.
// Блок test — налаштування Vitest (ПР 9): jsdom імітує браузерний DOM для тестів компонентів.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  // Та сама адреса, що й у src/utils/api.js (VITE_API_URL або локальний сервер)
  const apiUrl = (env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

  return {
    plugins: [
      react(),
      // Підставляє адресу API в index.html (%API_URL%): скрипт у <head> починає запит до API
      // ще під час розбору HTML, не чекаючи, поки завантажиться і виконається JS (ПР 9).
      {
        name: 'inject-api-url',
        transformIndexHtml: (html) => html.replaceAll('%API_URL%', apiUrl),
      },
    ],
    server: { port: 5173, open: true },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      include: ['src/**/*.test.{js,jsx}'],
    },
  };
});
