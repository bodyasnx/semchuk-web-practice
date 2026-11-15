// Express-застосунок окремо від запуску сервера: так його зможуть імпортувати тести (ПР 9).
import express from 'express';
import cors from 'cors';
import recipesRouter from './routes/recipes.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json()); // розбирає JSON-тіло запиту в req.body

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/recipes', recipesRouter);

  return app;
}
