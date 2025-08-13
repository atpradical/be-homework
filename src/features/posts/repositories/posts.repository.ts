import { PostQueryInput } from '../types/post-query.input';
import { injectable } from 'inversify';
import { PostDocument, PostModel } from '../../../db/models/post.model';
import { ObjectId } from 'mongodb';

@injectable()
export class PostsRepository {
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

  async findById(id: string): Promise<PostDocument | null> {
    return PostModel.findById(id);
  }

  async findByBlogId(
    blogId: string,
    queryDto: PostQueryInput,
  ): Promise<{ items: PostDocument[]; totalCount: number }> {
    const { pageSize, pageNumber, sortBy, sortDirection } = queryDto;

    const filter = { blogId: blogId };

    const skip = (pageNumber - 1) * pageSize;

    const postsQuery = PostModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);

    const countQuery = PostModel.countDocuments({ blogId: blogId });

    const [items, totalCount] = await Promise.all([postsQuery.exec(), countQuery.exec()]);

    return { items, totalCount };
  }

  async save(post: PostDocument): Promise<PostDocument> {
    return post.save();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await PostModel.deleteOne({ _id: new ObjectId(id) }).exec();
    return result.deletedCount >= 1;
  }
}
