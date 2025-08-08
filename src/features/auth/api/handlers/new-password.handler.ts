import { Response } from 'express';
import { HttpStatus } from '../../../../core';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';
import { ResultStatus } from '../../../../core/result/resultCode';
import { authService } from '../../../../composition-root';
import { RequestWithBody } from '../../../../core/types/requests';
import { NewPasswordInputDto } from '../../types/new-password-input.dto';

export async function newPasswordHandler(req: RequestWithBody<NewPasswordInputDto>, res: Response) {
  const result = await authService.updatePassword(req.body);

  if (result.status !== ResultStatus.Success) {
    res
      .status(resultCodeToHttpException(result.status))
      .send({ errorsMessages: result.extensions });

    return;
  }
  res.sendStatus(HttpStatus.NoContent);
  return;
}
