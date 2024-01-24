import {CreateUserModel} from "../types/user/input";
import {OutputUserType, User} from "../types/user/output";
import bcrypt from "bcrypt";
import {ObjectId} from "mongodb";
import {v4 as uuidv4} from 'uuid';
import {UsersRepository} from "../repositories/users-db-repository";
import {EmailsManager} from "../managers/emails-manager";
import {UsersQueryRepository} from "../repositories/users-db-query-repository";
import {add} from "date-fns/add";
import {AttemptType} from "../types/auth/output";
import {AuthRepository} from "../repositories/auth-db-repository";

export class AuthService {
    constructor(protected usersRepository: UsersRepository,
                protected usersQueryRepository: UsersQueryRepository,
                protected authRepository: AuthRepository,
                protected emailsManager: EmailsManager) {
    }
    async createUserByRegistration(createData: CreateUserModel): Promise<OutputUserType | null> {
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
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(), {
                    minutes: 10
                }),
                isConfirmed: false
            }
        )

        const createdUser = await this.usersRepository
            .createUser(newUser)

        try {
            await this.emailsManager
                .sendEmailConfirmationMessage(newUser.accountData.email, newUser.emailConfirmation.confirmationCode!)
        } catch(e) {
            console.error(e)
            return null
        }

        return createdUser
    }
    async updateConfirmationCode(email: string): Promise<string | null> {
        const newCode = uuidv4()
        const newExpirationDate = add(new Date(), {
            minutes: 10
        })

        const isUpdated = await this.usersRepository
            .updateConfirmationCode(email, newCode, newExpirationDate)

        if (isUpdated) {
            return newCode
        } else {
            return null
        }
    }
    async confirmEmail(code: string): Promise<boolean> {
        const user = await this.usersQueryRepository
            .getUserByConfirmationCode(code)

        return await this.usersRepository
            .updateConfirmStatus(user!._id)
    }
    async resendingEmail(email: string, newCode: string) {
        try {
            await this.emailsManager
                .sendEmailConfirmationMessage(email, newCode)
        } catch (e) {
            console.error(e)
            return false
        }

        return true
    }
    async addAttempt(attempt: AttemptType): Promise<AttemptType> {
        return await this.authRepository
            .addAttempt(attempt)
    }
    async sendEmailForPasswordRecovery(email: string, recoveryCode: string) {
        try {
            await this.emailsManager
                .sendEmailWithRecoveryCode(email, recoveryCode)
        } catch(e) {
            console.error(e)
            return false
        }

        return true
    }
    async updatePasswordForRecovery(recoveryCode: string, newPassword: string) {
        const newPasswordHash = await bcrypt.hash(newPassword, 10)

        return await this.usersRepository
            .updatePasswordForRecovery(recoveryCode, newPasswordHash)
    }
}