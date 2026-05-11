import mongoose, { Model } from "mongoose";
import { IUser } from "./IUser.ts";
import { BaseRepository } from "../../base/BaseRepository.ts";
import { UserSchema } from "./User.ts";

export class UserRepository extends BaseRepository<IUser> {
    constructor(model: Model<IUser> = mongoose.model<IUser>('User', UserSchema)) {
        super(model);
    }
}
