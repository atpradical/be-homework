import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { generateBasicAuthToken } from '../../utils/generate-admin-auth-token';
import { clearDb } from '../../utils/clear-db';
import { BlogInputDto } from '../../../src/features/blogs/dto/blogInputDto';
import { BLOGS_PATH, HttpStatus } from '../../../src/core';

describe('Blogs API', () => {
  const app = express();
  setupApp(app);

  const adminToken = generateBasicAuthToken();

  const testBlogData: BlogInputDto = {
    name: 'Test Blog',
    description: 'Test Blog Description',
    websiteUrl: 'https://test-blog.com',
  };

  beforeAll(async () => {
    await clearDb(app);
  });

  it('✅ should create blog; POST /api/blogs', async () => {
    const newBlog: BlogInputDto = {
      ...testBlogData,
    };

    await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminToken)
      .send(newBlog)
      .expect(HttpStatus.Created);
  });

  it('✅ should return blogs list; GET /api/blogs', async () => {
    await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminToken)
      .send({ ...testBlogData, name: 'Test Blog 1' })
      .expect(HttpStatus.Created);

    await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminToken)
      .send({ ...testBlogData, name: 'Test Blog 2' })
      .expect(HttpStatus.Created);

    const blogsListResponse = await request(app)
      .get(BLOGS_PATH)
      .set('Authorization', adminToken)
      .expect(HttpStatus.Ok);

    expect(blogsListResponse.body).toBeInstanceOf(Array);
    expect(blogsListResponse.body.length).toBeGreaterThanOrEqual(2);
  });

  it('✅ should return blog by id; GET /api/blogs/:id', async () => {
    const createResponse = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminToken)
      .send({ ...testBlogData, name: 'Test Blog 1' })
      .expect(HttpStatus.Created);

    const getResponse = await request(app)
      .get(`${BLOGS_PATH}/${createResponse.body.id}`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.Ok);

    expect(getResponse.body).toEqual({
      ...createResponse.body,
      id: expect.any(String),
      name: 'Test Blog 1',
      description: 'Test Blog Description',
      websiteUrl: 'https://test-blog.com',
    });
  });

  it('✅ should update blog; PUT /api/blogs/:id', async () => {
    const createResponse = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminToken)
      .send({ ...testBlogData, name: 'Test Blog 1' })
      .expect(HttpStatus.Created);

    const blogUpdateData: BlogInputDto = {
      name: 'Updated Name',
      description: 'Updated Description',
      websiteUrl: 'https://updated-blog.com',
    };

    await request(app)
      .put(`${BLOGS_PATH}/${createResponse.body.id}`)
      .set('Authorization', adminToken)
      .send(blogUpdateData)
      .expect(HttpStatus.NoContent);

    const blogResponse = await request(app)
      .get(`${BLOGS_PATH}/${createResponse.body.id}`)
      .set('Authorization', adminToken);

    expect(blogResponse.body).toEqual({
      id: createResponse.body.id,
      name: 'Updated Name',
      description: 'Updated Description',
      websiteUrl: 'https://updated-blog.com',
    });
  });

  it('✅ DELETE /api/blogs/:id and check after NOT FOUND', async () => {
    const {
      body: { id: createdBlogId },
    } = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminToken)
      .send({ ...testBlogData, name: 'Test Blog 1' })
      .expect(HttpStatus.Created);

    await request(app)
      .delete(`${BLOGS_PATH}/${createdBlogId}`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.NoContent);

    const blogResponse = await request(app)
      .get(`${BLOGS_PATH}/${createdBlogId}`)
      .set('Authorization', adminToken);
    expect(blogResponse.status).toBe(HttpStatus.NotFound);
  });
});
