import { Response } from 'express';
import { HttpStatus } from '../../../../core';
import { setDefaultSortAndPaginationIfNotExist } from '../../../../core/helpers/set-default-sort-and-pagination';
import { PaginationAndSorting } from '../../../../core/types/pagination-and-sorting';
import { PostSortField } from '../../../posts/types/post-sort-field';
import { mapToPostListPaginatedOutput } from '../../../posts/mappers/map-to-post-list-paginated-output.util';
import { RequestWithParamsAndQuery } from '../../../../core/types/requests';
import { ResultStatus } from '../../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';
import { PostListPaginatedOutput } from '../../../posts/types/post-list-paginated.output';
import { ExtensionType } from '../../../../core/result/object-result.entity';
import { postsService } from '../../../../composition-root';

export async function getPostListByBlogIdHandler(
  req: RequestWithParamsAndQuery<{ blogId: string }, PaginationAndSorting<PostSortField>>, // Request<{ blogId: string }, {}, {}, PaginationAndSorting<PostSortField>>,
  res: Response<PostListPaginatedOutput | ExtensionType[] | string>,
) {
  const blogId = req.params.blogId;
  const queryInput = setDefaultSortAndPaginationIfNotExist(req.query);

  const result = await postsService.findPostsByBlog({
    blogId,
    queryDto: queryInput,
  });

  if (result.status !== ResultStatus.Success) {
    res.status(resultCodeToHttpException(result.status)).send(result.extensions);
    return;
  }

  const {
    data: { items, totalCount },
  } = result;

  const postListOutput = mapToPostListPaginatedOutput(items, {
    pageNumber: queryInput.pageNumber,
    pageSize: queryInput.pageSize,
    totalCount,
  });

  res.status(HttpStatus.Ok).send(postListOutput);
}
