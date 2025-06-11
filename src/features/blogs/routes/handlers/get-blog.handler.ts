import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { mapToBlogViewModel } from '../mappers/map-to-blog-view-model';
import { errorsHandler } from '../../../../core/errors/errors.handler';
import { blogsService } from '../../application/blogs.service';

export async function getBlogHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const id = req.params.id;

    const blog = await blogsService.findById(id);

    const blogViewModel = mapToBlogViewModel(blog);

    res.status(HttpStatus.Ok).send(blogViewModel);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
