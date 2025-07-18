import { Response } from 'express';
import { RepositoryNotFoundError } from './repository-not-found.error';
import { HttpStatus } from '../enums';
import { DomainError } from './domain.error';
import { AuthorizationError } from './authorization.error';

export function errorsHandler(error: unknown, res: Response): void {
  if (error instanceof RepositoryNotFoundError) {
    const httpStatus = HttpStatus.NotFound;

    res.sendStatus(httpStatus);

    return;
  }

  if (error instanceof AuthorizationError) {
    res.status(HttpStatus.Unauthorized).send({
      errorsMessages: [{ field: error.field, message: error.message }],
    });
  }

  if (error instanceof DomainError) {
    const httpStatus = HttpStatus.BadRequest;

    res.status(httpStatus).send({
      errorsMessages: [{ field: error.field, message: error.message }],
    });

    return;
  }

  res.status(HttpStatus.InternalServerError);
  return;
}
