import { WithId } from 'mongodb';
import { MeViewModel, UserViewModel } from '../types';
import { User } from '../../../db/models/user.model';

export function mapToUserViewModel(createdUser: WithId<User>): UserViewModel {
  return {
    id: createdUser._id.toString(),
    email: createdUser.email,
    createdAt: createdUser.createdAt,
    login: createdUser.login,
  };
}

export function mapToMeViewModel(createdUser: WithId<User>): MeViewModel {
  return {
    userId: createdUser._id.toString(),
    email: createdUser.email,
    login: createdUser.login,
  };
}
