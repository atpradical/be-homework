import { validationResult } from 'express-validator';
import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../enums';
import { formatErrors } from '../../utils/error.utils';

export const inputValidationResultMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req)
    .formatWith(formatErrors)
    .array({ onlyFirstError: true });

  if (errors.length > 0) {
    res.status(HttpStatus.BadRequest).json({ errorMessages: errors });
    return;
  }

  next();
};
