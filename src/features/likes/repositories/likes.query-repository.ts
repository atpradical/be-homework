import { injectable } from 'inversify';
import { LikeDocument, LikeModel } from '../../../db/models/likes.model';

@injectable()
export class LikesQueryRepository {
  async findAllByCommentAndUserId(userId: string, entityIds: string[]): Promise<LikeDocument[]> {
    return LikeModel.find({ userId, entityId: { $in: entityIds } });
  }
}
