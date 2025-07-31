import { authDeviceSessionRepository } from '../repositories/auth-device-session.repository';
import { AuthDeviceSession } from './auth-device-session.entity';
import { ObjectResult } from '../../../core/result/object-result.entity';
import { ResultStatus } from '../../../core/result/resultCode';

export const authDeviceSessionService = {
  async create(newDevice: AuthDeviceSession): Promise<ObjectResult<string>> {
    const sessionId = await authDeviceSessionRepository.create(newDevice);

    if (!sessionId) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'InternalServerError',
        extensions: 'Oops, something went wrong',
      });
    }

    return ObjectResult.createSuccessResult(sessionId);
  },

  async findById(deviceId: string): Promise<AuthDeviceSession | null> {
    return authDeviceSessionRepository.findById(deviceId);
  },

  async updateExpiresAt(deviceId: string, issuedAt: Date, expiresAt: Date): Promise<ObjectResult> {
    const result = authDeviceSessionRepository.updateExpiresAt(deviceId, issuedAt, expiresAt);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'InternalServerError',
        extensions: 'Oops, something went wrong',
      });
    }

    return ObjectResult.createSuccessResult(null);
  },

  async deleteByDeviceId(deviceId: string, userId: string): Promise<ObjectResult> {
    // Находим сессию по deviceId
    const session = await authDeviceSessionRepository.findById(deviceId);

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
    const result = await authDeviceSessionRepository.deleteById(deviceId);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'InternalServerError',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    return ObjectResult.createSuccessResult(null);
  },

  async deleteAllExceptCurrent(userId: string, deviceId: string): Promise<ObjectResult> {
    const result = await authDeviceSessionRepository.deleteAllExceptCurrent(userId, deviceId);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'InternalServerError',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    return ObjectResult.createSuccessResult(null);
  },
};
