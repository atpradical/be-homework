import { Response } from 'express';
import { HttpStatus, UserDetails } from '../../../core';
import { authDeviceSessionService } from '../domain/auth-device-session.service';
import { ResultStatus } from '../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../core/result/resultCodeToHttpException';
import { RequestWithParamsAndUserDetails } from '../../../core/types/requests';

export async function deleteSecurityDeviceSessionHandler(
  req: RequestWithParamsAndUserDetails<{ id: string }, UserDetails>,
  res: Response,
) {
  const userId = req.user.id;
  const deviceId = req.params.id;

  const result = await authDeviceSessionService.deleteByDeviceId(deviceId, userId);

  if (result.status !== ResultStatus.Success) {
    res.status(resultCodeToHttpException(result.status)).send(result.extensions);
    return;
  }

  res.sendStatus(HttpStatus.NoContent);
  return;
}
