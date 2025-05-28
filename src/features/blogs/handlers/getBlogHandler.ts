import { Request, Response } from 'express';
import { db } from '../../../db/in-memory.db';
import { HttpStatus } from '../../../core';

export const getBlogHandler = (req: Request, res: Response) => {
  const id = req.params.id;
  const blog = db.blogs.find((blog) => blog.id === id);

  if (!blog) {
    res.sendStatus(HttpStatus.NotFound);
  }

  res.send(blog);
};
