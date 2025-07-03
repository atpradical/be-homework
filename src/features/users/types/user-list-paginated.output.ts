import { UserViewModel } from './index';
import { PaginatedOutput } from '../../../core/types/paginated.output';

export type UserListPaginatedOutput = {
  items: UserViewModel[];
} & PaginatedOutput;
