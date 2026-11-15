// Форма зворотного зв'язку: POST /api/contact → повідомлення зберігається в data/messages.json.
import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { updateCollection } from '../store.js';
import { validateBody } from '../middleware/validate.js';
import { validateContact } from '../validation/contact.js';

const router = Router();

router.post('/', validateBody(validateContact), async (req, res) => {
  const message = { id: randomUUID(), ...req.validBody, createdAt: new Date().toISOString() };
  await updateCollection('messages', (messages) => ({ items: [...messages, message], result: message }));
  // Повертаємо лише підтвердження — персональні дані назад не віддаємо
  res.status(201).json({ id: message.id, createdAt: message.createdAt });
});

export default router;
