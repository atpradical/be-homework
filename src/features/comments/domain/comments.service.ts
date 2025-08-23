import { CommentInputDto } from '../types/comment.input.dto';
import { ResultStatus } from '../../../core/result/resultCode';
import { ObjectResult } from '../../../core/result/object-result.entity';
import { CommentsRepository } from '../repositories/comments.repository';
import { inject, injectable } from 'inversify';
import { LikesService } from '../../likes/domain/likes.service';
import { LikeModel } from '../../../db/models/likes.model';
import { IncrementType, LikeStatus } from '../../../core';
import { CommentView } from '../types';
import { mapToCommentViewModel } from '../mappers/map-to-comment-view-model';

type CommentUpdateArgs = {
  id: string;
  dto: CommentInputDto;
  userId: string;
};

@injectable()
export class CommentsService {
  constructor(
    @inject(CommentsRepository) private commentsRepository: CommentsRepository,
    @inject(LikesService) private likesService: LikesService,
  ) {}

  async update({ userId, id, dto }: CommentUpdateArgs): Promise<ObjectResult> {
    const comment = await this.commentsRepository.findById(id);

    if (!comment) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'commentId', message: `comment with id:${id} not found` }],
      });
    }

    // Проверка, что коммент принадлежит юзеру
    if (userId !== comment.commentatorInfo.userId) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.Forbidden,
        errorMessage: 'Forbidden',
        extensions: [
          { field: 'userId', message: `comment update is forbidden for user with id:${userId}` },
        ],
      });
    }

    comment.content = dto.content;

    const result = await this.commentsRepository.save(comment);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'Database update failed',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    return ObjectResult.createSuccessResult(null);
  }

  async updateCommentLikeStatus(
    userId: string,
    commentId: string,
    likeStatus: LikeStatus,
  ): Promise<ObjectResult> {
    const comment = await this.commentsRepository.findById(commentId);

    if (!comment) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'commentId', message: `comment with id:${commentId} not found` }],
      });
    }

    const like = await this.likesService.findLikesByCommentAndUserId(userId, commentId);

    if (!like) {
      // Если like нет -> создаем новые
      const newLike = LikeModel.createLike({
        userId,
        entityId: commentId,
      });

      switch (likeStatus) {
        case LikeStatus.Like:
          newLike.updateLikeStatus(LikeStatus.Like);
          comment.updateLikesCounter(LikeStatus.Like, IncrementType.Increment);
          break;
        case LikeStatus.Dislike:
          newLike.updateLikeStatus(LikeStatus.Dislike);
          comment.updateLikesCounter(LikeStatus.Dislike, IncrementType.Decrement);
          break;
        case LikeStatus.None:
          newLike.likeStatus = LikeStatus.None;
          break;
      }

      await this.likesService.save(newLike);
      await this.commentsRepository.save(comment);
    } else {
      // Если like есть -> обновляем существующий
      switch (likeStatus) {
        case LikeStatus.Like:
          if (like.likeStatus !== LikeStatus.Like) {
            like.updateLikeStatus(LikeStatus.Like);
            comment.updateLikesCounter(LikeStatus.Like, IncrementType.Increment);
            comment.dislikesCount > 0 &&
              comment.updateLikesCounter(LikeStatus.Dislike, IncrementType.Decrement);
          }
          break;
        case LikeStatus.Dislike:
          if (like.likeStatus !== LikeStatus.Dislike) {
            like.updateLikeStatus(LikeStatus.Dislike);
            comment.likesCount > 0 &&
              comment.updateLikesCounter(LikeStatus.Like, IncrementType.Decrement);
          }
          break;
        case LikeStatus.None:
          if (like.likeStatus === LikeStatus.Dislike) {
            comment.updateLikesCounter(LikeStatus.Dislike, IncrementType.Decrement);
          }

          if (like.likeStatus === LikeStatus.Like) {
            comment.updateLikesCounter(LikeStatus.Like, IncrementType.Decrement);
          }

          like.likeStatus = LikeStatus.None;
          break;
      }

      await this.likesService.save(like);
      await this.commentsRepository.save(comment);
    }

    return ObjectResult.createSuccessResult(null);
  }

  async findCommentWithUserStatus(
    commentId: string,
    userId: string,
  ): Promise<ObjectResult<CommentView>> {
    const comment = await this.commentsRepository.findById(commentId);

    if (!comment) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'commentId', message: `comment with id:${commentId} not found` }],
      });
    }

    const like = await this.likesService.findLikesByCommentAndUserId(userId, commentId);

    const viewDtoModel = mapToCommentViewModel(comment, like?.likeStatus);

    return ObjectResult.createSuccessResult(viewDtoModel);
  }

  async delete({ id, userId }: { id: string; userId: string }): Promise<ObjectResult> {
    const comment = await this.commentsRepository.findById(id);

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

    const result = await this.commentsRepository.deleteById(id);

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
