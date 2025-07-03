import { body } from 'express-validator';

export const loginOrEmailValidation = body('loginOrEmail')
  .exists()
  .withMessage('is required')
  .isString()
  .withMessage('must be a string')
  .trim()
  .withMessage('can not be empty');

export const passwordValidation = body('password')
  .exists()
  .withMessage('is required')
  .isString()
  .withMessage('must be a string')
  .trim()
  .withMessage('can not be empty');

export const authInputValidation = [loginOrEmailValidation, passwordValidation];
