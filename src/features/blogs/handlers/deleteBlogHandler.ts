import { Request, Response } from 'express';
import { HttpStatus } from '../../../core';
import { blogsRepository } from '../repositories/blogs.repository';

export const deleteBlogHandler = (req: Request, res: Response) => {
  const id = req.params.id;
  const blog = blogsRepository.findById(id);

  if (!blog) {
    res.sendStatus(HttpStatus.NotFound);
  }

  blogsRepository.delete(id);
  res.sendStatus(HttpStatus.NoContent);
};
