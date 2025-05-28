export type ValidationErrorType = {
  field: string;
  message: string;
};

export type ValidationErrorDto = { errorMessages: ValidationErrorType[] };
