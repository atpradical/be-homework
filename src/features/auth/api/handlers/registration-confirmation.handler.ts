import { RequestWithBody } from '../../../../core/types/requests';
import { RegistrationConfirmationInputDto } from '../../types/registration-confirmation.input.dto';
import { authService } from '../../domain/auth.service';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';
import { ResultStatus } from '../../../../core/result/resultCode';
import { HttpStatus } from '../../../../core';
import { ResponseWithExtensions } from '../../../../core/types/responses';

export async function registrationConfirmationHandler(
  req: RequestWithBody<RegistrationConfirmationInputDto>,
  res: ResponseWithExtensions,
) {
  const result = await authService.confirmEmail({ code: req.body.code });

  if (result.status !== ResultStatus.Success) {
    res.status(resultCodeToHttpException(result.status)).send(result.extensions);
    return;
  }

  res.status(HttpStatus.NoContent).send();
  return;
}
