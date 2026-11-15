// useState, який пам'ятає значення між перезавантаженнями сторінки (тема, порції).
// Значення зберігається як JSON; у приватному режимі сховище може бути недоступне —
// тоді хук працює як звичайний useState (readStorage/writeStorage не кидають винятків).
import { useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../utils/storage.js';

function readJson(key, initialValue) {
  const raw = readStorage(key);
  if (raw === null) return initialValue;
  try {
    return JSON.parse(raw);
  } catch {
    return initialValue;
  }
}

export function useLocalStorage(key, initialValue) {
  // Функція в useState виконується лише при першому рендері — не читаємо сховище щоразу
  const [value, setValue] = useState(() => readJson(key, initialValue));

  useEffect(() => {
    writeStorage(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
