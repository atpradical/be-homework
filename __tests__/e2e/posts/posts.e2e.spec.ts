import request from 'supertest';
import { Express } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { generateBasicAuthToken } from '../../utils/generate-admin-auth-token';
import { BlogInputDto } from '../../../src/features/blogs/dto/blogInputDto';
import { BLOGS_PATH, HttpStatus, POSTS_PATH } from '../../../src/core';
import { PostInputDto } from '../../../src/features/posts/dto/postInputDto';
import { bootstrap } from '../../../src';
import { SETTINGS } from '../../../src/core/settings';

describe('Post API', () => {
  let app: Express;
  let mongoClient: MongoClient;
  let testBlogId: string;
  const adminToken = generateBasicAuthToken();

  const testBlogData: BlogInputDto = {
    name: 'Test Blog',
    description: 'Test Blog Description',
    websiteUrl: 'https://test-blog.com',
  };

  const testPostData: Omit<PostInputDto, 'blogId'> = {
    title: 'Test Post',
    shortDescription: 'Test post short description',
    content: 'Test post content',
  };

  beforeAll(async () => {
    // Initialize the app and get the Express instance
    app = await bootstrap();

    // Connect to the test database
    mongoClient = new MongoClient(SETTINGS.MONGO_URL);
    await mongoClient.connect();

    // Clear the database before tests
    await request(app).delete('/testing/all-data').expect(204);

    // Create a test blog for posts
    const blogResponse = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminToken)
      .send(testBlogData)
      .expect(HttpStatus.Created);

    testBlogId = blogResponse.body.id;
  });

  afterAll(async () => {
    // Close the MongoDB connection after all tests
    await mongoClient.close();
  });

  // Helper function to create a test post
  const createTestPost = async (postData: Partial<PostInputDto> = {}) => {
    const postWithBlogId = { ...testPostData, blogId: testBlogId, ...postData };
    const response = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminToken)
      .send(postWithBlogId)
      .expect(HttpStatus.Created);

    return response.body;
  };

  it('✅ should create post; POST /api/posts', async () => {
    const newPost = await createTestPost();

    // Verify the response
    expect(newPost).toMatchObject({
      id: expect.any(String),
      title: testPostData.title,
      shortDescription: testPostData.shortDescription,
      content: testPostData.content,
      blogId: testBlogId,
      blogName: expect.any(String),
      createdAt: expect.any(String),
    });

    // Verify the ID is a valid MongoDB ObjectId
    expect(ObjectId.isValid(newPost.id)).toBe(true);
  });

  it('✅ should return post list; GET /api/posts', async () => {
    // Create test posts
    const post1 = await createTestPost({ title: 'Test Post 1' });
    const post2 = await createTestPost({ title: 'Test Post 2' });

    // Get all posts
    const postsListResponse = await request(app)
      .get(POSTS_PATH)
      .expect(HttpStatus.Ok);

    // Verify response
    expect(postsListResponse.body).toBeInstanceOf(Array);
    expect(postsListResponse.body).toHaveLength(3);

    // Verify post items structure
    postsListResponse.body.forEach((post: any) => {
      expect(post).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        shortDescription: expect.any(String),
        content: expect.any(String),
        blogId: testBlogId,
        blogName: expect.any(String),
        createdAt: expect.any(String),
      });

      // Verify the ID is a valid MongoDB ObjectId
      expect(ObjectId.isValid(post.id)).toBe(true);
    });
  });

  it('✅ should return post by id; GET /api/posts/:id', async () => {
    // Create a test post
    const createdPost = await createTestPost({
      title: 'Test Post for Get By ID',
      shortDescription: 'Test description',
      content: 'Test content',
    });

    // Get the post by ID
    const getResponse = await request(app)
      .get(`${POSTS_PATH}/${createdPost.id}`)
      .expect(HttpStatus.Ok);

    // Verify the response
    expect(getResponse.body).toMatchObject({
      id: createdPost.id,
      title: 'Test Post for Get By ID',
      shortDescription: 'Test description',
      content: 'Test content',
      blogId: testBlogId,
      blogName: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  it('✅ should return 404 for non-existent post; GET /api/posts/:id', async () => {
    // Try to get a non-existent post
    const nonExistentId = new ObjectId().toHexString();
    await request(app)
      .get(`${POSTS_PATH}/${nonExistentId}`)
      .expect(HttpStatus.NotFound);
  });

  it('✅ should update post; PUT /api/posts/:id', async () => {
    // Create a test post
    const createdPost = await createTestPost();

    // Update the post
    const updateData: PostInputDto = {
      title: 'Updated Title',
      shortDescription: 'Updated short description',
      content: 'Updated content',
      blogId: testBlogId,
    };

    await request(app)
      .put(`${POSTS_PATH}/${createdPost.id}`)
      .set('Authorization', adminToken)
      .send(updateData)
      .expect(HttpStatus.NoContent);

    // Get the updated post
    const updatedPostResponse = await request(app)
      .get(`${POSTS_PATH}/${createdPost.id}`)
      .expect(HttpStatus.Ok);

    // Verify the post was updated
    expect(updatedPostResponse.body).toMatchObject({
      id: createdPost.id,
      title: 'Updated Title',
      shortDescription: 'Updated short description',
      content: 'Updated content',
      blogId: testBlogId,
      blogName: expect.any(String),
      createdAt: createdPost.createdAt,
    });
  });

  it('✅ should return 404 when updating non-existent post; PUT /api/posts/:id', async () => {
    const nonExistentId = new ObjectId().toHexString();
    const updateData: PostInputDto = {
      title: 'Updated Title',
      shortDescription: 'Updated short description',
      content: 'Updated content',
      blogId: testBlogId,
    };

    await request(app)
      .put(`${POSTS_PATH}/${nonExistentId}`)
      .set('Authorization', adminToken)
      .send(updateData)
      .expect(HttpStatus.NotFound);
  });

  it('✅ DELETE /api/posts/:id and check after NOT FOUND', async () => {
    // Create a test post
    const createdPost = await createTestPost();

    // Verify the post exists before deletion
    await request(app)
      .get(`${POSTS_PATH}/${createdPost.id}`)
      .expect(HttpStatus.Ok);

    // Delete the post
    await request(app)
      .delete(`${POSTS_PATH}/${createdPost.id}`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.NoContent);

    // Verify the post no longer exists
    const postResponse = await request(app)
      .get(`${POSTS_PATH}/${createdPost.id}`)
      .expect(HttpStatus.NotFound);
  });

  it('✅ should return 404 when deleting non-existent post; DELETE /api/posts/:id', async () => {
    const nonExistentId = new ObjectId().toHexString();
    await request(app)
      .delete(`${POSTS_PATH}/${nonExistentId}`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.NotFound);
  });
});
