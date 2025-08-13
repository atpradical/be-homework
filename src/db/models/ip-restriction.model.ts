import mongoose, { HydratedDocument, model, Model } from 'mongoose';
import { IpRestricted } from '../../features/ip-restriction/domain/ip-restricted.entity';
import { IP_RESTRICTION_COLLECTION_NAME } from '../mongo.db';
import { appConfig } from '../../core/config';

export const ipRestrictionSchema = new mongoose.Schema<IpRestricted>(
  {
    ip: {
      type: String,
      required: true,
      minLength: [1, 'IP is required'],
      maxLength: [15, 'Too long IP'],
    },
    url: {
      type: String,
      required: true,
      minLength: [1, 'URL is required'],
      maxLength: [500, 'Too long URL'],
    },
  },
  { timestamps: true },
);

// Добавляем TTL-индекс
ipRestrictionSchema.index({ createdAt: 1 }, { expireAfterSeconds: appConfig.IP_RESTRICTED_TTL });

type IpRestrictionModel = Model<IpRestricted>;
export type IpRestrictionDocument = HydratedDocument<IpRestricted>;
export const IpRestrictionModel = model<IpRestricted, IpRestrictionModel>(
  IP_RESTRICTION_COLLECTION_NAME,
  ipRestrictionSchema,
);
