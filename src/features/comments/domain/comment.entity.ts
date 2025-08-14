type Props = {
  postId: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
};

export class Comment {
  postId: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;

  constructor(props: Props) {
    const { postId, content, commentatorInfo, createdAt } = props;
    this.postId = postId;
    this.content = content;
    this.commentatorInfo = commentatorInfo;
    this.createdAt = createdAt;
    this.likesCount = 0;
    this.dislikesCount = 0;
  }

  static create(props) {
    return new Comment(props);
  }
}
