import { User } from '../types';
import { ObjectId, WithId } from 'mongodb';
import { usersCollection } from '../../../db/mongo.db';
import { RepositoryNotFoundError } from '../../../core/errors/repository-not-found.error';
import { UserQueryInput } from '../routes/input/user-query.input';

export const usersRepository = {
  async findAll(
    queryDto: UserQueryInput,
  ): Promise<{ items: WithId<User>[]; totalCount: number }> {
    const {
      searchEmailTerm,
      searchLoginTerm,
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
    } = queryDto;

    const skip = (pageNumber - 1) * pageSize;

    const filter: any = {};

    if (searchLoginTerm) {
      filter.login = { $regex: searchLoginTerm, $option: 'i' };
    }

    if (searchEmailTerm) {
      filter.login = { $regex: searchEmailTerm, $option: 'i' };
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

  async findUserById(_id: ObjectId): Promise<WithId<User> | null> {
    return await usersCollection.findOne({ _id });
  },

  async create(newUser: User): Promise<ObjectId> {
    const insertResult = await usersCollection.insertOne(newUser);
    return insertResult.insertedId;
  },

  async delete(id: string): Promise<void> {
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      throw new RepositoryNotFoundError('User not exist');
    }

    const deletedResult = await usersCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deletedResult.deletedCount < 1) {
      throw new Error('User not exist');
    }
  },
};
