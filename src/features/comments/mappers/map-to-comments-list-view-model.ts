import { CommentDB } from '../types';
import { WithId } from 'mongodb';
import { CommentListPaginatedOutput } from '../types/comment-list-paginated.output';

export function mapToCommentsListViewModel(
  comments: WithId<CommentDB>[],
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  },
): CommentListPaginatedOutput {
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
    })),
  };
}
