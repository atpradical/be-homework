import { PaginatedOutput } from '../../../core/types/paginated.output';
import { Post } from '../../../db/models/post.model';

export type PostListPaginatedOutput = {
  items: Post[];
} & PaginatedOutput;
