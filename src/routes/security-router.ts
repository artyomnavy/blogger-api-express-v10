import {Router} from "express";
import {authRefreshTokenMiddleware} from "../middlewares/auth/auth-middleware";
import {deviceSessionMiddleware} from "../middlewares/device-middleware";
import {devicesController} from "../composition-root";

export const securityRouter = Router({})

securityRouter
    .delete('/devices',
        authRefreshTokenMiddleware,
        devicesController.terminateSessionsForAllOthersDevices.bind(devicesController))

    .delete('/devices/:id',
        authRefreshTokenMiddleware,
        deviceSessionMiddleware,
        devicesController.terminateSessionForDevice.bind(devicesController))

    .get('/devices',
        authRefreshTokenMiddleware,
        devicesController.getAllDevicesSessionsForUser.bind(devicesController))