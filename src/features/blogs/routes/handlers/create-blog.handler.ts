import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { BlogInputDto } from '../../dto/blogInputDto';
import { mapToBlogViewModel } from '../mappers/map-to-blog-view-model';
import { blogsService } from '../../application/blogs.service';
import { errorsHandler } from '../../../../core/errors/errors.handler';

export async function createBlogHandler(
  req: Request<{}, {}, BlogInputDto>,
  res: Response,
) {
  try {
    const createdBlog = await blogsService.create(req.body);

    const blogViewModel = mapToBlogViewModel(createdBlog);

    res.status(HttpStatus.Created).send(blogViewModel);
  } catch (e) {
    errorsHandler(e, res);
  }
}
