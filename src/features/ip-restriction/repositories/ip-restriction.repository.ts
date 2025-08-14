import { IpRestrictionDocument, IpRestrictionModel } from '../../../db/models/ip-restriction.model';
import { injectable } from 'inversify';

@injectable()
export class IpRestrictionRepository {
  async save(newRecord: IpRestrictionDocument): Promise<IpRestrictionDocument> {
    return await newRecord.save();
  }

  async countByLastTenSeconds(ip: string, url: string): Promise<number> {
    const lastTenSeconds = new Date(Date.now() - 10000); // "сейчас" минус 10 сек
    return IpRestrictionModel.countDocuments({
      ip,
      url,
      createdAt: { $gte: lastTenSeconds },
    }).exec();
  }
}
