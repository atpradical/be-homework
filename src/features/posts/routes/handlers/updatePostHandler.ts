import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { PostInputDto } from '../../dto/postInputDto';
import { postsRepository } from '../../repositories/posts.repository';

export async function updatePostHandler(
  req: Request<{ id: string }, {}, PostInputDto>,
  res: Response,
) {
  const id = req.params.id;

  try {
    const foundPost = await postsRepository.findById(id);

    if (!foundPost) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }

    await postsRepository.update(id, req.body);
    res.sendStatus(HttpStatus.NoContent);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
