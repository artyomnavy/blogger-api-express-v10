import {CommentType, OutputCommentType} from "../types/comment/output";
import {ObjectId, WithId} from "mongodb";
import {CommentModelClass} from "../db/db";
import {commentMapper} from "../types/comment/mapper";
import {CreateAndUpdateCommentModel} from "../types/comment/input";
import {likesStatuses} from "../utils";

export class CommentsRepository {
    async deleteComment(id: string): Promise<boolean>{
        const resultDeleteComment = await CommentModelClass
            .deleteOne({_id: new ObjectId(id)})
        return resultDeleteComment.deletedCount === 1
    }
    async createComment(newComment: WithId<CommentType>): Promise<OutputCommentType> {
        const resultCreateComment = await CommentModelClass
            .create(newComment)
        return commentMapper(newComment)
    }
    async updateComment(id: string, updateData: CreateAndUpdateCommentModel): Promise<boolean>{
        const resultUpdateComment = await CommentModelClass
            .updateOne({_id: new ObjectId(id)}, {
                $set: {
                    content: updateData.content
                }
            })
        return resultUpdateComment.matchedCount === 1
    }
    async changeLikeStatusCommentForUser(
        commentId: string,
        likeStatus: string,
        likesCount: number,
        dislikesCount: number): Promise<boolean> {

        const resultUpdateLikeStatus = await CommentModelClass
            .updateOne({
                _id: new ObjectId(commentId)
            }, {
                $set: {
                    'likesInfo.likesCount': likesCount,
                    'likesInfo.dislikesCount': dislikesCount,
                    'likesInfo.myStatus': likeStatus
                }
            })
        return resultUpdateLikeStatus.matchedCount === 1
    }
}