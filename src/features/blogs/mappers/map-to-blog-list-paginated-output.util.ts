import { WithId } from 'mongodb';
import { BlogListPaginatedOutput } from '../types/blog-list-paginated.output';
import { Blog } from '../../../db/models/blog.model';

export function mapToBlogListPaginatedOutput(
  blogs: WithId<Blog>[],
  pagination: { pageNumber: number; pageSize: number; totalCount: number },
): BlogListPaginatedOutput {
  return {
    pagesCount: Math.ceil(pagination.totalCount / pagination.pageSize),
    page: pagination.pageNumber,
    pageSize: pagination.pageSize,
    totalCount: pagination.totalCount,

    items: blogs.map((blog: WithId<Blog>) => ({
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
      websiteUrl: blog.websiteUrl,
    })),
  };
}
