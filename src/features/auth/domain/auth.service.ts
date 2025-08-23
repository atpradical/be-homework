import { LoginInputDto } from '../types/login-input.dto';
import { WithId } from 'mongodb';
import { JwtService, RefreshTokenPayload } from '../adapters/jwt.service';
import { BcryptService } from '../adapters/bcrypt.service';
import { ResultStatus } from '../../../core/result/resultCode';
import { RegistrationUserInputDto } from '../types/registration-user-input.dto';
import { NodemailerService } from '../adapters/nodemailer.service';
import { EmailExamples } from '../adapters/emailExamples';
import { ObjectResult } from '../../../core/result/object-result.entity';
import { RegistrationEmailResendingInputDto } from '../types/registration-email-resending-input.dto';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns/add';
import { RegistrationConfirmationInputDto } from '../types/registration-confirmation.input.dto';
import { Nullable, UNKNOWN_DEVICE, UNKNOWN_IP } from '../../../core';
import { AuthTokens } from '../types/auth-tokens.type';
import { UaParserService } from '../adapters/ua-parser.service';
import { UsersRepository } from '../../users/repositories/users.repository';
import { NewPasswordInputDto } from '../types/new-password-input.dto';
import { inject, injectable } from 'inversify';
import { AuthDeviceSessionService } from '../../auth-device-session/domain/auth-device-session.service';
import {
  AuthDeviceSessionDocument,
  AuthDeviceSessionModel,
} from '../../../db/models/auth-device-session.model';
import { User, UserModel } from '../../../db/models/user.model';

@injectable()
export class AuthService {
  constructor(
    @inject(UsersRepository) private usersRepository: UsersRepository,
    @inject(JwtService) private jwtService: JwtService,
    @inject(BcryptService) private bcryptService: BcryptService,
    @inject(NodemailerService) private nodemailerService: NodemailerService,
    @inject(EmailExamples) private emailExamples: EmailExamples,
    @inject(UaParserService) private uaParserService: UaParserService,
    @inject(AuthDeviceSessionService) private authDeviceSessionService: AuthDeviceSessionService,
  ) {}

