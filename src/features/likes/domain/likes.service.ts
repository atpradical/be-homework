import { inject, injectable } from 'inversify';
import { LikesRepository } from '../repositories/likes.repository';
import { LikeDocument } from '../../../db/models/likes.model';

@injectable()
export class LikesService {
  constructor(@inject(LikesRepository) private likesRepository: LikesRepository) {}

  async findLikesByEntityAndUserId(userId: string, entityId: string): Promise<LikeDocument | null> {
    return this.likesRepository.findByEntityAndUserId(userId, entityId);
  }

  async findThreeNewestLikesToEntity(entityId: string[]): Promise<LikeDocument[]> {
    return this.likesRepository.findAllLikes(entityId, 3);
  }

  async save(newLike: LikeDocument): Promise<LikeDocument> {
    return this.likesRepository.save(newLike);
  }
}
