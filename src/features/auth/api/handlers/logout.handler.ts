import { Request, Response } from 'express';
import { authService } from '../../domain/auth.service';
import { HttpStatus } from '../../../../core';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';
import { ResultStatus } from '../../../../core/result/resultCode';

export async function logoutHandler(req: Request, res: Response) {
  const token = req.refreshToken;

  const result = await authService.logout(token);

  if (result.status !== ResultStatus.Success) {
    res
      .status(resultCodeToHttpException(result.status))
      .send({ errorsMessages: result.extensions });

    return;
  }
  res.status(HttpStatus.NoContent).clearCookie('refreshToken').send();
  return;
}
