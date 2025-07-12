import { Response } from 'express';
import { ExtensionType } from '../result/object-result.entity';
import { Nullable } from './index';

export type ResponseWithExtensions = Response<Nullable<ExtensionType[] | string>>;
export type ResponseWithExtensionsErrorMessages = Response<
  Nullable<{ errorsMessages: ExtensionType[] | string }>
>;
