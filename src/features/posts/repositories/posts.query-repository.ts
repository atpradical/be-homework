import { WithId } from 'mongodb';
import { PostQueryInput } from '../types/post-query.input';
import { Post } from '../domain/post.etntity';
import { injectable } from 'inversify';
import { PostModel } from '../../../db/models/post.model';

@injectable()
export class PostsQueryRepository {
  async findAll(queryDto: PostQueryInput): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    const { pageSize, pageNumber, sortBy, sortDirection } = queryDto;

    const skip = (pageNumber - 1) * pageSize;

    const postsQuery = PostModel.find()
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);

    const countQuery = PostModel.countDocuments();

    const [items, totalCount] = await Promise.all([postsQuery.lean(), countQuery.exec()]);

    return { items, totalCount };
  }

  async findById(id: string): Promise<WithId<Post> | null> {
    return PostModel.findById(id);
  }
}
