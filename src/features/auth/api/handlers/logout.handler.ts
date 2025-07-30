import { Response } from 'express';
import { authService } from '../../domain/auth.service';
import { HttpStatus, UserDetails } from '../../../../core';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';
import { ResultStatus } from '../../../../core/result/resultCode';
import { RequestWithUserDetails } from '../../../../core/types/requests';

export async function logoutHandler(req: RequestWithUserDetails<UserDetails>, res: Response) {
  const userId = req.user.id;
  const deviceId = req.user.deviceId;

  const result = await authService.logout(deviceId, userId);

  if (result.status !== ResultStatus.Success) {
    res
      .status(resultCodeToHttpException(result.status))
      .send({ errorsMessages: result.extensions });

    return;
  }
  res.status(HttpStatus.NoContent).clearCookie('refreshToken').send();
  return;
}

//todo: добавить TTL в authDeviceSessionCollection
