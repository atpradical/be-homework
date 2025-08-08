import { Response } from 'express';
import { HttpStatus, IdType } from '../../../../core';
import { mapToCommentViewModel } from '../../mappers/map-to-comment-view-model';
import { RequestWithParams } from '../../../../core/types/requests';
import { CommentView } from '../../types';
import { commentsQueryRepository } from '../../../../composition-root';

export async function getCommentHandler(
  req: RequestWithParams<IdType>,
  res: Response<CommentView | null>,
) {
  const commentId = req.params.id;

  const result = await commentsQueryRepository.findById(commentId);

  if (!result) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  const commentView = mapToCommentViewModel(result);
  res.status(HttpStatus.Ok).send(commentView);
  return;
}
