import { Request, Response, Router } from 'express';
import { HttpStatus } from '../../../core';
import {
  authDeviceSessionCollection,
  blogsCollection,
  commentsCollection,
  ipRestrictedCollection,
  postsCollection,
  tokenBlacklistCollection,
  usersCollection,
} from '../../../db/mongo.db';

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (reg: Request, res: Response) => {
  try {
    await blogsCollection.deleteMany({});
    await postsCollection.deleteMany({});
    await usersCollection.deleteMany({});
    await commentsCollection.deleteMany({});
    await authDeviceSessionCollection.deleteMany({});
    await tokenBlacklistCollection.deleteMany({});
    await ipRestrictedCollection.deleteMany({});
    res.status(HttpStatus.NoContent).send('All data is deleted');
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
});
