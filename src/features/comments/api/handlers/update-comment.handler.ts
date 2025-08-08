import { Response } from 'express';
import { RequestWithParamsAndBody } from '../../../../core/types/requests';
import { HttpStatus, IdType } from '../../../../core';
import { CommentInputDto } from '../../types/comment.input.dto';
import { ResultStatus } from '../../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';
import { commentsService } from '../../../../composition-root';

export async function updateCommentHandler(
  req: RequestWithParamsAndBody<IdType, CommentInputDto>,
  res: Response,
) {
  const id = req.params.id;
  const dto = req.body;
  const userId = req.user.id;

  const result = await commentsService.update({ userId, id, dto });

  if (result.status !== ResultStatus.Success) {
    res.status(resultCodeToHttpException(result.status)).send(result.extensions);
    return;
  }

  res.sendStatus(HttpStatus.NoContent);
  return;
}
