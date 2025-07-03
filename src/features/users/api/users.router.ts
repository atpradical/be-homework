import { Router } from 'express';
import { getUsersListHandler } from '../handlers/get-user-list.handler';
import { superAdminGuard } from '../../auth/api/guards/super-admin.guard';
import { createUserHandler } from '../handlers/create-user.handler';
import { deleteUserHandler } from '../handlers/delete-user.handler';
import {
  routeIdValidation,
  inputValidationResultMiddleware,
  paginationAndSortingValidation,
} from '../../../core';
import { userInputValidation } from './middleware/users.input-dto.validation';
import { UserSortField } from '../types/user-sort-field';

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
    superAdminGuard,
    userInputValidation,
    inputValidationResultMiddleware,
    createUserHandler,
  )

  .delete(
    '/:id',
    superAdminGuard,
    routeIdValidation,
    inputValidationResultMiddleware,
    deleteUserHandler,
  );
