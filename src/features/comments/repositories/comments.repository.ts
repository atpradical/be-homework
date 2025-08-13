import { injectable } from 'inversify';
import { CommentQueryInput } from '../types/comment-query.input';
import { CommentDocument, CommentModel } from '../../../db/models/comments.model';

@injectable()
export class CommentsRepository {
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

    const countQuery = CommentModel.countDocuments();

    const [items, totalCount] = await Promise.all([commentsQuery.exec(), countQuery.exec()]);

    return { items, totalCount };
  }

  async findById(id: string): Promise<CommentDocument | null> {
    return CommentModel.findById(id);
  }

  async save(newComment: CommentDocument): Promise<CommentDocument> {
    return newComment.save();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await CommentModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
}
