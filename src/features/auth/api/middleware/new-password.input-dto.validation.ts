import { body } from 'express-validator';

export const EmailValidation = body('newPassword')
  .exists()
  .withMessage('is required')
  .isString()
  .withMessage('must be a string')
  .trim()
  .withMessage('can not be empty')
  .isEmail()
  .withMessage('incorrect email');

export const recoveryCodeValidation = body('recoveryCode')
  .exists()
  .withMessage('is required')
  .isString()
  .withMessage('must be a string')
  .trim()
  .isUUID()
  .withMessage('Incorrect code');

export const newPasswordInputValidation = [EmailValidation, recoveryCodeValidation];
