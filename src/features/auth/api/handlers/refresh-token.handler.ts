import { RequestWithUserDetails } from '../../../../core/types/requests';
import { HttpStatus, UserDetails } from '../../../../core';
import {
  AccessTokenResponse,
  ErrorMessagesResponse,
  ResponseWith,
} from '../../../../core/types/responses';
import { appConfig } from '../../../../core/config';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';
import { ResultStatus } from '../../../../core/result/resultCode';
import { authService } from '../../../../core/composition-root';

export async function refreshTokenHandler(
  req: RequestWithUserDetails<UserDetails>,
  res: ResponseWith<AccessTokenResponse | ErrorMessagesResponse>,
) {
  const userId = req.user?.id;
  const deviceId = req.user.deviceId;
  const tokenExp = req.user.tokenExp;

  const result = await authService.refreshToken(userId, deviceId, tokenExp);

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
