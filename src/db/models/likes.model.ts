import mongoose, { HydratedDocument, model, Model } from 'mongoose';
import { LIKES_COLLECTION_NAME } from '../mongo.db';
import { LikeStatus } from '../../core';
import { CreateLikeDto } from '../../features/likes/domain/dto';

type Like = {
  userId: string;
  entityId: string; // postId or commentId
  likeStatus: LikeStatus;
};

const likesSchema = new mongoose.Schema<Like, LikeModel, LikeMethods>(
  {
    userId: {
      type: String,
      required: true,
      minLength: [1, 'userId is required'],
      maxLength: [100, 'Too long userId'],
    },

    entityId: {
      type: String,
      required: true,
      minLength: [1, 'EntityId is required'],
      maxLength: [100, 'Too long EntityId'],
    },

    likeStatus: { type: String, enum: LikeStatus },
  },

  { timestamps: true },
);

const likeMethods = {
  updateLikeStatus(likeStatus: LikeStatus) {
    (this as LikeDocument).likeStatus = likeStatus;
  },
};

const likeStatics = {
  createLike(dto: CreateLikeDto) {
    const like = new LikeModel();

    like.userId = dto.userId;
    like.entityId = dto.entityId;
    like.likeStatus = LikeStatus.None;

    return like;
  },
};

type LikeMethods = typeof likeMethods;
type LikeStatics = typeof likeStatics;

type LikeModel = Model<Like, {}, LikeMethods> & LikeStatics;
export type LikeDocument = HydratedDocument<Like, LikeMethods>;
export const LikeModel = model<Like, LikeModel>(LIKES_COLLECTION_NAME, likesSchema);
