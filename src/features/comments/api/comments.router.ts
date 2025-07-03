import { Router } from 'express';
import { routeIdValidation, inputValidationResultMiddleware } from '../../../core';
import { getCommentHandler } from './handlers/get-comment.handler';
import { accessTokenGuard } from '../../auth/api/guards/access-token.guard';
import { updateCommentHandler } from './handlers/update-comment.handler';
import { deleteCommentHandler } from './handlers/delete-comment.handler';
import { commentExistValidation } from './middleware/comment-exist.validation';
import { commentsInputValidation } from './middleware/comments.input-dto.validation';

export const commentsRouter = Router({});

commentsRouter
  .get('/:id', routeIdValidation, inputValidationResultMiddleware, getCommentHandler)

  .put(
    '/:id',
    accessTokenGuard,
    routeIdValidation,
    commentsInputValidation,
    inputValidationResultMiddleware,
    commentExistValidation,
    updateCommentHandler,
  )
  .delete(
    '/:id',
    accessTokenGuard,
    // routeIdValidation,
    inputValidationResultMiddleware,
    deleteCommentHandler,
  );
