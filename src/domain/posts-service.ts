import {OutputPostType, Post} from "../types/post/output";
import {CreateAndUpdatePostModel} from "../types/post/input";
import {ObjectId} from "mongodb";
import {PostsRepository} from "../repositories/posts-db-repository";
import {BlogsQueryRepository} from "../repositories/blogs-db-query-repository";

export class PostsService {
    constructor(protected postsRepository: PostsRepository,
                protected blogsQueryRepository: BlogsQueryRepository) {
    }
    async createPost(createData: CreateAndUpdatePostModel): Promise<OutputPostType> {
        const blog = await this.blogsQueryRepository
            .getBlogById(createData.blogId)

        const newPost = new Post(
            new ObjectId(),
            createData.title,
            createData.shortDescription,
            createData.content,
            createData.blogId,
            blog!.name,
            new Date()
        )

        const createdPost = await this.postsRepository
            .createPost(newPost)

        return createdPost
    }
    async updatePost(id: string, updateData: CreateAndUpdatePostModel): Promise<boolean> {
        return await this.postsRepository
            .updatePost(id, updateData)
    }
    async deletePost(id: string): Promise<boolean> {
        return this.postsRepository
            .deletePost(id)
    }
}