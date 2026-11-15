// Express-застосунок окремо від запуску сервера: так його зможуть імпортувати тести (ПР 9).
// Порядок middleware важливий: запит проходить їх згори вниз, доки хтось не надішле відповідь.
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import recipesRouter from './routes/recipes.js';
import contactRouter from './routes/contact.js';
import { notFound, errorHandler } from './middleware/errors.js';
import { CLIENT_ORIGIN } from './config.js';

// CLIENT_ORIGIN може містити кілька адрес через кому (наприклад, localhost і адреса на Vercel)
const allowedOrigins = CLIENT_ORIGIN.split(',').map((origin) => origin.trim());

export function createApp({ logging = true } = {}) {
  const app = express();

  // 1. Журнал запитів: метод, шлях, статус, час відповіді
  if (logging) app.use(morgan('dev'));

  // 2. CORS: браузеру дозволено читати відповіді лише для сторінок з CLIENT_ORIGIN.
  //    Запити без заголовка Origin (Postman, curl, сервер-сервер) CORS не стосується.
  app.use(cors({
    origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)),
  }));

  // 3. JSON-тіло запиту → req.body; більше 100 КБ — помилка 413 (захист від завеликих запитів)
  app.use(express.json({ limit: '100kb' }));

  // 4. Маршрути
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/recipes', recipesRouter);
  app.use('/api/contact', contactRouter);

  // 5. Нічого не підійшло — 404; будь-яка помилка вище — централізований обробник
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
