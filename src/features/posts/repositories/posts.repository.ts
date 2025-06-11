import { PostInputDto } from '../dto/postInputDto';
import { Post } from '../types';
import { postsCollection } from '../../../db/mongo.db';
import { ObjectId, WithId } from 'mongodb';
import { RepositoryNotFoundError } from '../../../core/errors/repository-not-found.error';
import { PostQueryInput } from '../routes/input/post-query.input';

export const postsRepository = {
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

  async create(newPost: Post): Promise<WithId<Post>> {
    const insertResult = await postsCollection.insertOne(newPost);
    return { ...newPost, _id: insertResult.insertedId };
  },

  async update(id: string, dto: PostInputDto): Promise<void> {
    const post = await postsCollection.findOne({ _id: new ObjectId(id) });

    if (!post) {
      throw new RepositoryNotFoundError('Post not exist');
    }

    const updateResult = await postsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title: dto.title,
          shortDescription: dto.shortDescription,
          content: dto.content,
          blogId: dto.blogId,
        },
      },
    );

    if (updateResult.matchedCount < 1) {
      //  TODO: заменить на DomainError если такая проверка есть в дз
      throw new Error('Post not exist');
    }

    return;
  },

  async delete(id: string): Promise<void> {
    const post = await postsCollection.findOne({ _id: new ObjectId(id) });

    if (!post) {
      throw new RepositoryNotFoundError('Post not exist');
    }

    const deleteResult = await postsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      //  TODO: заменить на DomainError если такая проверка есть в дз
      throw new Error('Post not exist');
    }

    return;
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

    const totalCount = await postsCollection.countDocuments();

    return { items, totalCount };
  },
};
