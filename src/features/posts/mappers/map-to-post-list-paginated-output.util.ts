import { WithId } from 'mongodb';
import { Post } from '../types';
import {
  PostListPaginatedOutput,
  PostListPaginatedOutputWithPagesCount,
} from '../routes/output/post-list-paginated.output';

export function mapToPostListPaginatedOutput(
  posts: WithId<Post>[],
  pagination: { pageNumber: number; pageSize: number; totalCount: number },
): PostListPaginatedOutput {
  return {
    page: pagination.pageNumber,
    pageSize: pagination.pageSize,
    pageCount: Math.ceil(pagination.totalCount / pagination.pageSize),
    totalCount: pagination.totalCount,

    items: posts.map((post: WithId<Post>) => ({
      id: post._id.toString(),
      createdAt: post.createdAt,
      blogId: post.blogId,
      blogName: post.blogName,
      content: post.content,
      shortDescription: post.shortDescription,
      title: post.title,
    })),
  };
}

export function mapToPostForBlogListPaginatedOutput(
  posts: WithId<Post>[],
  pagination: { pageNumber: number; pageSize: number; totalCount: number },
): PostListPaginatedOutputWithPagesCount {
  return {
    page: pagination.pageNumber,
    pageSize: pagination.pageSize,
    pagesCount: Math.ceil(pagination.totalCount / pagination.pageSize),
    totalCount: pagination.totalCount,

    items: posts.map((post: WithId<Post>) => ({
      id: post._id.toString(),
      createdAt: post.createdAt,
      blogId: post.blogId,
      blogName: post.blogName,
      content: post.content,
      shortDescription: post.shortDescription,
      title: post.title,
    })),
  };
}
