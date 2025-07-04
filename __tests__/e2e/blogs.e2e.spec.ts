import request from 'supertest';
import express from 'express';
import { ObjectId } from 'mongodb';
import { setupApp } from '../../src/setup-app';
import { runDB, stopDb } from '../../src/db/mongo.db';
import { appConfig } from '../../src/core/config';
import { BLOGS_PATH } from '../../src/core';
import { testingDtosCreator } from './utils/testingDtosCreator';
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} from '../../src/features/auth/api/guards/super-admin.guard';
import { createBlog, createBlogs } from './utils/createBlogs';
import { BlogInputDto } from '../../src/features/blogs/types/blog-input.dto';

describe('Blogs API test', () => {
  const app = express();
  setupApp(app);

  beforeAll(async () => {
    await runDB(appConfig.MONGO_URL);

    // Clear the database before tests
    await request(app).delete('/testing/all-data').expect(204);
  });

  beforeEach(async () => {
    // Clear the database before tests
    await request(app).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    // Close the MongoDB connection after all tests
    await stopDb();
  });

  let blogDto: any;

  it('shouldn`t create blog without authorization, POST : STATUS 401', async () => {
    await request(app)
      .post(BLOGS_PATH)
      .send({
        name: '',
      })
      .expect(401);
  });

  it('should create blog with correct data and return it, POST : STATUS 201', async () => {
    blogDto = testingDtosCreator.createBlogDto({});

    const newBlog = await request(app)
      .post(BLOGS_PATH)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send({
        name: blogDto.name,
        description: blogDto.description,
        websiteUrl: blogDto.websiteUrl,
      })
      .expect(201);

    expect(newBlog.body).toEqual({
      id: expect.any(String),
      name: blogDto.name,
      description: blogDto.description,
      websiteUrl: blogDto.websiteUrl,
      isMembership: expect.any(Boolean),
      createdAt: expect.any(String),
    });
  });

  it('shouldn`t create blog with incorrect name: STATUS 400', async () => {
    blogDto = testingDtosCreator.createBlogDto({ name: '1234567890123456' });
    await request(app)
      .post(BLOGS_PATH)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send({
        name: blogDto.name,
        description: blogDto.description,
        websiteUrl: blogDto.websiteUrl,
      })
      .expect(400);
  });

  it('shouldn`t create blog with incorrect websiteUrl: STATUS 400', async () => {
    blogDto = testingDtosCreator.createBlogDto({ websiteUrl: 'websiteUrl' });
    await request(app)
      .post(BLOGS_PATH)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send({
        name: blogDto.name,
        description: blogDto.description,
        websiteUrl: blogDto.websiteUrl,
      })
      .expect(400);
  });

  it('shouldn`t create blog with incorrect description: STATUS 400', async () => {
    blogDto = testingDtosCreator.createBlogDto({ description: '' });

    await request(app)
      .post(BLOGS_PATH)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send({
        name: blogDto.name,
        description: blogDto.description,
        websiteUrl: blogDto.websiteUrl,
      })
      .expect(400);
  });

  it('shouldn`t delete blog by id without authorization: STATUS 401', async () => {
    const blog = await createBlog(app);

    await request(app)
      .delete(BLOGS_PATH + `/${blog.id}`)
      .expect(401);
  });

  it('should delete blog by id: STATUS 204', async () => {
    const blog = await createBlog(app);

    await request(app)
      .delete(BLOGS_PATH + `/${blog.id}`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .expect(204);
  });

  it('shouldn`t delete blog by id if specified blog is not exists: STATUS 404', async () => {
    const nonExistentId = new ObjectId();
    await request(app)
      .delete(BLOGS_PATH + `/${nonExistentId}`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .expect(404);
  });

  it('should return blogs list: STATUS 200', async () => {
    await createBlogs(app, 10);

    const response = await request(app).get(BLOGS_PATH).expect(200);

    expect(response.body.items).toHaveLength(10);
  });

  it('should return sorted blogs list: STATUS 200', async () => {
    const blogs = await createBlogs(app, 5);

    // Get blogs sorted by name in ascending order
    const ascSortedResponse = await request(app)
      .get(`${BLOGS_PATH}?sortBy=name&sortDirection=asc`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .expect(200);

    // Verify sorting by name in ascending order
    const ascBlogNames = ascSortedResponse.body.items.map((blog: any) => blog.name);
    expect(ascBlogNames).toEqual(
      blogs.sort((a, b) => a.name.localeCompare(b.name)).map((el) => el.name),
    );

    // Get blogs sorted by name in descending order
    const descSortedResponse = await request(app)
      .get(`${BLOGS_PATH}?sortBy=name&sortDirection=desc`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .expect(200);

    // Verify sorting by name in ascending order
    const descBlogNames = descSortedResponse.body.items.map((blog: any) => blog.name);
    expect(descBlogNames).toEqual(
      blogs.sort((a, b) => b.name.localeCompare(a.name)).map((el) => el.name),
    );
  });

  it('should return blog by id: STATUS 200', async () => {
    const blog = await createBlog(app);

    // Get the created blog by ID
    const getResponse = await request(app)
      .get(`${BLOGS_PATH}/${blog.id}`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .expect(200);

    // Verify the response
    expect(getResponse.body).toMatchObject({
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      isMembership: expect.any(Boolean),
      createdAt: expect.any(String),
    });
  });

  it('shouldn`t return non-existent blog: STATUS 404', async () => {
    const nonExistentId = new ObjectId().toHexString();
    await request(app)
      .get(`${BLOGS_PATH}/${nonExistentId}`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .expect(404);
  });

  it('should update blog with correct name: STATUS 200', async () => {
    const blog = await createBlog(app);

    // Update the blog
    await request(app)
      .put(`${BLOGS_PATH}/${blog.id}`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send({ name: 'updated name', description: blog.description, websiteUrl: blog.websiteUrl })
      .expect(204);

    // Get the updated blog
    const response = await request(app)
      .get(`${BLOGS_PATH}/${blog.id}`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .expect(200);

    expect(response.body.name).toEqual('updated name');
  });

  it('✅ shouldn`t update non-existent blog: STATUS 404', async () => {
    const nonExistentId = new ObjectId().toHexString();

    const blogUpdateData: BlogInputDto = {
      name: 'Updated Name',
      description: 'Updated Description',
      websiteUrl: 'https://updated-blog.com',
    };

    await request(app)
      .put(`${BLOGS_PATH}/${nonExistentId}`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send(blogUpdateData)
      .expect(404);
  });

  it('DELETE blog and check after NOT FOUND', async () => {
    const blog = await createBlog(app);

    // Verify the blog exists before deletion
    await request(app)
      .get(`${BLOGS_PATH}/${blog.id}`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .expect(200);

    // Delete the blog
    await request(app)
      .delete(`${BLOGS_PATH}/${blog.id}`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .expect(204);

    // Verify the blog no longer exists
    await request(app)
      .get(`${BLOGS_PATH}/${blog.id}`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .expect(404);
  });

  it('should return 404 when deleting non-existent blog: STATUS 404', async () => {
    const nonExistentId = new ObjectId().toHexString();
    await request(app)
      .delete(`${BLOGS_PATH}/${nonExistentId}`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .expect(404);
  });
});
