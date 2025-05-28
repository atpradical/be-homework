import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { BlogInputDto } from '../../dto/blogInputDto';
import { blogsRepository } from '../../repositories/blogs.repository';

export const updateBlogHandler = (
  req: Request<{ id: string }, {}, BlogInputDto>,
  res: Response,
) => {
  const id = req.params.id;
  //TODO: валидация на body если есть ошибки отправка ошибки

  const blog = blogsRepository.findById(id);

  if (!blog) {
    //TODO: отправлять правильный формат ошибки filed и message
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  //TODO:добавить репозиторий и делать обновление там.
  blogsRepository.update(id, req.body);
  res.status(HttpStatus.Ok).send(blog);
};
