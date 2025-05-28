import { Router, Request, Response } from 'express';
import { db } from '../../db/in-memory.db';
import { HttpStatus } from '../../core';

export const testingRouter = Router({});

testingRouter.get('/all-data', (_: Request, res: Response) => {
  db.blogs = [];
  db.posts = [];
  res.sendStatus(HttpStatus.NoContent);
});
