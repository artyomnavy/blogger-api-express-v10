import {Router} from "express";
import {authBearerMiddleware, authRefreshTokenMiddleware} from "../middlewares/auth/auth-middleware";
import {
    userAuthValidation,
    userConfirmEmailValidation, userEmailValidation, userNewPasswordValidation, userRecoveryCodeValidation,
    userRegistrationCodeValidation,
    userValidation
} from "../middlewares/validators/users-validator";
import {attemptsMiddleware} from "../middlewares/auth/attempts-middleware";
import {recoveryPasswordMiddleware} from "../middlewares/auth/recovery-password-middleware";
import {authController} from "../composition-root";

export const authRouter = Router({})

authRouter
    .post('/login',
    attemptsMiddleware,
    userAuthValidation(),
    authController.loginUser.bind(authController))

    .post('/password-recovery',
    attemptsMiddleware,
    userEmailValidation(),
    authController.sendEmailForRecoveryPassword.bind(authController))

    .post('/new-password',
        attemptsMiddleware,
        userRecoveryCodeValidation(),
        userNewPasswordValidation(),
        recoveryPasswordMiddleware,
        authController.changePasswordForRecovery.bind(authController))

    .post('/refresh-token',
        authRefreshTokenMiddleware,
        authController.getNewPairTokens.bind(authController))

    .post('/logout',
        authRefreshTokenMiddleware,
        authController.logoutUser.bind(authController))

    .post('/registration',
        attemptsMiddleware,
        userValidation(),
        authController.createUserByRegistration.bind(authController))

    .post('/registration-confirmation',
        attemptsMiddleware,
        userRegistrationCodeValidation(),
        authController.sendEmailForConfirmRegistration.bind(authController))

    .post('/registration-email-resending',
        attemptsMiddleware,
        userConfirmEmailValidation(),
        authController.resendEmailForConfirmRegistration.bind(authController))

    .get('/me',
        authBearerMiddleware,
        authController.getInfoAboutSelf.bind(authController))