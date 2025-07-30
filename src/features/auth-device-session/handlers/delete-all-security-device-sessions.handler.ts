import { Response } from 'express';
import { HttpStatus, UserDetails } from '../../../core';
import { ResultStatus } from '../../../core/result/resultCode';
import { authDeviceSessionService } from '../domain/auth-device-session.service';
import { resultCodeToHttpException } from '../../../core/result/resultCodeToHttpException';
import { RequestWithUserDetails } from '../../../core/types/requests';

export async function deleteAllSecurityDeviceSessionsHandler(
  req: RequestWithUserDetails<UserDetails>,
  res: Response,
) {
  const userId = req.user.id;
  const deviceId = req.user.deviceId;

  const result = await authDeviceSessionService.deleteAllExceptCurrent(userId, deviceId);

  if (result.status !== ResultStatus.Success) {
    res.status(resultCodeToHttpException(result.status)).send(result.extensions);
    return;
  }

  res.sendStatus(HttpStatus.NoContent);
  return;
}
