import { WithId } from 'mongodb';
import { User } from '../../types';
import { UserListPaginatedOutput } from '../../output/user-list-paginated.output';

export function mapToUserListPaginatedOutput(
  users: WithId<User>[],
  pagination: { pageNumber: number; pageSize: number; totalCount: number },
): UserListPaginatedOutput {
  return {
    page: pagination.pageNumber,
    pageSize: pagination.pageSize,
    pagesCount: Math.ceil(pagination.totalCount / pagination.pageSize),
    totalCount: pagination.totalCount,

    items: users.map((u: WithId<User>) => ({
      id: u._id.toString(),
      email: u.email,
      login: u.login,
      createdAt: u.createdAt,
    })),
  };
}
