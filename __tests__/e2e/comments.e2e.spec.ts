import request from 'supertest';
import express from 'express';
import { setupApp } from '../../src/setup-app';
import { appConfig } from '../../src/core/config';
import { runDB, stopDb } from '../../src/db/mongo.db';
import { testingDtosCreator } from './utils/testingDtosCreator';
import { createUser } from './utils/createUsers';
import { COMMENTS_PATH, POSTS_PATH, USERS_PATH } from '../../src/core';
import { createBlog } from './utils/createBlogs';
import { createPost } from './utils/createPosts';
import { testingJWTAuth } from './utils/testingJWTAuth';
import { createComment, createCommentsToPost } from './utils/createComments';
import { ObjectId } from 'mongodb';

describe('Comments API test', () => {
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

  let commentDto: any;

  const testLogin = 'test_login';
  const testPassword = 'test_password';

  const testLogin2 = 'testLogin2';
  const testPassword2 = 'test_password2';
  const testEmail2 = 'test2@gmail.com';

  it('shouldn`t create comment without authorization: STATUS 401', async () => {
    await request(app)
      .post(USERS_PATH)
      .send({
        login: '',
      })
      .expect(401);
  });

  it('should create comment with correct data by sa and return it: STATUS 201', async () => {
    const userDto = testingDtosCreator.createUserDto({ login: testLogin, pass: testPassword });
    const user = await createUser(app, userDto);

    const loginResponse = await testingJWTAuth.login(app, testLogin, testPassword);

    //get me data
    const meResponse = await testingJWTAuth.me(app, loginResponse.accessToken);

    commentDto = testingDtosCreator.createCommentDto({});

    const blog = await createBlog(app);
    const post = await createPost(app, blog.id);

    const newComment = await request(app)
      .post(POSTS_PATH + `/${post.id}` + COMMENTS_PATH)
      .auth(loginResponse.accessToken, { type: 'bearer' })
      .send({ content: commentDto.content })
      .expect(201);

    expect(newComment.body).toEqual({
      id: expect.any(String),
      content: commentDto.content,
      commentatorInfo: {
        userId: meResponse.userId,
        userLogin: testLogin,
      },
      createdAt: expect.any(String),
    });
  });

  it('shouldn`t create comment with incorrect content: STATUS 400', async () => {
    const userDto = testingDtosCreator.createUserDto({ login: testLogin, pass: testPassword });
    const user = await createUser(app, userDto);
    const loginResponse = await testingJWTAuth.login(app, testLogin, testPassword);
    const meResponse = await testingJWTAuth.me(app, loginResponse.accessToken);

    commentDto = testingDtosCreator.createCommentDto({
      content: '',
    });

    const blog = await createBlog(app);
    const post = await createPost(app, blog.id);

    const newComment = await request(app)
      .post(POSTS_PATH + `/${post.id}` + COMMENTS_PATH)
      .auth(loginResponse.accessToken, { type: 'bearer' })
      .send({ content: commentDto.content })
      .expect(400);
  });

  it('shouldn`t delete comment of another user: STATUS 403', async () => {
    const userDto = testingDtosCreator.createUserDto({ login: testLogin, pass: testPassword });
    const user = await createUser(app, userDto);
    const loginResponse = await testingJWTAuth.login(app, testLogin, testPassword);
    const meResponse = await testingJWTAuth.me(app, loginResponse.accessToken);

    commentDto = testingDtosCreator.createCommentDto({
      content: 'some comment content',
    });

    const comment = await createComment({ app, token: loginResponse.accessToken, commentDto });

    // создаем 2го пользователя
    const user2Dto = testingDtosCreator.createUserDto({
      login: testLogin2,
      pass: testPassword2,
      email: testEmail2,
    });
    const user2 = await createUser(app, user2Dto);
    const login2Response = await testingJWTAuth.login(app, testLogin2, testPassword2);

    await request(app)
      .delete(COMMENTS_PATH + `/${comment.id}`)
      .auth(login2Response.accessToken, { type: 'bearer' })
      .expect(403);
  });

  it('should delete comment by id: STATUS 204', async () => {
    const userDto = testingDtosCreator.createUserDto({ login: testLogin, pass: testPassword });
    const user = await createUser(app, userDto);
    const loginResponse = await testingJWTAuth.login(app, testLogin, testPassword);
    const meResponse = await testingJWTAuth.me(app, loginResponse.accessToken);

    commentDto = testingDtosCreator.createCommentDto({
      content: 'some comment content',
    });

    const comment = await createComment({ app, token: loginResponse.accessToken, commentDto });

    await request(app)
      .delete(COMMENTS_PATH + `/${comment.id}`)
      .auth(loginResponse.accessToken, { type: 'bearer' })
      .expect(204);
  });

  it('shouldn`t delete comment by id if specified comment is not exists: STATUS 404', async () => {
    const userDto = testingDtosCreator.createUserDto({ login: testLogin, pass: testPassword });
    await createUser(app, userDto);
    const loginResponse = await testingJWTAuth.login(app, testLogin, testPassword);

    const nonExistentId = new ObjectId();
    await request(app)
      .delete(COMMENTS_PATH + `/${nonExistentId}`)
      .auth(loginResponse.accessToken, { type: 'bearer' })
      .expect(404);
  });

  it('should return comments list for specified postId: STATUS 200', async () => {
    const userDto = testingDtosCreator.createUserDto({ login: testLogin, pass: testPassword });
    const user = await createUser(app, userDto);
    const loginResponse = await testingJWTAuth.login(app, testLogin, testPassword);
    const meResponse = await testingJWTAuth.me(app, loginResponse.accessToken);

    const blog = await createBlog(app);

    const post1 = await createPost(app, blog.id);
    const post2 = await createPost(app, blog.id);

    await createCommentsToPost({
      app,
      token: loginResponse.accessToken,
      postId: post1.id,
      count: 12,
    });

    await createCommentsToPost({
      app,
      token: loginResponse.accessToken,
      postId: post2.id,
      count: 12,
    });

    const response1 = await request(app)
      .get(POSTS_PATH + `/${post1.id}` + COMMENTS_PATH)
      .expect(200);

    expect(response1.body.items).toHaveLength(10);
    expect(response1.body.totalCount).toEqual(13);

    const response1Page2 = await request(app)
      .get(POSTS_PATH + `/${post1.id}` + COMMENTS_PATH + '?pageNumber=2')
      .expect(200);

    expect(response1Page2.body.items).toHaveLength(3);

    const response2 = await request(app)
      .get(POSTS_PATH + `/${post2.id}` + COMMENTS_PATH)
      .expect(200);

    expect(response2.body.items).toHaveLength(10);

    const response2Page2 = await request(app)
      .get(POSTS_PATH + `/${post2.id}` + COMMENTS_PATH + '?pageNumber=2')
      .expect(200);

    expect(response2Page2.body.items).toHaveLength(3);
  });
});
