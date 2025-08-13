import mongoose, { HydratedDocument, model, Model } from 'mongoose';
import { BLOG_COLLECTION_NAME } from '../mongo.db';

// Тип Блога для TS
type Blog = {
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
  // deletedAt: Date | null;
};

// Схема для документа в коллекции БД
const blogSchema = new mongoose.Schema<Blog>(
  {
    name: {
      type: String,
      required: true,
      minLength: [1, 'Name is required'],
      maxLength: [100, 'Too long name'],
    },
    description: {
      type: String,
      required: true,
      minLength: [1, 'Description is required'],
      maxLength: [500, 'Too long Description'],
    },
    websiteUrl: {
      type: String,
      required: true,
      maxLength: [500, 'Too long websiteUrl'],
    },
    isMembership: { type: Boolean, default: false },
    // deletedAt: { type: Date, nullable: true, default: () => null },
  },
  { timestamps: true },
);

// Тип модели (класс для взаимодействия с коллекцией) для взаимодействия с БД
type BlogModel = Model<Blog>;

// Тип Документа в БД -> инстанс модели
export type BlogDocument = HydratedDocument<Blog>;

// Сама модель
export const BlogModel = model<Blog, BlogModel>(BLOG_COLLECTION_NAME, blogSchema);
