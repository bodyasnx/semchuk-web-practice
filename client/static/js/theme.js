// Перемикач світлої / темної теми.
// Початкову тему ставить короткий скрипт у <head> (щоб не було «спалаху» іншої теми),
// цей файл лише оновлює підпис кнопки і зберігає вибір. Повноцінний JS сайту — у ПР 6.
(function () {
  'use strict';
  const root = document.documentElement;
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function isDark() {
    return root.dataset.theme ? root.dataset.theme === 'dark' : darkQuery.matches;
  }

  // Підпис — дія, яку виконає кнопка: у темній темі «Світла тема», у світлій — «Темна тема»
  function syncButtons() {
    const label = isDark() ? 'Світла тема' : 'Темна тема';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      button.setAttribute('aria-label', label);
      button.title = label;
    });
  }

  document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      const next = isDark() ? 'light' : 'dark';
      root.dataset.theme = next;
      try {
        localStorage.setItem('theme', next);
      } catch (e) {
        // localStorage недоступний — тема діє до перезавантаження сторінки
      }
      syncButtons();
    });
  });

  darkQuery.addEventListener('change', syncButtons);
  syncButtons();
})();
