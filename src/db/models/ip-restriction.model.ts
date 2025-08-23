import mongoose, { HydratedDocument, model, Model } from 'mongoose';
import { IP_RESTRICTION_COLLECTION_NAME } from '../mongo.db';
import { appConfig } from '../../core/config';
import { CreateRecordDto } from '../../features/ip-restriction/domain/dto';

export const ipRestrictionSchema = new mongoose.Schema<
  IpRestricted,
  IpRestrictionModel,
  IpRestrictionMethods
>(
  {
    ip: {
      type: String,
      required: true,
      minLength: [1, 'IP is required'],
      maxLength: [100, 'Too long IP'],
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

const ipRestrictionMethods = {};

const ipRestrictionStatics = {
  createNewRecord(dto: CreateRecordDto) {
    const record = new IpRestrictionModel();

    record.ip = dto.ip;
    record.url = dto.url;

    return record;
  },
};

ipRestrictionSchema.methods = ipRestrictionMethods;
ipRestrictionSchema.statics = ipRestrictionStatics;

type IpRestrictionMethods = typeof ipRestrictionMethods;
type IpRestrictionStatics = typeof ipRestrictionStatics;

export type IpRestricted = {
  ip: string;
  url: string;
};

type IpRestrictionModel = Model<IpRestricted, {}, IpRestrictionMethods> & IpRestrictionStatics;
export type IpRestrictionDocument = HydratedDocument<IpRestricted, IpRestrictionMethods>;
export const IpRestrictionModel = model<IpRestricted, IpRestrictionModel>(
  IP_RESTRICTION_COLLECTION_NAME,
  ipRestrictionSchema,
);
