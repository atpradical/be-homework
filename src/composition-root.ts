import 'reflect-metadata';
import { UsersRepository } from './features/users/repositories/users.repository';
import { BcryptService } from './features/auth/adapters/bcrypt.service';
import { UsersService } from './features/users/domain/users.service';
import { JwtService } from './features/auth/adapters/jwt.service';
import { EmailExamples } from './features/auth/adapters/emailExamples';
import { NodemailerService } from './features/auth/adapters/nodemailer.service';
import { UaParserService } from './features/auth/adapters/ua-parser.service';
import { AuthService } from './features/auth/domain/auth.service';
import { UsersQueryRepository } from './features/users/repositories/users.query-repository';
import { BlogsService } from './features/blogs/domain/blogs.service';
import { BlogsQueryRepository } from './features/blogs/repositories/blogs.query-repository';
import { BlogsRepository } from './features/blogs/repositories/blogs.repository';
import { PostsService } from './features/posts/domain/posts.service';
import { PostsQueryRepository } from './features/posts/repositories/posts.query-repository';
import { PostsRepository } from './features/posts/repositories/posts.repository';
import { CommentsRepository } from './features/comments/repositories/comments.repository';
import { CommentsQueryRepository } from './features/comments/repositories/comments.query-repository';
import { CommentsService } from './features/comments/domain/comments.service';
import { AuthDeviceSessionQueryRepository } from './features/auth-device-session/repositories/auth-device-session.query-repository';
import { AuthDeviceSessionService } from './features/auth-device-session/domain/auth-device-session.service';
import { AuthDeviceSessionRepository } from './features/auth-device-session/repositories/auth-device-session.repository';
import { AuthController } from './features/auth/api/auth.controller';
import { SecurityDevicesSessionsController } from './features/auth-device-session/api/security-devices-sessions.controller';
import { BlogsController } from './features/blogs/api/blogs.controller';
import { CommentsController } from './features/comments/api/comments.controller';
import { PostsController } from './features/posts/api/posts.controller';
import { UsersController } from './features/users/api/users.controller';
import { Container } from 'inversify';

export const container = new Container();

// Регистрируем сначала простые сервисы
container.bind<BcryptService>(BcryptService).to(BcryptService);
container.bind<JwtService>(JwtService).to(JwtService);
container.bind<NodemailerService>(NodemailerService).to(NodemailerService);
container.bind<EmailExamples>(EmailExamples).to(EmailExamples);
container.bind<UaParserService>(UaParserService).to(UaParserService);

// Регистрируем репозитории
container.bind<UsersRepository>(UsersRepository).to(UsersRepository);
container.bind<UsersQueryRepository>(UsersQueryRepository).to(UsersQueryRepository);
container.bind<BlogsRepository>(BlogsRepository).to(BlogsRepository);
container.bind<BlogsQueryRepository>(BlogsQueryRepository).to(BlogsQueryRepository);
container.bind<CommentsRepository>(CommentsRepository).to(CommentsRepository);
container.bind<CommentsQueryRepository>(CommentsQueryRepository).to(CommentsQueryRepository);
container.bind<PostsRepository>(PostsRepository).to(PostsRepository);
container.bind<PostsQueryRepository>(PostsQueryRepository).to(PostsQueryRepository);
container
  .bind<AuthDeviceSessionRepository>(AuthDeviceSessionRepository)
  .to(AuthDeviceSessionRepository);
container
  .bind<AuthDeviceSessionQueryRepository>(AuthDeviceSessionQueryRepository)
  .to(AuthDeviceSessionQueryRepository);

// Регистрируем сервисы
container.bind<CommentsService>(CommentsService).to(CommentsService);
container.bind<BlogsService>(BlogsService).to(BlogsService);
container.bind<UsersService>(UsersService).to(UsersService);
container.bind<PostsService>(PostsService).to(PostsService);
container.bind<AuthDeviceSessionService>(AuthDeviceSessionService).to(AuthDeviceSessionService);
container.bind<AuthService>(AuthService).to(AuthService);

// Регистрируем контроллеры
container.bind<AuthController>(AuthController).to(AuthController);
container
  .bind<SecurityDevicesSessionsController>(SecurityDevicesSessionsController)
  .to(SecurityDevicesSessionsController);
container.bind<BlogsController>(BlogsController).to(BlogsController);
container.bind<CommentsController>(CommentsController).to(CommentsController);
container.bind<PostsController>(PostsController).to(PostsController);
container.bind<UsersController>(UsersController).to(UsersController);
