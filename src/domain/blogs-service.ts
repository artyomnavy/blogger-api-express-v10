import {ObjectId} from "mongodb";
import {BlogsRepository} from "../repositories/blogs-db-repository";
import {CreateAndUpdateBlogModel} from "../types/blog/input";
import {Blog, OutputBlogType} from "../types/blog/output";

export class BlogsService {
    constructor(protected blogsRepository: BlogsRepository) {
    }
    async createBlog(createData: CreateAndUpdateBlogModel): Promise<OutputBlogType> {

        const newBlog = new Blog(
            new ObjectId(),
            createData.name,
            createData.description,
            createData.websiteUrl,
            new Date(),
            false
        )

        const createdBlog = await this.blogsRepository
            .createBlog(newBlog)

        return createdBlog
    }
    async updateBlog(id: string, updateData: CreateAndUpdateBlogModel): Promise<boolean> {
        return await this.blogsRepository
            .updateBlog(id, updateData)
    }
    async deleteBlog(id: string): Promise<boolean> {
        return await this.blogsRepository
            .deleteBlog(id)
    }
}