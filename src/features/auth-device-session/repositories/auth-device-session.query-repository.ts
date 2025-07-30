import { authDeviceSessionCollection } from '../../../db/mongo.db';
import { DeviceViewModel } from '../types';

export const AuthDeviceSessionQueryRepository = {
  async findAllActiveSessions(userId: string, expiresAt: Date): Promise<DeviceViewModel[]> {
    return await authDeviceSessionCollection
      .find({ userId, expiresAt: { $gte: expiresAt } })
      .toArray()
      .then((data) =>
        data.map((d) => ({
          ip: d.ip,
          title: d.deviceName,
          lastActiveDate: d.issuedAt.toISOString(),
          deviceId: d.deviceId,
        })),
      );
  },
};
