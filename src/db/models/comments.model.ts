import mongoose, { HydratedDocument, model, Model } from 'mongoose';
import { Comment } from '../../features/comments/domain/comment.entity';
import { COMMENTS_COLLECTION_NAME } from '../mongo.db';

const commentSchema = new mongoose.Schema<Comment>(
  {
    postId: {
      type: String,
      required: true,
      minLength: [1, 'PostId is required'],
      maxLength: [100, 'Too long PostId'],
    },

    content: {
      type: String,
      required: true,
      minLength: [1, 'content is required'],
      maxLength: [500, 'Too long content'],
    },

    commentatorInfo: {
      userId: {
        type: String,
        required: true,
        minLength: [1, 'userId is required'],
        maxLength: [100, 'Too long userId'],
      },

      userLogin: {
        type: String,
        required: true,
        minLength: [1, 'userLogin is required'],
        maxLength: [100, 'Too long userLogin'],
      },
    },

    likesCount: { type: Number, required: true },

    dislikesCount: { type: Number, required: true },
  },
  { timestamps: true },
);

type CommentModel = Model<Comment>;
export type CommentDocument = HydratedDocument<Comment>;
export const CommentModel = model<Comment, CommentModel>(COMMENTS_COLLECTION_NAME, commentSchema);
