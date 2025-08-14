import { Router } from 'express';
import { inputValidationResultMiddleware, routeIdValidation } from '../../../core';
import {
  accessTokenGuard,
  accessTokenGuardOptional,
} from '../../auth/api/guards/access-token.guard';
import { commentExistValidation } from './middleware/comment-exist.validation';
import { container } from '../../../composition-root';
import { CommentsController } from './comments.controller';
import { likesInputValidation } from '../../../core/middlewares/validation/like-status.input-dto.validation';

export const commentsRouter = Router({});

const commentsController = container.get(CommentsController);

commentsRouter
  .get(
    '/:id',
    accessTokenGuardOptional,
    routeIdValidation,
    inputValidationResultMiddleware,
    commentsController.getCommentHandler.bind(commentsController),
  )

  .put(
    '/:id/like-status',
    accessTokenGuard,
    routeIdValidation,
    inputValidationResultMiddleware,
    commentExistValidation,
    commentsController.updateCommentLikeStatusHandler.bind(commentsController),
  )

  .put(
    '/:id',
    accessTokenGuard,
    routeIdValidation,
    likesInputValidation,
    inputValidationResultMiddleware,
    commentExistValidation,
    commentsController.updateCommentHandler.bind(commentsController),
  )

  .delete(
    '/:id',
    accessTokenGuard,
    routeIdValidation,
    inputValidationResultMiddleware,
    commentsController.deleteCommentHandler.bind(commentsController),
  );
