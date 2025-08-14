import mongoose, { HydratedDocument, model, Model } from 'mongoose';
import { LIKES_COLLECTION_NAME } from '../mongo.db';
import { LikeStatus } from '../../core';

type Like = {
  userId: string;
  commentId: string;
  likeStatus: LikeStatus;
};

const likesSchema = new mongoose.Schema<Like>(
  {
    userId: {
      type: String,
      required: true,
      minLength: [1, 'userId is required'],
      maxLength: [100, 'Too long userId'],
    },

    commentId: {
      type: String,
      required: true,
      minLength: [1, 'CommentId is required'],
      maxLength: [100, 'Too long CommentId'],
    },

    likeStatus: { type: String, enum: LikeStatus },
  },

  { timestamps: true },
);

type LikeModel = Model<Like>;
export type LikeDocument = HydratedDocument<Like>;
export const LikeModel = model<Like, LikeModel>(LIKES_COLLECTION_NAME, likesSchema);
