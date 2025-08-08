import { WithId } from 'mongodb';
import { Blog } from '../types';
import { BlogInputDto } from '../types/blog-input.dto';
import { BlogQueryInput } from '../types/blog-query.input';
import { BlogsQueryRepository } from '../repositories/blogs.query-repository';
import { BlogsRepository } from '../repositories/blogs.repository';

export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async findAll(queryDto: BlogQueryInput): Promise<{ items: WithId<Blog>[]; totalCount: number }> {
    return this.blogsQueryRepository.findAll(queryDto);
  }

  async findById(id: string): Promise<WithId<Blog>> {
    return this.blogsQueryRepository.findById(id);
  }

  async create(dto: BlogInputDto): Promise<WithId<Blog>> {
    //todo: переделать на класс
    const newBlog: Blog = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      isMembership: false,
      createdAt: new Date(),
    };

    return this.blogsRepository.create(newBlog);
  }

  async update(id: string, dto: BlogInputDto): Promise<void> {
    await this.blogsRepository.update(id, dto);
    return;
  }

  async delete(id: string): Promise<void> {
    await this.blogsRepository.delete(id);
    return;
  }
}
