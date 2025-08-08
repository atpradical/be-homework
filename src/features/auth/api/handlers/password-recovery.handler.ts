import { Response } from 'express';
import { HttpStatus } from '../../../../core';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';
import { ResultStatus } from '../../../../core/result/resultCode';
import { authService } from '../../../../core/composition-root';
import { RequestWithBody } from '../../../../core/types/requests';
import { PasswordRecoveryInputDto } from '../../types/password-recovery-input.dto';

export async function passwordRecoveryHandler(
  req: RequestWithBody<PasswordRecoveryInputDto>,
  res: Response,
) {
  const email = req.body.email;

  const result = await authService.passwordRecovery(email);

  if (result.status !== ResultStatus.Success) {
    res
      .status(resultCodeToHttpException(result.status))
      .send({ errorsMessages: result.extensions });

    return;
  }
  res.status(HttpStatus.NoContent);
  return;
}
