import { CommentView } from './index';
import { PaginatedOutput } from '../../../core/types/paginated.output';

export type CommentListPaginatedOutput = {
  items: CommentView[];
} & PaginatedOutput;
