import { param } from 'express-validator';

export const routeIdValidation = param('id')
  .exists()
  .withMessage('ID is required') // Проверка на наличие
  .isString()
  .withMessage('ID must be a string') // Проверка, что это строка
  .isLength({ min: 1 })
  .withMessage('ID must not be empty') // Проверка, что строка не пустая
  .isMongoId()
  .withMessage('Incorrect format of ID'); // Проверка на формат ObjectId

export const blogIdValidation = param('blogId')
  .exists()
  .withMessage('blogId is required') // Проверка на наличие
  .isString()
  .withMessage('blogId must be a string') // Проверка, что это строка
  .isLength({ min: 1 })
  .withMessage('blogId must not be empty') // Проверка, что строка не пустая
  .isMongoId()
  .withMessage('Incorrect format of blogId'); // Проверка на формат ObjectId

export const postIdValidation = param('postId')
  .exists()
  .withMessage('postId is required') // Проверка на наличие
  .isString()
  .withMessage('postId must be a string') // Проверка, что это строка
  .isLength({ min: 1 })
  .withMessage('postId must not be empty') // Проверка, что строка не пустая
  .isMongoId()
  .withMessage('Incorrect format of postId'); // Проверка на формат ObjectId
