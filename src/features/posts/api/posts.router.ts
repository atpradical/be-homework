import { Router } from 'express';
import {
  createPostHandler,
  deletePostHandler,
  getPostHandler,
  getPostListHandler,
  updatePostHandler,
} from './handlers';
import {
  routeIdValidation,
  inputValidationResultMiddleware,
  paginationAndSortingValidation,
  postIdValidation,
} from '../../../core';
import { postsInputValidation } from './middleware/posts.input-dto.validation';
import { superAdminGuard } from '../../auth/api/guards/super-admin.guard';
import { PostSortField } from '../types/post-sort-field';
import { CommentSortField } from '../../comments/types/comment-sort-field';
import { getCommentsListHandler } from '../../comments/api/handlers/get-comments-list.handler';
import { createCommentHandler } from '../../comments/api/handlers/create-comment.handler';
import { accessTokenGuard } from '../../auth/api/guards/access-token.guard';
import { commentsInputValidation } from '../../comments/api/middleware/comments.input-dto.validation';

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
    superAdminGuard,
    postsInputValidation,
    inputValidationResultMiddleware,
    createPostHandler,
  )

  .get('/:id', routeIdValidation, inputValidationResultMiddleware, getPostHandler)

  .put(
    '/:id',
    superAdminGuard,
    routeIdValidation,
    postsInputValidation,
    inputValidationResultMiddleware,
    updatePostHandler,
  )

  .delete(
    '/:id',
    superAdminGuard,
    routeIdValidation,
    inputValidationResultMiddleware,
    deletePostHandler,
  )

  .get(
    '/:postId/comments',
    postIdValidation,
    paginationAndSortingValidation(CommentSortField),
    inputValidationResultMiddleware,
    getCommentsListHandler,
  )

  .post(
    '/:postId/comments',
    accessTokenGuard,
    postIdValidation,
    commentsInputValidation,
    inputValidationResultMiddleware,
    createCommentHandler,
  );
