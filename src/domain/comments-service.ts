import {CreateAndUpdateCommentModel} from "../types/comment/input";
import {OutputCommentType, Comment, Likes} from "../types/comment/output";
import {ObjectId} from "mongodb";
import {CommentsRepository} from "../repositories/comments-db-repository";
import {likesStatuses} from "../utils";
import {LikesRepository} from "../repositories/likes-db-repository";

export class CommentsService {
    constructor(protected commentsRepository: CommentsRepository,
                protected likesRepository: LikesRepository) {
    }
    async updateComment(id: string, updateData: CreateAndUpdateCommentModel): Promise<boolean> {
        return await this.commentsRepository
            .updateComment(id, updateData)
    }
    async deleteComment(id: string): Promise<boolean> {
        return this.commentsRepository
            .deleteComment(id)
    }
    async createComment(postId: string, userId: string, userLogin: string, createData: CreateAndUpdateCommentModel): Promise<OutputCommentType>{

        const newComment = new Comment (
            new ObjectId(),
            createData.content,
            {
                userId: userId,
                userLogin: userLogin
            },
            new Date(),
            postId,
            {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: likesStatuses.none
            }
        )

        const createdComment = await this.commentsRepository
            .createComment(newComment)

        return createdComment
    }
    async deleteLikeStatus(commentId: string, userId: string): Promise<boolean> {
        return await this.likesRepository
            .deleteLikeStatus(commentId, userId)
    }
    async createLikeStatus(commentId: string, userId: string, likeStatus: string): Promise<Likes> {
        return await this.likesRepository
            .createLikeStatus(commentId, userId, likeStatus)
    }

    async updateLikeStatus(commentId: string, userId: string, likeStatus: string): Promise<boolean> {
        return await this.likesRepository
            .updateLikeStatus(commentId, userId, likeStatus)
    }
    async changeLikeStatusCommentForUser(
        commentId: string,
        likeStatus: string,
        likesCount: number,
        dislikesCount: number,
        currentMyStatus: string): Promise<boolean> {

        if (likeStatus === likesStatuses.none && currentMyStatus === likesStatuses.like) {
            likesCount--
        }

        if (likeStatus === likesStatuses.like && currentMyStatus === likesStatuses.none) {
            likesCount++
        }

        if (likeStatus === likesStatuses.none && currentMyStatus === likesStatuses.dislike) {
            dislikesCount--
        }

        if (likeStatus === likesStatuses.dislike && currentMyStatus === likesStatuses.none) {
            dislikesCount++
        }

        if (likeStatus === likesStatuses.like && currentMyStatus === likesStatuses.dislike) {
            likesCount++
            dislikesCount--
        }

        if (likeStatus === likesStatuses.dislike && currentMyStatus === likesStatuses.like) {
            likesCount--
            dislikesCount++
        }

        return await this.commentsRepository
            .updateLikeStatusCommentForUser(commentId, likeStatus, likesCount, dislikesCount)
    }
}