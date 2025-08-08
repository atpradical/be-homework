import { UsersRepository } from '../features/users/repositories/users.repository';
import { BcryptService } from '../features/auth/adapters/bcrypt.service';
import { UsersService } from '../features/users/domain/users.service';
import { JwtService } from '../features/auth/adapters/jwt.service';
import { EmailExamples } from '../features/auth/adapters/emailExamples';
import { NodemailerService } from '../features/auth/adapters/nodemailer.service';
import { UaParserService } from '../features/auth/adapters/ua-parser.service';
import { AuthService } from '../features/auth/domain/auth.service';
import { UsersQueryRepository } from '../features/users/repositories/users.query-repository';
import { BlogsService } from '../features/blogs/domain/blogs.service';
import { BlogsQueryRepository } from '../features/blogs/repositories/blogs.query-repository';
import { BlogsRepository } from '../features/blogs/repositories/blogs.repository';
import { PostsService } from '../features/posts/domain/posts.service';
import { PostsQueryRepository } from '../features/posts/repositories/posts.query-repository';
import { PostsRepository } from '../features/posts/repositories/posts.repository';
import { CommentsRepository } from '../features/comments/repositories/comments.repository';
import { CommentsQueryRepository } from '../features/comments/repositories/comments.query-repository';
import { CommentsService } from '../features/comments/domain/comments.service';
import { AuthDeviceSessionQueryRepository } from '../features/auth-device-session/repositories/auth-device-session.query-repository';
import { AuthDeviceSessionService } from '../features/auth-device-session/domain/auth-device-session.service';
import { AuthDeviceSessionRepository } from '../features/auth-device-session/repositories/auth-device-session.repository';

export const bcryptService = new BcryptService();
export const jwtService = new JwtService();
export const nodemailerService = new NodemailerService();
export const emailExamples = new EmailExamples();
export const uaParserService = new UaParserService();

export const usersRepository = new UsersRepository();
export const usersQueryRepository = new UsersQueryRepository();
export const usersService = new UsersService(usersRepository, bcryptService);

export const blogsRepository = new BlogsRepository();
export const blogsQueryRepository = new BlogsQueryRepository();
export const blogsService = new BlogsService(blogsRepository, blogsQueryRepository);

export const commentsRepository = new CommentsRepository();
export const commentsQueryRepository = new CommentsQueryRepository();
export const commentsService = new CommentsService(commentsRepository, commentsQueryRepository);

export const postsRepository = new PostsRepository();
export const postsQueryRepository = new PostsQueryRepository();
export const postsService = new PostsService(
  postsRepository,
  postsQueryRepository,
  blogsService,
  blogsQueryRepository,
  commentsRepository,
);

export const authService = new AuthService(
  usersRepository,
  usersQueryRepository,
  jwtService,
  bcryptService,
  nodemailerService,
  emailExamples,
  uaParserService,
);

export const authDeviceSessionRepository = new AuthDeviceSessionRepository();
export const authDeviceSessionQueryRepository = new AuthDeviceSessionQueryRepository();
export const authDeviceSessionService = new AuthDeviceSessionService(authDeviceSessionRepository);
