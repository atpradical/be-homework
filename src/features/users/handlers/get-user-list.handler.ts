import { Request, Response } from 'express';
import { HttpStatus } from '../../../core';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { UserQueryInput } from '../routes/input/user-query.input';
import { setDefaultSortAndPaginationIfNotExist } from '../../../core/helpers/set-default-sort-and-pagination';
import { usersService } from '../application';
import { mapToUserListPaginatedOutput } from '../routes/mappers/map-to-user-list-paginated-output';

export async function getUsersListHandler(
  req: Request<{}, {}, {}, UserQueryInput>,
  res: Response,
) {
  try {
    const queryInput = setDefaultSortAndPaginationIfNotExist(req.query);

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
