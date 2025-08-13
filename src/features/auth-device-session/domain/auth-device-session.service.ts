import { AuthDeviceSessionRepository } from '../repositories/auth-device-session.repository';
import { ObjectResult } from '../../../core/result/object-result.entity';
import { ResultStatus } from '../../../core/result/resultCode';
import { injectable } from 'inversify';
import { AuthDeviceSessionDocument } from '../../../db/models/auth-device-session.model';

@injectable()
export class AuthDeviceSessionService {
  constructor(private authDeviceSessionRepository: AuthDeviceSessionRepository) {}

  async findById(deviceId: string): Promise<AuthDeviceSessionDocument | null> {
    return this.authDeviceSessionRepository.findById(deviceId);
  }

  async save(
    newDevice: AuthDeviceSessionDocument,
  ): Promise<ObjectResult<AuthDeviceSessionDocument>> {
    const deviceSession = await this.authDeviceSessionRepository.save(newDevice);

    if (!deviceSession) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'InternalServerError',
        extensions: 'Oops, something went wrong',
      });
    }

    return ObjectResult.createSuccessResult(deviceSession);
  }

  async deleteByDeviceId(deviceId: string, userId: string): Promise<ObjectResult> {
    // Находим сессию по deviceId
    const session = await this.authDeviceSessionRepository.findById(deviceId);

    if (!session) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'deviceId', message: `Session with deviceId:${deviceId} not found` }],
      });
    }

    // проверяем, что сессия принадлежит юзеру
    if (session.userId !== userId) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.Forbidden,
        errorMessage: 'Forbidden',
        extensions: [
          { field: 'userId', message: `Session deletion is forbidden for user with id:${userId}` },
        ],
      });
    }

    // удаляем сессию по deviceId
    const result = await this.authDeviceSessionRepository.deleteById(deviceId);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'InternalServerError',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    return ObjectResult.createSuccessResult(null);
  }

  async deleteAllExceptCurrent(userId: string, deviceId: string): Promise<ObjectResult> {
    const result = await this.authDeviceSessionRepository.deleteAllExceptCurrent(userId, deviceId);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'InternalServerError',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    return ObjectResult.createSuccessResult(null);
  }
}
