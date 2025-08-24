import { Request, Response } from 'express';
import { BlogQueryInput } from '../types/blog-query.input';
import { setDefaultSortAndPaginationIfNotExist } from '../../../core/helpers/set-default-sort-and-pagination';
import { mapToBlogListPaginatedOutput } from '../mappers/map-to-blog-list-paginated-output.util';
import { HttpStatus } from '../../../core';
import { errorsHandler } from '../../../core/errors/errors.handler';
import {
  RequestWithBody,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
} from '../../../core/types/requests';
import { BlogInputDto } from '../types/blog-input.dto';
import { mapToBlogViewModel } from '../mappers/map-to-blog-view-model';
import { PaginationAndSorting } from '../../../core/types/pagination-and-sorting';
import { PostSortField } from '../../posts/types/post-sort-field';
import { PostListPaginatedOutput } from '../../posts/types/post-list-paginated.output';
import { ExtensionType } from '../../../core/result/object-result.entity';
import { ResultStatus } from '../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../core/result/resultCodeToHttpException';
import { mapToPostListPaginatedOutput } from '../../posts/mappers/map-to-post-list-paginated-output.util';
import { PostInputDto } from '../../posts/types/post-input.dto';
import { PostViewModel } from '../../posts/types/post-view-model';
import { mapToPostViewModel } from '../../posts/mappers/map-to-post-view-model';
import { BlogsService } from '../domain/blogs.service';
import { BlogsQueryRepository } from '../repositories/blogs.query-repository';
import { PostsService } from '../../posts/domain/posts.service';
import { inject, injectable } from 'inversify';
import { LikesQueryRepository } from '../../likes/repositories/likes.query-repository';

@injectable()
export class BlogsController {
  constructor(
    @inject(BlogsService) private blogsService: BlogsService,
    @inject(BlogsQueryRepository) private blogsQueryRepository: BlogsQueryRepository,
    @inject(PostsService) private postsService: PostsService,
    @inject(LikesQueryRepository) private likesQueryRepository: LikesQueryRepository,
  ) {}

  async getBlogListHandler(req: Request, res: Response) {
    try {
      const query = req.query as unknown as BlogQueryInput;

      const queryInput = setDefaultSortAndPaginationIfNotExist(query);

      const { items, totalCount } = await this.blogsService.findAll(queryInput);

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

  async createBlogHandler(req: RequestWithBody<BlogInputDto>, res: Response) {
    try {
      const createdBlog = await this.blogsService.create(req.body);

      const blogViewModel = mapToBlogViewModel(createdBlog);

      res.status(HttpStatus.Created).send(blogViewModel);
    } catch (e) {
      errorsHandler(e, res);
    }
  }

  async getBlogHandler(req: Request<{ id: string }>, res: Response) {
    try {
      const id = req.params.id;

      const blog = await this.blogsQueryRepository.findById(id);

      if (!blog) {
        res.status(HttpStatus.NotFound).send(`Blog with id:${id} not found`);
      }

      const blogViewModel = mapToBlogViewModel(blog);

      res.status(HttpStatus.Ok).send(blogViewModel);
    } catch (e: unknown) {
      errorsHandler(e, res);
    }
  }

  async updateBlogHandler(req: Request<{ id: string }, {}, BlogInputDto>, res: Response) {
    const result = await this.blogsService.update(req.params.id, req.body);

    if (result.status !== ResultStatus.Success) {
      res.status(resultCodeToHttpException(result.status)).send(result.extensions);
      return;
    }

    res.sendStatus(HttpStatus.NoContent);
    return;
  }

  async deleteBlogHandler(req: Request<{ id: string }>, res: Response) {
    const id = req.params.id;
    const result = await this.blogsService.delete(id);

    if (result.status !== ResultStatus.Success) {
      res.status(resultCodeToHttpException(result.status)).send(result.extensions);
      return;
    }

    res.sendStatus(HttpStatus.NoContent);
    return;
  }

  async getPostListByBlogIdHandler(
    req: RequestWithParamsAndQuery<{ blogId: string }, PaginationAndSorting<PostSortField>>,
    res: Response<PostListPaginatedOutput | ExtensionType[] | string>,
  ) {
    const blogId = req.params.blogId;
    const queryInput = setDefaultSortAndPaginationIfNotExist(req.query);

    const result = await this.postsService.findPostsByBlog({
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

    const userId = req.user?.id;
    let likes = [];

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
  }

  async createPostForBlogHandler(
    req: RequestWithParamsAndBody<{ blogId: string }, PostInputDto>,
    res: Response<PostViewModel | ExtensionType[] | string>,
  ) {
    const blogId = req.params.blogId;

    const result = await this.postsService.createPostForBlog({ blogId, dto: req.body });

    if (result.status !== ResultStatus.Success) {
      res.status(resultCodeToHttpException(result.status)).send(result.extensions);
      return;
    }

    const postViewModel = mapToPostViewModel(result.data);
    res.status(HttpStatus.Created).send(postViewModel);
    return;
  }
}
