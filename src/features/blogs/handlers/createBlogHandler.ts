import { Request, Response } from 'express';
import { db } from '../../../db/in-memory.db';
import { HttpStatus } from '../../../core';
import { BlogInputDto } from '../dto/blogInputDto';

export const createBlogHandler = (
  req: Request<{}, {}, BlogInputDto>,
  res: Response,
) => {
  //TODO: валидация на body если есть ошибки отправка ошибки
  const body = req.body;

  //TODO:добавить репозиторий и делать обновление там.
  const newBlog = {
    id: db.blogs.length
      ? String(parseInt(db.blogs[db.blogs.length - 1].id) + 1)
      : '1',
    name: body.name,
    description: body.description,
    websiteUrl: body.websiteUrl,
  };

  db.blogs.push(newBlog);

  res.status(HttpStatus.Created).send(newBlog);
};
