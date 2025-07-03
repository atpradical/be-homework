import { Router } from 'express';
import {
  blogIdValidation,
  inputValidationResultMiddleware,
  paginationAndSortingValidation,
  routeIdValidation,
} from '../../../core';
import { blogsInputDtoValidation } from './middleware/blogs.input-dto.validation-middleware';
import { superAdminGuard } from '../../auth/api/guards/super-admin.guard';
import { BlogSortField } from '../types/blog-sort-field';
import { getPostListByBlogIdHandler } from './handlers/get-post-list-by-blog-id.handler';
import { postForBlogInputValidation } from '../../posts/api/middleware/posts.input-dto.validation';
import { createPostForBlogHandler } from '../../posts/api/handlers/create-post-for-blog.handler';
import {
  createBlogHandler,
  deleteBlogHandler,
  getBlogHandler,
  getBlogListHandler,
  updateBlogHandler,
} from './handlers';

export const blogsRouter = Router({});

blogsRouter
  .get(
    '/',
    paginationAndSortingValidation(BlogSortField),
    inputValidationResultMiddleware,
    getBlogListHandler,
  )

  .post(
    '/',
    superAdminGuard,
    blogsInputDtoValidation,
    inputValidationResultMiddleware,
    createBlogHandler,
  )

  .get('/:id', routeIdValidation, inputValidationResultMiddleware, getBlogHandler)

  .put(
    '/:id',
    superAdminGuard,
    routeIdValidation,
    blogsInputDtoValidation,
    inputValidationResultMiddleware,
    updateBlogHandler,
  )

  .delete(
    '/:id',
    superAdminGuard,
    routeIdValidation,
    inputValidationResultMiddleware,
    deleteBlogHandler,
  )

  .get(
    '/:blogId/posts',
    blogIdValidation,
    inputValidationResultMiddleware,
    getPostListByBlogIdHandler,
  )

  .post(
    '/:blogId/posts',
    superAdminGuard,
    blogIdValidation,
    postForBlogInputValidation,
    inputValidationResultMiddleware,
    createPostForBlogHandler,
  );
