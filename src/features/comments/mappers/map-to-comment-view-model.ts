import { CommentView } from '../types';
import { WithId } from 'mongodb';
import { Comment } from '../domain/comment.entity';
import { LikeStatus } from '../../../core';

export function mapToCommentViewModel(
  comment: WithId<Comment>,
  likeStatus?: LikeStatus,
): CommentView {
  return {
    id: comment._id.toString(),
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    commentatorInfo: {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    },
    likesInfo: {
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
      myStatus: likeStatus ?? LikeStatus.None,
    },
  };
}
