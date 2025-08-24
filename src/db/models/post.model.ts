import mongoose, { HydratedDocument, model, Model } from 'mongoose';
import { POST_COLLECTION_NAME } from '../mongo.db';
import { CreatePostDto, UpdatePostDto, AddPostNewestLikes } from '../../features/posts/domain/dto';
import { IncrementType, LikeStatus } from '../../core';
import { CommentDocument } from './comments.model';

export type NewestLikes = {
  userId: string;
  login: string;
  updatedAt: string;
};

const newestLikesSchema = new mongoose.Schema<NewestLikes>(
  {
    userId: { type: String, required: true },
    login: { type: String, required: true },
  },
  { timestamps: true },
);

const postSchema = new mongoose.Schema<Post, PostModel, PostMethods>(
  {
    title: {
      type: String,
      required: true,
      minLength: [1, 'Title is required'],
      maxLength: [100, 'Too long Title'],
    },
    shortDescription: {
      type: String,
      required: true,
      minLength: [1, 'ShortDescription is required'],
      maxLength: [500, 'Too long ShortDescription'],
    },
    content: {
      type: String,
      required: true,
      minLength: [1, 'Content is required'],
      maxLength: [1000, 'Too long Content'],
    },

    blogId: { type: String, required: true, minLength: [1, 'BlogId is required'] },

    blogName: {
      type: String,
      required: true,
      minLength: [1, 'BlogName is required'],
      maxLength: [100, 'Too long BlogName'],
    },

    likesCount: { type: Number, required: true },

    dislikesCount: { type: Number, required: true },

    newestLikes: { type: [newestLikesSchema] },
  },
  { timestamps: true },
);

const postMethods = {
  updatePost(dto: UpdatePostDto) {
    const that = this as PostDocument;

    that.title = dto.title;
    that.shortDescription = dto.shortDescription;
    that.content = dto.content;
    that.blogId = dto.blogId;
  },

  addPostNewestLikes(dto: AddPostNewestLikes[]) {
    const that = this as PostDocument;

    that.newestLikes = dto;
    that.markModified('newestLikes');
  },

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

const postStatics = {
  createPost(dto: CreatePostDto) {
    const post = new PostModel();

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = dto.blogName;
    post.likesCount = 0;
    post.dislikesCount = 0;
    post.newestLikes = [];

    return post;
  },
};

postSchema.methods = postMethods;
postSchema.statics = postStatics;

type PostMethods = typeof postMethods;
type PostStatics = typeof postStatics;

export type Post = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
  newestLikes: NewestLikes[];
};

type PostModel = Model<Post, {}, PostMethods> & PostStatics;

export type PostDocument = HydratedDocument<Post, PostMethods>;

export const PostModel = model<Post, PostModel>(POST_COLLECTION_NAME, postSchema);
