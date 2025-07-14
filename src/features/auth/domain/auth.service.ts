import { usersQueryRepository } from '../../users/repositories/users.query-repository';
import { LoginInputDto } from '../types/login-input.dto';
import { WithId } from 'mongodb';
import { jwtService } from '../adapters/jwt.service';
import { bcryptService } from '../adapters/bcrypt.service';
import { ResultStatus } from '../../../core/result/resultCode';
import { RegistrationUserInputDto } from '../types/registration-user-input.dto';
import { User } from '../../users/domain/user.entity';
import { usersRepository } from '../../users/repositories/users.repository';
import { nodemailerService } from '../adapters/nodemailer.service';
import { emailExamples } from '../adapters/emailExamples';
import { ObjectResult } from '../../../core/result/object-result.entity';
import { RegistrationEmailResendingInputDto } from '../types/registration-email-resending-input.dto';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns/add';
import { RegistrationConfirmationInputDto } from '../types/registration-confirmation.input.dto';
import { Nullable } from '../../../core';
import { AuthTokens } from '../types/auth-tokens.type';
import { tokenBlacklistRepository } from '../../token-blacklist/repositories/tokenBlacklist.repository';

export const authService = {
  async login(
    dto: LoginInputDto,
  ): Promise<ObjectResult<Nullable<{ accessToken: string; refreshToken: string }>>> {
    const result = await this.checkCredentials(dto);

    if (result.status !== ResultStatus.Success) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'email', message: 'not confirmed' }],
      });
    }

    const { accessToken, refreshToken } = await this.generateTokens(result.data!._id.toString());

    return ObjectResult.createSuccessResult({ accessToken, refreshToken });
  },

  async checkCredentials(dto: LoginInputDto): Promise<ObjectResult<WithId<User>>> {
    const user = await usersQueryRepository.findUserByLoginOrEmail(dto.loginOrEmail);

    if (!user) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'loginOrEmail', message: 'Not Found' }],
      });
    }

    const isPasswordCorrect = await bcryptService.checkPassword(dto.password, user.passwordHash);

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
  },

  async registerUser(dto: RegistrationUserInputDto): Promise<Nullable<ObjectResult<User>>> {
    const { login, email, password } = dto;

    const isSameLogin = await usersRepository.doesExistByLogin(login);

    if (isSameLogin) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'login', message: 'User with this login already exists' }],
      });
    }

    const isSameEmail = await usersRepository.doesExistByEmail(email);

    if (isSameEmail) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'email', message: 'User with this email already exists' }],
      });
    }

    const passwordHash = await bcryptService.generateHash(password);

    const user = new User(login, email, passwordHash);

    await usersRepository.create(user);

    nodemailerService
      .sendEmail(
        user.email,
        user.emailConfirmation.confirmationCode,
        emailExamples.registrationEmail,
      )
      .catch((e: unknown) => {
        console.log('error in send email: ', e);
      });

    return ObjectResult.createSuccessResult(null);
  },

  async resendEmailConfirmation(
    dto: RegistrationEmailResendingInputDto,
  ): Promise<Nullable<ObjectResult>> {
    const { email } = dto;

    const user = await usersRepository.findUserByLoginOrEmail(email);

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
    const updatedEmailConfirmation = {
      confirmationCode: randomUUID(),
      expirationDate: add(new Date(), { days: 1 }),
      isConfirmed: false,
    };

    const updateResult = await usersRepository.update(user._id, {
      emailConfirmation: updatedEmailConfirmation,
    });

    if (!updateResult) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'Database update failed',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    nodemailerService
      .sendEmail(
        user.email,
        updatedEmailConfirmation.confirmationCode,
        emailExamples.registrationEmail,
      )
      .catch((e: unknown) => {
        console.log('error in send email: ', e);
      });

    return ObjectResult.createSuccessResult(null);
  },

  async confirmEmail(
    dto: RegistrationConfirmationInputDto,
  ): Promise<Promise<Nullable<ObjectResult>>> {
    const user = await usersRepository.findUserByConfirmationCode(dto.code);

    if (!user) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'code', message: 'Invalid code' }],
      });
    }

    if (user.emailConfirmation.isConfirmed) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'code', message: 'Already confirmed' }],
      });
    }

    if (user.emailConfirmation.expirationDate < new Date()) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        extensions: [{ message: 'Code is expired', field: 'code' }],
      });
    }

    const updateResult = await usersRepository.update(user._id, {
      emailConfirmation: {
        isConfirmed: true,
        confirmationCode: user.emailConfirmation.confirmationCode,
        expirationDate: user.emailConfirmation.expirationDate,
      },
    });

    if (!updateResult) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'Database update failed',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    return ObjectResult.createSuccessResult(null);
  },

  async checkAccessToken(authHeader: string): Promise<ObjectResult<{ userId: string }>> {
    const [authType, token] = authHeader.split(' ');

    if (authType !== 'Bearer') {
      return ObjectResult.createErrorResult({
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'authType', message: 'Invalid auth type' }],
      });
    }

    const payload = await jwtService.verifyToken(token);

    if (!payload) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'authType', message: 'Invalid auth type' }],
      });
    }

    return ObjectResult.createSuccessResult({ userId: payload.userId });
  },

  async checkRefreshToken(token: string): Promise<ObjectResult<{ userId: string }>> {
    const payload = await jwtService.verifyRefreshToken(token);

    if (!payload) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'token', message: 'Invalid token' }],
      });
    }

    const isTokenInBlackList = await tokenBlacklistRepository.findTokenInBlackList(token);

    if (isTokenInBlackList) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'token', message: 'Invalid token' }],
      });
    }

    const user = await usersQueryRepository.findUserById(payload.userId);

    if (!user) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'token', message: 'Invalid token' }],
      });
    }

    return ObjectResult.createSuccessResult({ userId: payload.userId });
  },

  async refreshToken(
    id,
    token,
  ): Promise<ObjectResult<Nullable<{ accessToken: string; refreshToken: string }>>> {
    const blacklistResult = await tokenBlacklistRepository.addTokenToBlackList(token);

    if (!blacklistResult) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'Database update failed',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    const { refreshToken, accessToken } = await this.generateTokens(id);

    return ObjectResult.createSuccessResult({ accessToken, refreshToken });
  },

  async generateTokens(id: string): Promise<AuthTokens> {
    const accessToken = await jwtService.createToken(id.toString());
    const refreshToken = await jwtService.createRefreshToken(id.toString());

    return {
      accessToken,
      refreshToken,
    };
  },

  async logout(token: string): Promise<Promise<Nullable<ObjectResult>>> {
    const result = await tokenBlacklistRepository.addTokenToBlackList(token);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'Database update failed',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    return ObjectResult.createSuccessResult(null);
  },
};
