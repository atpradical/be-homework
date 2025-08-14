import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../enums';
import { ResultStatus } from '../result/resultCode';
import { resultCodeToHttpException } from '../result/resultCodeToHttpException';
import { container } from '../../composition-root';
import { IpRestrictionService } from '../../features/ip-restriction/domain/ip-restriction.service';

export async function ipRestrictionMiddleware(req: Request, res: Response, next: NextFunction) {
  const ipRestrictionService = container.get<IpRestrictionService>(IpRestrictionService);

  const url = req.originalUrl;
  const ip = req.ip;

  // Проверяем кол-во запросов за последние 10 сек.
  const checkResult = await ipRestrictionService.checkRequestsLimit(url, ip);

  if (checkResult.status !== ResultStatus.Success) {
    res.sendStatus(HttpStatus.TooManyRequests);
  }

  //  Добавляем новую запись в БД
  const createResult = await ipRestrictionService.create(url, ip);

  if (createResult.status === ResultStatus.InternalServerError) {
    res.status(resultCodeToHttpException(createResult.status)).send(createResult.extensions);
    return;
  }

  next();
  return;
}
