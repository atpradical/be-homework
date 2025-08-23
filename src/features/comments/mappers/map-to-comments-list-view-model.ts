import { WithId } from 'mongodb';
import { CommentListPaginatedOutput } from '../types/comment-list-paginated.output';
import { LikeDocument } from '../../../db/models/likes.model';
import { LikeStatus } from '../../../core';
import { Comment } from '../../../db/models/comments.model';

type Params = {
  comments: WithId<Comment>[];
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  };
  likes?: LikeDocument[];
  userId?: string;
};

export function mapToCommentsListViewModel(prams: Params): CommentListPaginatedOutput {
  const { comments, pagination, userId, likes } = prams;

  // Сопоставление commentId -> likeStatus текущего пользователя
  const likesByComment = new Map<string, LikeStatus>();
  if (userId && likes?.length) {
    for (const l of likes) {
      likesByComment.set(l.entityId.toString(), l.likeStatus);
    }
  }

  return {
    pagesCount: Math.ceil(pagination.totalCount / pagination.pageSize),
    page: pagination.pageNumber,
    pageSize: pagination.pageSize,
    totalCount: pagination.totalCount,

    items: comments.map((c) => {
      const commentId = c._id.toString();
      const myStatus = likesByComment.get(commentId) ?? LikeStatus.None;

      return {
        id: commentId,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        commentatorInfo: {
          userId: c.commentatorInfo.userId,
          userLogin: c.commentatorInfo.userLogin,
        },
        likesInfo: {
          likesCount: c.likesCount,
          dislikesCount: c.dislikesCount,
          myStatus: myStatus,
        },
      };
    }),
  };
}
