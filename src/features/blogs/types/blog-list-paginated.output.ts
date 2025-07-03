import { PaginatedOutput } from '../../../core/types/paginated.output';
import { Blog } from './index';

export type BlogListPaginatedOutput = {
  items: Blog[];
} & PaginatedOutput;
