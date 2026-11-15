// Точка входу: створює застосунок і запускає HTTP-сервер.
import { createApp } from './app.js';
import { PORT } from './config.js';

createApp().listen(PORT, () => {
  console.log(`API «Смак Традиції» працює: http://localhost:${PORT}/api/recipes`);
});
