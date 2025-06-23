import { WithId } from 'mongodb';
import { User, UserViewModel } from '../../types';

export function mapToUserViewModel(createdUser: WithId<User>): UserViewModel {
  return {
    id: createdUser._id.toString(),
    email: createdUser.email,
    createdAt: createdUser.createdAt,
    login: createdUser.login,
  };
}
