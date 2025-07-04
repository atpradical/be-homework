import request from 'supertest';
import express from 'express';
import { runDB, stopDb } from '../../src/db/mongo.db';
import { appConfig } from '../../src/core/config';
import { POSTS_PATH } from '../../src/core';
import { testingDtosCreator } from './utils/testingDtosCreator';
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} from '../../src/features/auth/api/guards/super-admin.guard';
import { createBlog } from './utils/createBlogs';
import { setupApp } from '../../src/setup-app';
import { createPost, createPosts } from './utils/createPosts';
import { ObjectId } from 'mongodb';
import { PostInputDto } from '../../src/features/posts/types/post-input.dto';

describe('Post API test', () => {
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

  let postDto: any;

  it('shouldn`t create post without authorization, POST : STATUS 401', async () => {
    await request(app)
      .post(POSTS_PATH)
      .send({
        title: '',
      })
      .expect(401);
  });

  it('should create post with correct data by sa and return it: STATUS 201', async () => {
    const blog = await createBlog(app);
    postDto = testingDtosCreator.createPostDto({ blogId: blog.id });

    const newPost = await request(app)
      .post(POSTS_PATH)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send({
        title: postDto.title,
        shortDescription: postDto.shortDescription,
        content: postDto.content,
        blogId: postDto.blogId,
      })
      .expect(201);

    expect(newPost.body).toEqual({
      id: expect.any(String),
      blogId: postDto.blogId,
      blogName: blog.name,
      title: postDto.title,
      shortDescription: postDto.shortDescription,
      content: postDto.content,
      createdAt: expect.any(String),
    });
  });

  it('shouldn`t create post with incorrect title: STATUS 400', async () => {
    const blog = await createBlog(app);
    postDto = testingDtosCreator.createPostDto({ blogId: blog.id, title: '' });

    await request(app)
      .post(POSTS_PATH)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send({
        title: postDto.title,
        shortDescription: postDto.shortDescription,
        content: postDto.content,
        blogId: postDto.blogId,
      })
      .expect(400);
  });

  it('shouldn`t create post with incorrect shortDescription: STATUS 400', async () => {
    const blog = await createBlog(app);
    postDto = testingDtosCreator.createPostDto({ blogId: blog.id, shortDescription: '' });

    await request(app)
      .post(POSTS_PATH)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send({
        title: postDto.title,
        shortDescription: postDto.shortDescription,
        content: postDto.content,
        blogId: postDto.blogId,
      })
      .expect(400);
  });

  it('shouldn`t create post without blogId: STATUS 400', async () => {
    postDto = testingDtosCreator.createPostDto({ blogId: 'some_invalid_id', shortDescription: '' });

    await request(app)
      .post(POSTS_PATH)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send({
        title: postDto.title,
        shortDescription: postDto.shortDescription,
        content: postDto.content,
        blogId: postDto.blogId,
      })
      .expect(400);
  });

  it('shouldn`t delete post by id without authorization: STATUS 401', async () => {
    const blog = await createBlog(app);
    const post = await createPost(app, blog.id);

    await request(app)
      .delete(POSTS_PATH + `/${post.id}`)
      .expect(401);
  });

  it('should delete post by id: STATUS 204', async () => {
    const blog = await createBlog(app);
    const post = await createPost(app, blog.id);

    await request(app)
      .delete(POSTS_PATH + `/${post.id}`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .expect(204);
  });

  it('shouldn`t delete post by id if specified post is not exists: STATUS 404', async () => {
    const nonExistentId = new ObjectId();
    await request(app)
      .delete(POSTS_PATH + `/${nonExistentId}`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .expect(404);
  });

  it('should return post list: STATUS 200', async () => {
    const blog = await createBlog(app);
    await createPosts(app, blog.id, 9);

    const response = await request(app).get(POSTS_PATH).expect(200);
    expect(response.body.items).toHaveLength(10);
  });

  it('should return paginated posts with default values: STATUS 200', async () => {
    const blog = await createBlog(app);
    await createPosts(app, blog.id, 14);

    // Get first page with default pagination (pageSize=10, pageNumber=1)
    const firstPageResponse = await request(app).get(POSTS_PATH).expect(200);

    // Verify pagination metadata
    expect(firstPageResponse.body).toMatchObject({
      pagesCount: 2,
      page: 1,
      pageSize: 10,
      totalCount: 15,
      items: expect.any(Array),
    });

    // Verify we got 10 items on the first page
    expect(firstPageResponse.body.items).toHaveLength(10);

    // Get the second page
    const secondPageResponse = await request(app)
      .get(`${POSTS_PATH}?pageNumber=2&pageSize=10`)
      .expect(200);

    // Verify pagination metadata for the second page
    expect(secondPageResponse.body).toMatchObject({
      pagesCount: 2,
      page: 2,
      pageSize: 10,
      totalCount: 15,
      items: expect.any(Array),
    });

    // Verify we got 5 items on the second page
    expect(secondPageResponse.body.items).toHaveLength(5);
  });

  it('should return post by id: STATUS 200', async () => {
    const blog = await createBlog(app);
    const post = await createPost(app, blog.id);

    // Get the post by ID
    const response = await request(app).get(`${POSTS_PATH}/${post.id}`).expect(200);

    // Verify the response
    expect(response.body).toMatchObject({
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: expect.any(String),
    });
  });

  it('should return 404 for non-existent post: STATUS 404', async () => {
    const nonExistentId = new ObjectId().toHexString();
    await request(app).get(`${POSTS_PATH}/${nonExistentId}`).expect(404);
  });

  it('should update post: STATUS 204', async () => {
    const blog = await createBlog(app);
    const post = await createPost(app, blog.id);

    // Update data for the post
    const updateData: PostInputDto = {
      title: 'Updated Title',
      shortDescription: 'Updated shortDescription',
      content: 'Updated content',
      blogId: post.blogId,
    };

    await request(app)
      .put(POSTS_PATH + `/${post.id}`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send(updateData)
      .expect(204);

    // Get the updated post
    const getResponse = await request(app).get(`${POSTS_PATH}/${post.id}`).expect(200);

    // Verify the post was updated
    expect(getResponse.body).toMatchObject({
      id: post.id,
      title: updateData.title,
      shortDescription: updateData.shortDescription,
      content: updateData.content,
      blogId: updateData.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
    });
  });

  it('should return 404 when updating non-existent post: STATUS 404', async () => {
    const nonExistentId = new ObjectId().toHexString();

    // Update data for the post
    const updateData: PostInputDto = {
      title: 'Updated Title',
      shortDescription: 'Updated shortDescription',
      content: 'Updated content',
      blogId: nonExistentId,
    };

    await request(app)
      .put(POSTS_PATH + `/${nonExistentId}`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send(updateData)
      .expect(404);
  });

  it('DELETE post and check after NOT FOUND', async () => {
    const blog = await createBlog(app);
    const post = await createPost(app, blog.id);

    // Verify the post exists before deletion
    await request(app).get(`${POSTS_PATH}/${post.id}`).expect(200);

    // Delete the post
    await request(app)
      .delete(`${POSTS_PATH}/${post.id}`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .expect(204);

    // Verify the post no longer exists
    await request(app).get(`${POSTS_PATH}/${post.id}`).expect(404);
  });

  it('should return 404 when deleting non-existent post: STATUS 404', async () => {
    const nonExistentId = new ObjectId().toHexString();
    await request(app)
      .delete(`${POSTS_PATH}/${nonExistentId}`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .expect(404);
  });
});
