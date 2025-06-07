import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { postsRepository } from '../../repositories/posts.repository';
import { mapToPostViewModel } from '../../mappers/map-to-post-view-model';

export async function getPostHandler(req: Request, res: Response) {
  const id = req.params.id;
  try {
    const foundPost = await postsRepository.findById(id);

    if (!foundPost) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }

    const postViewModel = mapToPostViewModel(foundPost);
    res.send(postViewModel);
  } catch (e) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
