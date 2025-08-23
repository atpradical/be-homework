import { WithId } from 'mongodb';
import { BlogViewModel } from '../types/blog-view.model';
import { Blog } from '../../../db/models/blog.model';

export function mapToBlogViewModel(createdBlog: WithId<Blog>): BlogViewModel {
  return {
    id: createdBlog._id.toString(),
    name: createdBlog.name,
    description: createdBlog.description,
    websiteUrl: createdBlog.websiteUrl,
    createdAt: createdBlog.createdAt,
    isMembership: createdBlog.isMembership,
  };
}
