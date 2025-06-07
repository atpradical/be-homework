import express, { Express } from 'express';
import { blogsRouter, postsRouter, testingRouter } from './features';
import { BLOGS_PATH, HttpStatus, POSTS_PATH, TESTING_PATH } from './core';

export const setupApp = (app: Express) => {
  app.use(express.json()); // middleware для парсинга JSON в теле запроса

  // основной роут
  app.get('/', (req, res) => {
    res.status(HttpStatus.Ok).send('Hello world!');
  });

  app.use(BLOGS_PATH, blogsRouter);
  app.use(POSTS_PATH, postsRouter);
  app.use(TESTING_PATH, testingRouter);

  return app;
};
