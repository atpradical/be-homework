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
import { postForBlogInputValidation } from '../../posts/api/middleware/posts.input-dto.validation';
import { BlogsController } from './blogs.controller';
import { container } from '../../../composition-root';

export const blogsRouter = Router({});

const blogsController = container.get(BlogsController);

blogsRouter
  .get(
    '/',
    paginationAndSortingValidation(BlogSortField),
    inputValidationResultMiddleware,
    blogsController.getBlogListHandler.bind(blogsController),
  )

  .post(
    '/',
    superAdminGuard,
    blogsInputDtoValidation,
    inputValidationResultMiddleware,
    blogsController.createBlogHandler.bind(blogsController),
  )

  .get(
    '/:id',
    routeIdValidation,
    inputValidationResultMiddleware,
    blogsController.getBlogHandler.bind(blogsController),
  )

  .put(
    '/:id',
    superAdminGuard,
    routeIdValidation,
    blogsInputDtoValidation,
    inputValidationResultMiddleware,
    blogsController.updateBlogHandler.bind(blogsController),
  )

  .delete(
    '/:id',
    superAdminGuard,
    routeIdValidation,
    inputValidationResultMiddleware,
    blogsController.deleteBlogHandler.bind(blogsController),
  )

  .get(
    '/:blogId/posts',
    blogIdValidation,
    inputValidationResultMiddleware,
    blogsController.getPostListByBlogIdHandler.bind(blogsController),
  )

  .post(
    '/:blogId/posts',
    superAdminGuard,
    blogIdValidation,
    postForBlogInputValidation,
    inputValidationResultMiddleware,
    blogsController.createPostForBlogHandler.bind(blogsController),
  );
