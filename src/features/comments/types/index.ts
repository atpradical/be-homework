export type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

export type CommentDB = {
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
};

export type CommentView = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
};
