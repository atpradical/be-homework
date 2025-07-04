import { BlogInputDto } from '../../../src/features/blogs/types/blog-input.dto';
import { PostInputDto } from '../../../src/features/posts/types/post-input.dto';

export type UserDto = {
  login: string;
  email: string;
  pass: string;
};

export const testingDtosCreator = {
  createBlogDto({
    name,
    description,
    websiteUrl,
  }: {
    name?: string;
    description?: string;
    websiteUrl?: string;
  }): BlogInputDto {
    return {
      name: name ?? 'test name',
      description: description ?? 'test description',
      websiteUrl: websiteUrl ?? 'https://test.com',
    };
  },

  createBlogDtos(count: number): BlogInputDto[] {
    const blogs = [];

    for (let i = 0; i <= count; i++) {
      blogs.push({
        name: `test name ${i}`,
        description: `test description ${i}`,
        websiteUrl: `https://test${i}.com`,
      });
    }
    return blogs;
  },

  createPostDto({
    title,
    shortDescription,
    content,
    blogId,
  }: {
    title?: string;
    shortDescription?: string;
    content?: string;
    blogId: string;
  }): PostInputDto {
    return {
      title: title ?? 'test title',
      shortDescription: shortDescription ?? 'test shortDescription',
      content: content ?? 'test content',
      blogId: blogId,
    };
  },

  createPostDtos(blogId: string, count: number): PostInputDto[] {
    const posts = [];

    for (let i = 0; i <= count; i++) {
      posts.push({
        title: `test title ${i}`,
        shortDescription: `test shortDescription ${i}`,
        content: `test content ${i}`,
        blogId: blogId,
      });
    }
    return posts;
  },

  createUserDto({
    login,
    email,
    pass,
  }: {
    login?: string;
    email?: string;
    pass?: string;
  }): UserDto {
    return {
      login: login ?? 'test',
      email: email ?? 'test@gmail.com',
      pass: pass ?? '123456789',
    };
  },
  createUserDtos(count: number): UserDto[] {
    const users = [];

    for (let i = 0; i <= count; i++) {
      users.push({
        login: 'test' + i,
        email: `test${i}@gmail.com`,
        pass: '12345678',
      });
    }
    return users;
  },
};
