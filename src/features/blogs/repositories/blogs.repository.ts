import { Blog } from '../types';
import { BlogInputDto } from '../types/blog-input.dto';
import { blogsCollection } from '../../../db/mongo.db';
import { ObjectId, WithId } from 'mongodb';
import { RepositoryNotFoundError } from '../../../core/errors/repository-not-found.error';
import { BlogQueryInput } from '../types/blog-query.input';
import { injectable } from 'inversify';

@injectable()
export class BlogsRepository {
  async findAll(queryDto: BlogQueryInput): Promise<{ items: WithId<Blog>[]; totalCount: number }> {
    const { pageSize, pageNumber, sortBy, sortDirection, searchWebsiteUrlTerm, searchNameTerm } =
      queryDto;

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
  }

  async findById(id: string): Promise<WithId<Blog>> {
    const blog = await blogsCollection.findOne({ _id: new ObjectId(id) });

    if (!blog) {
      throw new RepositoryNotFoundError('Blog not exist');
    }

    return blog;
  }

  async create(newBlog: Blog): Promise<WithId<Blog>> {
    const insertResult = await blogsCollection.insertOne(newBlog);
    return { ...newBlog, _id: insertResult.insertedId };
  }

  async update(id: string, dto: BlogInputDto): Promise<void> {
    const blog = await blogsCollection.findOne({ _id: new ObjectId(id) });

    if (!blog) {
      throw new RepositoryNotFoundError('Blog not exist');
    }

    const updateResult = await blogsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: dto.name,
          description: dto.description,
          websiteUrl: dto.websiteUrl,
        },
      },
    );

    if (updateResult.matchedCount < 1) {
      //  TODO: заменить на DomainError если такая проверка есть в дз
      throw new Error('Blog not exist');
    }

    return;
  }

  async delete(id: string): Promise<void> {
    const blog = await blogsCollection.findOne({ _id: new ObjectId(id) });

    if (!blog) {
      throw new RepositoryNotFoundError('Blog not exist');
    }

    const deleteResult = await blogsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      //  TODO: заменить на DomainError если такая проверка есть в дз
      throw new Error('Blog not exist');
    }

    return;
  }
}
