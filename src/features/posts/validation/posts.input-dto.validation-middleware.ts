import { body } from 'express-validator';

export const titleValidation = body('title')
  .exists()
  .withMessage('is required')
  .isString()
  .withMessage('must be a string')
  .trim()
  .isLength({ min: 1, max: 30 })
  .withMessage('length is not correct');

export const shortDescriptionValidation = body('shortDescriptionValidation')
  .exists()
  .withMessage('is required')
  .isString()
  .withMessage('must be a string')
  .trim()
  .isLength({ min: 1, max: 100 })
  .withMessage('length is not correct');

export const contentValidation = body('content')
  .exists()
  .withMessage('must be a string')
  .isString()
  .withMessage('is required')
  .trim()
  .isLength({ min: 1, max: 1000 })
  .withMessage('length is not correct');

export const blogIdValidation = body('blogId')
  .exists()
  .withMessage('is required')
  .isString()
  .withMessage('must be a string')
  .trim()
  .isLength({ min: 1 })
  .withMessage('length is not correct');

export const postsInputValidation = [
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  blogIdValidation,
];
