import { Request, Response } from 'express';
import { HttpStatus } from '../../../core';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { UserQueryInput } from '../types/user-query.input';
import { setDefaultSortAndPaginationIfNotExist } from '../../../core/helpers/set-default-sort-and-pagination';
import { mapToUserListPaginatedOutput } from '../mappers/map-to-user-list-paginated-output';
import { usersService } from '../domain/users.service';

export async function getUsersListHandler(req: Request, res: Response) {
  try {
    const query = req.query as unknown as UserQueryInput;

    const queryInput = setDefaultSortAndPaginationIfNotExist(query);

    const { items, totalCount } = await usersService.findAll(queryInput);

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
