import { usersQueryRepository } from '../../users/repositories/users.query-repository';
import { AuthInputDto } from '../dto/auth.input.dto';
import { compare } from 'bcrypt';

export const authService = {
  async login(dto: AuthInputDto): Promise<boolean> {
    const user = await usersQueryRepository.findUserByLogin(dto.login);

    if (!user) {
      return false;
    }

    return compare(dto.password, user.password);
  },
};
