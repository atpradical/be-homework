import { ObjectId, WithId } from 'mongodb';
import { CommentDB } from '../types';
import { commentsCollection } from '../../../db/mongo.db';
import { CommentQueryInput } from '../types/comment-query.input';

export const commentsQueryRepository = {
  async findAll(
    postId: string,
    queryDto: CommentQueryInput,
  ): Promise<{ items: WithId<CommentDB>[]; totalCount: number }> {
    const { pageSize, pageNumber, sortBy, sortDirection } = queryDto;

    const skip = (pageNumber - 1) * pageSize;

    const items = await commentsCollection
      .find({ postId: new ObjectId(postId) })
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await commentsCollection.countDocuments();

    return { items, totalCount };
  },

  async findById(id: string): Promise<WithId<CommentDB> | null> {
    return await commentsCollection.findOne({ _id: new ObjectId(id) });
  },
};
