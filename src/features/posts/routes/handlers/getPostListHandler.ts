import { Request, Response } from 'express';
import { postsRepository } from '../../repositories/posts.repository';
import { HttpStatus } from '../../../../core';
import { mapToPostViewModel } from '../../mappers/map-to-post-view-model';

export async function getPostListHandler(req: Request, res: Response) {
  try {
    const foundResult = await postsRepository.findAll();
    const postViewModelList = foundResult.map(mapToPostViewModel);
    res.send(postViewModelList);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
