import { param } from 'express-validator';

export const idValidation = param('id')
  .exists()
  .withMessage('ID is required') // Проверка на наличие
  .isString()
  .withMessage('ID must be a string') // Проверка, что это строка
  .isLength({ min: 1 })
  .withMessage('ID must not be empty') // Проверка, что строка не пустая
  .isMongoId()
  .withMessage('Incorrect format of ObjectId'); // Проверка на формат ObjectId
