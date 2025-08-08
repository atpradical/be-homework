import { PostInputDto } from '../types/post-input.dto';
import { WithId } from 'mongodb';
import { PostsRepository } from '../repositories/posts.repository';
import { PostQueryInput } from '../types/post-query.input';
import { ResultStatus } from '../../../core/result/resultCode';
import { CommentInputDto } from '../../comments/types/comment.input.dto';
import { ObjectResult } from '../../../core/result/object-result.entity';
import { usersQueryRepository } from '../../../composition-root';
import { BlogsService } from '../../blogs/domain/blogs.service';
import { PostsQueryRepository } from '../repositories/posts.query-repository';
import { BlogsQueryRepository } from '../../blogs/repositories/blogs.query-repository';
import { CommentsRepository } from '../../comments/repositories/comments.repository';
import { Post } from './post.etntity';
import { Comment } from '../../comments/domain/comment.entity';

export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private postsQueryRepository: PostsQueryRepository,
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  async findAll(queryDto: PostQueryInput): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    return this.postsQueryRepository.findAll(queryDto);
  }

  async findById(id: string): Promise<WithId<Post>> {
    return this.postsQueryRepository.findById(id);
  }

  async create(dto: PostInputDto): Promise<ObjectResult<WithId<Post> | null>> {
    const blog = await this.blogsService.findById(dto.blogId);

    if (!blog) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'blogId', message: `Blog with id:${dto.blogId} not found` }],
      });
    }

    const newPost = Post.create({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog?.name,
    });

    const result = await this.postsRepository.create(newPost);

    return ObjectResult.createSuccessResult(result);
  }

  async update(id: string, dto: PostInputDto): Promise<ObjectResult> {
    const post = await this.postsQueryRepository.findById(id);

    if (!post) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'post', message: `post with id:${id} not found` }],
      });
    }

    const result = await this.postsRepository.update(id, dto);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'InternalServerError',
        extensions: 'Oops.. something went wrong, please try again later',
      });
    }

    return ObjectResult.createSuccessResult(null);
  }

  async delete(id: string): Promise<ObjectResult> {
    const post = await this.postsQueryRepository.findById(id);

    if (!post) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [],
      });
    }

    const result = await this.postsRepository.delete(id);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'Database update failed',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    return ObjectResult.createSuccessResult(null);
  }

  async findPostsByBlog({
    blogId,
    queryDto,
  }: {
    blogId: string;
    queryDto: PostQueryInput;
  }): Promise<ObjectResult<{ items: WithId<Post>[]; totalCount: number }>> {
    const blog = await this.blogsQueryRepository.findById(blogId);

    if (!blog) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'blogId', message: `Blog with id:${blogId} not found` }],
      });
    }

    const result = await this.postsQueryRepository.findPostsByBlog(blogId, queryDto);

    return ObjectResult.createSuccessResult(result);
  }

  async createPostForBlog({
    blogId,
    dto,
  }: {
    blogId: string;
    dto: Omit<PostInputDto, 'blogId'>;
  }): Promise<ObjectResult<WithId<Post>>> {
    const blog = await this.blogsQueryRepository.findById(blogId);

    if (!blog) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'blogId', message: `Blog with id:${blogId} not found` }],
      });
    }

    const newPost = Post.create({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
      blogName: blog.name,
    });

    const result = await this.postsRepository.create(newPost);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'Database update failed',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    return ObjectResult.createSuccessResult(result);
  }

  async createComment({
    userId,
    postId,
    dto,
  }: CreateCommentArgs): Promise<ObjectResult<WithId<Comment | null>>> {
    const userData = await usersQueryRepository.findUserById(userId);

    if (!userData) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'BadRequest',
        extensions: [{ field: 'userId', message: 'User not found' }],
      });
    }

    const postData = await this.postsQueryRepository.findById(postId);

    if (!postData) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'postId', message: 'Post not found' }],
      });
    }

    const newComment = Comment.create({
      commentatorInfo: {
        userId: userData._id.toString(),
        userLogin: userData.login,
      },
      postId: postData._id.toString(),
      content: dto.content,
      createdAt: new Date(),
    });

    const result = await this.commentsRepository.create(newComment);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'Database update failed',
        extensions: 'Please try again later. If problem persists, contact support',
      });
    }

    return ObjectResult.createSuccessResult(result);
  }
}

//todo: вынести в отдельный файл
type CreateCommentArgs = {
  userId: string;
  postId: string;
  dto: CommentInputDto;
};
