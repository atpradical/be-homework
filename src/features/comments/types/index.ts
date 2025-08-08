export type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

export type CommentView = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
};
