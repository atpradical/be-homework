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
import { postForBlogInputValidation } from '../../posts/routes/posts.input-dto.validation-middleware';
import { createPostForBlogHandler } from '../../posts/routes/handlers/create-post-for-blog.handler';

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
    blogIdValidation,
    postForBlogInputValidation,
    inputValidationResultMiddleware,
    createPostForBlogHandler,
  );
