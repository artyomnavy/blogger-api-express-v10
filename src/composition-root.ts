import {UsersRepository} from "./repositories/users-db-repository";
import {UsersQueryRepository} from "./repositories/users-db-query-repository";
import {UsersService} from "./domain/users-service";
import {UsersController} from "./controllers/users-controller";
import {PostsRepository} from "./repositories/posts-db-repository";
import {BlogsQueryRepository} from "./repositories/blogs-db-query-repository";
import {PostsQueryRepository} from "./repositories/posts-db-query-repository";
import {BlogsRepository} from "./repositories/blogs-db-repository";
import {CommentsQueryRepository} from "./repositories/comments-db-query-repository";
import {CommentsRepository} from "./repositories/comments-db-repository";
import {DevicesRepository} from "./repositories/devices-db-repository";
import {DevicesQueryRepository} from "./repositories/devices-db-query-repository";
import {AuthRepository} from "./repositories/auth-db-repository";
import {AuthQueryRepository} from "./repositories/auth-db-query-repository";
import {PostsService} from "./domain/posts-service";
import {DevicesService} from "./domain/devices-service";
import {CommentsService} from "./domain/comments-service";
import {BlogsService} from "./domain/blogs-service";
import {AuthService} from "./domain/auth-service";
import {PostsController} from "./controllers/posts-controller";
import {DevicesController} from "./controllers/devices-controller";
import {CommentsController} from "./controllers/comments-controller";
import {BlogsController} from "./controllers/blogs-controller";
import {EmailsAdapter} from "./adapters/EmailsAdapter";
import {EmailsManager} from "./managers/emails-manager";
import {JwtService} from "./application/jwt-service";
import {AuthController} from "./controllers/auth-controller";
import {LikesRepository} from "./repositories/likes-db-repository";
import {LikesQueryRepository} from "./repositories/likes-db-query-repository";

// Create instances repositories
export const usersQueryRepository = new UsersQueryRepository()
const usersRepository = new UsersRepository()

const postsQueryRepository = new PostsQueryRepository()
const postsRepository = new PostsRepository()

export const blogsQueryRepository = new BlogsQueryRepository()
const blogsRepository = new BlogsRepository()

const commentsQueryRepository = new CommentsQueryRepository()
const commentsRepository = new CommentsRepository()

export const devicesQueryRepository = new DevicesQueryRepository()
const devicesRepository = new DevicesRepository()

const authRepository = new AuthRepository()
export const authQueryRepository = new AuthQueryRepository()

const likesRepository = new LikesRepository()
export const likesQueryRepository = new LikesQueryRepository()

// Create instances for emails
const emailsAdapter = new EmailsAdapter()
const emailsManager = new EmailsManager(emailsAdapter)

// Create instances services
const usersService = new UsersService(usersRepository, usersQueryRepository)
const postsService = new PostsService(postsRepository, blogsQueryRepository)
const devicesService = new DevicesService(devicesRepository)
const commentsService = new CommentsService(commentsRepository, likesRepository)
const blogsService = new BlogsService(blogsRepository)
export const authService = new AuthService(
    usersRepository,
    usersQueryRepository,
    authRepository,
    emailsManager)
export const jwtService = new JwtService()

// Create instances controllers
export const usersController = new UsersController(usersService, usersQueryRepository)
export const postsController = new PostsController(
    postsService,
    postsQueryRepository,
    usersQueryRepository,
    commentsQueryRepository,
    commentsService,
    jwtService)
export const devicesController = new DevicesController(devicesService, devicesQueryRepository)
export const commentsController = new CommentsController(
    commentsService,
    commentsQueryRepository,
    jwtService)
export const blogsController = new BlogsController(
    blogsQueryRepository,
    blogsService,
    postsQueryRepository,
    postsService)
export const authController = new AuthController(
    authService,
    usersService,
    usersQueryRepository,
    devicesService,
    jwtService
)