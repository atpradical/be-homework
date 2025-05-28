import { Router } from 'express';
import {
  createBlogHandler,
  deleteBlogHandler,
  getBlogHandler,
  getBlogListHandler,
  updateBlogHandler,
} from '../handlers';

export const blogsRouter = Router({});

blogsRouter
  .get('/', getBlogListHandler)

  .post('/', createBlogHandler)

  .get('/:id', getBlogHandler)

  .put('/:id', updateBlogHandler)

  .delete('/:id', deleteBlogHandler);
