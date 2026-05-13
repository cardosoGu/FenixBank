import { UserRepository } from "../../models/User/UserRepository.ts";
import { TransactionLogRepository } from "../../models/TransactionLogs/TransactionLogsRepository.ts"
import { Types } from "mongoose";
import { TransactionStatus, TransactionType } from "../../models/TransactionLogs/ITransactionLog.ts";


export class BankService {
    constructor(private userRepository: UserRepository, private transactionLogRepository: TransactionLogRepository) {

    }
    transfer() { }

    async deposit(amount: number, userId: string) {
        const user = await this.userRepository.findById(new Types.ObjectId(userId))
        if (!user) {
            return { success: false, message: "User not found!" }
        }

        const newBalance = user.account.balance + amount

        await this.userRepository.updateById(new Types.ObjectId(userId), { 'account.balance': newBalance })

        const transactionLog = await this.transactionLogRepository.create({
            user: {
                userId: new Types.ObjectId(userId),
                userBalanceAfterTransaction: newBalance
            },
            type: TransactionType.Deposit,
            status: TransactionStatus.Completed,
            value: amount
        })
        user.transactionLogs.push(transactionLog._id!)
        await user.save()
        return { success: true, transactionLog }

    }




    async withdraw(amount: number, userId: string) {
        const user = await this.userRepository.findById(new Types.ObjectId(userId))
        if (!user) {
            return { success: false, message: "User not found!" }

        }
        //verify if user has sufficient balance for the withdraw
        if (user.account.balance < amount) {
            const transactionLog = await this.transactionLogRepository.create({
                user: {
                    userId: new Types.ObjectId(userId),
                    userBalanceAfterTransaction: user.account.balance
                },
                type: TransactionType.Withdraw,
                status: TransactionStatus.Failed,
                value: amount
            })

            return { success: false, message: "Insufficient account balance!", transactionLog }
        }

        //create a transaction log with status pending
        const newBalance = user.account.balance - amount
        const transactionLog = await this.transactionLogRepository.create({
            user: {
                userId: new Types.ObjectId(userId),
                userBalanceAfterTransaction: newBalance
            },
            type: TransactionType.Withdraw,
            status: TransactionStatus.Pending,
            value: amount
        })

        await this.userRepository.updateById(new Types.ObjectId(userId), { 'account.balance': newBalance })
        await this.transactionLogRepository.updateById(transactionLog._id!, { status: TransactionStatus.Completed })
        user.transactionLogs.push(transactionLog._id!)
        await user.save()

        return { success: true, transactionLog }
    }

    async getTransactions(userId: string) {
        const transactions = await this.transactionLogRepository.find({ 'user.userId': new Types.ObjectId(userId) })
        if (!transactions) {
            return { success: false, message: 'You dont have transaction logs' }
        }

        return { success: true, transactions }
    }

    async getTransactionById(transactionId: string, userId: string) {
        const transaction = await this.transactionLogRepository.findOne({ _id: new Types.ObjectId(transactionId) })
        const user = await this.userRepository.findById(new Types.ObjectId(userId))
        if (!transaction) {
            return { success: false, message: 'Transaction not found' }
        }
        if (!user) {
            return { success: false, message: 'User not found' }
        }
        if (transaction.user.userId.toString() !== userId && transaction.receiver?.receiverId.toString() !== userId) {
            return { success: false, message: 'You dont have permission to access this transaction log' }
        }


        return { success: true, transaction }
    }

    getAccountInfo() { }

    getPixKeys() { }

    addPixKey() { }

    removePixKey() { }


}
