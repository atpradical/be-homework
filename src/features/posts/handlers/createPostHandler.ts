import { Request, Response } from 'express';
import { db } from '../../../db/in-memory.db';
import { HttpStatus } from '../../../core';
import { postsRepository } from '../repositories/posts.repository';
import { PostInputDto } from '../dto/postInputDto';
import { blogsRepository } from '../../blogs/repositories/blogs.repository';

export const createPostHandler = (
  req: Request<{}, {}, PostInputDto>,
  res: Response,
) => {
  //TODO: валидация на body если есть ошибки отправка ошибки
  const body = req.body;
  const blog = blogsRepository.findById(req.body.blogId);

  if (!blog) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  //TODO:добавить репозиторий и делать обновление там.
  const newPost = {
    id: db.posts.length
      ? String(parseInt(db.blogs[db.blogs.length - 1].id) + 1)
      : '1',
    title: body.title,
    shortDescription: body.shortDescription,
    content: body.content,
    blogId: body.blogId,
    blogName: blog?.name,
  };

  postsRepository.create(newPost);
  res.status(HttpStatus.Created).send(newPost);
};
