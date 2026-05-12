import mongoose from "mongoose";
import { IUser, IUserMethods, UserModel } from "./IUser.ts";
import { BaseRepository } from "../../base/BaseRepository.ts";
import { UserSchema } from "./User.ts";


export class UserRepository extends BaseRepository<IUser, IUserMethods> {
    constructor(model: UserModel = mongoose.model<IUser, UserModel>('User', UserSchema)) {
        super(model);
    }

    findByEmail(email: string) {
        return this.model.findOne({ email });
    }

    deleteSessionByRefreshToken(userId: string, refreshToken: string) {
        return this.model.updateOne(
            { _id: userId },
            {
                $pull: {
                    sessions: { refreshToken }
                }
            }
        );
    }
    deleteAllSessionsByUserId(userId: string) {
        return this.model.updateOne(
            { _id: userId },
            {
                $pull: {
                    sessions: {}
                }
            }
        );
    }

}
