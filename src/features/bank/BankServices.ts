import { UserRepository } from "../../models/User/UserRepository.ts";
import { TransactionLogRepository } from "../../models/TransactionLogs/TransactionLogsRepository.ts"
import mongoose, { Types } from "mongoose";
import { TransactionStatus, TransactionType } from "../../models/TransactionLogs/ITransactionLog.ts";
import throwlhos from "throwlhos";


export class BankService {
    constructor(private userRepository: UserRepository, private transactionLogRepository: TransactionLogRepository) {

    }
    async transfer(userId: string, pixKey: string, amount: number) {
        const user = await this.userRepository.findById(new Types.ObjectId(userId))
        if (!user) {
            throw throwlhos.default.err_notFound("User not found!")
        }
        const receiver = await this.userRepository.findByPixKey(pixKey)
        if (!receiver) {
            throw throwlhos.default.err_notFound("Receiver not found!")
        }
        if (receiver._id.toString() === userId) {
            throw throwlhos.default.err_badRequest("You can't transfer to yourself!")
        }
        if (user.account.balance < amount) {
            const transactionLog = await this.transactionLogRepository.create({
                user: {
                    userId: new Types.ObjectId(userId),
                    userBalanceAfterTransaction: user.account.balance
                },
                type: TransactionType.Transfer,
                status: TransactionStatus.Failed,
                value: amount
            })
            throw throwlhos.default.err_badRequest("Insufficient account balance!", transactionLog)
        }

        const session = await mongoose.startSession()

        try {
            let transactionLog;

            await session.withTransaction(async (session) => {
                const newUserBalance = user.account.balance - amount
                const newReceiverBalance = receiver.account.balance + amount

                await this.userRepository.updateById(
                    new Types.ObjectId(userId),
                    { 'account.balance': newUserBalance },
                    { session }
                )
                await this.userRepository.updateById(
                    new Types.ObjectId(receiver._id),
                    { 'account.balance': newReceiverBalance },
                    { session }
                )

                transactionLog = await this.transactionLogRepository.createWithSession({
                    user: { userId: new Types.ObjectId(userId), userBalanceAfterTransaction: newUserBalance },
                    receiver: { receiverId: new Types.ObjectId(receiver._id), receiverBalanceAfterTransaction: newReceiverBalance },
                    type: TransactionType.Transfer,
                    status: TransactionStatus.Completed,
                    value: amount
                }, { session })

                user.transactionLogs.push(transactionLog._id!)
                receiver.transactionLogs.push(transactionLog._id!)
                await user.save({ session })
                await receiver.save({ session })
            })

            return { success: true, transactionLog }

        } catch {
            throw throwlhos.default.err_internalServerError("An error occurred while processing the transfer.")
        } finally {
            await session.endSession()
        }
    }

    async deposit(amount: number, userId: string) {
        const user = await this.userRepository.findById(new Types.ObjectId(userId))
        if (!user) {
            throw throwlhos.default.err_notFound("User not found!")
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
            throw throwlhos.default.err_notFound("User not found!")
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

            throw throwlhos.default.err_badRequest("Insufficient account balance!", transactionLog)
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
            throw throwlhos.default.err_notFound("No transactions found for this user!")
        }

        return { success: true, transactions }
    }

    async getTransactionById(transactionId: string, userId: string) {
        const transaction = await this.transactionLogRepository.findById(new Types.ObjectId(transactionId))
        const user = await this.userRepository.findById(new Types.ObjectId(userId))
        if (!transaction) {
            throw throwlhos.default.err_notFound("Transaction not found")
        }
        if (!user) {
            throw throwlhos.default.err_notFound("User not found")
        }
        if (transaction.user.userId.toString() !== userId && transaction.receiver?.receiverId.toString() !== userId) {
            throw throwlhos.default.err_forbidden("You don't have permission to access this transaction log")
        }


        return { success: true, transaction }
    }

    async getAccountInfo(userId: string) {
        const user = await this.userRepository.findById(new Types.ObjectId(userId))
        if (!user) {
            throw throwlhos.default.err_notFound("User not found")
        }
        return { success: true, account: user.account }

    }

    async addPixKey(userId: string, newPixKey: string) {
        const user = await this.userRepository.findById(new Types.ObjectId(userId))
        if (!user) {
            throw throwlhos.default.err_notFound("User not found")
        }
        if (user.account.pixKeys.includes(newPixKey)) {
            throw throwlhos.default.err_badRequest('This pix key is already registered in your account')
        }
        const pixKeyExists = await this.userRepository.pixKeyExists(newPixKey)
        if (pixKeyExists) {
            throw throwlhos.default.err_badRequest('This pix key is already registered by another user')
        }
        user.account.pixKeys.push(newPixKey)
        await user.save()
        return { success: true, message: 'PIX key added successfully' }
    }

    async removePixKey(userId: string, pixKey: string) {
        const user = await this.userRepository.findById(new Types.ObjectId(userId))
        if (!user) {
            throw throwlhos.default.err_notFound("User not found")
        }
        if (!user.account.pixKeys.includes(pixKey)) {
            throw throwlhos.default.err_badRequest('PIX key not found in your account')
        }
        user.account.pixKeys = user.account.pixKeys.filter((key) => key !== pixKey)
        await user.save()
        return { success: true, message: 'PIX key removed successfully' }
    }

}
