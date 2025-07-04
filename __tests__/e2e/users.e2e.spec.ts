import request from 'supertest';
import express from 'express';
import { setupApp } from '../../src/setup-app';
import { appConfig } from '../../src/core/config';
import { runDB, stopDb } from '../../src/db/mongo.db';
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} from '../../src/features/auth/api/guards/super-admin.guard';
import { testingDtosCreator } from './utils/testingDtosCreator';
import { createUser, createUsers } from './utils/createUsers';
import { ObjectId } from 'mongodb';
import { USERS_PATH } from '../../src/core';

describe('Users API test', () => {
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

  let userDto: any;

  it('shouldn`t create user without authorization: STATUS 401', async () => {
    await request(app)
      .post(USERS_PATH)
      .send({
        login: '',
      })
      .expect(401);
  });

  it('should create user with correct data by sa and return it: STATUS 201', async () => {
    userDto = testingDtosCreator.createUserDto({});

    const newUser = await request(app)
      .post(USERS_PATH)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send({ login: userDto.login, email: userDto.email, password: userDto.pass })
      .expect(201);

    expect(newUser.body).toEqual({
      id: expect.any(String),
      login: userDto.login,
      email: userDto.email,
      createdAt: expect.any(String),
    });
  });

  it('shouldn`t create user twice with correct data by sa: STATUS 400', async () => {
    userDto = testingDtosCreator.createUserDto({});
    const user = await createUser(app, userDto);
    await request(app).post(USERS_PATH).auth(ADMIN_USERNAME, ADMIN_PASSWORD).send(user).expect(400);
  });

  it('shouldn`t create user with incorrect login: STATUS 400', async () => {
    userDto = testingDtosCreator.createUserDto({ login: '' });
    await request(app)
      .post('/users')
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send({ login: userDto.login, email: userDto.email, password: userDto.pass })
      .expect(400);
  });

  it('shouldn`t create user with incorrect email: STATUS 400', async () => {
    userDto = testingDtosCreator.createUserDto({ email: 'hhh' });
    await request(app)
      .post('/users')
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send({ login: userDto.login, email: userDto.email, password: userDto.pass })
      .expect(400);
  });

  it('shouldn`t create user with incorrect password: STATUS 400', async () => {
    userDto = testingDtosCreator.createUserDto({ pass: 'hh' });
    await request(app)
      .post('/users')
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send({ login: userDto.login, email: userDto.email, password: userDto.pass })
      .expect(400);
  });

  it('shouldn`t delete user by id without authorization: STATUS 401', async () => {
    const user = await createUser(app);

    await request(app)
      .delete('/users' + `/${user.id}`)
      .expect(401);
  });

  it('should delete user by id: STATUS 204', async () => {
    const user = await createUser(app);

    await request(app)
      .delete('/users' + `/${user.id}`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .expect(204);
  });

  it('shouldn`t delete user by id if specified user is not exists: STATUS 404', async () => {
    const nonExistentId = new ObjectId();
    await request(app)
      .delete('/users' + `/${nonExistentId}`)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .expect(404);
  });

  it('should return users list: STATUS 200', async () => {
    await createUsers(app, 10);
    const response = await request(app).get(USERS_PATH).expect(200);
    expect(response.body.items).toHaveLength(10);
  });

  it('should return paginated users with default values: STATUS 200', async () => {
    const users = await createUsers(app, 14);

    // Get first page with default pagination (pageSize=10, pageNumber=1)
    const firstPageResponse = await request(app).get(USERS_PATH).expect(200);

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
      .get(`${USERS_PATH}?pageNumber=2&pageSize=10`)
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
});
