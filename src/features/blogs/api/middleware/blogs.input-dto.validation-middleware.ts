import { body } from 'express-validator';

export const websiteUrlValidation = body('websiteUrl')
  .exists()
  .withMessage('is required')
  .isString()
  .withMessage('must be a string')
  .trim()
  .isLength({ min: 1, max: 100 })
  .withMessage('length is not correct')
  .isURL({ require_protocol: true, protocols: ['https'] })
  .withMessage('incorrect URL');

export const nameValidation = body('name')
  .exists()
  .withMessage('is required')
  .isString()
  .withMessage('must be a string')
  .trim()
  .isLength({ min: 1, max: 15 })
  .withMessage('length is not correct');

export const descriptionValidation = body('description')
  .exists()
  .withMessage('is required')
  .isString()
  .withMessage('must be a string')
  .trim()
  .isLength({ min: 1, max: 500 })
  .withMessage('length is not correct');

export const blogsInputDtoValidation = [
  nameValidation,
  descriptionValidation,
  websiteUrlValidation,
];
