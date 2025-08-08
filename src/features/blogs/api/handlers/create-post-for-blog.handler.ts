import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { PostInputDto } from '../../../posts/types/post-input.dto';
import { mapToPostViewModel } from '../../../posts/mappers/map-to-post-view-model';
import { ResultStatus } from '../../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';
import { blogsService, postsService } from '../../../../composition-root';

export async function createPostForBlogHandler(
  req: Request<{ blogId: string }, {}, PostInputDto>,
  res: Response,
) {
  const blog = await blogsService.findById(req.params.blogId);

  if (!blog) {
    res.status(HttpStatus.NotFound).send('Blog not found');
    return;
  }

  const result = await postsService.create(req.body);

  if (result.status !== ResultStatus.Success) {
    res.status(resultCodeToHttpException(result.status)).send(result.extensions);
    return;
  }

  const postViewModel = mapToPostViewModel(result.data);
  res.status(HttpStatus.Created).send(postViewModel);
  return;
}
