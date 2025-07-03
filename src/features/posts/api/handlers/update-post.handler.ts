import { Response } from 'express';
import { HttpStatus, IdType } from '../../../../core';
import { PostInputDto } from '../../types/post-input.dto';
import { postsService } from '../../domain/posts.service';
import { RequestWithParamsAndBody } from '../../../../core/types/requests';
import { ResultStatus } from '../../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';
import { ExtensionType } from '../../../../core/result/result.type';

export async function updatePostHandler(
  req: RequestWithParamsAndBody<IdType, PostInputDto>,
  res: Response<null | ExtensionType[]>,
) {
  const id = req.params.id;

  const result = await postsService.update(id, req.body);

  if (result.status !== ResultStatus.Success) {
    res.status(resultCodeToHttpException(result.status)).send(result.extensions);
    return;
  }

  res.sendStatus(HttpStatus.NoContent);
  return;
}
