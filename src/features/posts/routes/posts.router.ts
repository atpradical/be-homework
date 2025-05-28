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

export const postsRouter = Router({});

postsRouter
  .get('/', getPostListHandler)

  .post(
    '/',
    postsInputValidation,
    inputValidationResultMiddleware,
    createPostHandler,
  )

  .get('/:id', idValidation, inputValidationResultMiddleware, getPostHandler)

  .put(
    '/:id',
    idValidation,
    postsInputValidation,
    inputValidationResultMiddleware,
    updatePostHandler,
  )

  .delete(
    '/:id',
    idValidation,
    inputValidationResultMiddleware,
    deletePostHandler,
  );
