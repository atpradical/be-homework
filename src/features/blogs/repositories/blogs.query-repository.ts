import { Blog } from '../types';
import { BlogInputDto } from '../dto/blogInputDto';
import { blogsCollection } from '../../../db/mongo.db';
import { ObjectId, WithId } from 'mongodb';
import { RepositoryNotFoundError } from '../../../core/errors/repository-not-found.error';
import { BlogQueryInput } from '../routes/input/blog-query.input';

export const blogsQueryRepository = {
  async findAll(
    queryDto: BlogQueryInput,
  ): Promise<{ items: WithId<Blog>[]; totalCount: number }> {
    const {
      pageSize,
      pageNumber,
      sortBy,
      sortDirection,
      searchWebsiteUrlTerm,
      searchNameTerm,
    } = queryDto;

    const skip = (pageNumber - 1) * pageSize;
    const filter: any = {};

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' };
    }

    if (searchWebsiteUrlTerm) {
      filter.websiteUrl = { $regex: searchWebsiteUrlTerm, $options: 'i' };
    }

    const items = await blogsCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await blogsCollection.countDocuments(filter);

    return { items, totalCount };
  },

  async findById(id: string): Promise<WithId<Blog>> {
    const blog = await blogsCollection.findOne({ _id: new ObjectId(id) });

    if (!blog) {
      throw new RepositoryNotFoundError('Blog not exist');
    }

    return blog;
  },
};
