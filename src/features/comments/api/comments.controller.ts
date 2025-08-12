import { RequestWithParams, RequestWithParamsAndBody } from '../../../core/types/requests';
import { HttpStatus, IdType } from '../../../core';
import { Response } from 'express';
import { CommentView } from '../types';
import { mapToCommentViewModel } from '../mappers/map-to-comment-view-model';
import { CommentInputDto } from '../types/comment.input.dto';
import { ResultStatus } from '../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../core/result/resultCodeToHttpException';
import { CommentsQueryRepository } from '../repositories/comments.query-repository';
import { CommentsService } from '../domain/comments.service';
import { inject, injectable } from 'inversify';

@injectable()
export class CommentsController {
  constructor(
    @inject(CommentsService) private commentsService: CommentsService,
    @inject(CommentsQueryRepository) private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async getCommentHandler(req: RequestWithParams<IdType>, res: Response<CommentView | null>) {
    const commentId = req.params.id;

    const result = await this.commentsQueryRepository.findById(commentId);

    if (!result) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }

    const commentView = mapToCommentViewModel(result);
    res.status(HttpStatus.Ok).send(commentView);
    return;
  }

  async updateCommentHandler(
    req: RequestWithParamsAndBody<IdType, CommentInputDto>,
    res: Response,
  ) {
    const id = req.params.id;
    const dto = req.body;
    const userId = req.user.id;

    const result = await this.commentsService.update({ userId, id, dto });

    if (result.status !== ResultStatus.Success) {
      res.status(resultCodeToHttpException(result.status)).send(result.extensions);
      return;
    }

    res.sendStatus(HttpStatus.NoContent);
    return;
  }

  async deleteCommentHandler(
    req: RequestWithParamsAndBody<IdType, CommentInputDto>,
    res: Response,
  ) {
    const id = req.params.id;
    const userId = req.user.id;

    const result = await this.commentsService.delete({ id, userId });

    if (result.status !== ResultStatus.Success) {
      res.status(resultCodeToHttpException(result.status)).send(result.extensions);
      return;
    }

    res.sendStatus(HttpStatus.NoContent);
    return;
  }
}
