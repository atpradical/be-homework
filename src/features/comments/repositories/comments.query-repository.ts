import { ObjectId, WithId } from 'mongodb';
import { commentsCollection } from '../../../db/mongo.db';
import { CommentQueryInput } from '../types/comment-query.input';
import { Comment } from '../domain/comment.entity';
import { injectable } from 'inversify';

@injectable()
export class CommentsQueryRepository {
  async findAll(
    postId: string,
    queryDto: CommentQueryInput,
  ): Promise<{ items: WithId<Comment>[]; totalCount: number }> {
    const { pageSize, pageNumber, sortBy, sortDirection } = queryDto;

    const skip = (pageNumber - 1) * pageSize;

    const items = await commentsCollection
      .find({ postId })
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await commentsCollection.countDocuments({ postId });

    return { items, totalCount };
  }

  async findById(id: string): Promise<WithId<Comment> | null> {
    return await commentsCollection.findOne({ _id: new ObjectId(id) });
  }
}
