import { Request, Response } from 'express';
import { errorsHandler } from '../../../../core/errors/errors.handler';
import { HttpStatus } from '../../../../core';
import { setDefaultSortAndPaginationIfNotExist } from '../../../../core/helpers/set-default-sort-and-pagination';
import { PaginationAndSorting } from '../../../../core/types/pagination-and-sorting';
import { PostSortField } from '../../../posts/routes/input/post-sort-field';
import { postsService } from '../../../posts/application/posts.service';
import { mapToPostListPaginatedOutput } from '../../../posts/mappers/map-to-post-list-paginated-output.util';

export async function getPostListByBlogIdHandler(
  req: Request<{ blogId: string }, {}, {}, PaginationAndSorting<PostSortField>>,
  res: Response,
) {
  try {
    const blogId = req.params.blogId;
    const queryInput = setDefaultSortAndPaginationIfNotExist(req.query);

    const { items, totalCount } = await postsService.findPostsByBlog(
      blogId,
      queryInput,
    );

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
