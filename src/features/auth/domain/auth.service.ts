import { usersQueryRepository } from '../../users/repositories/users.query-repository';
import { LoginInputDto } from '../types/login-input.dto';
import { WithId } from 'mongodb';
import { jwtService } from '../adapters/jwt.service';
import { bcryptService } from '../adapters/bcrypt.service';
import { ResultStatus } from '../../../core/result/resultCode';
import { Result } from '../../../core/result/result.type';
import { User } from '../../users/types';

export const authService = {
  async login(dto: LoginInputDto): Promise<Result<{ accessToken: string } | null>> {
    const result = await this.checkCredentials(dto);

    if (result.status !== ResultStatus.Success) {
      return {
        status: ResultStatus.NotFound,
        data: null,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'loginOrEmail', message: 'Wrong credentials' }],
      };
    }

    const accessToken = await jwtService.createToken(result.data!._id.toString());

    return {
      status: ResultStatus.Success,
      data: { accessToken },
      extensions: [],
    };
  },

  async checkCredentials(dto: LoginInputDto): Promise<Result<WithId<User> | null>> {
    const user = await usersQueryRepository.findUserByLoginOrEmail(dto.loginOrEmail);

    if (!user) {
      return {
        status: ResultStatus.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'loginOrEmail', message: 'Not Found' }],
      };
    }

    const isPasswordCorrect = await bcryptService.checkPassword(dto.password, user.password);

    if (!isPasswordCorrect) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'password', message: 'Wrong password' }],
      };
    }

    return {
      status: ResultStatus.Success,
      data: user,
      extensions: [],
    };
  },
};
