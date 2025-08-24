import { PostQueryInput } from '../types/post-query.input';
import { injectable } from 'inversify';
import { PostDocument, PostModel } from '../../../db/models/post.model';
import { mapToPostViewModel } from '../mappers/map-to-post-view-model';
import { PostViewModel } from '../types/post-view-model';

@injectable()
export class PostsQueryRepository {
  async findAll(queryDto: PostQueryInput): Promise<{ items: PostDocument[]; totalCount: number }> {
    const { pageSize, pageNumber, sortBy, sortDirection } = queryDto;

    const skip = (pageNumber - 1) * pageSize;

    const postsQuery = PostModel.find()
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);

    const countQuery = PostModel.countDocuments();

    const [items, totalCount] = await Promise.all([postsQuery.exec(), countQuery.exec()]);

    return { items, totalCount };
  }

  async findById(id: string): Promise<PostViewModel | null> {
    const post = await PostModel.findById(id);

    if (!post) {
      return null;
    }

    return mapToPostViewModel(post);
  }
}
