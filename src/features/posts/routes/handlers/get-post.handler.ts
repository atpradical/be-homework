import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { mapToPostViewModel } from '../../mappers/map-to-post-view-model';
import { postsService } from '../../application/posts.service';
import { errorsHandler } from '../../../../core/errors/errors.handler';

export async function getPostHandler(req: Request, res: Response) {
  try {
    const id = req.params.id;

    const post = await postsService.findById(id);

    const postViewModel = mapToPostViewModel(post);

    res.status(HttpStatus.Ok).send(postViewModel);
  } catch (e) {
    errorsHandler(e, res);
  }
}
