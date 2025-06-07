import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core';
import { BlogInputDto } from '../../dto/blogInputDto';
import { blogsRepository } from '../../repositories/blogs.repository';
import { Blog } from '../../types';
import { mapToBlogViewModel } from '../mappers/map-to-blog-view-model';

export async function createBlogHandler(
  req: Request<{}, {}, BlogInputDto>,
  res: Response,
) {
  const body = req.body;

  const newBlog: Blog = {
    name: body.name,
    description: body.description,
    websiteUrl: body.websiteUrl,
    isMembership: false,
    createdAt: new Date(), // TODO: вопрос про { $createdAt: true }
  };

  try {
    const createdBlog = await blogsRepository.create(newBlog);
    const blogViewModel = mapToBlogViewModel(createdBlog);
    res.status(HttpStatus.Created).send(blogViewModel);
  } catch (e) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
