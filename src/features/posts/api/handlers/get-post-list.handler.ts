import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { errorsHandler } from '../../../../core/errors/errors.handler';
import { PostQueryInput } from '../../types/post-query.input';
import { setDefaultSortAndPaginationIfNotExist } from '../../../../core/helpers/set-default-sort-and-pagination';
import { mapToPostListPaginatedOutput } from '../../mappers/map-to-post-list-paginated-output.util';
import { postsQueryRepository } from '../../repositories/posts.query-repository';

export async function getPostListHandler(req: Request, res: Response) {
  try {
    const queryInput = setDefaultSortAndPaginationIfNotExist(
      req.query as unknown as PostQueryInput,
    );

    const { items, totalCount } = await postsQueryRepository.findAll(queryInput);

    const postListOutput = mapToPostListPaginatedOutput(items, {
      pageNumber: queryInput.pageNumber,
      pageSize: queryInput.pageSize,
      totalCount,
    });

    res.status(HttpStatus.Ok).send(postListOutput);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
