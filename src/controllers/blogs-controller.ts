import {
    Params,
    RequestWithBody, RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from "../types/common";
import {CreateAndUpdateBlogModel, PaginatorBlogModel, PaginatorPostWithBlogIdModel} from "../types/blog/input";
import {Response} from "express";
import {BlogsQueryRepository} from "../repositories/blogs-db-query-repository";
import {BlogsService} from "../domain/blogs-service";
import {HTTP_STATUSES} from "../utils";
import {PostsQueryRepository} from "../repositories/posts-db-query-repository";
import {CreateAndUpdatePostModel} from "../types/post/input";
import {PostsService} from "../domain/posts-service";

export class BlogsController {
    constructor(protected blogsQueryRepository: BlogsQueryRepository,
                protected blogsService: BlogsService,
                protected postsQueryRepository: PostsQueryRepository,
                protected postsService: PostsService) {
    }
    async getAllBlogs(req: RequestWithQuery<PaginatorBlogModel>, res: Response) {
        let {
            searchNameTerm,
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        } = req.query

        const blogs = await this.blogsQueryRepository
            .getAllBlogs({
                searchNameTerm,
                sortBy,
                sortDirection,
                pageNumber,
                pageSize
            })

        res.send(blogs)
    }
    async createBlog(req: RequestWithBody<CreateAndUpdateBlogModel>, res: Response) {
        let {
            name,
            description,
            websiteUrl
        } = req.body

        const newBlog = await this.blogsService
            .createBlog({name, description, websiteUrl})

        res.status(HTTP_STATUSES.CREATED_201).send(newBlog)
    }
    async getPostsForBlog(req: RequestWithParamsAndQuery<Params, PaginatorPostWithBlogIdModel>, res: Response) {
        const blogId = req.params.id

        let {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
        } = req.query

        const blog = await this.blogsQueryRepository
            .getBlogById(blogId)

        if (!blog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        const posts = await this.postsQueryRepository
            .getPostsByBlogId(
                {
                    pageNumber,
                    pageSize,
                    sortBy,
                    sortDirection,
                    blogId
                }
            )

        res.send(posts)
    }
    async createPostForBlog(req: RequestWithParamsAndBody<Params, CreateAndUpdatePostModel>, res: Response) {
        const blogId = req.params.id

        const blog = await this.blogsQueryRepository
            .getBlogById(blogId)

        if (!blog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        let {
            title,
            shortDescription,
            content
        } = req.body

        const post = await this.postsService.createPost({
            title,
            shortDescription,
            content,
            blogId,
        })

        res.status(HTTP_STATUSES.CREATED_201).send(post)
    }
    async getBlog(req: RequestWithParams<Params>, res: Response) {
        const id = req.params.id

        const blog = await this.blogsQueryRepository
            .getBlogById(id)

        if (!blog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        } else {
            res.send(blog)
        }
    }
    async updateBlog(req: RequestWithParamsAndBody<Params, CreateAndUpdateBlogModel>, res: Response) {
        const id = req.params.id

        let {
            name,
            description,
            websiteUrl
        } = req.body

        const blog = await this.blogsQueryRepository
            .getBlogById(id)

        if (!blog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        let isUpdated = await this.blogsService
            .updateBlog(id, {
                name,
                description,
                websiteUrl
            })

        if (isUpdated) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        }
    }
    async deleteBlog(req: RequestWithParams<Params>, res: Response) {
        const id = req.params.id

        const isDeleted = await this.blogsService
            .deleteBlog(id)

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    }
}