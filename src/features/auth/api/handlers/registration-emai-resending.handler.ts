import { RequestWithBody } from '../../../../core/types/requests';
import { RegistrationEmailResendingInputDto } from '../../types/registration-email-resending-input.dto';
import { ResultStatus } from '../../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';
import { HttpStatus } from '../../../../core';
import { ErrorMessagesResponse, ResponseWith } from '../../../../core/types/responses';
import { authService } from '../../../../composition-root';

export async function registrationEmailResendingHandler(
  req: RequestWithBody<RegistrationEmailResendingInputDto>,
  res: ResponseWith<ErrorMessagesResponse>,
) {
  const email = req.body.email;

  const result = await authService.resendEmailConfirmation({ email });

  if (result.status !== ResultStatus.Success) {
    res
      .status(resultCodeToHttpException(result.status))
      .send({ errorsMessages: result.extensions });
    return;
  }

  res.status(HttpStatus.NoContent).send();
  return;
}
