import {
  RequestWithBody,
  RequestWithUserDetails,
  RequestWithUserId,
} from '../../../core/types/requests';
import { LoginInputDto } from '../types/login-input.dto';
import { Response } from 'express';
import { ResultStatus } from '../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../core/result/resultCodeToHttpException';
import { HttpStatus, IdType, UserDetails } from '../../../core';
import { appConfig } from '../../../core/config';
import { RegistrationUserInputDto } from '../types/registration-user-input.dto';
import {
  AccessTokenResponse,
  ErrorMessagesResponse,
  ResponseWith,
} from '../../../core/types/responses';
import { RegistrationEmailResendingInputDto } from '../types/registration-email-resending-input.dto';
import { RegistrationConfirmationInputDto } from '../types/registration-confirmation.input.dto';
import { PasswordRecoveryInputDto } from '../types/password-recovery-input.dto';
import { NewPasswordInputDto } from '../types/new-password-input.dto';
import { AuthService } from '../domain/auth.service';
import { mapToMeViewModel } from '../../users/mappers/map-to-user-view-model';
import { UsersQueryRepository } from '../../users/repositories/users.query-repository';
import { inject, injectable } from 'inversify';

@injectable()
export class AuthController {
  constructor(
    @inject(AuthService) private authService: AuthService,
    @inject(UsersQueryRepository) private usersQueryRepository: UsersQueryRepository,
  ) {}

  async loginHandler(req: RequestWithBody<LoginInputDto>, res: Response) {
    const ip = req.ip;
    const userAgent = req.get('User-Agent');
    const result = await this.authService.login(req.body, ip, userAgent);

    if (result.status !== ResultStatus.Success) {
      res.status(resultCodeToHttpException(result.status)).send(result.extensions);
      return;
    }

    res
      .status(HttpStatus.Ok)
      .cookie('refreshToken', result.data.refreshToken, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: appConfig.RT_COOKIE_MAX_AGE,
      })
      .send({ accessToken: result.data!.accessToken });
  }

  async meHandler(req: RequestWithUserId<IdType>, res: Response) {
    const userId = req.user?.id;

    if (userId) {
      const me = await this.usersQueryRepository.findUserById(userId);

      if (me) {
        const meOutput = mapToMeViewModel(me);
        res.status(HttpStatus.Ok).send(meOutput);
        return;
      }
    }

    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }

  async registrationHandler(
    req: RequestWithBody<RegistrationUserInputDto>,
    res: ResponseWith<ErrorMessagesResponse>,
  ) {
    const result = await this.authService.registerUser(req.body);

    if (result.status !== ResultStatus.Success) {
      res
        .status(resultCodeToHttpException(result.status))
        .send({ errorsMessages: result.extensions });
      return;
    }

    res.status(HttpStatus.NoContent).send();
    return;
  }

  async registrationEmailResendingHandler(
    req: RequestWithBody<RegistrationEmailResendingInputDto>,
    res: ResponseWith<ErrorMessagesResponse>,
  ) {
    const email = req.body.email;

    const result = await this.authService.resendEmailConfirmation({ email });

    if (result.status !== ResultStatus.Success) {
      res
        .status(resultCodeToHttpException(result.status))
        .send({ errorsMessages: result.extensions });
      return;
    }

    res.status(HttpStatus.NoContent).send();
    return;
  }

  async registrationConfirmationHandler(
    req: RequestWithBody<RegistrationConfirmationInputDto>,
    res: ResponseWith<ErrorMessagesResponse>,
  ) {
    const result = await this.authService.confirmEmail({ code: req.body.code });

    if (result.status !== ResultStatus.Success) {
      res
        .status(resultCodeToHttpException(result.status))
        .send({ errorsMessages: result.extensions });
      return;
    }

    res.status(HttpStatus.NoContent).send();
    return;
  }

  async refreshTokenHandler(
    req: RequestWithUserDetails<UserDetails>,
    res: ResponseWith<AccessTokenResponse | ErrorMessagesResponse>,
  ) {
    const userId = req.user?.id;
    const deviceId = req.user.deviceId;
    const tokenExp = req.user.tokenExp;

    const result = await this.authService.refreshToken(userId, deviceId, tokenExp);

    if (result.status !== ResultStatus.Success) {
      res
        .status(resultCodeToHttpException(result.status))
        .send({ errorsMessages: result.extensions });
    }

    res
      .status(HttpStatus.Ok)
      .cookie('refreshToken', result.data.refreshToken, {
        path: '/auth',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: appConfig.RT_COOKIE_MAX_AGE,
      })
      .send({ accessToken: result.data.accessToken });
  }

  async logoutHandler(req: RequestWithUserDetails<UserDetails>, res: Response) {
    const userId = req.user.id;
    const deviceId = req.user.deviceId;

    const result = await this.authService.logout(deviceId, userId);

    if (result.status !== ResultStatus.Success) {
      res
        .status(resultCodeToHttpException(result.status))
        .send({ errorsMessages: result.extensions });

      return;
    }
    res.status(HttpStatus.NoContent).clearCookie('refreshToken').send();
    return;
  }

  async passwordRecoveryHandler(req: RequestWithBody<PasswordRecoveryInputDto>, res: Response) {
    const email = req.body.email;

    await this.authService.passwordRecovery(email);

    // if (result.status !== ResultStatus.Success) {
    //   res
    //     .status(resultCodeToHttpException(result.status))
    //     .send({ errorsMessages: result.extensions });
    //
    //   return;
    // }

    res.sendStatus(HttpStatus.NoContent);
    return;
  }

  async newPasswordHandler(req: RequestWithBody<NewPasswordInputDto>, res: Response) {
    const result = await this.authService.updatePassword(req.body);

    if (result.status !== ResultStatus.Success) {
      res
        .status(resultCodeToHttpException(result.status))
        .send({ errorsMessages: result.extensions });

      return;
    }
    res.sendStatus(HttpStatus.NoContent);
    return;
  }
}
