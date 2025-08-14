import { injectable } from 'inversify';
import { LikeDocument, LikeModel } from '../../../db/models/likes.model';

@injectable()
export class LikesRepository {
  async save(newLike: LikeDocument): Promise<LikeDocument> {
    return newLike.save();
  }

  async findByCommentAndUserId(userId: string, commentId: string): Promise<LikeDocument | null> {
    return LikeModel.findOne({ userId, commentId });
  }

  async delete(userId: string, commentId: string): Promise<boolean> {
    const result = await LikeModel.deleteOne({ userId, commentId });
    return result.deletedCount === 1;
  }
}
