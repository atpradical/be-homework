import { ObjectId, WithId } from 'mongodb';
import { usersCollection } from '../../../db/mongo.db';
import { RepositoryNotFoundError } from '../../../core/errors/repository-not-found.error';
import { UserQueryInput } from '../types/user-query.input';
import { User } from '../domain/user.entity';

export const usersRepository = {
  async findAll(queryDto: UserQueryInput): Promise<{ items: WithId<User>[]; totalCount: number }> {
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

  async update(id: ObjectId, dto: Partial<User>): Promise<boolean> {
    const updateResult = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...dto,
        },
      },
    );

    return updateResult.matchedCount >= 1;
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

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<WithId<User> | null> {
    return await usersCollection.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  },

  async doesExistByLoginOrEmail(dto: { login?: string; email?: string }): Promise<boolean> {
    const user = await usersCollection.findOne({
      $or: [{ login: dto.login }, { email: dto.email }],
    });

    return !!user;
  },

  async doesExistByLogin(login: string): Promise<boolean> {
    const user = await usersCollection.findOne({ login });
    return !!user;
  },

  async doesExistByEmail(email: string): Promise<boolean> {
    const user = await usersCollection.findOne({ email });
    return !!user;
  },

  async findUserByConfirmationCode(code: string): Promise<WithId<User> | null> {
    return await usersCollection.findOne({ 'emailConfirmation.confirmationCode': code });
  },
};
