import { Request, Response } from 'express';
import { db } from '../../../db/in-memory.db';
import { HttpStatus } from '../../../core';
import { BlogInputDto } from '../dto/blogInputDto';

export const updateBlogHandler = (
  req: Request<{ id: string }, {}, BlogInputDto>,
  res: Response,
) => {
  const id = req.params.id;
  //TODO: валидация на body если есть ошибки отправка ошибки
  const body = req.body;

  const blog = db.blogs.find((blog) => blog.id === id);

  if (!blog) {
    //TODO: отправлять правильный формат ошибки filed и message
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  //TODO:добавить репозиторий и делать обновление там.
  blog.name = body.name;
  blog.description = body.description;
  blog.websiteUrl = body.websiteUrl;

  res.status(HttpStatus.Ok).send(blog);
};
