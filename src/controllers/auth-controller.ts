import {RequestWithBody} from "../types/common";
import {AuthLoginModel} from "../types/auth/input";
import {Request, Response} from "express";
import {v4 as uuidv4} from "uuid";
import {UsersService} from "../domain/users-service";
import {HTTP_STATUSES} from "../utils";
import {JwtService} from "../application/jwt-service";
import {DevicesService} from "../domain/devices-service";
import {UsersQueryRepository} from "../repositories/users-db-query-repository";
import {AuthService} from "../domain/auth-service";
import {CreateUserModel} from "../types/user/input";

export class AuthController {
    constructor(protected authService: AuthService,
                protected usersService: UsersService,
                protected usersQueryRepository: UsersQueryRepository,
                protected devicesService: DevicesService,
                protected jwtService: JwtService) {
    }
    async loginUser(req: RequestWithBody<AuthLoginModel>, res: Response) {
        const {
            loginOrEmail,
            password
        } = req.body

        const deviceId = uuidv4()
        const ip = req.ip! || 'unknown'
        const deviceName = req.headers['user-agent'] || 'unknown'

        const user = await this.usersService
            .checkCredentials({loginOrEmail, password})

        if (!user) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
            return
        } else {
            const userId = user._id.toString()

            const accessToken = await this.jwtService
                .createAccessJWT(userId)

            const refreshToken = await this.jwtService
                .createRefreshJWT(deviceId, userId)

            const payloadRefreshToken = await this.jwtService
                .getPayloadByToken(refreshToken)

            const iat = new Date(payloadRefreshToken.iat * 1000)
            const exp = new Date(payloadRefreshToken.exp * 1000)

            await this.devicesService
                .createDeviceSession({iat, exp, ip, deviceId, deviceName, userId})

            res
                .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
                .status(HTTP_STATUSES.OK_200).send({accessToken: accessToken})
        }
    }
    async sendEmailForRecoveryPassword(req: RequestWithBody<{email: string}>, res: Response) {
        const email = req.body.email

        const user = await this.usersQueryRepository
            .getUserByEmail(email)

        if (!user) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return
        }

        const newCode = await this.authService
            .updateConfirmationCode(email)

        if (newCode) {
            const isSend = await this.authService
                .sendEmailForPasswordRecovery(email, newCode)

            if (!isSend) {
                res
                    .status(HTTP_STATUSES.IM_A_TEAPOT_418)
                    .send('Recovery code don\'t sended to passed email address, try later')
                return
            }

            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        }
    }
    async changePasswordForRecovery(req: RequestWithBody<{recoveryCode: string, newPassword: string}>, res: Response) {
        const recoveryCode = req.body.recoveryCode
        const newPassword = req.body.newPassword

        const isUpdate = await this.authService
            .updatePasswordForRecovery(recoveryCode, newPassword)

        if (isUpdate) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        }
    }
    async getNewPairTokens(req: Request, res: Response) {
        const userId = req.userId!
        const deviceId = req.deviceId!

        const newIp = req.ip! || 'unknown'
        const newDeviceName = req.headers['user-agent'] || 'unknown'

        const newAccessToken = await this.jwtService
            .createAccessJWT(userId)

        const newRefreshToken = await this.jwtService
            .createRefreshJWT(deviceId, userId)

        const newPayloadRefreshToken = await this.jwtService
            .getPayloadByToken(newRefreshToken)

        const newIat = new Date(newPayloadRefreshToken.iat * 1000)
        const newExp = new Date(newPayloadRefreshToken.exp * 1000)

        const isUpdateDeviceSession = await this.devicesService
            .updateDeviceSession({
                iat: newIat,
                exp: newExp,
                ip: newIp,
                deviceId: deviceId,
                deviceName: newDeviceName,
                userId: userId
            })

        if (isUpdateDeviceSession) {
            res
                .cookie('refreshToken', newRefreshToken, {httpOnly: true, secure: true})
                .status(HTTP_STATUSES.OK_200).send({accessToken: newAccessToken})
        }
    }
    async logoutUser(req: Request, res: Response) {
        const userId = req.userId!
        const deviceId = req.deviceId!

        const isTerminateDeviceSession = await this.devicesService
            .terminateDeviceSessionByLogout(deviceId, userId)

        if (isTerminateDeviceSession) {
            res
                .clearCookie('refreshToken')
                .sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        }
    }
    async createUserByRegistration(req: RequestWithBody<CreateUserModel>, res: Response) {
        const {
            login,
            password,
            email
        } = req.body

        const user = await this.authService
            .createUserByRegistration({login, password, email})

        if (!user) {
            res
                .status(HTTP_STATUSES.IM_A_TEAPOT_418)
                .send('Confirm code don\'t sended to passed email address, try later')
            return
        }

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }
    async sendEmailForConfirmRegistration(req: RequestWithBody<{code: string}>, res: Response) {
        const code = req.body.code

        await this.authService
            .confirmEmail(code)

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }
    async resendEmailForConfirmRegistration(req: RequestWithBody<{email: string}>, res: Response) {
        const email = req.body.email

        const newCode = await this.authService
            .updateConfirmationCode(email)

        if (newCode) {
            const isResend = await this.authService
                .resendingEmail(email, newCode)

            if (!isResend) {
                res
                    .status(HTTP_STATUSES.IM_A_TEAPOT_418)
                    .send('Confirm code don\'t sended to passed email address, try later')
                return
            }

            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        }
    }
    async getInfoAboutSelf(req: Request, res: Response) {
        const authMe = await this.usersQueryRepository
            .getUserByIdForAuthMe(req.userId!)

        res.send(authMe)
    }
}