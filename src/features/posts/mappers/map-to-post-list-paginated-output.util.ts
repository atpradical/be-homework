import { WithId } from 'mongodb';
import { PostListPaginatedOutput } from '../types/post-list-paginated.output';
import { Post } from '../../../db/models/post.model';
import { LikeStatus } from '../../../core';
import { LikeDocument } from '../../../db/models/likes.model';

type Params = {
  posts: WithId<Post>[];
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  };
  likes?: LikeDocument[];
  userId?: string;
};

export function mapToPostListPaginatedOutput(params: Params): PostListPaginatedOutput {
  const { posts, pagination, userId, likes } = params;

  // Сопоставление postId -> likeStatus текущего пользователя
  const likesByPosts = new Map<string, LikeStatus>();

  if (userId && likes?.length) {
    for (const l of likes) {
      likesByPosts.set(l.entityId.toString(), l.likeStatus);
    }
  }

  return {
    page: pagination.pageNumber,
    pageSize: pagination.pageSize,
    pagesCount: Math.ceil(pagination.totalCount / pagination.pageSize),
    totalCount: pagination.totalCount,

    items: posts.map((post: WithId<Post>) => {
      const postId = post._id.toString();
      const myStatus = likesByPosts.get(postId) ?? LikeStatus.None;

      return {
        id: post._id.toString(),
        createdAt: post.createdAt,
        blogId: post.blogId,
        blogName: post.blogName,
        content: post.content,
        shortDescription: post.shortDescription,
        title: post.title,
        extendedLikesInfo: {
          likesCount: post.likesCount,
          dislikesCount: post.dislikesCount,
          myStatus: myStatus,
          newestLikes: (post.newestLikes ?? []).slice(0, 3).map((nl) => ({
            userId: nl.userId,
            login: nl.login,
            addedAt: nl.updatedAt, // map updatedAt -> addedAt
          })),
        },
      };
    }),
  };
}
