import { body } from 'express-validator';

export const emailValidation = body('email')
  .exists()
  .withMessage('is required')
  .isString()
  .withMessage('must be a string')
  .trim()
  .isLength({ min: 1, max: 500 })
  .withMessage('length is not correct')
  .isEmail()
  .withMessage('not correct email');

export const registrationEmailResendingInputValidation = [emailValidation];
