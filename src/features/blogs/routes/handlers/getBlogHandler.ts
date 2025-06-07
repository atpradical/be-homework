import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { blogsRepository } from '../../repositories/blogs.repository';
import { mapToBlogViewModel } from '../mappers/map-to-blog-view-model';

export async function getBlogHandler(req: Request, res: Response) {
  const id = req.params.id;
  try {
    const foundBlog = await blogsRepository.findById(id);

    if (!foundBlog) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }

    const blogViewModel = mapToBlogViewModel(foundBlog);
    res.send(blogViewModel);
  } catch (e) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
