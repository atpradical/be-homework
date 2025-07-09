import { body } from 'express-validator';

export const loginValidation = body('login')
  .exists()
  .withMessage('is required')
  .isString()
  .withMessage('must be a string')
  .trim()
  .isLength({ min: 3, max: 10 })
  .withMessage('must be between 3 and 10 characters')
  .matches(/^[a-zA-Z0-9_-]*$/)
  .withMessage('only letters, numbers, _, and - are allowed');

export const passwordValidation = body('password')
  .exists()
  .withMessage('is required')
  .isString()
  .withMessage('must be a string')
  .trim()
  .isLength({ min: 6, max: 20 })
  .withMessage('must be between 6 and 20 characters');

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

export const registrationInputValidation = [loginValidation, passwordValidation, emailValidation];
