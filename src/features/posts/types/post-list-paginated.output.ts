import { PaginatedOutput } from '../../../core/types/paginated.output';
import { PostViewModel } from './post-view-model';

export type PostListPaginatedOutput = {
  items: PostViewModel[];
} & PaginatedOutput;
