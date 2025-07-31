import { HttpStatus } from '../enums';
import { ResultStatus } from './resultCode';

export const resultCodeToHttpException = (resultCode: ResultStatus): number => {
  switch (resultCode) {
    case ResultStatus.BadRequest:
      return HttpStatus.BadRequest;
    case ResultStatus.Forbidden:
      return HttpStatus.Forbidden;
    case ResultStatus.NotFound:
      return HttpStatus.NotFound;
    case ResultStatus.Unauthorized:
      return HttpStatus.Unauthorized;
    case ResultStatus.TooManyRequests:
      return HttpStatus.TooManyRequests;
    case ResultStatus.InternalServerError:
      return HttpStatus.InternalServerError;
    default:
      return HttpStatus.InternalServerError;
  }
};
