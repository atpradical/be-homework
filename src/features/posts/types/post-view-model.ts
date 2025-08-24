import { LikeStatus } from '../../../core';

export class LikeDetailsViewModel {
  constructor(
    public addedAt: string,
    public userId: string,
    public login: string,
  ) {}
}

export class PostViewModel {
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: Date,
    public extendedLikesInfo: {
      likesCount: number;
      dislikesCount: number;
      myStatus: LikeStatus;
      newestLikes: LikeDetailsViewModel[];
    },
  ) {}
}
