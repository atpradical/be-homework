import { authDeviceSessionCollection } from '../../../db/mongo.db';
import { AuthDeviceSession } from '../domain/auth-device-session.entity';
import { WithId } from 'mongodb';

export class AuthDeviceSessionRepository {
  async create(newDevice: AuthDeviceSession): Promise<string> {
    const insertResult = await authDeviceSessionCollection.insertOne(newDevice);
    return insertResult.insertedId.toString();
  }

  async findById(deviceId: string): Promise<WithId<AuthDeviceSession>> {
    return await authDeviceSessionCollection.findOne({ deviceId });
  }

  async updateDates(deviceId: string, issuedAt: Date, expiresAt: Date): Promise<boolean> {
    const updateResult = await authDeviceSessionCollection.updateOne(
      { deviceId },
      { $set: { issuedAt, expiresAt } },
    );

    return updateResult.matchedCount >= 1;
  }

  async deleteById(deviceId: string): Promise<boolean> {
    const deleteResult = await authDeviceSessionCollection.deleteOne({ deviceId });
    return deleteResult.deletedCount >= 1;
  }

  async deleteAllExceptCurrent(userId: string, deviceId: string): Promise<boolean> {
    const deleteResult = await authDeviceSessionCollection.deleteMany({
      userId,
      deviceId: { $ne: deviceId },
    });

    return deleteResult.deletedCount >= 1;
  }
}
