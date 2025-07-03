import { CommentDB, CommentView } from '../types';
import { WithId } from 'mongodb';

export function mapToCommentViewModel(comment: WithId<CommentDB>): CommentView {
  return {
    id: comment._id.toString(),
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    commentatorInfo: {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    },
  };
}
