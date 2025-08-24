import { PostInputDto } from '../types/post-input.dto';
import { WithId } from 'mongodb';
import { PostsRepository } from '../repositories/posts.repository';
import { PostQueryInput } from '../types/post-query.input';
import { ResultStatus } from '../../../core/result/resultCode';
import { ObjectResult } from '../../../core/result/object-result.entity';
import { BlogsService } from '../../blogs/domain/blogs.service';
import { CommentsRepository } from '../../comments/repositories/comments.repository';
import { inject, injectable } from 'inversify';
import { PostDocument, PostModel } from '../../../db/models/post.model';
import { BlogsRepository } from '../../blogs/repositories/blogs.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { Comment, CommentModel } from '../../../db/models/comments.model';
import { mapToPostViewModel } from '../mappers/map-to-post-view-model';
import { PostViewModel } from '../types/post-view-model';
import { IncrementType, LikeStatus } from '../../../core';
import { LikesService } from '../../likes/domain/likes.service';
import { LikeModel } from '../../../db/models/likes.model';

@injectable()
export class PostsService {
  constructor(
    @inject(PostsRepository) private postsRepository: PostsRepository,
    @inject(BlogsService) private blogsService: BlogsService,
    @inject(BlogsRepository) private blogsRepository: BlogsRepository,
    @inject(CommentsRepository) private commentsRepository: CommentsRepository,
    @inject(UsersRepository) private usersRepository: UsersRepository,
    @inject(LikesService) private likesService: LikesService,
  ) {}

  async create(dto: PostInputDto): Promise<ObjectResult<PostViewModel | null>> {
    const blog = await this.blogsService.findById(dto.blogId);

    if (!blog) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'blogId', message: `Blog with id:${dto.blogId} not found` }],
      });
    }

    const newPost = PostModel.createPost({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
    });

    const result = await this.postsRepository.save(newPost);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'InternalServerError',
        extensions: 'Oops.. something went wrong, please try again later',
      });
    }

    const viewDtoModel = mapToPostViewModel(result);

    return ObjectResult.createSuccessResult(viewDtoModel);
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

    post.updatePost(dto);

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

    const newPost = PostModel.createPost({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
      blogName: blog.name,
    });

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

  async createComment(
    userId: string,
    postId: string,
    content: string,
  ): Promise<ObjectResult<WithId<Comment | null>>> {
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

    const newComment = CommentModel.createComment({
      userId,
      postId: postData._id.toString(),
      content: content,
      commentatorInfo: {
        userId: userData._id.toString(),
        userLogin: userData.login,
      },
    });

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

  async updatePostLikeStatus(
    userId: string,
    postId: string,
    likeStatus: LikeStatus,
  ): Promise<ObjectResult> {
    const post = await this.postsRepository.findById(postId);

    if (!post) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'postId', message: `post with id:${postId} not found` }],
      });
    }

    const like = await this.likesService.findLikesByEntityAndUserId(userId, postId);

    if (!like) {
      // Если like нет -> создаем новые
      const newLike = LikeModel.createLike({
        userId,
        entityId: postId,
      });

      switch (likeStatus) {
        case LikeStatus.Like:
          newLike.updateLikeStatus(LikeStatus.Like);
          post.updateLikesCounter(LikeStatus.Like, IncrementType.Increment);
          break;
        case LikeStatus.Dislike:
          newLike.updateLikeStatus(LikeStatus.Dislike);
          post.updateLikesCounter(LikeStatus.Dislike, IncrementType.Increment);
          break;
        case LikeStatus.None:
          newLike.likeStatus = LikeStatus.None;
          break;
      }

      await this.likesService.save(newLike);
      await this.postsRepository.save(post);
    } else {
      // Если like есть -> обновляем существующий
      switch (likeStatus) {
        case LikeStatus.Like:
          if (like.likeStatus !== LikeStatus.Like) {
            like.updateLikeStatus(LikeStatus.Like);
            post.updateLikesCounter(LikeStatus.Like, IncrementType.Increment);
            post.dislikesCount > 0 &&
              post.updateLikesCounter(LikeStatus.Dislike, IncrementType.Decrement);
          }
          break;
        case LikeStatus.Dislike:
          if (like.likeStatus !== LikeStatus.Dislike) {
            like.updateLikeStatus(LikeStatus.Dislike);
            post.updateLikesCounter(LikeStatus.Dislike, IncrementType.Increment);
            post.likesCount > 0 &&
              post.updateLikesCounter(LikeStatus.Like, IncrementType.Decrement);
          }
          break;
        case LikeStatus.None:
          if (like.likeStatus === LikeStatus.Dislike) {
            post.updateLikesCounter(LikeStatus.Dislike, IncrementType.Decrement);
          }

          if (like.likeStatus === LikeStatus.Like) {
            post.updateLikesCounter(LikeStatus.Like, IncrementType.Decrement);
          }

          like.likeStatus = LikeStatus.None;
          break;
      }

      await this.likesService.save(like);
      await this.postsRepository.save(post);
    }

    const lastThreeLikes = await this.likesService.findThreeNewestLikesToEntity([postId]);

    if (lastThreeLikes.length > 0) {
      const userIds = lastThreeLikes.map((el) => el.userId);
      const users = await this.usersRepository.findAllUsersByIds(userIds);

      const newestLikes = [];

      for (let el of lastThreeLikes) {
        const user = users.find((u) => u._id.toString() === el.userId);
        newestLikes.push({
          login: user.login,
          userId: user._id.toString(),
          updatedAt: (el?.updatedAt ?? el?.createdAt ?? new Date()).toISOString(),
        });
      }

      post.addPostNewestLikes(newestLikes);
      await this.postsRepository.save(post);
    } else {
      // ВАЖНО: очищаем newestLikes, если актуальных лайков нет
      post.addPostNewestLikes([]);
      await this.postsRepository.save(post);
    }

    return ObjectResult.createSuccessResult(null);
  }

  async findPostWithUserStatus(
    postId: string,
    userId: string,
  ): Promise<ObjectResult<PostViewModel>> {
    const post = await this.postsRepository.findById(postId);

    if (!post) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'postId', message: `post with id:${post} not found` }],
      });
    }

    const like = await this.likesService.findLikesByEntityAndUserId(userId, postId);

    const viewDtoModel = mapToPostViewModel(post, like?.likeStatus);

    return ObjectResult.createSuccessResult(viewDtoModel);
  }
}
