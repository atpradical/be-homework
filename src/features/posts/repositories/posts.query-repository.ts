import { PostInputDto } from '../dto/postInputDto';
import { Post } from '../types';
import { postsCollection } from '../../../db/mongo.db';
import { ObjectId, WithId } from 'mongodb';
import { RepositoryNotFoundError } from '../../../core/errors/repository-not-found.error';
import { PostQueryInput } from '../routes/input/post-query.input';

export const postsQueryRepository = {
  async findAll(
    queryDto: PostQueryInput,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
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
  },

  async findById(id: string): Promise<WithId<Post>> {
    const post = await postsCollection.findOne({ _id: new ObjectId(id) });

    if (!post) {
      throw new RepositoryNotFoundError('Blog not exist');
    }

    return post;
  },

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
  },
};
