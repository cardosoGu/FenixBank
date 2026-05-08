import mongoose from "mongoose";
import { User } from "../models/userModel.ts";
import { typeUserSchema, typeUserSessionSchema } from "../types/userDataType.ts";

class UserRepositoryClass {
    constructor(private userModel: typeof User) {}

    findByEmail(email: string) {
        return this.userModel.findOne({ email });
    }

    findById(id: string) {
        return this.userModel.findById(id);
    }

    create(userData: typeUserSchema) {
        return this.userModel.create(userData);
    }

    updateById(userId: string, updateData: Partial<typeUserSchema>) {
        return this.userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );
    }

    deleteById(userId: string) {
        return this.userModel.findByIdAndDelete(userId);
    }

    findTransactionLogs(userId: string) {
        return this.userModel.findById(userId).populate("transactionLogs");
    }

    addPixKey(userId: string, newPixKey: string) {
        return this.userModel.findByIdAndUpdate(
            userId,
            { $push: { "account.pixKeys": newPixKey } },
            { new: true }
        );
    }

    addTransactionLog(userId: string, transactionLogId: string) {
        return this.userModel.findByIdAndUpdate(
            userId,
            { $push: { transactionLogs: new mongoose.Types.ObjectId(transactionLogId) } },
            { new: true }
        );
    }

    addSession(userId: string, sessionData: typeUserSessionSchema) {
        return this.userModel.findByIdAndUpdate(
            userId,
            { $push: { sessions: sessionData } },
            { new: true }
        );
    }

    getSessions(userId: string) {
        return this.userModel.findById(userId).select("sessions");
    }

    removeSession(userId: string, refreshToken: string) {
        return this.userModel.findByIdAndUpdate(
            userId,
            { $pull: { sessions: { refreshToken } } },
            { new: true }
        );
    }

    getBalance(userId: string) {
        return this.userModel.findById(userId).select("account.balance");
    }
}

export const UserRepository = new UserRepositoryClass(User);
