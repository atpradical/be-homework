import mongoose, { HydratedDocument, model, Model } from 'mongoose';
import { Post } from '../../features/posts/domain/post.etntity';
import { POST_COLLECTION_NAME } from '../mongo.db';

const postSchema = new mongoose.Schema<Post>(
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
  },
  { timestamps: true },
);

type PostModel = Model<Post>;
export type PostDocument = HydratedDocument<Post>;
export const PostModel = model<Post, PostModel>(POST_COLLECTION_NAME, postSchema);
