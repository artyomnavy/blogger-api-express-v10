import {Router} from "express";
import {authBasicMiddleware} from "../middlewares/auth/auth-middleware";
import {userValidation} from "../middlewares/validators/users-validator";
import {objectIdValidation} from "../middlewares/validators/objectId-validator";
import {usersController} from "../composition-root";

export const usersRouter = Router({})

usersRouter
    .post('/',
        authBasicMiddleware,
        userValidation(),
        usersController.createUserByAdmin.bind(usersController))

    .delete('/:id',
        authBasicMiddleware,
        objectIdValidation,
        usersController.deleteUser.bind(usersController))

    .get('/',
        authBasicMiddleware,
        usersController.getAllUsers.bind(usersController))

    .get('/:id',
        authBasicMiddleware,
        objectIdValidation,
        usersController.getUser.bind(usersController))