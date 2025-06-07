import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { postsRepository } from '../../repositories/posts.repository';
import { PostInputDto } from '../../dto/postInputDto';
import { blogsRepository } from '../../../blogs/repositories/blogs.repository';
import { mapToPostViewModel } from '../../mappers/map-to-post-view-model';

export async function createPostHandler(
  req: Request<{}, {}, PostInputDto>,
  res: Response,
) {
  const body = req.body;

  try {
    const blog = await blogsRepository.findById(req.body.blogId);

    if (!blog) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }

    const newPost = {
      title: body.title,
      shortDescription: body.shortDescription,
      content: body.content,
      blogId: body.blogId,
      blogName: blog?.name,
      createdAt: new Date(),
    };

    const createdPost = await postsRepository.create(newPost);
    const postViewModel = mapToPostViewModel(createdPost);
    res.status(HttpStatus.Created).send(postViewModel);
  } catch (e) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
