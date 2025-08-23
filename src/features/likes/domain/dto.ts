export class CreateLikeDto {
  constructor(
    public userId: string,
    public entityId: string,
  ) {}
}
