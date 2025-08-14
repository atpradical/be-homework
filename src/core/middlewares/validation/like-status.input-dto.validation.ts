import { body } from 'express-validator';
import { LikeStatus } from '../../index';

export const likeStatusValidation = body('likeStatus')
  .isString()
  .withMessage('must be a string')
  .isIn(Object.values(LikeStatus))
  .withMessage(`must be one of: ${Object.values(LikeStatus).join(', ')}`);

export const likesInputValidation = [likeStatusValidation];
