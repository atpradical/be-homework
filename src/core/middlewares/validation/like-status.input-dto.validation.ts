import { body } from 'express-validator';
import { LikeStatus } from '../../index';

export const likeStatusValidation = body('likeStatus')
  .exists()
  .withMessage('likeStatus is required')
  .isString()
  .trim()
  .withMessage('likeStatus must be a string')
  .isIn(Object.values(LikeStatus))
  .withMessage(`likeStatus must be one of: ${Object.values(LikeStatus).join(', ')}`);

// .isString()
//   .withMessage('must be a string')
//   .trim()
//   .isIn(Object.values(LikeStatus))
//   .withMessage(`must be one of: ${Object.values(LikeStatus).join(', ')}`);

export const likesInputValidation = [likeStatusValidation];
