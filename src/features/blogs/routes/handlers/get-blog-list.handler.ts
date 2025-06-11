import { Request, Response } from 'express';
import { blogsService } from '../../application/blogs.service';
import { errorsHandler } from '../../../../core/errors/errors.handler';
import { HttpStatus } from '../../../../core';
import { BlogQueryInput } from '../input/blog-query.input';
import { setDefaultSortAndPaginationIfNotExist } from '../../../../core/helpers/set-default-sort-and-pagination';
import { mapToBlogListPaginatedOutput } from '../mappers/map-to-blog-list-paginated-output.util';

export async function getBlogListHandler(
  req: Request<{}, {}, {}, BlogQueryInput>,
  res: Response,
) {
  try {
    const queryInput = setDefaultSortAndPaginationIfNotExist(req.query);

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
