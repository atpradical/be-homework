import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { BlogInputDto } from '../../dto/blogInputDto';
import { blogsRepository } from '../../repositories/blogs.repository';

export async function updateBlogHandler(
  req: Request<{ id: string }, {}, BlogInputDto>,
  res: Response,
) {
  const id = req.params.id;

  try {
    const foundBlog = await blogsRepository.findById(id);

    if (!foundBlog) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }

    await blogsRepository.update(id, req.body);
    res.sendStatus(HttpStatus.NoContent);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
