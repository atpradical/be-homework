import { CommentInputDto } from '../types/comment.input.dto';
import { ResultStatus } from '../../../core/result/resultCode';
import { ObjectResult } from '../../../core/result/object-result.entity';
import { CommentsRepository } from '../repositories/comments.repository';
import { CommentsQueryRepository } from '../repositories/comments.query-repository';
import { inject, injectable } from 'inversify';

type CommentUpdateArgs = {
  id: string;
  dto: CommentInputDto;
  userId: string;
};

@injectable()
export class CommentsService {
  constructor(
    @inject(CommentsRepository) private commentsRepository: CommentsRepository,
    @inject(CommentsQueryRepository) private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async update({ userId, id, dto }: CommentUpdateArgs): Promise<ObjectResult> {
    const comment = await this.commentsQueryRepository.findById(id);

    if (!comment) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'commentId', message: `comment with id:${id} not found` }],
      });
    }

    if (userId !== comment.commentatorInfo.userId) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.Forbidden,
        errorMessage: 'Forbidden',
        extensions: [
          { field: 'userId', message: `comment update is forbidden for user with id:${userId}` },
        ],
      });
    }

    const result = await this.commentsRepository.update({ id, dto });

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'Database update failed',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    return ObjectResult.createSuccessResult(null);
  }

  async delete({ id, userId }: { id: string; userId: string }): Promise<ObjectResult> {
    const comment = await this.commentsQueryRepository.findById(id);

    if (!comment) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'commentId', message: `comment with id:${id} not found` }],
      });
    }

    if (userId !== comment.commentatorInfo.userId) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.Forbidden,
        errorMessage: 'Forbidden',
        extensions: [
          { field: 'userId', message: `comment deletion is forbidden for user with id:${userId}` },
        ],
      });
    }

    const result = await this.commentsRepository.delete(id);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'Database update failed',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    return ObjectResult.createSuccessResult(null);
  }
}
