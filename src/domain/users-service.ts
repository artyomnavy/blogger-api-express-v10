import {CreateUserModel} from "../types/user/input";
import {OutputUserType, User} from "../types/user/output";
import {ObjectId} from "mongodb";
import {UsersRepository} from "../repositories/users-db-repository";
import bcrypt from 'bcrypt';
import {AuthLoginModel} from "../types/auth/input";
import {UsersQueryRepository} from "../repositories/users-db-query-repository";

export class UsersService {
    constructor(protected usersRepository: UsersRepository,
                protected usersQueryRepository: UsersQueryRepository) {
    }
    async createUserByAdmin(createData: CreateUserModel): Promise<OutputUserType> {
        const passwordHash = await bcrypt.hash(createData.password, 10)

        const newUser = new User(
            new ObjectId(),
            {
                login: createData.login,
                password: passwordHash,
                email: createData.email,
                createdAt: new Date()
            },
            {
                confirmationCode: null,
                expirationDate: null,
                isConfirmed: true
            }
        )

        const createdUser = await this.usersRepository
            .createUser(newUser)

        return createdUser
    }
    async checkCredentials(inputData: AuthLoginModel) {
        const user = await this.usersQueryRepository
            .getUserByLoginOrEmail(inputData.loginOrEmail)

        if (!user) {
            return null
        }

        if (!user.emailConfirmation.isConfirmed) {
            return null
        }

        const checkPassword = await bcrypt.compare(inputData.password, user.accountData.password)

        if (!checkPassword) {
            return null
        } else {
            return user
        }
    }
    async deleteUser(id: string): Promise<boolean> {
        return await this.usersRepository
            .deleteUser(id)
    }
}