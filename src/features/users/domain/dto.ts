export class UserCreateDto {
  constructor(
    public login: string,
    public email: string,
    public passwordHash: string,
  ) {}
}
