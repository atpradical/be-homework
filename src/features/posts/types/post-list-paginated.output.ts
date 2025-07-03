import { PaginatedOutput } from '../../../core/types/paginated.output';
import { Post } from './index';

export type PostListPaginatedOutput = {
  items: Post[];
} & PaginatedOutput;
