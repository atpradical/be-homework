import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { generateBasicAuthToken } from '../../utils/generate-admin-auth-token';
import { clearDb } from '../../utils/clear-db';
import { BlogInputDto } from '../../../src/features/blogs/dto/blogInputDto';
import { BLOGS_PATH, HttpStatus, POSTS_PATH } from '../../../src/core';
import { PostInputDto } from '../../../src/features/posts/dto/postInputDto';

describe('Post API', () => {
  const app = express();
  setupApp(app);

  const adminToken = generateBasicAuthToken();

  const testBlogData: BlogInputDto = {
    name: 'Test Blog',
    description: 'Test Blog Description',
    websiteUrl: 'https://test-blog.com',
  };
  const testPostData: PostInputDto = {
    title: 'updated post',
    shortDescription: 'updated post shortDescription',
    content: 'updated content',
    blogId: '1',
  };

  beforeAll(async () => {
    await clearDb(app);
  });

  it('✅ should create post; POST /api/posts', async () => {
    const newBlog: BlogInputDto = {
      ...testBlogData,
    };

    const blogsListResponse = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminToken)
      .send(newBlog)
      .expect(HttpStatus.Created);

    const newPost: PostInputDto = {
      ...testPostData,
      blogId: blogsListResponse.body.id,
    };

    await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminToken)
      .send(newPost)
      .expect(HttpStatus.Created);
  });

  it('✅ should return post list; GET /api/posts', async () => {
    await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminToken)
      .send({ ...testPostData, title: 'Test Post 1' })
      .expect(HttpStatus.Created);

    await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminToken)
      .send({ ...testPostData, title: 'Test Post 2' })
      .expect(HttpStatus.Created);

    const postsListResponse = await request(app)
      .get(POSTS_PATH)
      .set('Authorization', adminToken)
      .expect(HttpStatus.Ok);

    expect(postsListResponse.body).toBeInstanceOf(Array);
    expect(postsListResponse.body.length).toBeGreaterThanOrEqual(2);
  });

  it('✅ should return post by id; GET /api/posts/:id', async () => {
    const createResponse = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminToken)
      .send({ ...testPostData, name: 'Test Blog 1' })
      .expect(HttpStatus.Created);

    const getResponse = await request(app)
      .get(`${POSTS_PATH}/${createResponse.body.id}`)
      // .set('Authorization', adminToken)
      .expect(HttpStatus.Ok);

    expect(getResponse.body).toEqual({
      ...createResponse.body,
      id: expect.any(String),
      title: 'updated post',
      shortDescription: 'updated post shortDescription',
      content: 'updated content',
      blogId: '1',
    });
  });

  it('✅ should update post; PUT /api/posts/:id', async () => {
    const createResponse = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminToken)
      .send({ ...testPostData })
      .expect(HttpStatus.Created);

    const getResponse = await request(app)
      .get(`${POSTS_PATH}/${createResponse.body.id}`)
      .expect(HttpStatus.Ok);

    const postUpdateData: PostInputDto = {
      ...getResponse.body,
      title: 'updated post',
      shortDescription: 'updated post shortDescription',
      content: 'updated content',
      blogId: '1',
    };

    await request(app)
      .put(`${POSTS_PATH}/${createResponse.body.id}`)
      .set('Authorization', adminToken)
      .send(postUpdateData)
      .expect(HttpStatus.NoContent);

    const postResponse = await request(app)
      .get(`${POSTS_PATH}/${createResponse.body.id}`)
      .set('Authorization', adminToken);

    expect(postResponse.body).toEqual({
      id: createResponse.body.id,
      title: 'updated post',
      shortDescription: 'updated post shortDescription',
      content: 'updated content',
      blogId: '1',
      blogName: getResponse.body.blogName,
    });
  });

  it('✅ DELETE /api/posts/:id and check after NOT FOUND', async () => {
    const {
      body: { id: createdBlogId },
    } = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminToken)
      .send({ ...testPostData, name: 'Test Blog 1' })
      .expect(HttpStatus.Created);

    await request(app)
      .delete(`${POSTS_PATH}/${createdBlogId}`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.NoContent);

    const blogResponse = await request(app)
      .get(`${POSTS_PATH}/${createdBlogId}`)
      .set('Authorization', adminToken);
    expect(blogResponse.status).toBe(HttpStatus.NotFound);
  });
});
