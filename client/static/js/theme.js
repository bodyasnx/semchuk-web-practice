// Перемикач світлої / темної теми — спільний модуль для всіх сторінок.
// Початкову тему ставить короткий скрипт у <head> ДО першого малювання (інакше тема «блимне»);
// модуль лише оновлює підпис кнопки, перемикає тему і зберігає вибір.
import { readStorage, writeStorage } from './storage.js';

const STORAGE_KEY = 'theme';

export function initTheme() {
  const root = document.documentElement;
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const buttons = document.querySelectorAll('[data-theme-toggle]');

  const saved = readStorage(STORAGE_KEY);
  if ((saved === 'light' || saved === 'dark') && root.dataset.theme !== saved) root.dataset.theme = saved;

  const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : darkQuery.matches);

  // Підпис — дія, яку виконає кнопка: у темній темі «Світла тема», у світлій — «Темна тема»
  function syncButtons() {
    const label = isDark() ? 'Світла тема' : 'Темна тема';
    buttons.forEach((button) => {
      button.setAttribute('aria-label', label);
      button.title = label;
    });
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const next = isDark() ? 'light' : 'dark';
      root.dataset.theme = next;
      writeStorage(STORAGE_KEY, next);
      syncButtons();
    });
  });

  darkQuery.addEventListener('change', syncButtons);
  syncButtons();
}
