import request from 'supertest';
import { testingDtosCreator } from './testingDtosCreator';
import { COMMENTS_PATH, POSTS_PATH } from '../../../src/core';
import { CommentInputDto } from '../../../src/features/comments/types/comment.input.dto';
import { createBlog } from './createBlogs';
import { createPost } from './createPosts';

export const createComment = async ({
  app,
  token,
  commentDto,
}: {
  app: any;
  token: string;
  commentDto: CommentInputDto;
}) => {
  const blog = await createBlog(app);
  const post = await createPost(app, blog.id);
  const dto = commentDto ?? testingDtosCreator.createCommentDto({});

  const resp = await request(app)
    .post(POSTS_PATH + `/${post.id}` + COMMENTS_PATH)
    .auth(token, { type: 'bearer' })
    .send({
      content: dto.content,
    })
    .expect(201);
  return resp.body;
};

export const createCommentsToPost = async ({
  app,
  postId,
  count,
  token,
}: {
  app: any;
  postId: string;
  token: string;
  count: number;
}) => {
  const comments = [];

  for (let i = 0; i <= count; i++) {
    const resp = await request(app)
      .post(POSTS_PATH + `/${postId}` + COMMENTS_PATH)
      .auth(token, { type: 'bearer' })
      .send({
        content: 'test comment content ' + i,
      })
      .expect(201);

    comments.push(resp.body);
  }
  return comments;
};
