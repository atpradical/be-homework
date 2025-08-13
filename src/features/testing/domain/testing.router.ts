import { Request, Response, Router } from 'express';
import { HttpStatus } from '../../../core';
import { ipRestrictedCollection } from '../../../db/mongo.db';
import { BlogModel } from '../../../db/models/blog.model';
import { PostModel } from '../../../db/models/post.model';
import { UserModel } from '../../../db/models/user.model';
import { CommentModel } from '../../../db/models/comments.model';
import { AuthDeviceSessionModel } from '../../../db/models/auth-device-session.model';

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (reg: Request, res: Response) => {
  try {
    await BlogModel.deleteMany({});
    await PostModel.deleteMany({});
    await UserModel.deleteMany({});
    await CommentModel.deleteMany({});
    await AuthDeviceSessionModel.deleteMany({});

    await ipRestrictedCollection.deleteMany({});
    res.status(HttpStatus.NoContent).send('All data is deleted');
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
});
