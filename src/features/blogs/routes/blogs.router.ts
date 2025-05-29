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
import { superAdminGuardMiddleware } from '../../../auth/super-admin.guard-middleware';

export const blogsRouter = Router({});

blogsRouter
  .get('/', getBlogListHandler)

  .post(
    '/',
    superAdminGuardMiddleware,
    blogsInputValidation,
    inputValidationResultMiddleware,
    createBlogHandler,
  )

  .get('/:id', idValidation, inputValidationResultMiddleware, getBlogHandler)

  .put(
    '/:id',
    superAdminGuardMiddleware,
    idValidation,
    blogsInputValidation,
    inputValidationResultMiddleware,
    updateBlogHandler,
  )

  .delete(
    '/:id',
    superAdminGuardMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    deleteBlogHandler,
  );
