import request from 'supertest';
import express, { Express } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { generateBasicAuthToken } from '../../utils/generate-admin-auth-token';
import { BlogInputDto } from '../../../src/features/blogs/dto/blogInputDto';
import { BLOGS_PATH, HttpStatus } from '../../../src/core';
import { SETTINGS } from '../../../src/core/settings';
import { setupApp } from '../../../src/setup-app';
import { runDB } from '../../../src/db/mongo.db';

describe('Blogs API', () => {
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

  const testBlogData: BlogInputDto = {
    name: 'Test Blog',
    description: 'Test Blog Description',
    websiteUrl: 'https://test-blog.com',
  };
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
    // Clear any existing data
    await request(app).delete('/testing/all-data').expect(204);

    // Create test blogs
    const blog1 = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminToken)
      .send({ ...testBlogData, name: 'Test Blog 1' })
      .expect(HttpStatus.Created);

    const blog2 = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminToken)
      .send({ ...testBlogData, name: 'Test Blog 2' })
      .expect(HttpStatus.Created);

    // Get all blogs
    const blogsListResponse = await request(app)
      .get(BLOGS_PATH)
      .set('Authorization', adminToken)
      .expect(HttpStatus.Ok);

    // Verify response
    expect(blogsListResponse.body).toBeInstanceOf(Object);
    expect(blogsListResponse.body.items).toHaveLength(2);

    // Verify blog items structure
    blogsListResponse.body.items.forEach((blog: any) => {
      expect(blog).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        websiteUrl: expect.any(String),
        isMembership: expect.any(Boolean),
        createdAt: expect.any(String),
      });

      // Verify the ID is a valid MongoDB ObjectId
      expect(ObjectId.isValid(blog.id)).toBe(true);
    });
  });

  it('✅ should return paginated blogs with default values; GET /api/blogs', async () => {
    // Clear any existing data
    await request(app).delete('/testing/all-data').expect(204);

    // Create 15 test blogs
    const testBlogs: BlogInputDto[] = Array.from({ length: 15 }, (_, i) => ({
      name: `Test Blog ${i + 1}`,
      description: `Description ${i + 1}`,
      websiteUrl: `https://test-blog-${i + 1}.com`,
    }));

    await Promise.all(
      testBlogs.map((blog) =>
        request(app)
          .post(BLOGS_PATH)
          .set('Authorization', adminToken)
          .send(blog)
          .expect(HttpStatus.Created),
      ),
    );

    // Get first page with default pagination (pageSize=10, pageNumber=1)
    const firstPageResponse = await request(app)
      .get(BLOGS_PATH)
      .set('Authorization', adminToken)
      .expect(HttpStatus.Ok);

    // Verify pagination metadata
    expect(firstPageResponse.body).toMatchObject({
      pageCount: 2,
      page: 1,
      pageSize: 10,
      totalCount: 15,
      items: expect.any(Array),
    });

    // Verify we got 10 items on the first page
    expect(firstPageResponse.body.items).toHaveLength(10);

    // Get the second page
    const secondPageResponse = await request(app)
      .get(`${BLOGS_PATH}?pageNumber=2&pageSize=10`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.Ok);

    // Verify pagination metadata for the second page
    expect(secondPageResponse.body).toMatchObject({
      pageCount: 2,
      page: 2,
      pageSize: 10,
      totalCount: 15,
      items: expect.any(Array),
    });

    // Verify we got 5 items on the second page
    expect(secondPageResponse.body.items).toHaveLength(5);

    // Verify items on the first and second pages don't overlap
    const firstPageIds = firstPageResponse.body.items.map(
      (item: any) => item.id,
    );
    const secondPageIds = secondPageResponse.body.items.map(
      (item: any) => item.id,
    );

    const commonIds = firstPageIds.filter((id: string) =>
      secondPageIds.includes(id),
    );
    expect(commonIds).toHaveLength(0);
  });

  it('✅ should return sorted blogs; GET /api/blogs', async () => {
    // Clear any existing data
    await request(app).delete('/testing/all-data').expect(204);

    // Create test blogs with different creation dates
    const testBlogs = [
      { name: 'Blog A', createdAt: new Date('2023-01-03').toISOString() },
      { name: 'Blog C', createdAt: new Date('2023-01-01').toISOString() },
      { name: 'Blog B', createdAt: new Date('2023-01-02').toISOString() },
    ];

    // Create blogs
    await Promise.all(
      testBlogs.map((blog) =>
        request(app)
          .post(BLOGS_PATH)
          .set('Authorization', adminToken)
          .send({
            name: blog.name,
            description: 'Test description',
            websiteUrl: 'https://test.com',
          })
          .expect(HttpStatus.Created),
      ),
    );

    // Get blogs sorted by name in ascending order
    const sortedResponse = await request(app)
      .get(`${BLOGS_PATH}?sortBy=name&sortDirection=asc`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.Ok);

    // Verify sorting by name
    const blogNames = sortedResponse.body.items.map((blog: any) => blog.name);
    expect(blogNames).toEqual(['Blog A', 'Blog B', 'Blog C']);

    // Get blogs sorted by creation date in descending order (default)
    const dateSortedResponse = await request(app)
      .get(`${BLOGS_PATH}?sortBy=createdAt&sortDirection=desc`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.Ok);

    // Verify sorting by creation date
    const createdAtDates = dateSortedResponse.body.items.map(
      (blog: any) => blog.createdAt,
    );
    const sortedDates = [...createdAtDates].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    );
    expect(createdAtDates).toEqual(sortedDates);
  });

  it('✅ should return blog by id; GET /api/blogs/:id', async () => {
    // Clear any existing data
    await request(app).delete('/testing/all-data').expect(204);

    // Create a test blog
    const createResponse = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminToken)
      .send({ ...testBlogData, name: 'Test Blog 1' })
      .expect(HttpStatus.Created);

    // Get the created blog by ID
    const getResponse = await request(app)
      .get(`${BLOGS_PATH}/${createResponse.body.id}`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.Ok);

    // Verify the response
    expect(getResponse.body).toMatchObject({
      id: createResponse.body.id,
      name: 'Test Blog 1',
      description: 'Test Blog Description',
      websiteUrl: 'https://test-blog.com',
      isMembership: expect.any(Boolean),
      createdAt: expect.any(String),
    });

    // Verify the ID is a valid MongoDB ObjectId
    expect(ObjectId.isValid(getResponse.body.id)).toBe(true);
  });

  it('✅ should return 404 for non-existent blog; GET /api/blogs/:id', async () => {
    // Try to get a non-existent blog
    const nonExistentId = new ObjectId().toHexString();
    await request(app)
      .get(`${BLOGS_PATH}/${nonExistentId}`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.NotFound);
  });

  it('✅ should update blog; PUT /api/blogs/:id', async () => {
    // Clear any existing data
    await request(app).delete('/testing/all-data').expect(204);

    // Create a test blog
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

    // Update the blog
    await request(app)
      .put(`${BLOGS_PATH}/${createResponse.body.id}`)
      .set('Authorization', adminToken)
      .send(blogUpdateData)
      .expect(HttpStatus.NoContent);

    // Get the updated blog
    const blogResponse = await request(app)
      .get(`${BLOGS_PATH}/${createResponse.body.id}`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.Ok);

    // Verify the blog was updated correctly
    expect(blogResponse.body).toMatchObject({
      id: createResponse.body.id,
      name: 'Updated Name',
      description: 'Updated Description',
      websiteUrl: 'https://updated-blog.com',
      isMembership: expect.any(Boolean),
      createdAt: expect.any(String),
    });
  });

  it('✅ should return 404 when updating non-existent blog; PUT /api/blogs/:id', async () => {
    const nonExistentId = new ObjectId().toHexString();
    const blogUpdateData: BlogInputDto = {
      name: 'Updated Name',
      description: 'Updated Description',
      websiteUrl: 'https://updated-blog.com',
    };

    await request(app)
      .put(`${BLOGS_PATH}/${nonExistentId}`)
      .set('Authorization', adminToken)
      .send(blogUpdateData)
      .expect(HttpStatus.NotFound);
  });

  it('✅ DELETE /api/blogs/:id and check after NOT FOUND', async () => {
    // Clear any existing data
    await request(app).delete('/testing/all-data').expect(204);

    // Create a test blog
    const createResponse = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminToken)
      .send({ ...testBlogData, name: 'Test Blog 1' })
      .expect(HttpStatus.Created);

    const createdBlogId = createResponse.body.id;

    // Verify the blog exists before deletion
    await request(app)
      .get(`${BLOGS_PATH}/${createdBlogId}`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.Ok);

    // Delete the blog
    await request(app)
      .delete(`${BLOGS_PATH}/${createdBlogId}`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.NoContent);

    // Verify the blog no longer exists
    const blogResponse = await request(app)
      .get(`${BLOGS_PATH}/${createdBlogId}`)
      .set('Authorization', adminToken);

    expect(blogResponse.status).toBe(HttpStatus.NotFound);
  });

  it('✅ should return 404 when deleting non-existent blog; DELETE /api/blogs/:id', async () => {
    const nonExistentId = new ObjectId().toHexString();
    await request(app)
      .delete(`${BLOGS_PATH}/${nonExistentId}`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.NotFound);
  });
});
