import { RequestHandler } from "express";
import { BankService } from "./BankServices.ts";
import { BankRules } from "./BankRules.ts";
import { ITransactionLog } from "../../models/TransactionLogs/ITransactionLog.ts";

export class BankController {
    constructor(bankService: BankService, bankRules: BankRules) {
        this.bankService = bankService
        this.bankRules = bankRules
    }
    private bankService: BankService
    private bankRules: BankRules

    transfer: RequestHandler = async (req, res) => {
        res.send_ok("Transfer successful!")
    }

    deposit: RequestHandler = async (req, res) => {
        const { userId } = req.user!
        const data = req.body

        try {

            const validation = this.bankRules.deposit(data)
            if (!validation.success) {
                return res.send_badRequest("Invalid Body", validation.errors)
            }

            const deposit = await this.bankService.deposit(data.amount, userId)

            if (!deposit.success) {
                return res.send_badRequest("Deposit failed", validation.errors)
            }
            return res.send_ok("Deposit successful!", { transactionLog: this.formatTransaction(deposit.transactionLog!) })

        } catch (error: unknown) {

            res.send_internalServerError("An error occurred while processing the deposit.", error)
        }

    }

    withdraw: RequestHandler = async (req, res) => {
        const { userId } = req.user!
        const data = req.body

        try {
            const validation = this.bankRules.withdraw(data)
            if (!validation.success) {
                return res.send_badRequest("Invalid Body", validation.errors)
            }

            const withdraw = await this.bankService.withdraw(data.amount, userId)
            if (!withdraw.success) {

                return res.send_badRequest("Withdraw failed", {
                    message: withdraw.message, transactionLog: {
                        user: {
                            userId: userId,
                            userBalanceAfterTransaction: withdraw.transactionLog?.user.userBalanceAfterTransaction
                        },
                        type: withdraw.transactionLog?.type,
                        status: withdraw.transactionLog?.status,
                        value: withdraw.transactionLog?.value
                    }
                })
            }
            return res.send_ok("Withdraw successful!", { transactionLog: this.formatTransaction(withdraw.transactionLog!) })

        } catch (error: unknown) {
            console.log(error)
            res.send_internalServerError("An error occurred while processing the withdraw.", error)
        }
    }

    getTransactions: RequestHandler = async (req, res) => {
        const { userId } = req.user!
        try {
            const transactions = await this.bankService.getTransactions(userId)
            if (!transactions.success) {
                return res.send_badRequest("Failed to retrieve transactions", transactions.message)
            }

            const formattedTransactions = transactions.transactions?.map(transaction => (this.formatTransaction(transaction)))
            res.send_ok("Transactions retrieved!", { transactions: formattedTransactions })

        } catch (error: unknown) {
            res.send_internalServerError("An error occurred while fetching transactions.", error)
        }

    }


    getTransactionById: RequestHandler = async (req, res) => {
        const { userId } = req.user!
        const { id } = req.params as { id: string }

        try {
            const response = await this.bankService.getTransactionById(id, userId)

            if (!response.success) {
                return res.send_badRequest("Failed to retrieve transaction", response.message)
            }

            res.send_ok("Transaction retrieved!", { transaction: this.formatTransaction(response.transaction!) })

        } catch (error: unknown) {
            res.send_internalServerError("An error occurred while fetching the transaction.", error)
        }
    }

    getAccountInfo: RequestHandler = async (req, res) => {
        res.send_ok("Account information retrieved!")
    }
    getPixKeys: RequestHandler = async (req, res) => {
        res.send_ok("PIX keys retrieved!")
    }

    addPixKey: RequestHandler = async (req, res) => {
        res.send_ok("PIX key added!")
    }

    removePixKey: RequestHandler = async (req, res) => {
        res.send_ok("PIX key removed!")
    }

    formatTransaction(transaction: ITransactionLog) {
        return {
            transactionId: transaction._id,
            user: {
                userId: transaction.user.userId,
                userBalanceAfterTransaction: transaction.user.userBalanceAfterTransaction
            },
            receiver: transaction.receiver ? {
                userId: transaction.receiver.receiverId,
                userBalanceAfterTransaction: transaction.receiver.receiverBalanceAfterTransaction
            } : null,
            type: transaction.type,
            value: transaction.value,
            status: transaction.status,
            userBalanceAfterTransaction: transaction.user.userBalanceAfterTransaction
        }
    }
}
