import { UNKNOWN_DEVICE, UNKNOWN_IP } from '../../../core';

type Params = {
  userId: string;
  deviceId: string;
  deviceName: string;
  ip: string;
  issuedAt: Date;
  expiresAt: Date;
};

export class AuthDeviceSession {
  userId: string;
  deviceId: string;
  deviceName: string;
  ip: string;
  issuedAt: Date;
  expiresAt: Date;

  constructor(params: Params) {
    const { userId, deviceId, deviceName, ip, issuedAt, expiresAt } = params;

    this.userId = userId;
    this.deviceId = deviceId;
    this.deviceName = deviceName ?? UNKNOWN_DEVICE;
    this.ip = ip ?? UNKNOWN_IP;
    this.issuedAt = issuedAt;
    this.expiresAt = expiresAt;
  }

  static create(params: Params) {
    return new AuthDeviceSession(params);
  }
}
