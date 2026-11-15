// Реєстрація service worker (ПР 10). Лише в production-збірці: у `npm run dev` файлу /sw.js
// немає, а кешування заважало б бачити зміни коду. Реєструємо після події load, щоб
// встановлення SW (завантаження офлайн-сторінки і шрифтів) не конкурувало з першим показом сторінки.
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      // Сайт працює і без SW — лише без офлайн-сторінки та кешу, тому тільки пишемо в консоль
      console.warn('Service worker не зареєстровано:', error);
    });
  });
}
