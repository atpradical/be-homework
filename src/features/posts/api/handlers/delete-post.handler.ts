import { Response } from 'express';
import { HttpStatus, IdType } from '../../../../core';
import { postsService } from '../../domain/posts.service';
import { RequestWithParams } from '../../../../core/types/requests';
import { ExtensionType } from '../../../../core/result/result.type';
import { ResultStatus } from '../../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';

export async function deletePostHandler(
  req: RequestWithParams<IdType>,
  res: Response<null | ExtensionType[]>,
) {
  const id = req.params.id;

  const result = await postsService.delete(id);

  if (result.status !== ResultStatus.Success) {
    res.status(resultCodeToHttpException(result.status)).send(result.extensions);
    return;
  }

  res.sendStatus(HttpStatus.NoContent);
  return;
}
