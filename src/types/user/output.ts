import {ObjectId} from "mongodb";

export type OutputUserType = {
    id: string,
    login: string,
    email: string,
    createdAt: string
}

export type PaginatorUsersType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: OutputUserType[]
}

export type UserType = {
    login: string,
    password: string,
    email: string,
    createdAt: Date
}

export type EmailConfirmationType = {
        confirmationCode: string | null,
        expirationDate: Date | null,
        isConfirmed: boolean
}

export type UserAccountType = {
    accountData: UserType,
    emailConfirmation: EmailConfirmationType
}

export class User {
    constructor(public _id: ObjectId,
                public accountData: UserType,
                public emailConfirmation: EmailConfirmationType
                ) {
    }
}