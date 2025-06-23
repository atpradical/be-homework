import request from 'supertest';
import express, { Express } from 'express';
import { MongoClient } from 'mongodb';
import { generateBasicAuthToken } from '../../utils/generate-admin-auth-token';
import { BLOGS_PATH, HttpStatus, USERS_PATH } from '../../../src/core';
import { SETTINGS } from '../../../src/core/settings';
import { setupApp } from '../../../src/setup-app';
import { runDB } from '../../../src/db/mongo.db';
import { UserInputDto } from '../../../src/features/users/dto/userInputDto';

describe('Users API', () => {
  let app: Express;
  let mongoClient: MongoClient;

  beforeAll(async () => {
    // Initialize the app and get the Express instance
    app = express();
    setupApp(app);
    const PORT = SETTINGS.PORT;

    await runDB(SETTINGS.MONGO_URL);

    // Connect to the test database
    mongoClient = new MongoClient(SETTINGS.MONGO_URL);
    await mongoClient.connect();

    // Clear the database before tests
    await request(app).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    // Close the MongoDB connection after all tests
    await mongoClient.close();
  });

  const adminToken = generateBasicAuthToken();

  const testUserData: UserInputDto = {
    login: 'oWUiPvCZbp',
    password: 'XqX4oK',
    email: 'example@example.com',
  };

  it('✅ should create user; POST /users', async () => {
    const newUser: UserInputDto = {
      ...testUserData,
    };

    await request(app)
      .post(USERS_PATH)
      .set('Authorization', adminToken)
      .send(newUser)
      .expect(HttpStatus.Created);
  });

  it('✅ should return users list; GET /users', async () => {
    // Clear any existing data
    await request(app).delete('/testing/all-data').expect(204);

    // Create test users
    const user1 = await request(app)
      .post(USERS_PATH)
      .set('Authorization', adminToken)
      .send({ ...testUserData, login: 'yb0Fiwdkw1', email: 'example@mail.ru' })
      .expect(HttpStatus.Created);

    const user2 = await request(app)
      .post(USERS_PATH)
      .set('Authorization', adminToken)
      .send({ ...testUserData, login: 'IfeaTG6mTV', email: 'example@mail.kz' })
      .expect(HttpStatus.Created);

    // Get all users
    const usersListResponse = await request(app)
      .get(USERS_PATH)
      .expect(HttpStatus.Ok);

    // Verify response
    expect(usersListResponse.body).toBeInstanceOf(Object);
    expect(usersListResponse.body.items).toHaveLength(2);

    // Verify user items structure
    expect(usersListResponse.body.items[1]).toStrictEqual({
      login: 'yb0Fiwdkw1',
      email: 'example@mail.ru',
      createdAt: expect.any(String),
      id: expect.any(String),
    });

    expect(usersListResponse.body.items[0]).toStrictEqual({
      login: 'IfeaTG6mTV',
      email: 'example@mail.kz',
      createdAt: expect.any(String),
      id: expect.any(String),
    });
  });

  it('✅ should return paginated users with default values; GET /users', async () => {
    // Clear any existing data
    await request(app).delete('/testing/all-data').expect(204);

    // Create 10 test blogs
    const testUsers: UserInputDto[] = Array.from({ length: 15 }, (_, i) => ({
      login: `example${i + 1}`,
      email: `example${i + 1}@mail.com`,
      password: `example${i + 1}`,
    }));

    await Promise.all(
      testUsers.map((user) =>
        request(app)
          .post(USERS_PATH)
          .set('Authorization', adminToken)
          .send(user)
          .expect(HttpStatus.Created),
      ),
    );

    // Get first page with default pagination (pageSize=10, pageNumber=1)
    const firstPageResponse = await request(app)
      .get(USERS_PATH)
      .expect(HttpStatus.Ok);

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
      .expect(HttpStatus.Ok);

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

  it('✅ DELETE /users/:id and check after NOT FOUND', async () => {
    // Clear any existing data
    await request(app).delete('/testing/all-data').expect(204);

    // Create a test user
    const createResponse = await request(app)
      .post(USERS_PATH)
      .set('Authorization', adminToken)
      .send({ ...testUserData })
      .expect(HttpStatus.Created);

    const createdUserId = createResponse.body.id;

    // Delete the blog
    await request(app)
      .delete(`${USERS_PATH}/${createdUserId}`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.NoContent);

    // Verify the blog no longer exists
    const userResponse = await request(app).get(
      `${BLOGS_PATH}/${createdUserId}`,
    );

    expect(userResponse.status).toBe(HttpStatus.NotFound);
  });
});
