import express, { Express } from 'express';
import {
  usersRouter,
  blogsRouter,
  postsRouter,
  testingRouter,
} from './features';
import {
  HttpStatus,
  USERS_PATH,
  BLOGS_PATH,
  POSTS_PATH,
  TESTING_PATH,
  AUTH_PATH,
} from './core';
import { authRouter } from './features/auth/routes/auth.router';

export const setupApp = (app: Express) => {
  app.use(express.json()); // middleware для парсинга JSON в теле запроса

  // основной роут
  app.get('/', (req, res) => {
    res.status(HttpStatus.Ok).send('Hello world!');
  });

  app.use(AUTH_PATH, authRouter);
  app.use(USERS_PATH, usersRouter);
  app.use(BLOGS_PATH, blogsRouter);
  app.use(POSTS_PATH, postsRouter);
  app.use(TESTING_PATH, testingRouter);

  return app;
};