  async login(
    dto: LoginInputDto,
    ip: string,
    userAgent?: string,
  ): Promise<ObjectResult<Nullable<{ accessToken: string; refreshToken: string }>>> {
    const result = await this.checkCredentials(dto);

    if (result.status !== ResultStatus.Success) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'email', message: 'not confirmed' }],
      });
    }

    const userId = result.data!._id.toString();

    const generateTokensResult = await this.generateTokensAndAuthSession(userId, ip, userAgent);

    if (!generateTokensResult) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'InternalServerError',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    const { accessToken, refreshToken } = generateTokensResult;

    return ObjectResult.createSuccessResult({ accessToken, refreshToken });
  }

  async checkCredentials(dto: LoginInputDto): Promise<ObjectResult<WithId<User>>> {
    const user = await this.usersRepository.findUserByLoginOrEmail(dto.loginOrEmail);

    if (!user) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'loginOrEmail', message: 'Not Found' }],
      });
    }

    const isPasswordCorrect = await this.bcryptService.checkPassword(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordCorrect) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'password', message: 'Wrong password' }],
      });
    }

    if (!user.emailConfirmation.isConfirmed) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'email', message: 'Email not confirmed' }],
      });
    }

    return ObjectResult.createSuccessResult(user);
  }

  async registerUser(dto: RegistrationUserInputDto): Promise<Nullable<ObjectResult<User>>> {
    const { login, email, password } = dto;

    let existUser = await this.usersRepository.findUserByLoginOrEmail(login);

    if (existUser) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'login', message: 'User with this login already exists' }],
      });
    }

    existUser = await this.usersRepository.findUserByLoginOrEmail(email);

    if (existUser) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'email', message: 'User with this email already exists' }],
      });
    }

    const passwordHash = await this.bcryptService.generateHash(password);

    const user = UserModel.createUser({
      login,
      email,
      passwordHash,
    });

    await this.usersRepository.save(user);

    this.nodemailerService
      .sendEmail(
        user.email,
        user.emailConfirmation.confirmationCode,
        this.emailExamples.registrationEmail,
      )
      .catch((e: unknown) => {
        console.log('error in send email: ', e);
      });

    return ObjectResult.createSuccessResult(null);
  }

  async resendEmailConfirmation(
    dto: RegistrationEmailResendingInputDto,
  ): Promise<Nullable<ObjectResult>> {
    const { email } = dto;

    const user = await this.usersRepository.findUserByLoginOrEmail(email);

    if (!user) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'email', message: 'User with this email not exist' }],
      });
    }

    // Если email уже подтвержден
    if (user.emailConfirmation.isConfirmed) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'email', message: 'Email already confirmed' }],
      });
    }

    // Генерация нового кода и даты истечения
    user.generateNewConfirmationCode();

    const updateResult = await this.usersRepository.save(user);

    if (!updateResult) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'Database update failed',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    this.nodemailerService
      .sendEmail(
        user.email,
        user.emailConfirmation.confirmationCode,
        this.emailExamples.registrationEmail,
      )
      .catch((e: unknown) => {
        console.log('error in send email: ', e);
      });

    return ObjectResult.createSuccessResult(null);
  }

  async confirmEmail(
    dto: RegistrationConfirmationInputDto,
  ): Promise<Promise<Nullable<ObjectResult>>> {
    const user = await this.usersRepository.findUserByConfirmationCode(dto.code);

    const checkResult = user.canBeConfirmed(dto.code);

    if (!checkResult) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'code', message: 'Invalid code' }],
      });
    }

    user.confirmUser(dto.code);

    const updateResult = await this.usersRepository.save(user);

    if (!updateResult) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'Database update failed',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    return ObjectResult.createSuccessResult(null);
  }

  async checkAccessToken(authHeader: string): Promise<ObjectResult<{ userId: string }>> {
    const [authType, token] = authHeader.split(' ');

    if (authType !== 'Bearer') {
      return ObjectResult.createErrorResult({
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'authType', message: 'Invalid auth type' }],
      });
    }

    const payload = await this.jwtService.verifyToken(token);

    if (!payload) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'authType', message: 'Invalid auth type' }],
      });
    }

    return ObjectResult.createSuccessResult({ userId: payload.userId });
  }

  async checkRefreshToken(token: string): Promise<ObjectResult<RefreshTokenPayload>> {
    const payload = await this.jwtService.verifyRefreshToken(token);

    if (!payload) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'token', message: 'Invalid token' }],
      });
    }

    const authDeviceSession = await this.authDeviceSessionService.findById(payload.deviceId);

    if (!authDeviceSession) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'token', message: 'Invalid token' }],
      });
    }

    // если даты exp разные - это значит, что токен или старый, или невалидный
    if (authDeviceSession.expiresAt.toISOString() !== new Date(payload.exp * 1000).toISOString()) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'token', message: 'Invalid token' }],
      });
    }

    const user = await this.usersRepository.findUserById(payload.userId);

    if (!user) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'token', message: 'Invalid token' }],
      });
    }

    return ObjectResult.createSuccessResult(payload);
  }

  async refreshToken(
    userId: string,
    deviceId: string,
    tokenExp: number,
  ): Promise<ObjectResult<Nullable<{ accessToken: string; refreshToken: string }>>> {
    const authDeviceSession = await this.authDeviceSessionService.findById(deviceId);

    if (
      !authDeviceSession ||
      authDeviceSession.expiresAt.toISOString() !== new Date(tokenExp * 1000).toISOString()
    ) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'token', message: 'Invalid token' }],
      });
    }

    // Генерим новую пару токенов и обновляем expiresAt в сессии
    const result = await this.generateTokensAndUpdateSession(userId, authDeviceSession);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'InternalServerError',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    const { accessToken, refreshToken } = result;

    return ObjectResult.createSuccessResult({ accessToken, refreshToken });
  }

  async generateTokensAndAuthSession(
    userId: string,
    ip: string,
    userAgent?: string,
  ): Promise<AuthTokens | null> {
    const deviceId = crypto.randomUUID();

    const deviceName = await this.uaParserService
      .parse(userAgent)
      .then((data) => data.browser.name + ' ' + data.os.name);

    const accessToken = await this.jwtService.createToken(userId);
    const refreshToken = await this.jwtService.createRefreshToken(userId, deviceId);
    const decodedRefreshToken = await this.jwtService.decodeToken(refreshToken);

    const newDevice = AuthDeviceSessionModel.createDevice({
      userId: userId,
      deviceId: deviceId,
      deviceName: deviceName ?? UNKNOWN_DEVICE,
      ip: ip ?? UNKNOWN_IP,
      issuedAt: decodedRefreshToken.iat,
      expiresAt: decodedRefreshToken.exp,
    });

    const sessionCreateResult = await this.authDeviceSessionService.save(newDevice);

    if (sessionCreateResult.status !== ResultStatus.Success) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  async generateTokensAndUpdateSession(
    userId: string,
    authDeviceSession: AuthDeviceSessionDocument,
  ): Promise<AuthTokens | null> {
    const accessToken = await this.jwtService.createToken(userId);

    const refreshToken = await this.jwtService.createRefreshToken(
      userId,
      authDeviceSession.deviceId,
    );

    const decodedRefreshToken = await this.jwtService.decodeToken(refreshToken);

    authDeviceSession.updateDevice({
      issuedAt: decodedRefreshToken.iat,
      expiresAt: decodedRefreshToken.exp,
    });

    const result = await this.authDeviceSessionService.save(authDeviceSession);

    if (result.status !== ResultStatus.Success) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(deviceId: string, userId: string): Promise<ObjectResult> {
    const deleteResult = await this.authDeviceSessionService.deleteByDeviceId(deviceId, userId);

    if (deleteResult.status !== ResultStatus.Success) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'InternalServerError',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    return ObjectResult.createSuccessResult(null);
  }

  async passwordRecovery(email: string): Promise<Nullable<ObjectResult>> {
    const user = await this.usersRepository.findUserByLoginOrEmail(email);

    if (!user) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'email', message: 'User with this email not exist' }],
      });
    }

    // Генерация нового кода и даты истечения
    user.generateNewConfirmationCode();

    const updateResult = await this.usersRepository.save(user);

    if (!updateResult) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'Database update failed',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    this.nodemailerService
      .sendEmail(
        email,
        user.emailConfirmation.confirmationCode,
        this.emailExamples.passwordRecoveryEmail,
      )
      .catch((e: unknown) => {
        console.log('error in send email: ', e);
      });

    return ObjectResult.createSuccessResult(null);
  }

  async updatePassword(dto: NewPasswordInputDto): Promise<Nullable<ObjectResult>> {
    const { newPassword, recoveryCode } = dto;

    const user = await this.usersRepository.findUserByConfirmationCode(recoveryCode);

    if (!user) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'recoveryCode', message: 'invalid recoveryCode' }],
      });
    }
    const newPassHash = await this.bcryptService.generateHash(newPassword);
    user.updateUserPass(newPassHash);

    await this.usersRepository.save(user);

    this.nodemailerService
      .sendEmail(
        user.email,
        user.emailConfirmation.confirmationCode,
        this.emailExamples.passwordRecoveryEmail,
      )
      .catch((e: unknown) => {
        console.log('error in send email: ', e);
      });

    return ObjectResult.createSuccessResult(null);
  }
}
