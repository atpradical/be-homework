import { body } from 'express-validator';

export const codeValidation = body('code')
  .exists()
  .withMessage('is required')
  .isString()
  .withMessage('must be a string')
  .trim()
  .isUUID()
  .withMessage('Incorrect code');
