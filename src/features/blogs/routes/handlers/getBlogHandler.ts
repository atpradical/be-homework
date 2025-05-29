import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { blogsRepository } from '../../repositories/blogs.repository';

export const getBlogHandler = (req: Request, res: Response) => {
  const id = req.params.id;
  const blog = blogsRepository.findById(id);

  if (!blog) {
    res.sendStatus(HttpStatus.NotFound);
  }

  res.send(blog);
};
