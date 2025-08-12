import { body } from 'express-validator';

export const EmailValidation = body('email')
  .exists()
  .withMessage('is required')
  .isString()
  .withMessage('must be a string')
  .trim()
  .withMessage('can not be empty')
  .isEmail()
  .withMessage('incorrect email');

export const passwordRecoveryInputValidation = [EmailValidation];
