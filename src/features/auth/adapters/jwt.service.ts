import jwt, { JwtPayload } from 'jsonwebtoken';
import { appConfig } from '../../../core/config';
import { injectable } from 'inversify';

export type RefreshTokenPayload = JwtPayload & { userId: string; deviceId: string };

@injectable()
export class JwtService {
  async createToken(userId: string): Promise<string> {
    return jwt.sign({ userId }, appConfig.AC_SECRET, {
      expiresIn: appConfig.AC_TIME,
    });
  }

  async createRefreshToken(userId: string, deviceId: string): Promise<string> {
    return jwt.sign({ userId, deviceId }, appConfig.RT_SECRET, {
      expiresIn: appConfig.RT_TIME,
    });
  }

  async decodeToken(token: string): Promise<any> {
    try {
      return jwt.decode(token) as RefreshTokenPayload;
    } catch (e: unknown) {
      console.error("Can't decode token", e);
      return null;
    }
  }

  async verifyToken(token: string): Promise<{ userId: string } | null> {
    try {
      return jwt.verify(token, appConfig.AC_SECRET) as { userId: string };
    } catch (error) {
      console.error('Token verify some error');
      return null;
    }
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
    try {
      return jwt.verify(token, appConfig.RT_SECRET) as RefreshTokenPayload;
    } catch (error) {
      console.error('Token verify some error');
      return null;
    }
  }
}
