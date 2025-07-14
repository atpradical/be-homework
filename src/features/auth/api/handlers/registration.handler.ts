import { authService } from '../../domain/auth.service';
import { ResultStatus } from '../../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';
import { HttpStatus } from '../../../../core';
import { RequestWithBody } from '../../../../core/types/requests';
import { RegistrationUserInputDto } from '../../types/registration-user-input.dto';
import { ErrorMessagesResponse, ResponseWith } from '../../../../core/types/responses';

export async function registrationHandler(
  req: RequestWithBody<RegistrationUserInputDto>,
  res: ResponseWith<ErrorMessagesResponse>,
) {
  const result = await authService.registerUser(req.body);

  if (result.status !== ResultStatus.Success) {
    res
      .status(resultCodeToHttpException(result.status))
      .send({ errorsMessages: result.extensions });
    return;
  }

  res.status(HttpStatus.NoContent).send();
  return;
}
