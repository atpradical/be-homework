import { Response } from 'express';
import { LoginInputDto } from '../../types/login-input.dto';
import { authService } from '../../domain/auth.service';
import { HttpStatus } from '../../../../core';
import { RequestWithBody } from '../../../../core/types/requests';
import { ResultStatus } from '../../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';
import { appConfig } from '../../../../core/config';

export async function loginHandler(req: RequestWithBody<LoginInputDto>, res: Response) {
  const ip = req.ip;
  const userAgent = req.get('User-Agent');
  const result = await authService.login(req.body, ip, userAgent);

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
