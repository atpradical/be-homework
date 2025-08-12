import { AuthDeviceSessionRepository } from '../repositories/auth-device-session.repository';
import { AuthDeviceSession } from './auth-device-session.entity';
import { ObjectResult } from '../../../core/result/object-result.entity';
import { ResultStatus } from '../../../core/result/resultCode';
import { injectable } from 'inversify';

@injectable()
export class AuthDeviceSessionService {
  constructor(private authDeviceSessionRepository: AuthDeviceSessionRepository) {}

  async create(newDevice: AuthDeviceSession): Promise<ObjectResult<string>> {
    const sessionId = await this.authDeviceSessionRepository.create(newDevice);

    if (!sessionId) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'InternalServerError',
        extensions: 'Oops, something went wrong',
      });
    }

    return ObjectResult.createSuccessResult(sessionId);
  }

  async findById(deviceId: string): Promise<AuthDeviceSession | null> {
    return this.authDeviceSessionRepository.findById(deviceId);
  }

  async updateDates(deviceId: string, issuedAt: Date, expiresAt: Date): Promise<ObjectResult> {
    const result = this.authDeviceSessionRepository.updateDates(deviceId, issuedAt, expiresAt);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'InternalServerError',
        extensions: 'Oops, something went wrong',
      });
    }

    return ObjectResult.createSuccessResult(null);
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
