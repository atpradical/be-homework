import { BlogQueryInput } from '../types/blog-query.input';
import { injectable } from 'inversify';
import { BlogDocument, BlogModel } from '../../../db/models/blog.model';
import { ObjectId } from 'mongodb';

@injectable()
export class BlogsRepository {
  async findAll(queryDto: BlogQueryInput): Promise<{ items: BlogDocument[]; totalCount: number }> {
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

    const blogsQuery = BlogModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);

    const totalCountQuery = BlogModel.countDocuments(filter);

    const [items, totalCount] = await Promise.all([blogsQuery.exec(), totalCountQuery.exec()]);

    return { items, totalCount };
  }

  async findById(id: string): Promise<BlogDocument | null> {
    return BlogModel.findById(id);
  }

  async save(blog: BlogDocument): Promise<BlogDocument> {
    return blog.save();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await BlogModel.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount >= 1;
  }
}
