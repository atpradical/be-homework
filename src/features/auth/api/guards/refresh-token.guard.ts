import { NextFunction, Request, Response } from 'express';
import { HttpStatus, IdType } from '../../../../core';
import { authService } from '../../domain/auth.service';
import { ResultStatus } from '../../../../core/result/resultCode';

export async function refreshTokenGuard(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.refreshToken;

  if (!token) {
    res.status(HttpStatus.Unauthorized).send('Invalid token');
    return;
  }

  const result = await authService.checkRefreshToken(token);

  if (result.status !== ResultStatus.Success) {
    res.status(HttpStatus.Unauthorized).send('Invalid token');
    return;
  }

  if (result.data.userId) {
    // прокидываем userId в request для других middleWare
    req.user = { id: result.data.userId } as IdType;
    req.refreshToken = token;
    next();
    return;
  }

  res.sendStatus(HttpStatus.BadRequest);
  return;
}
