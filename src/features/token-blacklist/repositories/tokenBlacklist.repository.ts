import { tokenBlacklistCollection } from '../../../db/mongo.db';
import { WithId } from 'mongodb';

export const tokenBlacklistRepository = {
  async addTokenToBlackList(token: string): Promise<boolean> {
    const insertResult = await tokenBlacklistCollection.insertOne({ token, createdAt: new Date() });
    return insertResult.insertedId !== undefined;
  },

  async findTokenInBlackList(token: string): Promise<WithId<{ token: string; createdAt: Date }>> {
    return await tokenBlacklistCollection.findOne({ token });
  },

  async deleteTokenFromBlackList(token: string): Promise<boolean> {
    const deleteResult = await tokenBlacklistCollection.deleteOne({ token });
    return deleteResult.deletedCount >= 1;
  },
};
