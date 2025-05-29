import { Router, Request, Response } from 'express';
import { db } from '../../../db/in-memory.db';
import { HttpStatus } from '../../../core';

export const testingRouter = Router({});

testingRouter.delete('/all-data', (reg: Request, res: Response) => {
  db.blogs = [];
  db.posts = [];
  res.sendStatus(HttpStatus.NoContent);
});
