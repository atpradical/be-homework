import express from 'express';
import { setupApp } from './setup-app';
import { runDB, setupDBIndexes } from './db/mongo.db';
import { appConfig } from './core/config';

const bootstrap = async () => {
  const app = express();
  //Для получения корректного ip-адреса из req.ip
  app.set('trust proxy', true);

  setupApp(app);
  const PORT = appConfig.PORT;

  await runDB(appConfig.MONGO_URL);
  await setupDBIndexes();

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
  });

  return app;
};

bootstrap();
