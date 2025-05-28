import express, { Express } from 'express';
import { testingRouter } from './testing/routes/testing.router';
import { TESTING_PATH } from './core/constants';

export const setupApp = (app: Express) => {
  app.use(express.json()); // middleware для парсинга JSON в теле запроса

  // основной роут
  app.get('/', (req, res) => {
    res.status(200).send('Hello world!');
  });

  app.use(TESTING_PATH, testingRouter);

  return app;
};
