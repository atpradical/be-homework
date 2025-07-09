import { CommentInputDto } from '../types/comment.input.dto';
import { commentsQueryRepository } from '../repositories/comments.query-repository';
import { ResultStatus } from '../../../core/result/resultCode';
import { commentsRepository } from '../repositories/comments.repository';
import { ObjectResult } from '../../../core/result/object-result.entity';

type CommentUpdateArgs = {
  id: string;
  dto: CommentInputDto;
  userId: string;
};

export const commentsService = {
  async update({ userId, id, dto }: CommentUpdateArgs): Promise<ObjectResult> {
    const comment = await commentsQueryRepository.findById(id);

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

    const result = await commentsRepository.update({ id, dto });

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'Database update failed',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    return ObjectResult.createSuccessResult(null);
  },

  async delete({ id, userId }: { id: string; userId: string }): Promise<ObjectResult> {
    const comment = await commentsQueryRepository.findById(id);

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

    const result = await commentsRepository.delete(id);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'Database update failed',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    return ObjectResult.createSuccessResult(null);
  },
};
