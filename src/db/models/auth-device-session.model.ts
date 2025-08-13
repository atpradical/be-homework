import mongoose, { HydratedDocument, model, Model } from 'mongoose';
import { AuthDeviceSession } from '../../features/auth-device-session/domain/auth-device-session.entity';
import { AUTH_DEVICE_SESSION_COLLECTION_NAME } from '../mongo.db';
import { appConfig } from '../../core/config';

export const authDeviceSessionSchema = new mongoose.Schema<AuthDeviceSession>({
  userId: {
    type: String,
    required: true,
    minLength: [1, 'UserId is required'],
    maxLength: [100, 'Too long UserId'],
  },

  deviceId: {
    type: String,
    required: true,
    minLength: [1, 'DeviceId is required'],
    maxLength: [100, 'Too long DeviceId'],
  },

  deviceName: {
    type: String,
    required: true,
    minLength: [1, 'DeviceName is required'],
    maxLength: [100, 'Too long DeviceName'],
  },

  ip: {
    type: String,
    required: true,
    minLength: [1, 'IP is required'],
    maxLength: [100, 'Too long IP'],
  },

  issuedAt: { type: Date, required: true },

  expiresAt: {
    type: Date,
    required: true,
    index: {
      expireAfterSeconds: appConfig.AUTH_DEVICE_SESSION_TTL, // TTL активируется на expiresAt
    },
  },
});

type AuthDeviceSessionModel = Model<AuthDeviceSession>;
export type AuthDeviceSessionDocument = HydratedDocument<AuthDeviceSession>;
export const AuthDeviceSessionModel = model<AuthDeviceSession, AuthDeviceSessionModel>(
  AUTH_DEVICE_SESSION_COLLECTION_NAME,
  authDeviceSessionSchema,
);
