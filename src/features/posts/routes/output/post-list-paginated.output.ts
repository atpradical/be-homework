import {
  PaginatedOutput,
  PaginatedOutputWithPagesCount,
} from '../../../../core/types/paginated.output';
import { Post } from '../../types';

export type PostListPaginatedOutput = {
  items: Post[];
} & PaginatedOutput;

export type PostListPaginatedOutputWithPagesCount = {
  items: Post[];
} & PaginatedOutputWithPagesCount;
