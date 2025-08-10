import { Router } from 'express';
import {
  inputValidationResultMiddleware,
  paginationAndSortingValidation,
  postIdValidation,
  routeIdValidation,
} from '../../../core';
import { postsInputValidation } from './middleware/posts.input-dto.validation';
import { superAdminGuard } from '../../auth/api/guards/super-admin.guard';
import { PostSortField } from '../types/post-sort-field';
import { CommentSortField } from '../../comments/types/comment-sort-field';
import { accessTokenGuard } from '../../auth/api/guards/access-token.guard';
import { commentsInputValidation } from '../../comments/api/middleware/comments.input-dto.validation';
import { PostsController } from './posts.controller';
import { container } from '../../../composition-root';

export const postsRouter = Router({});

const postsController = container.get(PostsController);

postsRouter
  .get(
    '/',
    paginationAndSortingValidation(PostSortField),
    inputValidationResultMiddleware,
    postsController.getPostListHandler.bind(postsController),
  )

  .post(
    '/',
    superAdminGuard,
    postsInputValidation,
    inputValidationResultMiddleware,
    postsController.createPostHandler.bind(postsController),
  )

  .get(
    '/:id',
    routeIdValidation,
    inputValidationResultMiddleware,
    postsController.getPostHandler.bind(postsController),
  )

  .put(
    '/:id',
    superAdminGuard,
    routeIdValidation,
    postsInputValidation,
    inputValidationResultMiddleware,
    postsController.updatePostHandler.bind(postsController),
  )

  .delete(
    '/:id',
    superAdminGuard,
    routeIdValidation,
    inputValidationResultMiddleware,
    postsController.deletePostHandler.bind(postsController),
  )

  .get(
    '/:postId/comments',
    postIdValidation,
    paginationAndSortingValidation(CommentSortField),
    inputValidationResultMiddleware,
    postsController.getCommentsListHandler.bind(postsController),
  )

  .post(
    '/:postId/comments',
    accessTokenGuard,
    postIdValidation,
    commentsInputValidation,
    inputValidationResultMiddleware,
    postsController.createCommentHandler.bind(postsController),
  );
