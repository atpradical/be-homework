import { WithId } from 'mongodb';
import { PostViewModel } from '../types';
import { Post } from '../../../db/models/post.model';

export function mapToPostViewModel(post: WithId<Post>): PostViewModel {
  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
  };
}
