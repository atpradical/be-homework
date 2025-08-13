import { DeviceViewModel } from '../types';
import { injectable } from 'inversify';
import {
  AuthDeviceSessionDocument,
  AuthDeviceSessionModel,
} from '../../../db/models/auth-device-session.model';

@injectable()
export class AuthDeviceSessionQueryRepository {
  async findAllActiveSessions(userId: string, expiresAt: Date): Promise<DeviceViewModel[]> {
    const authSessions = await AuthDeviceSessionModel.find({
      userId,
      expiresAt: { $gte: expiresAt },
    }).sort({ _id: 1 });

    return authSessions.map((el) => ({
      ip: el.ip,
      title: el.deviceName,
      lastActiveDate: el.issuedAt.toISOString(),
      deviceId: el.deviceId,
    }));
  }

  async findById(deviceId: string): Promise<AuthDeviceSessionDocument> {
    return AuthDeviceSessionModel.findOne({ deviceId });
  }
}
