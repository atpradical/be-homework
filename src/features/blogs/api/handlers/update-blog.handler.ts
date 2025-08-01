import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { BlogInputDto } from '../../types/blog-input.dto';
import { blogsService } from '../../domain/blogs.service';
import { errorsHandler } from '../../../../core/errors/errors.handler';

export async function updateBlogHandler(
  req: Request<{ id: string }, {}, BlogInputDto>,
  res: Response,
) {
  try {
    const id = req.params.id;

    await blogsService.update(id, req.body);

    res.sendStatus(HttpStatus.NoContent);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
