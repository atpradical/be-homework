import { Response } from 'express';
import { ExtensionType } from '../result/object-result.entity';
import { Nullable } from './index';

export type ResponseWithExtensions = Response<Nullable<ExtensionType[] | string>>;

export type ResponseWith<T> = Response<Nullable<T>>;
export type AccessTokenResponse = { accessToken: string };
export type ErrorMessagesResponse = { errorsMessages: ExtensionType[] | string };
