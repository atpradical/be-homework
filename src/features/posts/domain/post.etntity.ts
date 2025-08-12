type Params = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
};

export class Post {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;

  private constructor(params: Params) {
    const { title, shortDescription, content, blogId, blogName } = params;

    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogId = blogId;
    this.blogName = blogName;
    this.createdAt = new Date();
  }

  static create(params: Params) {
    return new Post(params);
  }
}
