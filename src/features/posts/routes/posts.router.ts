import { Router } from 'express';
import {
  createPostHandler,
  deletePostHandler,
  getPostHandler,
  getPostListHandler,
  updatePostHandler,
} from '../handlers';

export const postsRouter = Router({});

postsRouter
  .get('/', getPostListHandler)

  .post('/', createPostHandler)

  .get('/:id', getPostHandler)

  .put('/:id', updatePostHandler)

  .delete('/:id', deletePostHandler);
