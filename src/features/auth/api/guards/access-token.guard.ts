import { NextFunction, Request, Response } from 'express';
import { HttpStatus, IdType } from '../../../../core';
import { jwtService } from '../../adapters/jwt.service';
import { usersQueryRepository } from '../../../users/repositories/users.query-repository';

export async function accessTokenGuard(req: Request, res: Response, next: NextFunction) {
  if (!req.headers.authorization) {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }

  const [authType, token] = req.headers.authorization.split(' ');

  if (authType !== 'Bearer') {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }

  const payload = await jwtService.verifyToken(token);

  if (!payload) {
    res.status(HttpStatus.Unauthorized).send('Invalid token');
    return;
  }

  if (payload) {
    // прокидываем userId в request для других middleWare
    req.user = { id: payload.userId } as IdType;
    next();
    return;
  }

  res.sendStatus(HttpStatus.Unauthorized);
  return;
}
