import { validationResult } from 'express-validator';
import { NextFunction, Response } from 'express';
import {
  blogIdValidation,
  contentValidation,
  postsInputValidation,
  shortDescriptionValidation,
  titleValidation,
} from '../../../../../src/features/posts/validation/posts.input-dto.validation-middleware';

// Mock Express request/response objects
const mockRequest = (body: any = {}) => ({
  body,
});

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext: NextFunction = jest.fn();

describe('Post Validation Middleware', () => {
  describe('titleValidation', () => {
    it('should pass with valid title', async () => {
      const req = mockRequest({ title: 'Valid Title' });
      await titleValidation.run(req);
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail when title is missing', async () => {
      const req = mockRequest({});
      await titleValidation.run(req);
      const errors = validationResult(req);
      expect(errors.array()).toContainEqual(
        expect.objectContaining({
          msg: 'is required',
        }),
      );
    });

    it('should fail when title is not a string', async () => {
      const req = mockRequest({ title: 123 });
      await titleValidation.run(req);
      const errors = validationResult(req);
      expect(errors.array()).toContainEqual(
        expect.objectContaining({
          msg: 'must be a string',
        }),
      );
    });

    it('should fail when title is too long', async () => {
      const longTitle = 'a'.repeat(31);
      const req = mockRequest({ title: longTitle });
      await titleValidation.run(req);
      const errors = validationResult(req);
      expect(errors.array()).toContainEqual(
        expect.objectContaining({
          msg: 'length is not correct',
        }),
      );
    });
  });

  describe('shortDescriptionValidation', () => {
    it('should pass with valid short description', async () => {
      const req = mockRequest({ shortDescription: 'A short description' });
      await shortDescriptionValidation.run(req);
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail when short description is too long', async () => {
      const longDescription = 'a'.repeat(101);
      const req = mockRequest({ shortDescription: longDescription });
      await shortDescriptionValidation.run(req);
      const errors = validationResult(req);
      expect(errors.array()).toContainEqual(
        expect.objectContaining({
          msg: 'length is not correct',
        }),
      );
    });
  });

  describe('contentValidation', () => {
    it('should pass with valid content', async () => {
      const req = mockRequest({ content: 'This is the content of the post' });
      await contentValidation.run(req);
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail when content is too long', async () => {
      const longContent = 'a'.repeat(1001);
      const req = mockRequest({ content: longContent });
      await contentValidation.run(req);
      const errors = validationResult(req);
      expect(errors.array()).toContainEqual(
        expect.objectContaining({
          msg: 'length is not correct',
        }),
      );
    });
  });

  describe('blogIdValidation', () => {
    it('should pass with valid blogId', async () => {
      const req = mockRequest({ blogId: '60d21b4667d0d8992e610c85' });
      await blogIdValidation.run(req);
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail when blogId is empty', async () => {
      const req = mockRequest({ blogId: '' });
      await blogIdValidation.run(req);
      const errors = validationResult(req);
      expect(errors.array()).toContainEqual(
        expect.objectContaining({
          msg: 'length is not correct',
        }),
      );
    });
  });

  describe('postsInputValidation', () => {
    it('should pass with valid post data', async () => {
      const req = mockRequest({
        title: 'Test Post',
        shortDescription: 'A short description',
        content: 'This is the content',
        blogId: '60d21b4667d0d8992e610c85',
      });

      // Run all validations
      await Promise.all(
        postsInputValidation.map((validation) => validation.run(req)),
      );

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail with multiple validation errors', async () => {
      const req = mockRequest({
        title: '',
        shortDescription: 'A'.repeat(101),
        content: 'a'.repeat(1001),
        blogId: '',
      });

      // Run all validations
      await Promise.all(
        postsInputValidation.map((validation) => validation.run(req)),
      );

      const errors = validationResult(req);
      expect(errors.array()).toHaveLength(5); // All fields should have errors
    });
  });
});
