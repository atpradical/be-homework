import { WithId } from 'mongodb';
import { Blog } from '../types';
import { BlogInputDto } from '../dto/blogInputDto';
import { blogsRepository } from '../repositories/blogs.repository';
import { BlogQueryInput } from '../routes/input/blog-query.input';

export const blogsService = {
  async findAll(
    queryDto: BlogQueryInput,
  ): Promise<{ items: WithId<Blog>[]; totalCount: number }> {
    return blogsRepository.findAll(queryDto);
  },

  async findById(id: string): Promise<WithId<Blog>> {
    return blogsRepository.findById(id);
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
