import request from 'supertest';
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} from '../../../src/features/auth/api/guards/super-admin.guard';
import { testingDtosCreator } from './testingDtosCreator';
import { POSTS_PATH } from '../../../src/core';
import { PostInputDto } from '../../../src/features/posts/types/post-input.dto';

export const createPost = async (app: any, blogId: string, postDto?: PostInputDto) => {
  const dto = postDto ?? testingDtosCreator.createPostDto({ blogId });

  const resp = await request(app)
    .post(POSTS_PATH)
    .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
    .send({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
    })
    .expect(201);
  return resp.body;
};

export const createPosts = async (app: any, blogId: string, count: number) => {
  const posts = [];

  for (let i = 0; i <= count; i++) {
    const resp = await request(app)
      .post(POSTS_PATH)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send({
        title: 'test ' + i,
        shortDescription: 'shortDescription ' + i,
        content: 'content ' + i,
        blogId: blogId,
      })
      .expect(201);

    posts.push(resp.body);
  }
  return posts;
};
