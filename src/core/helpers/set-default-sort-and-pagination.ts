import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  paginationAndSortingDefault,
} from '../middlewares';
import { PaginationAndSorting } from '../types/pagination-and-sorting';

export function setDefaultSortAndPaginationIfNotExist<P = string>(
  query: Partial<PaginationAndSorting<P>>,
): PaginationAndSorting<P> {
  return {
    ...paginationAndSortingDefault,
    ...{
      ...query,
      pageSize: query.pageSize ? +query.pageSize : DEFAULT_PAGE_SIZE,
      pageNumber: query.pageNumber ? +query.pageNumber : DEFAULT_PAGE_NUMBER,
    },
    sortBy: (query.sortBy ?? paginationAndSortingDefault.sortBy) as P,
  };
}
