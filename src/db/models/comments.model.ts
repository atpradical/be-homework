import mongoose, { HydratedDocument, model, Model } from 'mongoose';
import { COMMENTS_COLLECTION_NAME } from '../mongo.db';
import { CreateCommentDto } from '../../features/comments/domain/dto';
import { IncrementType, LikeStatus } from '../../core';

const commentSchema = new mongoose.Schema<Comment, CommentModel, CommentMethods>(
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

const commentMethods = {
  /* Увеличивает или уменьшает кол-во лайков на 1 у поста */
  updateLikesCounter(status: Omit<LikeStatus, 'None'>, type: IncrementType) {
    switch (type) {
      case IncrementType.Increment: {
        if (status === LikeStatus.Like) {
          (this as CommentDocument).likesCount += 1;
          break;
        }
        if (status === LikeStatus.Dislike) {
          (this as CommentDocument).dislikesCount += 1;
          break;
        }
        break;
      }
      case IncrementType.Decrement: {
        if (status === LikeStatus.Like) {
          (this as CommentDocument).likesCount -= 1;
          break;
        }
        if (status === LikeStatus.Dislike) {
          (this as CommentDocument).dislikesCount -= 1;
          break;
        }
        break;
      }
      default: {
        return;
      }
    }
  },
};

const commentStatics = {
  createComment(dto: CreateCommentDto) {
    const comment = new CommentModel();

    comment.postId = dto.postId;
    comment.content = dto.content;
    comment.commentatorInfo = dto.commentatorInfo;
    comment.likesCount = 0;
    comment.dislikesCount = 0;

    return comment;
  },
};

export type Comment = {
  postId: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
};

commentSchema.statics = commentStatics;
commentSchema.methods = commentMethods;

type CommentStatics = typeof commentStatics;
type CommentMethods = typeof commentMethods;

type CommentModel = Model<Comment, {}, CommentMethods> & CommentStatics;

export type CommentDocument = HydratedDocument<Comment, CommentMethods>;

export const CommentModel = model<Comment, CommentModel>(COMMENTS_COLLECTION_NAME, commentSchema);
