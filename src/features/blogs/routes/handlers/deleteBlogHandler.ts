import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { blogsRepository } from '../../repositories/blogs.repository';

export async function deleteBlogHandler(req: Request, res: Response) {
  const id = req.params.id;
  try {
    const foundBlog = await blogsRepository.findById(id);

    if (!foundBlog) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }

    await blogsRepository.delete(id);
    res.sendStatus(HttpStatus.NoContent);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
