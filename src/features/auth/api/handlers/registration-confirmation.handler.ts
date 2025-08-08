import { RequestWithBody } from '../../../../core/types/requests';
import { RegistrationConfirmationInputDto } from '../../types/registration-confirmation.input.dto';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';
import { ResultStatus } from '../../../../core/result/resultCode';
import { HttpStatus } from '../../../../core';
import { ErrorMessagesResponse, ResponseWith } from '../../../../core/types/responses';
import { authService } from '../../../../composition-root';

export async function registrationConfirmationHandler(
  req: RequestWithBody<RegistrationConfirmationInputDto>,
  res: ResponseWith<ErrorMessagesResponse>,
) {
  const result = await authService.confirmEmail({ code: req.body.code });

  if (result.status !== ResultStatus.Success) {
    res
      .status(resultCodeToHttpException(result.status))
      .send({ errorsMessages: result.extensions });
    return;
  }

  res.status(HttpStatus.NoContent).send();
  return;
}
