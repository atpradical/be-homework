import { injectable } from 'inversify';
import { LikeDocument, LikeModel } from '../../../db/models/likes.model';
import { LikeStatus } from '../../../core';

@injectable()
export class LikesRepository {
  async save(newLike: LikeDocument): Promise<LikeDocument> {
    return newLike.save();
  }

  async findByEntityAndUserId(userId: string, entityId: string): Promise<LikeDocument | null> {
    return LikeModel.findOne({ userId, entityId });
  }

  async findAllLikes(entityIds: string[], limit?: number): Promise<LikeDocument[]> {
    return LikeModel.find({ entityId: { $in: entityIds }, likeStatus: LikeStatus.Like })
      .sort({ updatedAt: -1 })
      .limit(limit);
  }

  async delete(userId: string, entityId: string): Promise<boolean> {
    const result = await LikeModel.deleteOne({ userId, entityId });
    return result.deletedCount === 1;
  }
}
