import { injectable } from 'inversify';
import {
  AuthDeviceSessionDocument,
  AuthDeviceSessionModel,
} from '../../../db/models/auth-device-session.model';

@injectable()
export class AuthDeviceSessionRepository {
  async findById(deviceId: string): Promise<AuthDeviceSessionDocument | null> {
    return AuthDeviceSessionModel.findOne({ deviceId });
  }

  async save(newDevice: AuthDeviceSessionDocument): Promise<AuthDeviceSessionDocument> {
    return newDevice.save();
  }

  async deleteById(deviceId: string): Promise<boolean> {
    const result = await AuthDeviceSessionModel.deleteOne({ deviceId });
    return result.deletedCount >= 1;
  }

  async deleteAllExceptCurrent(userId: string, deviceId: string): Promise<boolean> {
    const result = await AuthDeviceSessionModel.deleteMany({
      userId,
      deviceId: { $ne: deviceId },
    });

    return result.deletedCount >= 1;
  }
}
