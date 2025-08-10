import { Router } from 'express';
import { inputValidationResultMiddleware, routeIdValidation } from '../../../core';
import { accessTokenGuard } from '../../auth/api/guards/access-token.guard';
import { commentExistValidation } from './middleware/comment-exist.validation';
import { commentsInputValidation } from './middleware/comments.input-dto.validation';
import { container } from '../../../composition-root';
import { CommentsController } from './comments.controller';

export const commentsRouter = Router({});

const commentsController = container.get(CommentsController);

commentsRouter
  .get(
    '/:id',
    routeIdValidation,
    inputValidationResultMiddleware,
    commentsController.getCommentHandler.bind(commentsController),
  )

  .put(
    '/:id',
    accessTokenGuard,
    routeIdValidation,
    commentsInputValidation,
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
