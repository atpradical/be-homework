import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { PostInputDto } from '../../dto/postInputDto';
import { mapToPostViewModel } from '../../mappers/map-to-post-view-model';
import { errorsHandler } from '../../../../core/errors/errors.handler';
import { postsService } from '../../application/posts.service';

export async function createPostForBlogHandler(
  req: Request<{ blogId: string }, {}, PostInputDto>,
  res: Response,
) {
  try {
    const blogId = req.params.blogId;

    const createdPost = await postsService.createPostForBlog(blogId, req.body);

    const postViewModel = mapToPostViewModel(createdPost);

    res.status(HttpStatus.Created).send(postViewModel);
  } catch (e) {
    errorsHandler(e, res);
  }
}
