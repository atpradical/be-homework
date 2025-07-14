import { NextFunction, Request, Response } from 'express';
import { HttpStatus, IdType } from '../../../../core';
import { jwtService } from '../../adapters/jwt.service';
import { usersQueryRepository } from '../../../users/repositories/users.query-repository';
import { tokenBlacklistRepository } from '../../../token-blacklist/repositories/tokenBlacklist.repository';

export async function refreshTokenGuard(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.refreshToken;

  if (!token) {
    res.status(HttpStatus.Unauthorized).send('Invalid token');
    return;
  }

  const payload = await jwtService.verifyRefreshToken(token);

  if (!payload) {
    res.status(HttpStatus.Unauthorized).send('Invalid token');
    return;
  }

  const isTokenInBlackList = await tokenBlacklistRepository.findTokenInBlackList(token);

  if (isTokenInBlackList) {
    res.status(HttpStatus.Unauthorized).send('Invalid token');
    return;
  }

  const user = await usersQueryRepository.findUserById(payload.userId);

  if (!user) {
    res.status(HttpStatus.BadRequest).send('User not found');
    return;
  }

  if (payload) {
    // прокидываем userId в request для других middleWare
    req.user = { id: payload.userId } as IdType;
    req.refreshToken = token;
    next();
    return;
  }

  res.sendStatus(HttpStatus.BadRequest);
  return;
}
