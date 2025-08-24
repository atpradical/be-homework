export class CreatePostDto {
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
  ) {}
}

export class UpdatePostDto {
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
  ) {}
}

export class AddPostNewestLikes {
  constructor(
    public userId: string,
    public login: string,
    public updatedAt: string,
  ) {}
}
