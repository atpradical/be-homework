export type IdType = { id: string };

export type UserDetails = {
  id: string;
  deviceId?: string;
  tokenExp?: number;
};

export type PostIdType = { postId: string };

export type ValidationErrorType = {
  field: string;
  message: string;
};

export type ValidationErrorDto = { errorsMessages: ValidationErrorType[] };

export type Nullable<T> = T | null;
