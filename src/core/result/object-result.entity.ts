import { Nullable } from '../types';
import { ResultStatus } from './resultCode';

export type ExtensionType = {
  field: Nullable<string>;
  message: string;
};

export class ObjectResult<T = null> {
  status: ResultStatus;
  errorMessage?: string;
  data: T;
  extensions: ExtensionType[] | string;

  constructor(params: {
    status: ResultStatus;
    errorMessage?: string;
    data: T;
    extensions: ExtensionType[] | string;
  }) {
    this.status = params.status;
    this.errorMessage = params.errorMessage;
    this.data = params.data;
    this.extensions = params.extensions;
  }

  static createSuccessResult<T>(data: T): ObjectResult<T> {
    return new ObjectResult({ status: ResultStatus.Success, data, extensions: [] });
  }

  static createErrorResult(params: {
    status: ResultStatus;
    errorMessage?: string;
    extensions: ExtensionType[] | string;
  }): ObjectResult<null> {
    return new ObjectResult({
      status: params.status,
      errorMessage: params.errorMessage,
      data: null,
      extensions: params.extensions,
    });
  }
}
