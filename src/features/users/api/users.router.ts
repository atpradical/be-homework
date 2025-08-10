import { Router } from 'express';
import { superAdminGuard } from '../../auth/api/guards/super-admin.guard';
import {
  inputValidationResultMiddleware,
  paginationAndSortingValidation,
  routeIdValidation,
} from '../../../core';
import { userInputValidation } from './middleware/users.input-dto.validation';
import { UserSortField } from '../types/user-sort-field';
import { UsersController } from './users.controller';
import { container } from '../../../composition-root';

export const usersRouter = Router({});

const usersController = container.get(UsersController);

usersRouter

  .get(
    '/',
    paginationAndSortingValidation(UserSortField),
    inputValidationResultMiddleware,
    usersController.getUsersListHandler.bind(usersController),
  )

  .post(
    '/',
    superAdminGuard,
    userInputValidation,
    inputValidationResultMiddleware,
    usersController.createUserHandler.bind(usersController),
  )

  .delete(
    '/:id',
    superAdminGuard,
    routeIdValidation,
    inputValidationResultMiddleware,
    usersController.deleteUserHandler.bind(usersController),
  );
