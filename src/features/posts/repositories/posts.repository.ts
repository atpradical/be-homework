import { db } from '../../../db/in-memory.db';
import { PostInputDto } from '../dto/postInputDto';
import { Post } from '../types';

export const postsRepository = {
  findAll(): Post[] {
    return db.posts;
  },

  findById(id: string): Post | null {
    return db.posts.find((blog) => blog.id === id) ?? null;
  },

  create(newBlog: Post): Post {
    db.posts.push(newBlog);
    return newBlog;
  },

  update(id: string, dto: PostInputDto): void {
    const post = db.posts.find((blog) => blog.id === id);

    if (!post) {
      throw new Error('Blog not exist');
    }

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;

    return;
  },

  delete(id: string): void {
    const index = db.posts.findIndex((blog) => blog.id === id);

    if (index === -1) {
      throw new Error('Post not exist');
    }

    db.posts.splice(index, 1);
    return;
  },
};
