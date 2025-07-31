import { IpRestricted } from '../domain/ip-restricted.entity';
import { ipRestrictedCollection } from '../../../db/mongo.db';

export const ipRestrictedRepository = {
  async create(newRecord: IpRestricted): Promise<string> {
    const insertResult = await ipRestrictedCollection.insertOne(newRecord);
    return insertResult.insertedId.toString();
  },

  async countByLastTenSeconds(ip: string, url: string): Promise<number> {
    const lastTenSeconds = new Date(Date.now() - 10000); // "сейчас" минус 10 сек
    return await ipRestrictedCollection.countDocuments({
      ip,
      url,
      createdAt: { $gte: lastTenSeconds },
    });
  },
};
