import {Router} from "express";
import {objectIdValidation} from "../middlewares/validators/objectId-validator";
import {likeStatusForCommentValidation, commentValidation} from "../middlewares/validators/comments-validator";
import {authBearerMiddleware} from "../middlewares/auth/auth-middleware";
import {commentsController} from "../composition-root";
import {accessTokenVerification} from "../middlewares/auth/accessToken-verificator";

export const commentsRouter = Router({})

commentsRouter
    .put('/:id',
        authBearerMiddleware,
        objectIdValidation,
        commentValidation(),
        commentsController.updateComment.bind(commentsController))

    .put('/:id/like-status',
        authBearerMiddleware,
        objectIdValidation,
        likeStatusForCommentValidation(),
        commentsController.changeLikeStatusForComment.bind(commentsController))

    .delete('/:id',
        authBearerMiddleware,
        objectIdValidation,
        commentsController.deleteComment.bind(commentsController))

    .get('/:id',
        objectIdValidation,
        accessTokenVerification,
        commentsController.getComment.bind(commentsController))