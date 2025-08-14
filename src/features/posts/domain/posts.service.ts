import { PostInputDto } from '../types/post-input.dto';
import { WithId } from 'mongodb';
import { PostsRepository } from '../repositories/posts.repository';
import { PostQueryInput } from '../types/post-query.input';
import { ResultStatus } from '../../../core/result/resultCode';
import { CommentInputDto } from '../../comments/types/comment.input.dto';
import { ObjectResult } from '../../../core/result/object-result.entity';
import { BlogsService } from '../../blogs/domain/blogs.service';
import { BlogsQueryRepository } from '../../blogs/repositories/blogs.query-repository';
import { CommentsRepository } from '../../comments/repositories/comments.repository';
import { Post } from './post.etntity';
import { Comment } from '../../comments/domain/comment.entity';
import { inject, injectable } from 'inversify';
import { PostDocument, PostModel } from '../../../db/models/post.model';
import { BlogsRepository } from '../../blogs/repositories/blogs.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { CommentModel } from '../../../db/models/comments.model';

@injectable()
export class PostsService {
  constructor(
    @inject(PostsRepository) private postsRepository: PostsRepository,
    @inject(BlogsService) private blogsService: BlogsService,
    @inject(BlogsRepository) private blogsRepository: BlogsRepository,
    @inject(BlogsQueryRepository) private blogsQueryRepository: BlogsQueryRepository,
    @inject(CommentsRepository) private commentsRepository: CommentsRepository,
    @inject(UsersRepository) private usersRepository: UsersRepository,
  ) {}

  async findAll(queryDto: PostQueryInput): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    return this.postsRepository.findAll(queryDto);
  }

  async findById(id: string): Promise<WithId<Post>> {
    return this.postsRepository.findById(id);
  }

  async create(dto: PostInputDto): Promise<ObjectResult<PostDocument | null>> {
    const blog = await this.blogsService.findById(dto.blogId);

    if (!blog) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'blogId', message: `Blog with id:${dto.blogId} not found` }],
      });
    }

    const newPost = new PostModel();

    newPost.title = dto.title;
    newPost.shortDescription = dto.shortDescription;
    newPost.content = dto.content;
    newPost.blogId = dto.blogId;
    newPost.blogName = blog?.name;

    const result = await this.postsRepository.save(newPost);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'InternalServerError',
        extensions: 'Oops.. something went wrong, please try again later',
      });
    }

    return ObjectResult.createSuccessResult(result);
  }

  async update(id: string, dto: PostInputDto): Promise<ObjectResult> {
    const post = await this.postsRepository.findById(id);

    if (!post) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'post', message: `post with id:${id} not found` }],
      });
    }

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;

    const result = await this.postsRepository.save(post);

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
    const isDeleted = await this.postsRepository.deleteById(id);

    if (!isDeleted) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: `Post with id:${id} not found`,
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
  }): Promise<ObjectResult<{ items: PostDocument[]; totalCount: number }>> {
    const blog = await this.blogsRepository.findById(blogId);

    if (!blog) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'blogId', message: `Blog with id:${blogId} not found` }],
      });
    }

    const result = await this.postsRepository.findByBlogId(blogId, queryDto);

    return ObjectResult.createSuccessResult(result);
  }

  async createPostForBlog({
    blogId,
    dto,
  }: {
    blogId: string;
    dto: Omit<PostInputDto, 'blogId'>;
  }): Promise<ObjectResult<PostDocument>> {
    const blog = await this.blogsRepository.findById(blogId);

    if (!blog) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'blogId', message: `Blog with id:${blogId} not found` }],
      });
    }

    const newPost = new PostModel();

    newPost.title = dto.title;
    newPost.shortDescription = dto.shortDescription;
    newPost.content = dto.content;
    newPost.blogId = blogId;
    newPost.blogName = blog.name;

    const result = await this.postsRepository.save(newPost);

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
    const userData = await this.usersRepository.findUserById(userId);

    if (!userData) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.BadRequest,
        errorMessage: 'BadRequest',
        extensions: [{ field: 'userId', message: 'User not found' }],
      });
    }

    const postData = await this.postsRepository.findById(postId);

    if (!postData) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'postId', message: 'Post not found' }],
      });
    }

    const newComment = new CommentModel();

    newComment.postId = postData._id.toString();
    newComment.content = dto.content;
    newComment.commentatorInfo = {
      userId: userData._id.toString(),
      userLogin: userData.login,
    };
    newComment.likesCount = 0;
    newComment.dislikesCount = 0;

    const result = await this.commentsRepository.save(newComment);

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
