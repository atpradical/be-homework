import { Response } from 'express';
import { postsService } from '../../../posts/domain/posts.service';
import { ResultStatus } from '../../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';
import { HttpStatus, IdType, PostIdType } from '../../../../core';
import { RequestWithParamsAndBodyAndUserId } from '../../../../core/types/requests';
import { CommentInputDto } from '../../types/comment.input.dto';
import { ExtensionType } from '../../../../core/result/result.type';
import { CommentView } from '../../types';
import { mapToCommentViewModel } from '../../mappers/map-to-comment-view-model';

export async function createCommentHandler(
  req: RequestWithParamsAndBodyAndUserId<PostIdType, CommentInputDto, IdType>,
  res: Response<CommentView | ExtensionType[]>,
) {
  const userId = req.user.id;
  const postId = req.params.postId;
  const dto = req.body;
  const result = await postsService.createComment({ postId, dto, userId });

  if (result.status !== ResultStatus.Success) {
    res.status(resultCodeToHttpException(result.status)).send(result.extensions);
    return;
  }

  const resultViewModel = mapToCommentViewModel(result.data);

  res.status(HttpStatus.Created).send(resultViewModel);
  return;
}
