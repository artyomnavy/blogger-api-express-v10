import {Router} from "express";
import {authBasicMiddleware, authBearerMiddleware} from "../middlewares/auth/auth-middleware";
import {objectIdValidation} from "../middlewares/validators/objectId-validator";
import {postValidation} from "../middlewares/validators/posts-validator";
import {commentValidation} from "../middlewares/validators/comments-validator";
import {postsController} from "../composition-root";
import {accessTokenVerification} from "../middlewares/auth/accessToken-verificator";

export const postsRouter = Router({})

postsRouter
    .post('/',
        authBasicMiddleware,
        postValidation(),
        postsController.createPost.bind(postsController))

    .post('/:id/comments',
        authBearerMiddleware,
        objectIdValidation,
        commentValidation(),
        postsController.createCommentForPost.bind(postsController))

    .put('/:id',
        authBasicMiddleware,
        objectIdValidation,
        postValidation(),
        postsController.updatePost.bind(postsController))

    .delete('/:id',
        authBasicMiddleware,
        objectIdValidation,
        postsController.deletePost.bind(postsController))

    .get('/',
        postsController.getAllPosts.bind(postsController))

    .get('/:id',
        objectIdValidation,
        postsController.getPost.bind(postsController))

    .get('/:id/comments',
        objectIdValidation,
        accessTokenVerification,
        postsController.getCommentsForPost.bind(postsController))