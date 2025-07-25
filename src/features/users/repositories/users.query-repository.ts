import { ObjectId, WithId } from 'mongodb';
import { usersCollection } from '../../../db/mongo.db';
import { UserQueryInput } from '../types/user-query.input';
import { User } from '../domain/user.entity';

export const usersQueryRepository = {
  async findAll(queryDto: UserQueryInput): Promise<{ items: WithId<User>[]; totalCount: number }> {
    const { searchEmailTerm, searchLoginTerm, sortBy, sortDirection, pageNumber, pageSize } =
      queryDto;

    const skip = (pageNumber - 1) * pageSize;

    const filter: any = {};

    if (searchLoginTerm || searchEmailTerm) {
      filter['$or'] = [];
    }

    if (searchLoginTerm) {
      filter['$or'].push({
        login: { $regex: searchLoginTerm, $options: 'i' },
      });
    }

    if (searchEmailTerm) {
      filter['$or'].push({
        email: { $regex: searchEmailTerm, $options: 'i' },
      });
    }

    const items = await usersCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await usersCollection.countDocuments(filter);

    return { items, totalCount };
  },

  async findUserById(id: string): Promise<WithId<User> | null> {
    return await usersCollection.findOne({ _id: new ObjectId(id) });
  },

  async findUserByEmail(email: string): Promise<WithId<User> | null> {
    return await usersCollection.findOne({ email });
  },

  async findUserByLogin(login: string): Promise<WithId<User> | null> {
    return await usersCollection.findOne({ login });
  },

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<WithId<User> | null> {
    return await usersCollection.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  },
};
