import { LikeStatus } from '../../../core';

export type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

export type CommentView = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;

  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: () => LikeStatus;
  };
};
