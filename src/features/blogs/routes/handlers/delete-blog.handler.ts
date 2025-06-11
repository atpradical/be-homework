import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { blogsService } from '../../application/blogs.service';
import { errorsHandler } from '../../../../core/errors/errors.handler';

export async function deleteBlogHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const id = req.params.id;

    await blogsService.delete(id);

    res.sendStatus(HttpStatus.NoContent);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
