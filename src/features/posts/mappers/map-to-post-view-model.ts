import { PostViewModel } from '../types/post-view-model';
import { PostDocument } from '../../../db/models/post.model';
import { LikeStatus } from '../../../core';

export function mapToPostViewModel(post: PostDocument, likeStatus?: LikeStatus): PostViewModel {
  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
    extendedLikesInfo: {
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount,
      myStatus: likeStatus ?? LikeStatus.None,
      newestLikes: (post.newestLikes ?? []).slice(0, 3).map((nl) => ({
        userId: nl.userId,
        login: nl.login,
        addedAt: nl.updatedAt, // map updatedAt -> addedAt
      })), // always an
    },
  };
}
