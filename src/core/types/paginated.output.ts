export type PaginatedOutput = {
  page: number;
  pageSize: number;
  pageCount: number;
  totalCount: number;
};

export type PaginatedOutputWithPagesCount = { pagesCount: number } & Pick<
  PaginatedOutput,
  'pageSize' | 'page' | 'totalCount'
>;
