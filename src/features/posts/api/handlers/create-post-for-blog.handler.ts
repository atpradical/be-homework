import { Response } from 'express';
import { HttpStatus } from '../../../../core';
import { PostInputDto } from '../../types/post-input.dto';
import { mapToPostViewModel } from '../../mappers/map-to-post-view-model';
import { RequestWithParamsAndBody } from '../../../../core/types/requests';
import { ResultStatus } from '../../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../../core/result/resultCodeToHttpException';
import { PostViewModel } from '../../types';
import { ExtensionType } from '../../../../core/result/object-result.entity';
import { postsService } from '../../../../composition-root';

export async function createPostForBlogHandler(
  req: RequestWithParamsAndBody<{ blogId: string }, PostInputDto>,
  res: Response<PostViewModel | ExtensionType[] | string>,
) {
  const blogId = req.params.blogId;

  const result = await postsService.createPostForBlog({ blogId, dto: req.body });

  if (result.status !== ResultStatus.Success) {
    res.status(resultCodeToHttpException(result.status)).send(result.extensions);
    return;
  }

  const postViewModel = mapToPostViewModel(result.data);
  res.status(HttpStatus.Created).send(postViewModel);
  return;
}
