import express, { Request, Response, Express } from 'express';
import {
  HttpStatus,
  AUTH_PATH,
  BLOGS_PATH,
  COMMENTS_PATH,
  POSTS_PATH,
  SECURITY_DEVICES_PATH,
  TESTING_PATH,
  USERS_PATH,
} from './core';
import { authRouter } from './features/auth/api/auth.router';
import { commentsRouter } from './features/comments/api/comments.router';
import { usersRouter } from './features/users/api/users.router';
import { blogsRouter } from './features/blogs/api/blogs.router';
import { postsRouter } from './features/posts/api/posts.router';
import { testingRouter } from './features/testing/domain/testing.router';
import { securityDevicesRouter } from './features/auth-device-session/api/security-devices.router';
import cookieParser from 'cookie-parser';

export const setupApp = (app: Express) => {
  app.use(express.json()); // middleware для парсинга JSON в теле запроса
  app.use(cookieParser()); // middleware для парсинга Cookies

  app.get('/', (_: Request, res: Response) => {
    res.status(HttpStatus.Ok).send('Hello world!');
  });

  app.use(AUTH_PATH, authRouter);
  app.use(USERS_PATH, usersRouter);
  app.use(BLOGS_PATH, blogsRouter);
  app.use(POSTS_PATH, postsRouter);
  app.use(COMMENTS_PATH, commentsRouter);
  app.use(SECURITY_DEVICES_PATH, securityDevicesRouter);
  app.use(TESTING_PATH, testingRouter);

  return app;
};
