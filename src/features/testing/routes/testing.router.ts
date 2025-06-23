import { Request, Response, Router } from 'express';
import { HttpStatus } from '../../../core';
import {
  blogsCollection,
  postsCollection,
  usersCollection,
} from '../../../db/mongo.db';

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (reg: Request, res: Response) => {
  try {
    await blogsCollection.deleteMany({});
    await postsCollection.deleteMany({});
    await usersCollection.deleteMany({});
    res.status(HttpStatus.NoContent).send('All data is deleted');
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
});
