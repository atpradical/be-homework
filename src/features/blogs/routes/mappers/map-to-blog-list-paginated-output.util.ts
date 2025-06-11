import { WithId } from 'mongodb';
import { Blog } from '../../types';
import { BlogListPaginatedOutput } from '../output/blog-list-paginated.output';

export function mapToBlogListPaginatedOutput(
  blogs: WithId<Blog>[],
  pagination: { pageNumber: number; pageSize: number; totalCount: number },
): BlogListPaginatedOutput {
  return {
    page: pagination.pageNumber,
    pageSize: pagination.pageSize,
    pageCount: Math.ceil(pagination.totalCount / pagination.pageSize),
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
