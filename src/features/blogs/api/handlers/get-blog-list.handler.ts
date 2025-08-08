import { Request, Response } from 'express';
import { errorsHandler } from '../../../../core/errors/errors.handler';
import { HttpStatus } from '../../../../core';
import { BlogQueryInput } from '../../types/blog-query.input';
import { setDefaultSortAndPaginationIfNotExist } from '../../../../core/helpers/set-default-sort-and-pagination';
import { mapToBlogListPaginatedOutput } from '../../mappers/map-to-blog-list-paginated-output.util';
import { blogsService } from '../../../../composition-root';

export async function getBlogListHandler(req: Request, res: Response) {
  try {
    const query = req.query as unknown as BlogQueryInput;

    const queryInput = setDefaultSortAndPaginationIfNotExist(query);

    const { items, totalCount } = await blogsService.findAll(queryInput);

    const blogListOutput = mapToBlogListPaginatedOutput(items, {
      pageNumber: queryInput.pageNumber,
      pageSize: queryInput.pageSize,
      totalCount,
    });

    res.status(HttpStatus.Ok).send(blogListOutput);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
