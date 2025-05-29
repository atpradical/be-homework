import { db } from '../../../db/in-memory.db';
import { Blog } from '../types';
import { BlogInputDto } from '../dto/blogInputDto';

export const blogsRepository = {
  findAll(): Blog[] {
    return db.blogs;
  },

  findById(id: string): Blog | null {
    return db.blogs.find((blog) => blog.id === id) ?? null;
  },

  create(newBlog: Blog): Blog {
    db.blogs.push(newBlog);
    return newBlog;
  },

  update(id: string, dto: BlogInputDto): void {
    const blog = db.blogs.find((blog) => blog.id === id);

    if (!blog) {
      throw new Error('Blog not exist');
    }

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;

    return;
  },

  delete(id: string): void {
    const index = db.blogs.findIndex((blog) => blog.id === id);

    if (index === -1) {
      throw new Error('Blog not exist');
    }

    db.blogs.splice(index, 1);
    return;
  },
};
