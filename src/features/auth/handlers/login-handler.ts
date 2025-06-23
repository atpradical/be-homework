import { errorsHandler } from '../../../core/errors/errors.handler';
import { Request, Response } from 'express';
import { AuthInputDto } from '../dto/auth.input.dto';
import { authService } from '../application/auth.service';
import { HttpStatus } from '../../../core';

export async function loginHandler(
  req: Request<{}, {}, AuthInputDto>,
  res: Response,
) {
  try {
    const authResult = await authService.login(req.body);

    if (authResult) {
      res.sendStatus(HttpStatus.NoContent);
    }

    res.sendStatus(HttpStatus.Unauthorized);
  } catch (e) {
    errorsHandler(e, res);
  }
}
