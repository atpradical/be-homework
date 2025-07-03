import { body } from 'express-validator';

export const contentValidation = body('content')
  .exists()
  .withMessage('is required')
  .isString()
  .withMessage('must be a string')
  .trim()
  .isLength({ min: 20, max: 300 })
  .withMessage('length is not correct');

export const commentsInputValidation = [contentValidation];
