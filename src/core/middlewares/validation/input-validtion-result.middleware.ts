import { validationResult } from 'express-validator';
import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../enums';
import { formatErrors } from '../../helpers/error.utils';

export const inputValidationResultMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req)
    .formatWith(formatErrors)
    .array({ onlyFirstError: true });

  if (errors.length > 0) {
    res.status(HttpStatus.BadRequest).json({ errorsMessages: errors });
    return;
  }

  next();
};
