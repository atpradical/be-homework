import { RequestWithUserId } from '../../../../core/types/requests';
import { authService } from '../../domain/auth.service';
import { HttpStatus, IdType } from '../../../../core';
import {
  AccessTokenResponse,
  ErrorMessagesResponse,
  ResponseWith,
} from '../../../../core/types/responses';
import { appConfig } from '../../../../core/config';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';
import { ResultStatus } from '../../../../core/result/resultCode';

export async function refreshTokenHandler(
  req: RequestWithUserId<IdType>,
  res: ResponseWith<AccessTokenResponse | ErrorMessagesResponse>,
) {
  const userId = req.user?.id;
  const token = req.refreshToken;

  const result = await authService.refreshToken(userId, token);

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
  return;
}
