import { Response } from 'express';
import { HttpStatus, PostIdType } from '../../../../core';
import { mapToCommentsListViewModel } from '../../mappers/map-to-comments-list-view-model';
import { CommentQueryInput } from '../../types/comment-query.input';
import { setDefaultSortAndPaginationIfNotExist } from '../../../../core/helpers/set-default-sort-and-pagination';
import { CommentListPaginatedOutput } from '../../types/comment-list-paginated.output';
import { RequestWithParamsAndQuery } from '../../../../core/types/requests';
import { commentsQueryRepository, postsQueryRepository } from '../../../../core/composition-root';

export async function getCommentsListHandler(
  req: RequestWithParamsAndQuery<PostIdType, CommentQueryInput>,
  res: Response<CommentListPaginatedOutput | string>,
) {
  const postId = req.params.postId;

  const post = await postsQueryRepository.findById(postId);

  if (!post) {
    res.status(HttpStatus.NotFound).send(`Post with id:${postId} not found`);
    return;
  }

  const queryInput = setDefaultSortAndPaginationIfNotExist(req.query);

  const { items, totalCount } = await commentsQueryRepository.findAll(postId, queryInput);

  const resultViewModel = mapToCommentsListViewModel(items, {
    pageNumber: queryInput.pageNumber,
    pageSize: queryInput.pageSize,
    totalCount,
  });

  res.status(HttpStatus.Ok).send(resultViewModel);
}
