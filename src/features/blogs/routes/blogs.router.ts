import { Router, Response, Request } from 'express';

export const blogsRouter = Router({});

blogsRouter.get('/', (req: Request, res: Response) => {
  res.send('blogs will be here soon');
});
