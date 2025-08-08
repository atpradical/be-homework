import { Response } from 'express';
import { HttpStatus, IdType } from '../../../../core';
import { mapToPostViewModel } from '../../mappers/map-to-post-view-model';
import { RequestWithParams } from '../../../../core/types/requests';
import { PostViewModel } from '../../types';
import { postsQueryRepository } from '../../../../core/composition-root';

export async function getPostHandler(
  req: RequestWithParams<IdType>,
  res: Response<PostViewModel | null>,
) {
  const id = req.params.id;

  const result = await postsQueryRepository.findById(id);

  if (!result) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  const postViewModel = mapToPostViewModel(result);
  res.status(HttpStatus.Ok).send(postViewModel);
  return;
}
