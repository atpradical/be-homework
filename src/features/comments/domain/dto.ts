export class CreateCommentDto {
  constructor(
    public userId: string,
    public postId: string,
    public content: string,
    public commentatorInfo: {
      userId: string;
      userLogin: string;
    },
  ) {}
}
