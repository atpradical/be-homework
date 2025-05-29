import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { postsRepository } from '../../repositories/posts.repository';

export const getPostHandler = (req: Request, res: Response) => {
  const id = req.params.id;
  const post = postsRepository.findById(id);

  if (!post) {
    res.sendStatus(HttpStatus.NotFound);
  }

  res.send(post);
};
