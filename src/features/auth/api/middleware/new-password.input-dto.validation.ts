import { body } from 'express-validator';

export const passwordValidation = body('newPassword')
  .exists()
  .withMessage('is required')
  .isString()
  .withMessage('must be a string')
  .trim()
  .isLength({ min: 6, max: 20 })
  .withMessage('must be between 6 and 20 characters');

export const recoveryCodeValidation = body('recoveryCode')
  .exists()
  .withMessage('is required')
  .isString()
  .withMessage('must be a string')
  .trim()
  .isUUID()
  .withMessage('Incorrect code');

export const newPasswordInputValidation = [passwordValidation, recoveryCodeValidation];
