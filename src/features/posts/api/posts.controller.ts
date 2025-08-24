import { Request, Response } from 'express';
import { setDefaultSortAndPaginationIfNotExist } from '../../../core/helpers/set-default-sort-and-pagination';
import { PostQueryInput } from '../types/post-query.input';
import { mapToPostListPaginatedOutput } from '../mappers/map-to-post-list-paginated-output.util';
import { HttpStatus, IdType, PostIdType } from '../../../core';
import { errorsHandler } from '../../../core/errors/errors.handler';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndBodyAndUserId,
  RequestWithParamsAndQuery,
} from '../../../core/types/requests';
import { PostInputDto } from '../types/post-input.dto';
import { PostViewModel } from '../types/post-view-model';
import { ExtensionType } from '../../../core/result/object-result.entity';
import { ResultStatus } from '../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../core/result/resultCodeToHttpException';
import { ResponseWithExtensions } from '../../../core/types/responses';
import { CommentQueryInput } from '../../comments/types/comment-query.input';
import { CommentListPaginatedOutput } from '../../comments/types/comment-list-paginated.output';
import { mapToCommentsListViewModel } from '../../comments/mappers/map-to-comments-list-view-model';
import { CommentInputDto, LikeInputDto } from '../../comments/types/comment.input.dto';
import { CommentView } from '../../comments/types';
import { mapToCommentViewModel } from '../../comments/mappers/map-to-comment-view-model';
import { PostsQueryRepository } from '../repositories/posts.query-repository';
import { PostsService } from '../domain/posts.service';
import { CommentsQueryRepository } from '../../comments/repositories/comments.query-repository';
import { inject, injectable } from 'inversify';
import { LikesQueryRepository } from '../../likes/repositories/likes.query-repository';

@injectable()
export class PostsController {
  constructor(
    @inject(PostsService) private postsService: PostsService,
    @inject(PostsQueryRepository) private postsQueryRepository: PostsQueryRepository,
    @inject(CommentsQueryRepository) private commentsQueryRepository: CommentsQueryRepository,
    @inject(LikesQueryRepository) private likesQueryRepository: LikesQueryRepository,
  ) {}

  async getPostListHandler(req: Request, res: Response) {
    const userId = req.user?.id;
    let likes = [];

    try {
      const queryInput = setDefaultSortAndPaginationIfNotExist(
        req.query as unknown as PostQueryInput,
      );

      const { items, totalCount } = await this.postsQueryRepository.findAll(queryInput);

      if (userId) {
        const postIds = items.map((item) => item._id.toString());
        likes = await this.likesQueryRepository.findAllByEntityAndUserId(userId, postIds);
      }

      const postListOutput = mapToPostListPaginatedOutput({
        posts: items,
        pagination: {
          pageNumber: queryInput.pageNumber,
          pageSize: queryInput.pageSize,
          totalCount,
        },
        userId,
        likes,
      });

      res.status(HttpStatus.Ok).send(postListOutput);
    } catch (e: unknown) {
      errorsHandler(e, res);
    }
  }

  async getPostHandler(req: RequestWithParams<IdType>, res: Response<PostViewModel | null>) {
    const userId = req.user?.id;
    const postId = req.params.id;

    //  todo: Перенести в QueryRepository ?
    // const result = await this.postsQueryRepository.findById(postId);
    const result = await this.postsService.findPostWithUserStatus(postId, userId);

    if (result.status !== ResultStatus.Success) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }

    res.status(HttpStatus.Ok).send(result.data);
    return;
  }

  async createPostHandler(
    req: RequestWithBody<PostInputDto>,
    res: Response<PostViewModel | ExtensionType[] | string>,
  ) {
    const result = await this.postsService.create(req.body);

    if (result.status !== ResultStatus.Success) {
      res.status(resultCodeToHttpException(result.status)).send(result.extensions);
      return;
    }

    res.status(HttpStatus.Created).send(result.data);
    return;
  }

  async updatePostHandler(
    req: RequestWithParamsAndBody<IdType, PostInputDto>,
    res: ResponseWithExtensions,
  ) {
    const id = req.params.id;

    const result = await this.postsService.update(id, req.body);

    if (result.status !== ResultStatus.Success) {
      res.status(resultCodeToHttpException(result.status)).send(result.extensions);
      return;
    }

    res.sendStatus(HttpStatus.NoContent);
    return;
  }

  async deletePostHandler(req: RequestWithParams<IdType>, res: ResponseWithExtensions) {
    const id = req.params.id;

    const result = await this.postsService.delete(id);

    if (result.status !== ResultStatus.Success) {
      res.status(resultCodeToHttpException(result.status)).send(result.extensions);
      return;
    }

    res.sendStatus(HttpStatus.NoContent);
    return;
  }

  async updatePostLikeStatusHandler(
    req: RequestWithParamsAndBodyAndUserId<PostIdType, LikeInputDto, IdType>,
    res: Response,
  ) {
    const userId = req.user.id;
    const postId = req.params.postId;
    const likeStatus = req.body.likeStatus;

    const result = await this.postsService.updatePostLikeStatus(userId, postId, likeStatus);

    if (result.status !== ResultStatus.Success) {
      res.status(resultCodeToHttpException(result.status)).send(result.extensions);
      return;
    }

    res.sendStatus(HttpStatus.NoContent);
    return;
  }

  async getCommentsListHandler(
    req: RequestWithParamsAndQuery<PostIdType, CommentQueryInput>,
    res: Response<CommentListPaginatedOutput | string>,
  ) {
    const userId = req.user?.id;
    const postId = req.params.postId;
    let likes = [];

    const post = await this.postsQueryRepository.findById(postId);

    if (!post) {
      res.status(HttpStatus.NotFound).send(`Post with id:${postId} not found`);
      return;
    }

    const queryInput = setDefaultSortAndPaginationIfNotExist(req.query);

    const { items, totalCount } = await this.commentsQueryRepository.findAll(postId, queryInput);

    if (userId) {
      const commentIds = items.map((item) => item.id);
      likes = await this.likesQueryRepository.findAllByEntityAndUserId(userId, commentIds);
    }

    const resultViewModel = mapToCommentsListViewModel({
      comments: items,
      userId,
      likes,
      pagination: {
        pageNumber: queryInput.pageNumber,
        pageSize: queryInput.pageSize,
        totalCount,
      },
    });

    res.status(HttpStatus.Ok).send(resultViewModel);
  }

  async createCommentHandler(
    req: RequestWithParamsAndBodyAndUserId<PostIdType, CommentInputDto, IdType>,
    res: Response<CommentView | ExtensionType[] | string>,
  ) {
    const userId = req.user.id;
    const postId = req.params.postId;
    const content = req.body.content;
    // const result = await this.postsService.createComment({ postId, ...dto, userId });
    const result = await this.postsService.createComment(userId, postId, content);

    if (result.status !== ResultStatus.Success) {
      res.status(resultCodeToHttpException(result.status)).send(result.extensions);
      return;
    }

    const resultViewModel = mapToCommentViewModel(result.data);

    res.status(HttpStatus.Created).send(resultViewModel);
    return;
  }
}
