import { WithId } from 'mongodb';
import { CommentListPaginatedOutput } from '../types/comment-list-paginated.output';
import { Comment } from '../domain/comment.entity';
import { LikeDocument } from '../../../db/models/likes.model';
import { LikeStatus } from '../../../core';

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

  return {
    pagesCount: Math.ceil(pagination.totalCount / pagination.pageSize),
    page: pagination.pageNumber,
    pageSize: pagination.pageSize,
    totalCount: pagination.totalCount,

    items: comments.map((c) => ({
      id: c._id.toString(),
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      commentatorInfo: {
        userId: c.commentatorInfo.userId,
        userLogin: c.commentatorInfo.userLogin,
      },
      likesInfo: {
        likesCount: c.likesCount,
        dislikesCount: c.dislikesCount,
        myStatus: () => {
          if (userId && c.commentatorInfo.userId === userId) {
            return likes.find((l) => l.userId)?.likeStatus;
          } else {
            return LikeStatus.None;
          }
        },
      },
    })),
  };
}
