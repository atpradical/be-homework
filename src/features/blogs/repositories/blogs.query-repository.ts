import { injectable } from 'inversify';
import { BlogQueryInput } from '../types/blog-query.input';
import { BlogDocument, BlogModel } from '../../../db/models/blog.model';

@injectable()
export class BlogsQueryRepository {
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

  async findById(id: string): Promise<BlogDocument> {
    return BlogModel.findById(id);
  }
}
