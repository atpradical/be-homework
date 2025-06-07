import request from 'supertest';
import { Express } from 'express';
import { MongoClient } from 'mongodb';
import { generateBasicAuthToken } from '../../utils/generate-admin-auth-token';
import { BlogInputDto } from '../../../src/features/blogs/dto/blogInputDto';
import { BLOGS_PATH, HttpStatus } from '../../../src/core';
import { bootstrap } from '../../../src';
import { SETTINGS } from '../../../src/core/settings';
import { ObjectId } from 'mongodb';

describe('Blogs API', () => {
  let app: Express;
  let mongoClient: MongoClient;

  beforeAll(async () => {
    // Initialize the app and get the Express instance
    app = await bootstrap();

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
    expect(blogsListResponse.body).toBeInstanceOf(Array);
    expect(blogsListResponse.body).toHaveLength(2);

    // Verify blog items structure
    blogsListResponse.body.forEach((blog: any) => {
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
