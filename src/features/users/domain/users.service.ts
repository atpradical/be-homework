import { UserQueryInput } from '../types/user-query.input';
import { WithId } from 'mongodb';
import { UsersRepository } from '../repositories/users.repository';
import { UserInputDto } from '../types/user-input.dto';
import { BcryptService } from '../../auth/adapters/bcrypt.service';
import { inject, injectable } from 'inversify';
import { User, UserDocument, UserModel } from '../../../db/models/user.model';
import { ObjectResult } from '../../../core/result/object-result.entity';
import { ResultStatus } from '../../../core/result/resultCode';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns/add';

@injectable()
export class UsersService {
  constructor(
    @inject(UsersRepository) private usersRepository: UsersRepository,
    @inject(BcryptService) private bcrypt: BcryptService,
  ) {}

  async findAll(queryDto: UserQueryInput): Promise<{ items: WithId<User>[]; totalCount: number }> {
    return this.usersRepository.findAll(queryDto);
  }

  async create(dto: UserInputDto): Promise<ObjectResult<UserDocument>> {
    const userWithSameEmail = await this.usersRepository.findUserByLoginOrEmail(dto.email);

    if (userWithSameEmail) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'BadRequest',
        extensions: 'User with same Email already exist',
      });
    }

    const userWithSameLogin = await this.usersRepository.findUserByLoginOrEmail(dto.login);

    if (userWithSameLogin) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'BadRequest',
        extensions: 'User with same Login already exist',
      });
    }

    const passwordHash = await this.bcrypt.generateHash(dto.password, 10);

    // Создаем SA до mongoose было: User.createSuperUser(dto.login, dto.email, passwordHash);
    const newUser = UserModel.createSuperUser({
      login: dto.login,
      email: dto.email,
      passwordHash: passwordHash,
    });
    const result = await this.usersRepository.save(newUser);

    return ObjectResult.createSuccessResult(result);
  }

  async delete(id: string): Promise<ObjectResult> {
    const result = await this.usersRepository.deleteById(id);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: `User with id: ${id} not found`,
      });
    }
    return ObjectResult.createSuccessResult(null);
  }
}
