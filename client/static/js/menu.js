// Бургер-меню. Базово воно працює без JS на <details> (ПР 5); JS додає aria-expanded,
// закриття по Esc (з поверненням фокусу на кнопку) і по кліку поза меню.

export function initMenu() {
  const menu = document.querySelector('.site-menu');
  if (!menu) return;
  const toggle = menu.querySelector('summary');

  const sync = () => toggle.setAttribute('aria-expanded', String(menu.open));
  menu.addEventListener('toggle', sync);
  sync();

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
}
