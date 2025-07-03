import { RequestWithUserId } from '../../../../core/types/requests';
import { Response } from 'express';
import { HttpStatus, IdType } from '../../../../core';
import { usersQueryRepository } from '../../../users/repositories/users.query-repository';
import { mapToMeViewModel } from '../../../users/mappers/map-to-user-view-model';

export async function meHandler(req: RequestWithUserId<IdType>, res: Response) {
  const userId = req.user?.id;

  if (userId) {
    const me = await usersQueryRepository.findUserById(userId);

    if (me) {
      const meOutput = mapToMeViewModel(me);
      res.status(HttpStatus.Ok).send(meOutput);
      return;
    }
  }

  res.sendStatus(HttpStatus.Unauthorized);
  return;
}
