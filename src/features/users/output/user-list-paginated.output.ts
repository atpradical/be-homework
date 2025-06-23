import { UserViewModel } from '../types';
import { PaginatedOutput } from '../../../core/types/paginated.output';

export type UserListPaginatedOutput = {
  items: UserViewModel[];
} & PaginatedOutput;
