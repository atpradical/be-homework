import {
  RequestWithParamsAndUserDetails,
  RequestWithUserDetails,
} from '../../../core/types/requests';
import { HttpStatus, UserDetails } from '../../../core';
import { Response } from 'express';
import { ResultStatus } from '../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../core/result/resultCodeToHttpException';
import { AuthDeviceSessionService } from '../domain/auth-device-session.service';
import { AuthDeviceSessionQueryRepository } from '../repositories/auth-device-session.query-repository';
import { inject, injectable } from 'inversify';

@injectable()
export class SecurityDevicesSessionsController {
  constructor(
    @inject(AuthDeviceSessionService) private authDeviceSessionService: AuthDeviceSessionService,
    @inject(AuthDeviceSessionQueryRepository)
    private authDeviceSessionQueryRepository: AuthDeviceSessionQueryRepository,
  ) {}

  async getSecurityDeviceListHandler(req: RequestWithUserDetails<UserDetails>, res: Response) {
    const userId = req.user.id;

    const result = await this.authDeviceSessionQueryRepository.findAllActiveSessions(
      userId,
      new Date(),
    );

    res.status(HttpStatus.Ok).send(result);
    return;
  }

  async deleteAllSecurityDeviceSessionsHandler(
    req: RequestWithUserDetails<UserDetails>,
    res: Response,
  ) {
    const userId = req.user.id;
    const deviceId = req.user.deviceId;

    const result = await this.authDeviceSessionService.deleteAllExceptCurrent(userId, deviceId);

    if (result.status !== ResultStatus.Success) {
      res.status(resultCodeToHttpException(result.status)).send(result.extensions);
      return;
    }

    res.sendStatus(HttpStatus.NoContent);
    return;
  }

  async deleteSecurityDeviceSessionHandler(
    req: RequestWithParamsAndUserDetails<{ id: string }, UserDetails>,
    res: Response,
  ) {
    const userId = req.user.id;
    const deviceId = req.params.id;

    const result = await this.authDeviceSessionService.deleteByDeviceId(deviceId, userId);

    if (result.status !== ResultStatus.Success) {
      res.status(resultCodeToHttpException(result.status)).send(result.extensions);
      return;
    }

    res.sendStatus(HttpStatus.NoContent);
    return;
  }
}
