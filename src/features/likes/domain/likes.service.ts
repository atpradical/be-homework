import { inject, injectable } from 'inversify';
import { LikesRepository } from '../repositories/likes.repository';
import { LikeDocument } from '../../../db/models/likes.model';

@injectable()
export class LikesService {
  constructor(@inject(LikesRepository) private likesRepository: LikesRepository) {}

  async findLikesByCommentAndUserId(
    userId: string,
    commentId: string,
  ): Promise<LikeDocument | null> {
    return this.likesRepository.findByCommentAndUserId(userId, commentId);
  }

  async save(newLike: LikeDocument): Promise<LikeDocument> {
    return this.likesRepository.save(newLike);
  }
}
