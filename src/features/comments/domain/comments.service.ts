import { CommentInputDto } from '../types/comment.input.dto';
import { commentsQueryRepository } from '../repositories/comments.query-repository';
import { Result } from '../../../core/result/result.type';
import { ResultStatus } from '../../../core/result/resultCode';
import { commentsRepository } from '../repositories/comments.repository';

type CommentUpdateArgs = {
  id: string;
  dto: CommentInputDto;
  userId: string;
};

export const commentsService = {
  async update({ userId, id, dto }: CommentUpdateArgs): Promise<Result> {
    const comment = await commentsQueryRepository.findById(id);

    if (!comment) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'commentId', message: `comment with id:${id} not found` }],
        data: null,
      };
    }

    if (userId !== comment.commentatorInfo.userId) {
      return {
        status: ResultStatus.Forbidden,
        errorMessage: 'Forbidden',
        extensions: [
          { field: 'userId', message: `comment update is forbidden for user with id:${userId}` },
        ],
        data: null,
      };
    }

    const result = await commentsRepository.update({ id, dto });

    if (!result) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'BadRequest',
        extensions: [{ field: 'comment', message: `comment with id:${id} was not updated` }],
        data: null,
      };
    }

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: null,
    };
  },

  async delete({ id, userId }: { id: string; userId: string }): Promise<Result> {
    const comment = await commentsQueryRepository.findById(id);

    if (!comment) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'commentId', message: `comment with id:${id} not found` }],
        data: null,
      };
    }

    if (userId !== comment.commentatorInfo.userId) {
      return {
        status: ResultStatus.Forbidden,
        errorMessage: 'Forbidden',
        extensions: [
          { field: 'userId', message: `comment deletion is forbidden for user with id:${userId}` },
        ],
        data: null,
      };
    }

    const result = await commentsRepository.delete(id);

    if (!result) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'BadRequest',
        extensions: [{ field: 'comment', message: `comment with id:${id} was not deleted` }],
        data: null,
      };
    }

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: null,
    };
  },
};
