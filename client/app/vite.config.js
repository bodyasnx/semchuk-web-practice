import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Плагін react вмикає JSX і швидке оновлення компонентів (Fast Refresh) під час npm run dev.
// Блок test — налаштування Vitest (ПР 9): jsdom імітує браузерний DOM для тестів компонентів.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  // Та сама адреса, що й у src/utils/api.js (VITE_API_URL або локальний сервер)
  const apiUrl = (env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
  // Адреса сайту для абсолютних og:url і og:image в index.html (ПР 10). На відміну від usePageMeta,
  // у статичному HTML немає window.location, тож за замовчуванням — основний сайт на Netlify.
  const siteUrl = (env.VITE_SITE_URL || 'https://smak-tradytsii.netlify.app').replace(/\/+$/, '');

  return {
    plugins: [
      react(),
      // Підставляє адресу API в index.html (%API_URL%): скрипт у <head> починає запит до API
      // ще під час розбору HTML, не чекаючи, поки завантажиться і виконається JS (ПР 9).
      // %SITE_URL% — адреса сайту для Open Graph (ПР 10).
      {
        name: 'inject-urls',
        transformIndexHtml: (html) => html.replaceAll('%API_URL%', apiUrl).replaceAll('%SITE_URL%', siteUrl),
      },
      serviceWorker(),
    ],
    build: {
      // JS і CSS з хешем у назві — в окремій теці /static/, а не в /assets/, де лежать SVG з public/
      // без хешу. Так хостинг (netlify.toml) і service worker можуть кешувати /static/* «назавжди».
      assetsDir: 'static',
    },
    server: { port: 5173, open: true },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      include: ['src/**/*.test.{js,jsx}'],
    },
  };
});

/**
 * Service worker (ПР 10): під час збірки бере src/sw.js, підставляє версію і записує dist/sw.js.
 * Версія — хеш назв усіх файлів збірки (у них уже є хеші вмісту), коду SW і офлайн-сторінки:
 * змінився будь-який з них — нова версія, і браузер встановить оновлений SW зі свіжими кешами.
 * У dev-режимі SW не потрібен (і заважав би гарячому оновленню), тому плагін працює лише на build.
 */
function serviceWorker() {
  const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
  return {
    name: 'service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const source = read('./src/sw.js');
      const version = createHash('sha256')
        .update(Object.keys(bundle).sort().join('\n'))
        .update(source)
        .update(read('./public/offline.html'))
        .digest('hex')
        .slice(0, 10);
      const placeholder = "'__SW_VERSION__'";
      if (!source.includes(placeholder)) this.error(`src/sw.js: не знайдено ${placeholder}`);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: source.replace(placeholder, `'${version}'`) });
    },
  };
}
