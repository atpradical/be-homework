import { Router, Response, Request } from 'express';

export const postsRouter = Router({});

postsRouter.get('/', (req: Request, res: Response) => {
  res.send('posts will be here soon');
});
