import {OutputUserType, UserAccountType} from "../types/user/output";
import {ObjectId, WithId} from "mongodb";
import {UserModelClass} from "../db/db";
import {userMapper} from "../types/user/mapper";

export class UsersRepository {
    async createUser(newUser: WithId<UserAccountType>): Promise<OutputUserType> {
        const resultCreateUser = await UserModelClass
            .create(newUser)
        return userMapper(newUser)
    }
    async deleteUser(id: string): Promise<boolean> {
        const resultDeleteUser = await UserModelClass
            .deleteOne({_id: new ObjectId(id)})
        return resultDeleteUser.deletedCount === 1
    }
    async updateConfirmStatus(_id: ObjectId): Promise<boolean> {
        const resultUpdateConfirmStatus = await UserModelClass
            .updateOne({_id}, {
                $set: {'emailConfirmation.isConfirmed': true}
            })
        return resultUpdateConfirmStatus.modifiedCount === 1
    }
    async updateConfirmationCode(email: string, newCode: string, newExpirationDate: Date): Promise<boolean> {
        const resultUpdateConfirmationCode = await UserModelClass
            .updateOne({'accountData.email': email}, {
                $set: {
                    'emailConfirmation.confirmationCode': newCode,
                    'emailConfirmation.expirationDate': newExpirationDate
                }
            })
        return resultUpdateConfirmationCode.modifiedCount === 1
    }
    async updatePasswordForRecovery(recoveryCode: string, newPassword: string): Promise<boolean> {
        const resultUpdatePassword = await UserModelClass
            .updateOne({'emailConfirmation.confirmationCode': recoveryCode}, {
                $set: {
                    'accountData.password': newPassword
                }
            })
        return resultUpdatePassword.modifiedCount === 1
    }
}