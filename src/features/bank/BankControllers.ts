import { RequestHandler } from "express";
import { BankService } from "./BankServices.ts";
import { BankRules } from "./BankRules.ts";
import { ITransactionLog } from "../../models/TransactionLogs/ITransactionLog.ts";
import { handleHttpError } from "../HttpErrorHandle.ts";


export class BankController {
    constructor(bankService: BankService, bankRules: BankRules) {
        this.bankService = bankService
        this.bankRules = bankRules
    }
    private bankService: BankService
    private bankRules: BankRules

    transfer: RequestHandler = async (req, res) => {
        const { userId } = req.user!
        const { pixKey, amount } = req.body

        try {
            this.bankRules.transfer(req.body)
            const transfer = await this.bankService.transfer(userId, pixKey, amount)

            return res.send_ok("Transfer successful!", { transactionLog: this.formatTransaction(transfer.transactionLog!) })
        } catch (error: unknown) {
            return handleHttpError(res, error)

        }
    }

    deposit: RequestHandler = async (req, res) => {
        const { userId } = req.user!
        const data = req.body

        try {
            this.bankRules.deposit(data)
            const deposit = await this.bankService.deposit(data.amount, userId)

            return res.send_ok("Deposit successful!", { transactionLog: this.formatTransaction(deposit.transactionLog!) })

        } catch (error: unknown) {
            return handleHttpError(res, error)
        }

    }

    withdraw: RequestHandler = async (req, res) => {
        const { userId } = req.user!
        const data = req.body

        try {
            this.bankRules.withdraw(data)

            const withdraw = await this.bankService.withdraw(data.amount, userId)

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

            const formattedTransactions = transactions.transactions?.map(transaction => (this.formatTransaction(transaction)))
            res.send_ok("Transactions retrieved!", { transactions: formattedTransactions })

        } catch (error: unknown) {
            return handleHttpError(res , error)
        }

    }


    getTransactionById: RequestHandler = async (req, res) => {
        const { userId } = req.user!
        const { id } = req.params as { id: string }

        try {
            const response = await this.bankService.getTransactionById(id, userId)

            res.send_ok("Transaction retrieved!", { transaction: this.formatTransaction(response.transaction!) })

        } catch (error: unknown) {
            return handleHttpError(res, error)
        }
    }

    getAccountInfo: RequestHandler = async (req, res) => {
        const { userId } = req.user!

        try {
            const accountInfo = await this.bankService.getAccountInfo(userId)


            res.send_ok("Account information retrieved!", { accountInfo: accountInfo.account })
        } catch (err: unknown) {
            return handleHttpError(res, err)
        }
    }

    addPixKey: RequestHandler = async (req, res) => {
        const { userId } = req.user!
        const data = req.body
        try {
           await this.bankRules.addPixKey(data)

            await this.bankService.addPixKey(userId, data.newPixKey)

            res.send_ok("PIX key added!")
        } catch (err) {
            return handleHttpError(res, err)
        }
    }

    removePixKey: RequestHandler = async (req, res) => {
        const { userId } = req.user!
        const { key } = req.params as { key: string }

        try {
            await this.bankService.removePixKey(userId, key)
            res.send_ok("PIX key removed!")
        } catch (err) {
            return handleHttpError(res, err)
        }
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
                receiverBalanceAfterTransaction: transaction.receiver.receiverBalanceAfterTransaction
            } : null,
            type: transaction.type,
            value: transaction.value,
            status: transaction.status,
        }
    }
}
