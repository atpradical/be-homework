import { Request, Response } from 'express';
import { HttpStatus } from '../../../core';
import { PostInputDto } from '../dto/postInputDto';
import { postsRepository } from '../repositories/posts.repository';

export const updatePostHandler = (
  req: Request<{ id: string }, {}, PostInputDto>,
  res: Response,
) => {
  const id = req.params.id;
  //TODO: валидация на body если есть ошибки отправка ошибки

  const post = postsRepository.findById(id);

  if (!post) {
    //TODO: отправлять правильный формат ошибки filed и message
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  //TODO:добавить репозиторий и делать обновление там.
  postsRepository.update(id, req.body);
  res.status(HttpStatus.Ok).send(post);
};
