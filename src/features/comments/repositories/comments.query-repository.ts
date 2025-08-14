import { CommentQueryInput } from '../types/comment-query.input';
import { injectable } from 'inversify';
import { CommentDocument, CommentModel } from '../../../db/models/comments.model';

@injectable()
export class CommentsQueryRepository {
  async findAll(
    postId: string,
    queryDto: CommentQueryInput,
  ): Promise<{ items: CommentDocument[]; totalCount: number }> {
    const { pageSize, pageNumber, sortBy, sortDirection } = queryDto;

    const skip = (pageNumber - 1) * pageSize;

    const commentsQuery = CommentModel.find({ postId })
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);

    const countQuery = CommentModel.countDocuments({ postId });

    const [items, totalCount] = await Promise.all([commentsQuery.exec(), countQuery.exec()]);

    return { items, totalCount };
  }

  async findById(id: string): Promise<CommentDocument | null> {
    return CommentModel.findById(id);
  }
}
