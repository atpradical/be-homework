import { WithId } from 'mongodb';
import { Blog, BlogViewModel } from '../types';

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
