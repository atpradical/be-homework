import { PostInputDto } from '../types/post-input.dto';
import { Post } from '../types';
import { WithId } from 'mongodb';
import { postsRepository } from '../repositories/posts.repository';
import { blogsService } from '../../blogs/domain/blogs.service';
import { PostQueryInput } from '../types/post-query.input';
import { postsQueryRepository } from '../repositories/posts.query-repository';
import { CommentDB } from '../../comments/types';
import { usersQueryRepository } from '../../users/repositories/users.query-repository';
import { ResultStatus } from '../../../core/result/resultCode';
import { commentsRepository } from '../../comments/repositories/comments.repository';
import { CommentInputDto } from '../../comments/types/comment.input.dto';
import { blogsQueryRepository } from '../../blogs/repositories/blogs.query-repository';
import { ObjectResult } from '../../../core/result/object-result.entity';

export const postsService = {
  async findAll(queryDto: PostQueryInput): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    return postsQueryRepository.findAll(queryDto);
  },

  async findById(id: string): Promise<WithId<Post>> {
    return postsQueryRepository.findById(id);
  },

  async create(dto: PostInputDto): Promise<ObjectResult<WithId<Post> | null>> {
    const blog = await blogsService.findById(dto.blogId);

    if (!blog) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'blogId', message: `Blog with id:${dto.blogId} not found` }],
      });
    }

    //todo: заменить на класс
    const newPost = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog?.name,
      createdAt: new Date(),
    };

    const result = await postsRepository.create(newPost);

    return ObjectResult.createSuccessResult(result);
  },

  async update(id: string, dto: PostInputDto): Promise<ObjectResult> {
    const post = await postsQueryRepository.findById(id);

    if (!post) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'post', message: `post with id:${id} not found` }],
      });
    }

    const result = await postsRepository.update(id, dto);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'InternalServerError',
        extensions: 'Oops.. something went wrong, please try again later',
      });
    }

    return ObjectResult.createSuccessResult(null);
  },

  async delete(id: string): Promise<ObjectResult> {
    const post = await postsQueryRepository.findById(id);

    if (!post) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [],
      });
    }

    const result = await postsRepository.delete(id);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'Database update failed',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    return ObjectResult.createSuccessResult(null);
  },

  async findPostsByBlog({
    blogId,
    queryDto,
  }: {
    blogId: string;
    queryDto: PostQueryInput;
  }): Promise<ObjectResult<{ items: WithId<Post>[]; totalCount: number }>> {
    const blog = await blogsQueryRepository.findById(blogId);

    if (!blog) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'blogId', message: `Blog with id:${blogId} not found` }],
      });
    }

    const result = await postsQueryRepository.findPostsByBlog(blogId, queryDto);

    return ObjectResult.createSuccessResult(result);
  },

  async createPostForBlog({
    blogId,
    dto,
  }: {
    blogId: string;
    dto: Omit<PostInputDto, 'blogId'>;
  }): Promise<ObjectResult<WithId<Post>>> {
    const blog = await blogsQueryRepository.findById(blogId);

    if (!blog) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'blogId', message: `Blog with id:${blogId} not found` }],
      });
    }

    //todo: заменить на класс
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
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'Database update failed',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    return ObjectResult.createSuccessResult(result);
  },

  async createComment({
    userId,
    postId,
    dto,
  }: CreateCommentArgs): Promise<ObjectResult<WithId<CommentDB | null>>> {
    const userData = await usersQueryRepository.findUserById(userId);

    if (!userData) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'BadRequest',
        extensions: [{ field: 'userId', message: 'User not found' }],
      });
    }

    const postData = await postsQueryRepository.findById(postId);

    if (!postData) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'postId', message: 'Post not found' }],
      });
    }

    //todo:заменить на класс
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
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'Database update failed',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    return ObjectResult.createSuccessResult(result);
  },
};

//todo: вынести в отдельный файл
type CreateCommentArgs = {
  userId: string;
  postId: string;
  dto: CommentInputDto;
};
