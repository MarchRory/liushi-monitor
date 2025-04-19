import { User } from '@prisma/client'

import { Exclude } from "class-transformer";

export class UserItemEntity {
    id: number;
    userName: string;
    account: string;
    password: string;
    userType: number;

    @Exclude()
    isDeleted: boolean;

    constructor(model: Partial<User>) {
        Object.assign(this, model);
    }
}
