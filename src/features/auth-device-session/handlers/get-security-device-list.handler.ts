import { Response } from 'express';
import { RequestWithUserDetails } from '../../../core/types/requests';
import { HttpStatus, UserDetails } from '../../../core';
import { authDeviceSessionQueryRepository } from '../../../composition-root';

export async function getSecurityDeviceListHandler(
  req: RequestWithUserDetails<UserDetails>,
  res: Response,
) {
  const userId = req.user.id;

  const result = await authDeviceSessionQueryRepository.findAllActiveSessions(userId, new Date());

  res.status(HttpStatus.Ok).send(result);
  return;
}
