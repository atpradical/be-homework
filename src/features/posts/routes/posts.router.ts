import { Router, Response, Request } from 'express';
import { db } from '../../../db/in-memory.db';

export const postsRouter = Router({});

postsRouter
  .get('/', (req: Request, res: Response) => {
    res.send(db.posts);
  })

  .post('/', (req: Request, res: Response) => {})

  .get('/:id', (req: Request, res: Response) => {})

  .put('/:id', (req: Request, res: Response) => {})

  .delete('/:id', (req: Request, res: Response) => {});
