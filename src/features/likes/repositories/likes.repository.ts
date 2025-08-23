import { injectable } from 'inversify';
import { LikeDocument, LikeModel } from '../../../db/models/likes.model';

@injectable()
export class LikesRepository {
  async save(newLike: LikeDocument): Promise<LikeDocument> {
    return newLike.save();
  }

  async findByCommentAndUserId(userId: string, entityId: string): Promise<LikeDocument | null> {
    return LikeModel.findOne({ userId, entityId });
  }

  async delete(userId: string, entityId: string): Promise<boolean> {
    const result = await LikeModel.deleteOne({ userId, entityId });
    return result.deletedCount === 1;
  }
}
