import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { PostInputDto } from '../../dto/postInputDto';
import { errorsHandler } from '../../../../core/errors/errors.handler';
import { postsService } from '../../application/posts.service';

export async function updatePostHandler(
  req: Request<{ id: string }, {}, PostInputDto>,
  res: Response,
) {
  try {
    const id = req.params.id;

    await postsService.update(id, req.body);

    res.sendStatus(HttpStatus.NoContent);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
