import mongoose from 'mongoose'

export const transactionLogsSchema = new mongoose.Schema({
    user: {
        type: {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            senderBalanceAfterTransaction: {
                type: Number,
                required: true, min: 0
            }
        },
        required: true
    },
    receiver: {
        type: {
            receiverId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: false
            },
            receiverBalanceAfterTransaction: {
                type: Number,
                required: true,
                min: [0, 'Transaction value cant be negative'],
            },
        },
        required: false
    },
    value: {
        type: Number,
        required: true,
        min: [0, 'Transaction value cant be negative'],
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    type: {
        type: String,
        enum: ['transfer', 'deposit', 'withdraw'],
        required: true,
    }
}, { timestamps: true })

export const TransactionLogs = mongoose.model('TransactionLogs', transactionLogsSchema)
