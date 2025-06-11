import { Router } from 'express';
import {
  createBlogHandler,
  deleteBlogHandler,
  getBlogHandler,
  getBlogListHandler,
  updateBlogHandler,
} from './handlers';
import {
  blogIdValidation,
  idValidation,
  inputValidationResultMiddleware,
  paginationAndSortingValidation,
} from '../../../core';
import { blogsInputValidation } from './blogs.input-dto.validation-middleware';
import { superAdminGuardMiddleware } from '../../../auth/super-admin.guard-middleware';
import { BlogSortField } from './input/blog-sort-field';
import { getPostListByBlogIdHandler } from './handlers/get-post-list-by-blog-id.handler';
import { postsInputValidation } from '../../posts/routes/posts.input-dto.validation-middleware';
import { createPostHandler } from '../../posts/routes/handlers';

export const blogsRouter = Router({});

blogsRouter
  //todo: добавить пагинацию и параметры сортировки
  .get(
    '/',
    paginationAndSortingValidation(BlogSortField),
    inputValidationResultMiddleware,
    getBlogListHandler,
  )

  .post(
    '/',
    superAdminGuardMiddleware,
    blogsInputValidation,
    inputValidationResultMiddleware,
    createBlogHandler,
  )

  .get('/:id', idValidation, inputValidationResultMiddleware, getBlogHandler)

  .put(
    '/:id',
    superAdminGuardMiddleware,
    idValidation,
    blogsInputValidation,
    inputValidationResultMiddleware,
    updateBlogHandler,
  )

  .delete(
    '/:id',
    superAdminGuardMiddleware,
    idValidation,
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
    superAdminGuardMiddleware,
    postsInputValidation,
    blogIdValidation,
    inputValidationResultMiddleware,
    createPostHandler,
  );
