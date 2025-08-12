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

  constructor(props: Props) {
    const { postId, content, commentatorInfo, createdAt } = props;
    this.postId = postId;
    this.content = content;
    this.commentatorInfo = commentatorInfo;
    this.createdAt = createdAt;
  }

  static create(props) {
    return new Comment(props);
  }
}
