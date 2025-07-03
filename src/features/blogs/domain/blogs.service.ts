import { WithId } from 'mongodb';
import { Blog } from '../types';
import { BlogInputDto } from '../types/blog-input.dto';
import { blogsRepository } from '../repositories/blogs.repository';
import { BlogQueryInput } from '../types/blog-query.input';
import { blogsQueryRepository } from '../repositories/blogs.query-repository';

export const blogsService = {
  async findAll(queryDto: BlogQueryInput): Promise<{ items: WithId<Blog>[]; totalCount: number }> {
    return blogsQueryRepository.findAll(queryDto);
  },

  async findById(id: string): Promise<WithId<Blog>> {
    return blogsQueryRepository.findById(id);
  },

  async create(dto: BlogInputDto): Promise<WithId<Blog>> {
    const newBlog: Blog = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      isMembership: false,
      createdAt: new Date(), // TODO: вопрос про { $createdAt: true }
    };

    return blogsRepository.create(newBlog);
  },

  async update(id: string, dto: BlogInputDto): Promise<void> {
    await blogsRepository.update(id, dto);
    return;
  },

  async delete(id: string): Promise<void> {
    await blogsRepository.delete(id);
    return;
  },
};
