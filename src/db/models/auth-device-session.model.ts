import mongoose, { HydratedDocument, model, Model } from 'mongoose';
import { AUTH_DEVICE_SESSION_COLLECTION_NAME } from '../mongo.db';
import { appConfig } from '../../core/config';
import { UNKNOWN_DEVICE, UNKNOWN_IP } from '../../core';
import { CreateDeviceDto, UpdateDeviceDto } from '../../features/auth-device-session/domain/dto';
import { IpRestrictionDocument } from './ip-restriction.model';

export const authDeviceSessionSchema = new mongoose.Schema<
  AuthDeviceSession,
  AuthDeviceSessionModel,
  AuthDeviceSessionMethods
>({
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

const authDeviceSessionMethods = {
  updateDevice(dto: UpdateDeviceDto) {
    const that = this as AuthDeviceSessionDocument;

    that.issuedAt = new Date(dto.issuedAt * 1000);
    that.expiresAt = new Date(dto.expiresAt * 1000);
  },
};

const authDeviceSessionStatics = {
  createDevice(dto: CreateDeviceDto) {
    const device = new AuthDeviceSessionModel();

    device.userId = dto.userId;
    device.deviceId = dto.deviceId;
    device.deviceName = dto.deviceName ?? UNKNOWN_DEVICE;
    device.ip = dto.ip ?? UNKNOWN_IP;
    device.issuedAt = new Date(dto.issuedAt * 1000);
    device.expiresAt = new Date(dto.expiresAt * 1000);

    return device;
  },
};

authDeviceSessionSchema.methods = authDeviceSessionMethods;
authDeviceSessionSchema.statics = authDeviceSessionStatics;

type AuthDeviceSessionMethods = typeof authDeviceSessionMethods;
type AuthDeviceSessionStatics = typeof authDeviceSessionStatics;

export type AuthDeviceSession = {
  userId: string;
  deviceId: string;
  deviceName: string;
  ip: string;
  issuedAt: Date;
  expiresAt: Date;
};

type AuthDeviceSessionModel = Model<AuthDeviceSession, {}, AuthDeviceSessionMethods> &
  AuthDeviceSessionStatics;
export type AuthDeviceSessionDocument = HydratedDocument<
  AuthDeviceSession,
  AuthDeviceSessionMethods
>;
export const AuthDeviceSessionModel = model<AuthDeviceSession, AuthDeviceSessionModel>(
  AUTH_DEVICE_SESSION_COLLECTION_NAME,
  authDeviceSessionSchema,
);
