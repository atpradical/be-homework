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

export const authService = {
  async login(dto: LoginInputDto): Promise<ObjectResult<Nullable<{ accessToken: string }>>> {
    const result = await this.checkCredentials(dto);

    if (result.status !== ResultStatus.Success) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'loginOrEmail', message: 'Wrong credentials' }],
      });
    }

    const accessToken = await jwtService.createToken(result.data!._id.toString());

    return ObjectResult.createSuccessResult({ accessToken });
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

    const isUser = await usersRepository.doesExistByLoginOrEmail({ login, email });

    if (isUser) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        extensions: [
          { field: 'loginOrEmail', message: 'User with this login or email already exists' },
        ],
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
        user.emailConfirmation.confirmationCode,
        emailExamples.registrationEmailResending,
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
};
