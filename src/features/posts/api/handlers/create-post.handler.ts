import { Response } from 'express';
import { HttpStatus } from '../../../../core';
import { PostInputDto } from '../../types/post-input.dto';
import { mapToPostViewModel } from '../../mappers/map-to-post-view-model';
import { ResultStatus } from '../../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';
import { RequestWithBody } from '../../../../core/types/requests';
import { PostViewModel } from '../../types';
import { ExtensionType } from '../../../../core/result/object-result.entity';
import { postsService } from '../../../../core/composition-root';

export async function createPostHandler(
  req: RequestWithBody<PostInputDto>,
  res: Response<PostViewModel | ExtensionType[] | string>,
) {
  const result = await postsService.create(req.body);

  if (result.status !== ResultStatus.Success) {
    res.status(resultCodeToHttpException(result.status)).send(result.extensions);
    return;
  }

  const postViewModel = mapToPostViewModel(result.data);
  res.status(HttpStatus.Created).send(postViewModel);
  return;
}
