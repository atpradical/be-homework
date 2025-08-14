import { WithId } from 'mongodb';
import { Blog } from '../types';
import { BlogInputDto } from '../types/blog-input.dto';
import { BlogQueryInput } from '../types/blog-query.input';
import { BlogsRepository } from '../repositories/blogs.repository';
import { inject, injectable } from 'inversify';
import { BlogModel } from '../../../db/models/blog.model';
import { ObjectResult } from '../../../core/result/object-result.entity';
import { ResultStatus } from '../../../core/result/resultCode';

@injectable()
export class BlogsService {
  constructor(@inject(BlogsRepository) private blogsRepository: BlogsRepository) {}

  async findAll(queryDto: BlogQueryInput): Promise<{ items: WithId<Blog>[]; totalCount: number }> {
    return this.blogsRepository.findAll(queryDto);
  }

  async findById(id: string): Promise<WithId<Blog>> {
    return this.blogsRepository.findById(id);
  }

  async create(dto: BlogInputDto): Promise<WithId<Blog>> {
    const newBlog = new BlogModel();

    //todo: переделать на класс
    newBlog.name = dto.name;
    newBlog.description = dto.description;
    newBlog.websiteUrl = dto.websiteUrl;

    return this.blogsRepository.save(newBlog);
  }

  async update(id: string, dto: BlogInputDto): Promise<ObjectResult> {
    const blog = await this.blogsRepository.findById(id);

    if (!blog) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'id', message: `blog with id:${id} not found` }],
      });
    }

    //todo: переделать на класс
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;

    await this.blogsRepository.save(blog);

    return ObjectResult.createSuccessResult(null);
  }

  async delete(id: string): Promise<ObjectResult> {
    const isDeleted = await this.blogsRepository.deleteById(id);

    if (!isDeleted) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.NotFound,
        errorMessage: 'NotFound',
        extensions: [{ field: 'id', message: `blog with id:${id} not found` }],
      });
    }

    return ObjectResult.createSuccessResult(null);
  }
}
