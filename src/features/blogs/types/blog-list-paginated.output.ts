import { PaginatedOutput } from '../../../core/types/paginated.output';
import { Blog } from '../../../db/models/blog.model';

export type BlogListPaginatedOutput = {
  items: Blog[];
} & PaginatedOutput;
