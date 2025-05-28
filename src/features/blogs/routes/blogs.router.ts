import { Router, Response, Request } from 'express';
import { db } from '../../../db/in-memory.db';
import { postsRouter } from '../../posts';

export const blogsRouter = Router({});

blogsRouter
  .get('/', (req: Request, res: Response) => {
    res.send(db.blogs);
  })

  .post('/', (req: Request, res: Response) => {})

  .get('/:id', (req: Request, res: Response) => {})

  .put('/:id', (req: Request, res: Response) => {})

  .delete('/:id', (req: Request, res: Response) => {});
