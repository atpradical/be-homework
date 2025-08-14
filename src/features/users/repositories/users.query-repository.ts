import { injectable } from 'inversify';
import { UserQueryInput } from '../types/user-query.input';
import { UserDocument, UserModel } from '../../../db/models/user.model';

@injectable()
export class UsersQueryRepository {
  async findAll(queryDto: UserQueryInput): Promise<{ items: UserDocument[]; totalCount: number }> {
    const { searchEmailTerm, searchLoginTerm, sortBy, sortDirection, pageNumber, pageSize } =
      queryDto;

    const skip = (pageNumber - 1) * pageSize;

    const filter: any = {};

    if (searchLoginTerm) {
      filter.login = { $regex: searchLoginTerm, $option: 'i' };
    }

    if (searchEmailTerm) {
      filter.login = { $regex: searchEmailTerm, $option: 'i' };
    }

    const usersQuery = UserModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);

    const totalCountQuery = UserModel.countDocuments(filter);

    const [items, totalCount] = await Promise.all([usersQuery.exec(), totalCountQuery.exec()]);

    return { items, totalCount };
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id);
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    return UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }
}
