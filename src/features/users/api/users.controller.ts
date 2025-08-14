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
import { ResultStatus } from '../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../core/result/resultCodeToHttpException';
import { UsersQueryRepository } from '../repositories/users.query-repository';

// todo: мапить в QueryRepo

@injectable()
export class UsersController {
  constructor(
    @inject(UsersService) private usersService: UsersService,
    @inject(UsersQueryRepository) private usersQueryRepository: UsersQueryRepository,
  ) {}

  async getUsersListHandler(req: Request, res: Response) {
    try {
      const query = req.query as unknown as UserQueryInput;

      const queryInput = setDefaultSortAndPaginationIfNotExist(query);

      const { items, totalCount } = await this.usersQueryRepository.findAll(queryInput);

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
    const result = await this.usersService.create(req.body);

    if (result.status !== ResultStatus.Success) {
      res.status(resultCodeToHttpException(result.status)).send(result.extensions);
      return;
    }

    const userViewModel = mapToUserViewModel(result.data);
    res.status(HttpStatus.Created).send(userViewModel);
    return;
  }

  async deleteUserHandler(req: Request<{ id: string }>, res: Response) {
    const result = await this.usersService.delete(req.params.id);

    if (result.status !== ResultStatus.Success) {
      res.status(resultCodeToHttpException(result.status)).send(result.extensions);
      return;
    }

    res.sendStatus(HttpStatus.NoContent);
    return;
  }
}
