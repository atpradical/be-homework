import { Response } from 'express';
import { HttpStatus } from '../../../../core';
import { BlogInputDto } from '../../types/blog-input.dto';
import { mapToBlogViewModel } from '../../mappers/map-to-blog-view-model';
import { blogsService } from '../../domain/blogs.service';
import { errorsHandler } from '../../../../core/errors/errors.handler';
import { RequestWithBody } from '../../../../core/types/requests';

export async function createBlogHandler(req: RequestWithBody<BlogInputDto>, res: Response) {
  try {
    const createdBlog = await blogsService.create(req.body);

    const blogViewModel = mapToBlogViewModel(createdBlog);

    res.status(HttpStatus.Created).send(blogViewModel);
  } catch (e) {
    errorsHandler(e, res);
  }
}
