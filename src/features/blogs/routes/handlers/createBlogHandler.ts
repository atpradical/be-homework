import { Request, Response } from 'express';
import { db } from '../../../../db/in-memory.db';
import { HttpStatus } from '../../../../core';
import { BlogInputDto } from '../../dto/blogInputDto';
import { blogsRepository } from '../../repositories/blogs.repository';

export const createBlogHandler = (
  req: Request<{}, {}, BlogInputDto>,
  res: Response,
) => {
  const body = req.body;

  const newBlog = {
    id: db.blogs.length
      ? String(parseInt(db.blogs[db.blogs.length - 1].id) + 1)
      : '1',
    name: body.name,
    description: body.description,
    websiteUrl: body.websiteUrl,
  };

  blogsRepository.create(newBlog);
  res.status(HttpStatus.Created).send(newBlog);
};
