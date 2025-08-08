import { Response } from 'express';
import { HttpStatus } from '../../../../core';
import { authService } from '../../../../composition-root';
import { RequestWithBody } from '../../../../core/types/requests';
import { PasswordRecoveryInputDto } from '../../types/password-recovery-input.dto';

export async function passwordRecoveryHandler(
  req: RequestWithBody<PasswordRecoveryInputDto>,
  res: Response,
) {
  const email = req.body.email;

  await authService.passwordRecovery(email);

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
