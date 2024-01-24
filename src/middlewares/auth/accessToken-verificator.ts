import {NextFunction, Request, Response} from "express";
import {jwtService} from "../../composition-root";

export const accessTokenVerification = async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization

    if (!auth) {
        req.userId = null
        next()
        return
    }

    const accessToken = auth.split(' ')[1]

    const payloadToken = await jwtService
        .checkToken(accessToken)

    req.userId = payloadToken.userId
    next()
}