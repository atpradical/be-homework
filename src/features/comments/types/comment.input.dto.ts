import { LikeStatus } from '../../../core';

export type CommentInputDto = {
  content: string;
};

export type LikeInputDto = {
  likeStatus: LikeStatus;
};
