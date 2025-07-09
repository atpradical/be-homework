import { RequestWithBody } from '../../../../core/types/requests';
import { RegistrationEmailResendingInputDto } from '../../types/registration-email-resending-input.dto';
import { authService } from '../../domain/auth.service';
import { ResultStatus } from '../../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';
import { HttpStatus } from '../../../../core';
import { ResponseWithExtensions } from '../../../../core/types/responses';

export async function registrationEmailResendingHandler(
  req: RequestWithBody<RegistrationEmailResendingInputDto>,
  res: ResponseWithExtensions,
) {
  const email = req.body.email;

  const result = await authService.resendEmailConfirmation({ email });

  if (result.status !== ResultStatus.Success) {
    res.status(resultCodeToHttpException(result.status)).send(result.extensions);
    return;
  }

  res.status(HttpStatus.NoContent).send();
  return;
}
