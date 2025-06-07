import { Request, Response } from 'express';
import { blogsRepository } from '../../repositories/blogs.repository';
import { HttpStatus } from '../../../../core';
import { mapToBlogViewModel } from '../mappers/map-to-blog-view-model';

export async function getBlogListHandler(req: Request, res: Response) {
  try {
    const foundResult = await blogsRepository.findAll();
    const blogViewModelList = foundResult.map(mapToBlogViewModel);
    res.send(blogViewModelList);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
