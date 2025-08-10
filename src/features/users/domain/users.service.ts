import { UserQueryInput } from '../types/user-query.input';
import { WithId } from 'mongodb';
import { UsersRepository } from '../repositories/users.repository';
import { UserInputDto } from '../types/user-input.dto';
import { DomainError } from '../../../core/errors/domain.error';
import { User } from './user.entity';
import { BcryptService } from '../../auth/adapters/bcrypt.service';
import { inject, injectable } from 'inversify';
import { UsersQueryRepository } from '../repositories/users.query-repository';

@injectable()
export class UsersService {
  constructor(
    @inject(UsersRepository) private usersRepository: UsersRepository,
    @inject(BcryptService) private bcrypt: BcryptService,
    @inject(UsersQueryRepository) private usersQueryRepository: UsersQueryRepository,
  ) {}

  async findAll(queryDto: UserQueryInput): Promise<{ items: WithId<User>[]; totalCount: number }> {
    return this.usersQueryRepository.findAll(queryDto);
  }

  async create(dto: UserInputDto): Promise<WithId<User> | null> {
    const existUserWithSameEmail = await this.usersQueryRepository.findUserByEmail(dto.email);

    if (existUserWithSameEmail) {
      throw new DomainError('email should be unique', 'email');
    }

    const existUserWithSameLogin = await this.usersQueryRepository.findUserByLogin(dto.login);

    if (existUserWithSameLogin) {
      throw new DomainError('login should be unique', 'login');
    }

    const passwordHash = await this.bcrypt.generateHash(dto.password, 10);

    const newUser: User = User.createSuperUser(dto.login, dto.email, passwordHash);

    const insertedUserId = await this.usersRepository.create(newUser);

    return this.usersRepository.findUserById(insertedUserId);
  }

  async delete(id: string): Promise<void> {
    return this.usersRepository.delete(id);
  }
}
