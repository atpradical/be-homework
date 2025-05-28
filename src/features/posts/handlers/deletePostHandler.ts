import { Request, Response } from 'express';
import { HttpStatus } from '../../../core';
import { postsRepository } from '../repositories/posts.repository';

export const deletePostHandler = (req: Request, res: Response) => {
  const id = req.params.id;
  const post = postsRepository.findById(id);

  if (!post) {
    res.sendStatus(HttpStatus.NotFound);
  }

  postsRepository.delete(id);
  res.sendStatus(HttpStatus.NoContent);
};
