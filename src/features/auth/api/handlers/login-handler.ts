import { Response } from 'express';
import { LoginInputDto } from '../../types/login-input.dto';
import { authService } from '../../domain/auth.service';
import { HttpStatus } from '../../../../core';
import { RequestWithBody } from '../../../../core/types/requests';
import { ResultStatus } from '../../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';

export async function loginHandler(req: RequestWithBody<LoginInputDto>, res: Response) {
  const result = await authService.login(req.body);

  if (result.status !== ResultStatus.Success) {
    res.status(resultCodeToHttpException(result.status)).send(result.extensions);
    return;
  }

  res.status(HttpStatus.Ok).send({ accessToken: result.data!.accessToken });
}
