import { PostInputDto } from '../dto/postInputDto';
import { Post } from '../types';
import { WithId } from 'mongodb';
import { postsRepository } from '../repositories/posts.repository';
import { blogsService } from '../../blogs/application/blogs.service';
import { RepositoryNotFoundError } from '../../../core/errors/repository-not-found.error';
import { PostQueryInput } from '../routes/input/post-query.input';
import { blogsRepository } from '../../blogs/repositories/blogs.repository';
import { postsQueryRepository } from '../repositories/posts.query-repository';
import { blogsQueryRepository } from '../../blogs/repositories/blogs.query-repository';

export const postsService = {
  async findAll(
    queryDto: PostQueryInput,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    return postsQueryRepository.findAll(queryDto);
  },

  async findById(id: string): Promise<WithId<Post>> {
    return postsQueryRepository.findById(id);
  },

  async create(dto: PostInputDto): Promise<WithId<Post>> {
    const blog = await blogsService.findById(dto.blogId);

    if (!blog) {
      throw new RepositoryNotFoundError('Blog not exist');
    }

    const newPost = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog?.name,
      createdAt: new Date(),
    };

    return postsRepository.create(newPost);
  },

  async update(id: string, dto: PostInputDto): Promise<void> {
    await postsRepository.update(id, dto);
    return;
  },

  async delete(id: string): Promise<void> {
    await postsRepository.delete(id);
    return;
  },

  async findPostsByBlog(
    blogId: string,
    queryDto: PostQueryInput,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    await blogsService.findById(blogId);

    return postsQueryRepository.findPostsByBlog(blogId, queryDto);
  },

  async createPostForBlog(
    blogId: string,
    dto: Omit<PostInputDto, 'blogId'>,
  ): Promise<WithId<Post>> {
    const blog = await blogsService.findById(blogId);

    if (!blog) {
      throw new RepositoryNotFoundError('Blog not exist');
    }

    const newPost = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
      blogName: blog?.name,
      createdAt: new Date(),
    };

    return postsRepository.create(newPost);
  },
};
