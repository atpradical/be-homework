import { Router } from 'express';
import { getUsersListHandler } from '../handlers/get-user-list.handler';
import { superAdminGuardMiddleware } from '../../../auth/super-admin.guard-middleware';
import { createUserHandler } from '../handlers/create-user.handler';
import { deleteUserHandler } from '../handlers/delete-user.handler';
import {
  idValidation,
  inputValidationResultMiddleware,
  paginationAndSortingValidation,
} from '../../../core';
import { userInputValidation } from './users.input-dto.validation-middleware';
import { UserSortField } from './input/user-sort-field';

export const usersRouter = Router({});

usersRouter

  .get(
    '/',
    paginationAndSortingValidation(UserSortField),
    inputValidationResultMiddleware,
    getUsersListHandler,
  )

  .post(
    '/',
    superAdminGuardMiddleware,
    userInputValidation,
    inputValidationResultMiddleware,
    createUserHandler,
  )

  .delete(
    '/:id',
    superAdminGuardMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    deleteUserHandler,
  );
