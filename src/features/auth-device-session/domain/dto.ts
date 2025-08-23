export class CreateDeviceDto {
  constructor(
    public userId: string,
    public deviceId: string,
    public deviceName: string,
    public ip: string,
    public issuedAt: number,
    public expiresAt: number,
  ) {}
}

export class UpdateDeviceDto {
  constructor(
    public issuedAt: number,
    public expiresAt: number,
  ) {}
}
