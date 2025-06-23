import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { HttpStatus } from '../../../core';
import { UserInputDto } from '../dto/userInputDto';
import { usersService } from '../application';
import { mapToUserViewModel } from '../routes/mappers/map-to-user-view-model';

export async function createUserHandler(
  req: Request<{}, {}, UserInputDto>,
  res: Response,
) {
  try {
    const createdUser = await usersService.create(req.body);

    if (createdUser) {
      const userViewModel = mapToUserViewModel(createdUser);
      res.status(HttpStatus.Created).send(userViewModel);
    }
  } catch (e) {
    errorsHandler(e, res);
  }
}
