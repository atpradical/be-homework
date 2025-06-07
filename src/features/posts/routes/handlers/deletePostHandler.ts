import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { postsRepository } from '../../repositories/posts.repository';

export async function deletePostHandler(req: Request, res: Response) {
  const id = req.params.id;

  try {
    const foundPost = await postsRepository.findById(id);

    if (!foundPost) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }

    await postsRepository.delete(id);
    res.sendStatus(HttpStatus.NoContent);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
