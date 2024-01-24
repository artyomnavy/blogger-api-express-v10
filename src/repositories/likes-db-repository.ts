import {Likes} from "../types/comment/output";
import {LikeModelClass} from "../db/db";
import {ObjectId} from "mongodb";

export class LikesRepository {
    async createLikeStatus(
        commentId: string,
        userId: string,
        likeStatus: string): Promise<Likes> {

        await LikeModelClass.create({
                commentId: commentId,
                userId: userId,
                status: likeStatus})

        return {
            commentId: commentId,
            userId: userId,
            status: likeStatus
        }
    }
    async deleteLikeStatus(commentId: string, userId: string): Promise<boolean> {
        const resultDeleteLikeStatus = await LikeModelClass
            .deleteOne({commentId: commentId, userId: userId})
        return resultDeleteLikeStatus.deletedCount === 1
    }
    async updateLikeStatus(commentId: string, userId: string, likeStatus: string): Promise<boolean> {
        const resultUpdateLikeStatus = await LikeModelClass
            .updateOne({
                commentId: commentId,
                userId: userId
            }, {
                $set: {
                    status: likeStatus
                }
            })
        return resultUpdateLikeStatus.matchedCount === 1
    }
}