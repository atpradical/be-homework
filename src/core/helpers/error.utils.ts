import { ValidationErrorDto, ValidationErrorType } from '../types';
import { FieldValidationError, ValidationError } from 'express-validator';

export const createErrorMessages = (
  errors: ValidationErrorType[],
): ValidationErrorDto => {
  return { errorsMessages: errors };
};

export const formatErrors = (error: ValidationError): ValidationErrorType => {
  const expressError = error as unknown as FieldValidationError;

  return {
    field: expressError.path,
    message: expressError.msg,
  };
};
