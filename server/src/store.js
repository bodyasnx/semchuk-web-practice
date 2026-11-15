// Сховище на JSON-файлах: читання і запис через fs/promises.
// Записи виконуються по черзі (черга промісів), а сам запис — через тимчасовий файл і rename,
// тож два одночасні POST не перезапишуть зміни один одного, а збій посеред запису не зіпсує файл.
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { DATA_DIR } from './config.js';

const fileFor = (name) => path.join(DATA_DIR, `${name}.json`);

/** Повертає масив записів колекції; якщо файлу ще немає — порожній масив. */
export async function readCollection(name) {
  try {
    return JSON.parse(await readFile(fileFor(name), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeCollection(name, items) {
  await mkdir(DATA_DIR, { recursive: true });
  const file = fileFor(name);
  const temp = `${file}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
  await rename(temp, file);
}

let queue = Promise.resolve();

/**
 * Читає колекцію, передає її в update і записує те, що поверне update (items).
 * Повертає result з update. Усі зміни виконуються строго одна за одною.
 */
export function updateCollection(name, update) {
  const task = queue.then(async () => {
    const { items, result } = await update(await readCollection(name));
    if (items) await writeCollection(name, items);
    return result;
  });
  queue = task.catch(() => {}); // помилка одного запису не зупиняє чергу
  return task;
}
