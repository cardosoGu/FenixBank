import { IBaseInterface } from "../../base/IBaseInterface.ts";
import { Types } from "mongoose";

export enum TransactionType {
    Deposit = 'deposit',
    Withdraw = 'withdraw',
    Transfer = 'transfer'
}
export enum TransactionStatus {
    Pending = 'pending',
    Completed = 'completed',
    Failed = 'failed'
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
