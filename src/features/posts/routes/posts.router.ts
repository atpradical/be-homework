import { Router } from 'express';
import {
  createPostHandler,
  deletePostHandler,
  getPostHandler,
  getPostListHandler,
  updatePostHandler,
} from './handlers';
import { idValidation, inputValidationResultMiddleware } from '../../../core';
import { postsInputValidation } from '../validation/posts.input-dto.validation-middleware';
import { superAdminGuardMiddleware } from '../../../auth/super-admin.guard-middleware';

export const postsRouter = Router({});

postsRouter
  .get('/', getPostListHandler)

  .post(
    '/',
    superAdminGuardMiddleware,
    postsInputValidation,
    inputValidationResultMiddleware,
    createPostHandler,
  )

  .get('/:id', idValidation, inputValidationResultMiddleware, getPostHandler)

  .put(
    '/:id',
    superAdminGuardMiddleware,
    idValidation,
    postsInputValidation,
    inputValidationResultMiddleware,
    updatePostHandler,
  )

  .delete(
    '/:id',
    superAdminGuardMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    deletePostHandler,
  );
