import {Params, RequestWithBody, RequestWithParams, RequestWithQuery} from "../types/common";
import {CreateUserModel, PaginatorUserModel} from "../types/user/input";
import {Response} from "express";
import {UsersService} from "../domain/users-service";
import {HTTP_STATUSES} from "../utils";
import {UsersQueryRepository} from "../repositories/users-db-query-repository";

export class UsersController {
    constructor(protected usersService: UsersService,
                protected usersQueryRepository: UsersQueryRepository) {
    }
    async getAllUsers(req: RequestWithQuery<PaginatorUserModel>, res: Response) {
        let {
            sortBy,
            sortDirection,
            pageNumber,
            pageSize,
            searchLoginTerm,
            searchEmailTerm
        } = req.query

        const users = await this.usersQueryRepository
            .getAllUsers({
                sortBy,
                sortDirection,
                pageNumber,
                pageSize,
                searchLoginTerm,
                searchEmailTerm
            })

        res.send(users)
    }
    async createUserByAdmin(req: RequestWithBody<CreateUserModel>, res: Response) {
        let {
            login,
            password,
            email
        } = req.body

        const newUser = await this.usersService
            .createUserByAdmin({login, password, email})
        res.status(HTTP_STATUSES.CREATED_201).send(newUser)
    }
    async deleteUser(req: RequestWithParams<Params>, res: Response) {
        const id = req.params.id

        const isDeleted = await this.usersService
            .deleteUser(id)

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    }
    async getUser(req: RequestWithParams<Params>, res: Response) {
        const id = req.params.id

        let user = await this.usersQueryRepository
            .getUserById(id)

        if (!user) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        } else {
            res.send(user)
        }
    }
}