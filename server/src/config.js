// Налаштування з змінних середовища (файл .env читає dotenv). Значення за замовчуванням —
// для локальної розробки, тож сервер стартує і без .env.
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ quiet: true });

export const PORT = Number(process.env.PORT) || 3001;
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
// Тека з JSON-файлами даних; змінна DATA_DIR знадобиться тестам (ПР 9), щоб не чіпати справжні дані
export const DATA_DIR = process.env.DATA_DIR || fileURLToPath(new URL('../data/', import.meta.url));
