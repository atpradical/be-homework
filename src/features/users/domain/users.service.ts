import { UserQueryInput } from '../types/user-query.input';
import { WithId } from 'mongodb';
import { UsersRepository } from '../repositories/users.repository';
import { UserInputDto } from '../types/user-input.dto';
import { DomainError } from '../../../core/errors/domain.error';
import { User } from './user.entity';
import { BcryptService } from '../../auth/adapters/bcrypt.service';
import { usersQueryRepository } from '../../../core/composition-root';

export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private bcrypt: BcryptService,
  ) {}

  async findAll(queryDto: UserQueryInput): Promise<{ items: WithId<User>[]; totalCount: number }> {
    return usersQueryRepository.findAll(queryDto);
  }

  async create(dto: UserInputDto): Promise<WithId<User> | null> {
    const existUserWithSameEmail = await usersQueryRepository.findUserByEmail(dto.email);

    if (existUserWithSameEmail) {
      throw new DomainError('email should be unique', 'email');
    }

    const existUserWithSameLogin = await usersQueryRepository.findUserByLogin(dto.login);

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
