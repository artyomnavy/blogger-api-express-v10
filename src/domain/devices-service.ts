import {DevicesRepository} from "../repositories/devices-db-repository";
import {DeviceSession, DeviceSessionType} from "../types/device/output";

export class DevicesService {
    constructor(protected devicesRepository: DevicesRepository) {
    }
    async createDeviceSession(inputData: DeviceSessionType) {

        const newDeviceSession = new DeviceSession(
            inputData.iat,
            inputData.exp,
            inputData.ip,
            inputData.deviceId,
            inputData.deviceName,
            inputData.userId
        )

        const createdDeviceSession = await this.devicesRepository
            .createDeviceSession(newDeviceSession)

        return createdDeviceSession
    }
    async updateDeviceSession(updateData: DeviceSessionType): Promise<boolean> {
        return await this.devicesRepository
            .updateDeviceSession(updateData)
    }
    async terminateDeviceSessionByLogout(deviceId: string, userId: string): Promise<boolean>{
        return await this.devicesRepository
            .terminateDeviceSessionByLogout(deviceId, userId)
    }
    async terminateAllOthersDevicesSessions(userId: string, deviceId: string): Promise<boolean>{
        return await this.devicesRepository
            .terminateAllOthersDevicesSessions(userId, deviceId)
    }
    async terminateDeviceSessionById(deviceId: string): Promise<boolean>{
        return await this.devicesRepository
            .terminateDeviceSessionById(deviceId)
    }
}
