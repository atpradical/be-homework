import { PostInputDto } from '../types/post-input.dto';
import { Post } from '../types';
import { WithId } from 'mongodb';
import { postsRepository } from '../repositories/posts.repository';
import { blogsService } from '../../blogs/domain/blogs.service';
import { PostQueryInput } from '../types/post-query.input';
import { postsQueryRepository } from '../repositories/posts.query-repository';
import { Result } from '../../../core/result/result.type';
import { CommentDB } from '../../comments/types';
import { usersQueryRepository } from '../../users/repositories/users.query-repository';
import { ResultStatus } from '../../../core/result/resultCode';
import { commentsRepository } from '../../comments/repositories/comments.repository';
import { CommentInputDto } from '../../comments/types/comment.input.dto';
import { blogsQueryRepository } from '../../blogs/repositories/blogs.query-repository';

export const postsService = {
  async findAll(queryDto: PostQueryInput): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    return postsQueryRepository.findAll(queryDto);
  },

  async findById(id: string): Promise<WithId<Post>> {
    return postsQueryRepository.findById(id);
  },

  async create(dto: PostInputDto): Promise<Result<WithId<Post> | null>> {
    const blog = await blogsService.findById(dto.blogId);

    if (!blog) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'blogId', message: `Blog with id:${dto.blogId} not found` }],
        data: null,
      };
    }

    const newPost = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog?.name,
      createdAt: new Date(),
    };

    const result = await postsRepository.create(newPost);

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: result,
    };
  },

  async update(id: string, dto: PostInputDto): Promise<Result> {
    const post = await postsQueryRepository.findById(id);

    if (!post) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'post', message: `post with id:${id} not found` }],
        data: null,
      };
    }

    const result = await postsRepository.update(id, dto);

    if (!result) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'BadRequest',
        extensions: [{ field: 'post', message: `post with id: ${id} was not updated` }],
        data: null,
      };
    }

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: null,
    };
  },

  async delete(id: string): Promise<Result> {
    const post = await postsQueryRepository.findById(id);

    if (!post) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [],
        data: null,
      };
    }

    const result = await postsRepository.delete(id);

    if (!result) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'BadRequest',
        extensions: [{ field: 'post', message: `post with id: ${id} was not deleted` }],
        data: null,
      };
    }

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: null,
    };
  },

  async findPostsByBlog({
    blogId,
    queryDto,
  }: {
    blogId: string;
    queryDto: PostQueryInput;
  }): Promise<Result<{ items: WithId<Post>[]; totalCount: number }>> {
    const blog = await blogsQueryRepository.findById(blogId);

    if (!blog) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'blogId', message: `Blog with id:${blogId} not found` }],
        data: null,
      };
    }

    const result = await postsQueryRepository.findPostsByBlog(blogId, queryDto);

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: result,
    };
  },

  async createPostForBlog({
    blogId,
    dto,
  }: {
    blogId: string;
    dto: Omit<PostInputDto, 'blogId'>;
  }): Promise<Result<WithId<Post>>> {
    const blog = await blogsQueryRepository.findById(blogId);

    if (!blog) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'blogId', message: `Blog with id:${blogId} not found` }],
        data: null,
      };
    }

    const newPost = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
      blogName: blog?.name,
      createdAt: new Date(),
    };

    const result = await postsRepository.create(newPost);

    if (!result) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'BadRequest',
        extensions: [{ field: 'newPost', message: `post was not created` }],
        data: null,
      };
    }

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: result,
    };
  },

  async createComment({
    userId,
    postId,
    dto,
  }: CreateCommentArgs): Promise<Result<WithId<CommentDB | null>>> {
    const userData = await usersQueryRepository.findUserById(userId);

    if (!userData) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'BadRequest',
        extensions: [{ field: 'userId', message: 'User not found' }],
        data: null,
      };
    }

    const postData = await postsQueryRepository.findById(postId);

    if (!postData) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'postId', message: 'Post not found' }],
        data: null,
      };
    }

    const newComment: CommentDB = {
      commentatorInfo: {
        userId: userData._id.toString(),
        userLogin: userData.login,
      },
      postId: postData._id,
      content: dto.content,
      createdAt: new Date(),
    };

    const result = await commentsRepository.create(newComment);

    if (!result) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'BadRequest',
        extensions: [{ field: 'newComment', message: `comment was not created` }],
        data: null,
      };
    }

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: result,
    };
  },
};

type CreateCommentArgs = {
  userId: string;
  postId: string;
  dto: CommentInputDto;
};
