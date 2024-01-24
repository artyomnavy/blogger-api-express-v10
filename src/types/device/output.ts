import {ObjectId} from "mongodb";

export type DeviceSessionType = {
    iat: Date,
    exp: Date,
    ip: string,
    deviceId: string,
    deviceName: string,
    userId: string
}

export type OutputDeviceSessionType = {
    ip: string,
    title: string,
    lastActiveDate: string,
    deviceId: string
}

export class DeviceSession {
    constructor(
        public iat: Date,
        public exp: Date,
        public ip: string,
        public deviceId: string,
        public deviceName: string,
        public userId: string
    ) {
    }
}