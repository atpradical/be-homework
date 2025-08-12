import { Request, Response } from 'express';
import { UserQueryInput } from '../types/user-query.input';
import { setDefaultSortAndPaginationIfNotExist } from '../../../core/helpers/set-default-sort-and-pagination';
import { mapToUserListPaginatedOutput } from '../mappers/map-to-user-list-paginated-output';
import { HttpStatus } from '../../../core';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { UserInputDto } from '../types/user-input.dto';
import { mapToUserViewModel } from '../mappers/map-to-user-view-model';
import { UsersService } from '../domain/users.service';
import { inject, injectable } from 'inversify';

@injectable()
export class UsersController {
  constructor(@inject(UsersService) private usersService: UsersService) {}

  async getUsersListHandler(req: Request, res: Response) {
    try {
      const query = req.query as unknown as UserQueryInput;

      const queryInput = setDefaultSortAndPaginationIfNotExist(query);

      const { items, totalCount } = await this.usersService.findAll(queryInput);

      const userListOutput = mapToUserListPaginatedOutput(items, {
        pageNumber: queryInput.pageNumber,
        pageSize: queryInput.pageSize,
        totalCount,
      });

      res.status(HttpStatus.Ok).send(userListOutput);
    } catch (e: unknown) {
      errorsHandler(e, res);
    }
  }

  async createUserHandler(req: Request<{}, {}, UserInputDto>, res: Response) {
    try {
      const createdUser = await this.usersService.create(req.body);

      if (createdUser) {
        const userViewModel = mapToUserViewModel(createdUser);
        res.status(HttpStatus.Created).send(userViewModel);
      }
    } catch (e) {
      errorsHandler(e, res);
    }
  }

  async deleteUserHandler(req: Request<{ id: string }>, res: Response) {
    try {
      const id = req.params.id;

      await this.usersService.delete(id);

      res.sendStatus(HttpStatus.NoContent);
    } catch (e: unknown) {
      errorsHandler(e, res);
    }
  }
}
