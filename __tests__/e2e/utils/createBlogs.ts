import request from 'supertest';
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} from '../../../src/features/auth/api/guards/super-admin.guard';
import { testingDtosCreator } from './testingDtosCreator';
import { BlogInputDto } from '../../../src/features/blogs/types/blog-input.dto';
import { BLOGS_PATH } from '../../../src/core';

export const createBlog = async (app: any, blogDto?: BlogInputDto) => {
  const dto = blogDto ?? testingDtosCreator.createBlogDto({});

  const resp = await request(app)
    .post(BLOGS_PATH)
    .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
    .send({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    })
    .expect(201);

  return resp.body;
};

export const createBlogs = async (app: any, count: number) => {
  const blogs = [];

  for (let i = 0; i <= count; i++) {
    const resp = await request(app)
      .post(BLOGS_PATH)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send({
        name: `test name ${i}`,
        description: `test description ${i}`,
        websiteUrl: `https://test${i}.com`,
      })
      .expect(201);

    blogs.push(resp.body);
  }
  return blogs;
};
