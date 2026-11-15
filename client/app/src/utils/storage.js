// Безпечна робота з localStorage: у приватному режимі чи при вимкнених cookie доступ кидає виняток.
// Тут зберігаються лише налаштування інтерфейсу (тема, порції) — жодних паролів чи токенів.

export function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // сховище недоступне — налаштування діятиме до перезавантаження сторінки
  }
}
