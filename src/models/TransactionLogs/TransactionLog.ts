import { Schema } from 'mongoose'
import { BaseSchema } from "../../base/BaseSchema.ts";
import { ITransactionReceiver, ITransactionUser, TransactionType, ITransactionLog, TransactionStatus } from "./ITransactionLog.ts";

const transactionUserSchema = new Schema<ITransactionUser>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, default: null },
    userBalanceAfterTransaction: { type: Number, required: true, min: 0, default: null },
})
const transactionReceiverSchema = new Schema<ITransactionReceiver>({
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true, default: null },
    receiverBalanceAfterTransaction: { type: Number, required: true, min: [0, 'Transaction value cant be negative'], default: null },
})

// methods class
class TransactionLogClass implements ITransactionLog {
    user!: ITransactionLog['user']
    receiver!: ITransactionLog['receiver']
    value!: ITransactionLog['value']
    status!: ITransactionLog['status']
    type!: ITransactionLog['type']
    constructor(data: ITransactionLog) {
        this.user = data.user
        this.receiver = data.receiver
        this.value = data.value
        this.status = data.status
        this.type = data.type
    }
    get isCompleted(): boolean {
        return this.status === TransactionStatus.Completed
    }

    get isTransfer(): boolean {
        return this.type === TransactionType.Transfer
    }

    get hasFailed(): boolean {
        return this.status === TransactionStatus.Failed
    }
}

// Schema Class
class TransactionLogSchemaClass extends BaseSchema {
    constructor() {
        super({
            user: { type: transactionUserSchema, required: true },
            receiver: {
                type: transactionReceiverSchema, default: null,
                required: function (this: ITransactionLog) {
                    return this.type === TransactionType.Transfer
                },
            },
            value: { type: Number, required: true, min: [0, 'Transaction value cant be negative'], default: null },
            status: { type: String, enum: Object.values(TransactionStatus), default: TransactionStatus.Pending, required: true },
            type: { type: String, enum: Object.values(TransactionType), required: true, default: null },
        })
    }
}

const transactionLogSchema = new TransactionLogSchemaClass().schema
transactionLogSchema.loadClass(TransactionLogClass)

export { transactionLogSchema }
