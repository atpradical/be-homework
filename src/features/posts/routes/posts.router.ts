import { Router } from 'express';
import {
  createPostHandler,
  deletePostHandler,
  getPostHandler,
  getPostListHandler,
  updatePostHandler,
} from './handlers';
import {
  idValidation,
  inputValidationResultMiddleware,
  paginationAndSortingValidation,
} from '../../../core';
import { postsInputValidation } from './posts.input-dto.validation-middleware';
import { superAdminGuardMiddleware } from '../../../auth/super-admin.guard-middleware';
import { PostSortField } from './input/post-sort-field';

export const postsRouter = Router({});

postsRouter
  .get(
    '/',
    paginationAndSortingValidation(PostSortField),
    inputValidationResultMiddleware,
    getPostListHandler,
  )

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
