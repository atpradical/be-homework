import { NextFunction, Request, Response } from 'express';
import { HttpStatus, IdType } from '../../../../core';
import { ResultStatus } from '../../../../core/result/resultCode';
import { authService } from '../../../../core/composition-root';

export async function accessTokenGuard(req: Request, res: Response, next: NextFunction) {
  if (!req.headers.authorization) {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }

  const result = await authService.checkAccessToken(req.headers.authorization);

  if (result.status !== ResultStatus.Success) {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }

  if (result.data.userId) {
    // прокидываем userId в request для других middleWare
    req.user = { id: result.data.userId } as IdType;
    next();
    return;
  }

  res.sendStatus(HttpStatus.Unauthorized);
  return;
}
