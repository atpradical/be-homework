import { PaginatedOutput } from '../../../../core/types/paginated.output';
import { Post } from '../../types';

export type PostListPaginatedOutput = {
  items: Post[];
} & PaginatedOutput;
