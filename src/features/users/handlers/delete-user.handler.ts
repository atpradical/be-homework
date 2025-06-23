import { Request, Response } from 'express';
import { HttpStatus } from '../../../core';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { usersRepository } from '../repositories/users.repository';

export async function deleteUserHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const id = req.params.id;

    await usersRepository.delete(id);

    res.sendStatus(HttpStatus.NoContent);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
