import { PaginatedOutput } from '../../../../core/types/paginated.output';
import { Blog } from '../../types';

export type BlogListPaginatedOutput = {
  items: Blog[];
} & PaginatedOutput;
