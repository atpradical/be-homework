import express from 'express';
import { setupApp } from './setup-app';

// создание приложения
const app = express();
setupApp(app);

// порт приложения
const PORT = process.env.PORT || 5001; // Vercel устанавливает свой порт при деплое

// запуск приложения
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
