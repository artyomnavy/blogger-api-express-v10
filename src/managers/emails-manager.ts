import {EmailsAdapter} from "../adapters/EmailsAdapter";

export class EmailsManager {
    constructor(protected emailsAdapter: EmailsAdapter) {
    }
    async sendEmailConfirmationMessage(email: string, code: string) {
        return await this.emailsAdapter
            .sendEmailWithCode(email, code)
    }
    async sendEmailWithRecoveryCode(email: string, recoveryCode: string) {
        return await this.emailsAdapter
            .sendEmailWithRecoveryCode(email, recoveryCode)
    }
}