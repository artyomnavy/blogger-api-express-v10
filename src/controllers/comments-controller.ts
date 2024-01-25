import {Params, RequestWithParams, RequestWithParamsAndBody} from "../types/common";
import {CreateAndUpdateCommentModel} from "../types/comment/input";
import {Response} from "express";
import {CommentsQueryRepository} from "../repositories/comments-db-query-repository";
import {HTTP_STATUSES, likesStatuses} from "../utils";
import {CommentsService} from "../domain/comments-service";
import {JwtService} from "../application/jwt-service";

export class CommentsController {
    constructor(protected commentsService: CommentsService,
                protected commentsQueryRepository: CommentsQueryRepository,
                protected jwtService: JwtService) {
    }
    async updateComment(req: RequestWithParamsAndBody<Params, CreateAndUpdateCommentModel>, res: Response) {
        const userId = req.userId!
        const commentId = req.params.id
        const content = req.body

        const comment = await this.commentsQueryRepository
            .getCommentById(commentId, userId)

        if (!comment) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        } else if (comment.commentatorInfo.userId !== userId) {
            res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
            return
        }

        const isUpdated = await this.commentsService
            .updateComment(commentId, content)

        if (isUpdated) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        }
    }
    async deleteComment(req: RequestWithParams<Params>, res: Response) {
        const userId = req.userId!
        const commentId = req.params.id

        const comment = await this.commentsQueryRepository
            .getCommentById(commentId, userId)

        if (!comment) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        } else if (comment.commentatorInfo.userId !== userId) {
            res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
            return
        }

        const isDeleted = await this.commentsService
            .deleteComment(commentId)

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return
        }
    }
    async getComment(req: RequestWithParams<Params>, res: Response) {
        const commentId = req.params.id
        const userId = req.userId

        if (!userId) {
            const comment = await this.commentsQueryRepository
                .getCommentById(commentId)

            if (!comment) {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
                return
            } else {
                res.send(comment)
                return
            }
        }

        const comment = await this.commentsQueryRepository
            .getCommentById(commentId, userId)

        if (!comment) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        } else {
            res.send(comment)
        }
    }
    async changeLikeStatusForComment(req: RequestWithParamsAndBody<Params, {likeStatus: string}>, res: Response) {
        const userId = req.userId!
        const commentId = req.params.id
        const likeStatus = req.body.likeStatus

        const comment = await this.commentsQueryRepository
            .getCommentById(commentId, userId)

        if (!comment) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        const currentMyStatus = comment.likesInfo.myStatus
        const likesCount = comment.likesInfo.likesCount
        const dislikesCount = comment.likesInfo.dislikesCount

        if (likeStatus === currentMyStatus) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return
        }

        if (currentMyStatus === likesStatuses.none) {
            await this.commentsService
                .createLikeStatus(commentId, userId, likeStatus)
        }

        if (likeStatus === likesStatuses.none) {
            await this.commentsService
                .deleteLikeStatus(commentId, userId)
        }

        await this.commentsService
            .updateLikeStatus(commentId, userId, likeStatus)

        const isUpdated = await this.commentsService
            .changeLikeStatusCommentForUser(commentId, likeStatus, likesCount, dislikesCount, currentMyStatus)

        if (isUpdated) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        }
    }
}