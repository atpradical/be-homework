export class CreateCommentDto {
  constructor(
    public postId: string,
    public content: string,
    public commentatorInfo: {
      userId: string;
      userLogin: string;
    },
  ) {}
}
