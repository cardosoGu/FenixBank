import { IBaseInterface } from "../../base/IBaseInterface.ts";
import { Types } from "mongoose";

export enum TransactionType {
    DEPOSIT = 'DEPOSIT',
    WITHDRAW = 'WITHDRAW',
    TRANSFER = 'TRANSFER'
}
export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}

export interface ITransactionUser {
    userId: Types.ObjectId
    userBalanceAfterTransaction: number
}
export interface ITransactionReceiver {
    receiverId: Types.ObjectId
    receiverBalanceAfterTransaction: number
}

export interface ITransactionLog extends IBaseInterface {
    user: ITransactionUser
    receiver: ITransactionReceiver | null
    value: number
    status: TransactionStatus
    type: TransactionType
}
