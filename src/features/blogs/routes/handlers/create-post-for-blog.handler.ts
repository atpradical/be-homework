import { Request, Response } from 'express';
import { postsService } from '../../../posts/application/posts.service';
import { HttpStatus } from '../../../../core';
import { errorsHandler } from '../../../../core/errors/errors.handler';
import { PostInputDto } from '../../../posts/dto/postInputDto';
import { mapToPostViewModel } from '../../../posts/mappers/map-to-post-view-model';
import { blogsService } from '../../application/blogs.service';

export async function createPostForBlogHandler(
  req: Request<{ blogId: string }, {}, PostInputDto>,
  res: Response,
) {
  try {
    await blogsService.findById(req.params.blogId);

    const createdPost = await postsService.create(req.body);

    const postViewModel = mapToPostViewModel(createdPost);

    res.status(HttpStatus.Created).send(postViewModel);
  } catch (e) {
    errorsHandler(e, res);
  }
}
