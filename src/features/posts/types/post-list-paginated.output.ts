import { PaginatedOutput } from '../../../core/types/paginated.output';
import { Post } from '../domain/post.etntity';

export type PostListPaginatedOutput = {
  items: Post[];
} & PaginatedOutput;
