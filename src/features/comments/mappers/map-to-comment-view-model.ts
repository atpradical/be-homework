import { CommentView } from '../types';
import { WithId } from 'mongodb';
import { Comment } from '../domain/comment.entity';

export function mapToCommentViewModel(comment: WithId<Comment>): CommentView {
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
