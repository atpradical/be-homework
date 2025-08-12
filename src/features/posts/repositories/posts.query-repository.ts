import { postsCollection } from '../../../db/mongo.db';
import { ObjectId, WithId } from 'mongodb';
import { PostQueryInput } from '../types/post-query.input';
import { Post } from '../domain/post.etntity';
import { injectable } from 'inversify';

@injectable()
export class PostsQueryRepository {
  async findAll(queryDto: PostQueryInput): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    const { pageSize, pageNumber, sortBy, sortDirection } = queryDto;

    const skip = (pageNumber - 1) * pageSize;

    const items = await postsCollection
      .find()
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await postsCollection.countDocuments();

    return { items, totalCount };
  }

  async findById(id: string): Promise<WithId<Post> | null> {
    return postsCollection.findOne({ _id: new ObjectId(id) });
  }

  async findPostsByBlog(
    blogId: string,
    queryDto: PostQueryInput,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    const { pageSize, pageNumber, sortBy, sortDirection } = queryDto;

    const filter = { blogId: blogId };

    const skip = (pageNumber - 1) * pageSize;

    const items = await postsCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await postsCollection.countDocuments({ blogId: blogId });

    return { items, totalCount };
  }
}
