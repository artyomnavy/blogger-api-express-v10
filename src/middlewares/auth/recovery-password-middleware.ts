import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils";
import {usersQueryRepository} from "../../composition-root";

export const recoveryPasswordMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const recoveryCode = req.body.recoveryCode
    const newPassword = req.body.newPassword

    const isOldPassword = await usersQueryRepository
        .checkUserPasswordForRecovery(recoveryCode, newPassword)

    if (isOldPassword) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }

    next()
}