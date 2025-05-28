import { Router } from 'express';
import {
  createBlogHandler,
  deleteBlogHandler,
  getBlogHandler,
  getBlogListHandler,
  updateBlogHandler,
} from './handlers';
import { idValidation, inputValidationResultMiddleware } from '../../../core';
import { blogsInputValidation } from '../validation/blogs.input-dto.validation-middleware';

export const blogsRouter = Router({});

blogsRouter
  .get('/', getBlogListHandler)

  .post(
    '/',
    blogsInputValidation,
    inputValidationResultMiddleware,
    createBlogHandler,
  )

  .get('/:id', idValidation, inputValidationResultMiddleware, getBlogHandler)

  .put(
    '/:id',
    idValidation,
    blogsInputValidation,
    inputValidationResultMiddleware,
    updateBlogHandler,
  )

  .delete(
    '/:id',
    idValidation,
    inputValidationResultMiddleware,
    deleteBlogHandler,
  );
