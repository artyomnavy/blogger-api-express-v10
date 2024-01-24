import {
    Params,
    RequestWithBody, RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from "../types/common";
import {CreateAndUpdateCommentModel, PaginatorCommentModel} from "../types/comment/input";
import {Response} from "express";
import {PostsQueryRepository} from "../repositories/posts-db-query-repository";
import {HTTP_STATUSES} from "../utils";
import {CommentsQueryRepository} from "../repositories/comments-db-query-repository";
import {UsersQueryRepository} from "../repositories/users-db-query-repository";
import {CommentsService} from "../domain/comments-service";
import {CreateAndUpdatePostModel, PaginatorPostModel} from "../types/post/input";
import {PostsService} from "../domain/posts-service";
import {JwtService} from "../application/jwt-service";

export class PostsController {
    constructor(protected postsService: PostsService,
                protected postsQueryRepository: PostsQueryRepository,
                protected usersQueryRepository: UsersQueryRepository,
                protected commentsQueryRepository: CommentsQueryRepository,
                protected commentsService: CommentsService,
                protected jwtService: JwtService) {
    }
    async getCommentsForPost(req: RequestWithParamsAndQuery<Params, PaginatorCommentModel>, res: Response) {
        const postId = req.params.id
        const userId = req.userId

        let {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection
        } = req.query

        const post = await this.postsQueryRepository
            .getPostById(postId)

        if (!post) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        if (!userId) {
            const comments = await this.commentsQueryRepository
                .getCommentsByPostId({
                    pageNumber,
                    pageSize,
                    sortBy,
                    sortDirection,
                    postId
                })

            res.send(comments)
            return
        }

        const comments = await this.commentsQueryRepository
            .getCommentsByPostId({
                pageNumber,
                pageSize,
                sortBy,
                sortDirection,
                postId,
                userId
            })

        res.send(comments)
    }
    async createCommentForPost(req: RequestWithParamsAndBody<Params, CreateAndUpdateCommentModel>, res: Response) {
        const postId = req.params.id
        const userId = req.userId!

        const post = await this.postsQueryRepository
            .getPostById(postId)

        if (!post) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        const user = await this.usersQueryRepository
            .getUserById(userId)

        const userLogin = user!.login

        let content = req.body

        const newComment = await this.commentsService
            .createComment(postId, userId, userLogin, content)

        res.status(HTTP_STATUSES.CREATED_201).send(newComment)
    }
    async getAllPosts(req: RequestWithQuery<PaginatorPostModel>, res: Response) {
        let {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection
        } = req.query

        const posts = await this.postsQueryRepository
            .getAllPosts({
                pageNumber,
                pageSize,
                sortBy,
                sortDirection
            })
        res.send(posts)
    }
    async createPost(req: RequestWithBody<CreateAndUpdatePostModel>, res: Response) {
        let {
            title,
            shortDescription,
            content,
            blogId
        } = req.body

        const newPost = await this.postsService
            .createPost({
                title,
                shortDescription,
                content,
                blogId
            })

        res.status(HTTP_STATUSES.CREATED_201).send(newPost)
    }
    async getPost(req: RequestWithParams<Params>, res: Response) {
        const id = req.params.id

        let post = await this.postsQueryRepository
            .getPostById(id)

        if (!post) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        } else {
            res.send(post)
        }
    }
    async updatePost(req: RequestWithParamsAndBody<Params, CreateAndUpdatePostModel>, res: Response) {
        const id = req.params.id
        let {
            title,
            shortDescription,
            content,
            blogId
        } = req.body

        const post = await this.postsQueryRepository
            .getPostById(id)

        if (!post) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        let isUpdated = await this.postsService
            .updatePost(id, {
                title,
                shortDescription,
                content,
                blogId
            })

        if (isUpdated) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        }
    }
    async deletePost(req: RequestWithParams<Params>, res: Response) {
        const id = req.params.id

        const isDeleted = await this.postsService
            .deletePost(id)

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    }
}