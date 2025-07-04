import { CommentQueryInput } from '../types/comment-query.input';
import { ObjectId, WithId } from 'mongodb';
import { CommentDB } from '../types';
import { commentsCollection } from '../../../db/mongo.db';
import { CommentInputDto } from '../types/comment.input.dto';

export const commentsRepository = {
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
    return commentsCollection.findOne({ _id: new ObjectId(id) });
  },

  async create(newComment: CommentDB): Promise<WithId<CommentDB>> {
    const insertResult = await commentsCollection.insertOne(newComment);
    return { ...newComment, _id: insertResult.insertedId };
  },

  async delete(id: string): Promise<boolean> {
    const deleteResult = await commentsCollection.deleteOne({ _id: new ObjectId(id) });
    return deleteResult.deletedCount === 1;
  },

  async update({ id, dto }: { id: string; dto: CommentInputDto }): Promise<boolean> {
    const updateResult = await commentsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          content: dto.content,
        },
      },
    );

    return updateResult.matchedCount === 1;
  },
};
