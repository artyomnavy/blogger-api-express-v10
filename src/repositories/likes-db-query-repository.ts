import {LikeModelClass} from "../db/db";

export class LikesQueryRepository {
    async getLikeStatusCommentForUser(commentId: string, userId: string): Promise<string | null> {
        const likeStatus = await LikeModelClass
            .findOne({commentId: commentId, userId: userId})
        if (!likeStatus) {
            return null
        } else {
            return likeStatus.status
        }
    }
}