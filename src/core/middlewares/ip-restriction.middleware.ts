import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../enums';
import { ipRestrictedService } from '../../features/ip-restriction/domain/ip-restricted.service';
import { ResultStatus } from '../result/resultCode';
import { resultCodeToHttpException } from '../result/resultCodeToHttpException';

export async function ipRestrictionMiddleware(req: Request, res: Response, next: NextFunction) {
  const url = req.originalUrl;
  const ip = req.ip;

  // Проверяем кол-во запросов за последние 10 сек.
  const checkResult = await ipRestrictedService.checkRequestsLimit(url, ip);

  if (checkResult.status !== ResultStatus.Success) {
    res.sendStatus(HttpStatus.TooManyRequests);
  }

  //  Добавляем новую запись в БД
  const createResult = await ipRestrictedService.create(url, ip);

  if (createResult.status === ResultStatus.InternalServerError) {
    res.status(resultCodeToHttpException(createResult.status)).send(createResult.extensions);
    return;
  }

  next();
  return;
}
