import mongoose, { HydratedDocument, model, Model } from 'mongoose';
import { BLOG_COLLECTION_NAME } from '../mongo.db';
import { CreatePostDto, UpdatePostDto } from '../../features/posts/domain/dto';
import { CreateBlogDto, UpdateBlogDto } from '../../features/blogs/domain/dto';

// Схема для документа в коллекции БД
const blogSchema = new mongoose.Schema<Blog, BlogModel, BlogMethods>(
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

const blogMethods = {
  updateBlog(dto: UpdateBlogDto) {
    const that = this as BlogDocument;

    that.name = dto.name;
    that.description = dto.description;
    that.websiteUrl = dto.websiteUrl;
  },
};

const blogStatics = {
  createBlog(dto: CreateBlogDto) {
    const blog = new BlogModel();

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;

    return blog;
  },
};

blogSchema.methods = blogMethods;
blogSchema.statics = blogStatics;

type BlogMethods = typeof blogMethods;
type BlogStatics = typeof blogStatics;

// Тип Блога для TS
export type Blog = {
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
  // deletedAt: Date | null;
};

// Тип модели (класс для взаимодействия с коллекцией) для взаимодействия с БД
type BlogModel = Model<Blog, {}, BlogMethods> & BlogStatics;

// Тип Документа в БД -> инстанс модели
export type BlogDocument = HydratedDocument<Blog, BlogMethods>;

// Сама модель
export const BlogModel = model<Blog, BlogModel>(BLOG_COLLECTION_NAME, blogSchema);
