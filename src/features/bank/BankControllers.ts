import { Request, Response } from "express";
import { BankService } from "./BankServices.ts";
import { BankRules } from "./BankRules.ts";
import { ITransactionLog } from "../../models/TransactionLogs/ITransactionLog.ts";
import { handleHttpError } from "../../utils/HttpErrorHandle.ts";


export class BankController {
    constructor(bankService: BankService, bankRules: BankRules) {
        this.bankService = bankService
        this.bankRules = bankRules
    }
    private bankService: BankService
    private bankRules: BankRules

    transfer = async (req: Request, res: Response) => {
        const { userId } = req.user!
        const { pixKey, amount } = req.body

        try {
            this.bankRules.transfer(req.body)
            const transfer = await this.bankService.transfer(userId, pixKey, amount)

            return res.send_ok("Transfer successful!", {
                transactionLog: transfer.transactionLog
            })
        } catch (error: unknown) {
            return handleHttpError(res, error)

        }
    }

    deposit = async (req: Request, res: Response) => {
        const { userId } = req.user!
        const data = req.body

        try {
            this.bankRules.deposit(data)
            const response = await this.bankService.deposit(data.amount, userId)

            return res.send_ok(response.message, {
                transactionLog: response.transactionLog
            })

        } catch (error: unknown) {
            return handleHttpError(res, error)
        }

    }

    withdraw = async (req: Request, res: Response) => {
        const { userId } = req.user!
        const data = req.body

        try {
            this.bankRules.withdraw(data)

            const response = await this.bankService.withdraw(data.amount, userId)

            return res.send_ok(response.message, {
                transactionLog: response.transactionLog
            })

        } catch (error: unknown) {
            return handleHttpError(res, error)
        }
    }

    getTransactions = async (req: Request, res: Response) => {
        const { userId } = req.user!
        try {
            const response = await this.bankService.getTransactions(userId)

            const formattedTransactions = response.transactions?.map(transaction => (transaction))
            res.send_ok(response.message, { transactions: formattedTransactions })

        } catch (error: unknown) {
            return handleHttpError(res, error)
        }

    }


    getTransactionById = async (req: Request, res: Response) => {
        const { userId } = req.user!
        const { id } = req.params as { id: string }

        try {
            const response = await this.bankService.getTransactionById(id, userId)

            res.send_ok(response.message, { transactionLog: response.transactionLog })

        } catch (error: unknown) {
            return handleHttpError(res, error)
        }
    }

    getAccountInfo = async (req: Request, res: Response) => {
        const { userId } = req.user!

        try {
            const response = await this.bankService.getAccountInfo(userId)


            res.send_ok(response.message, { accountInfo: response.account })
        } catch (err: unknown) {
            return handleHttpError(res, err)
        }
    }

    addPixKey = async (req: Request, res: Response) => {
        const { userId } = req.user!
        const data = req.body
        try {
            await this.bankRules.addPixKey(data)

            const response = await this.bankService.addPixKey(userId, data.newPixKey)

            res.send_ok(response.message)
        } catch (err) {
            return handleHttpError(res, err)
        }
    }

    removePixKey = async (req: Request, res: Response) => {
        const { userId } = req.user!
        const { key } = req.params as { key: string }

        try {
            const response = await this.bankService.removePixKey(userId, key)
            res.send_ok(response.message)
        } catch (err) {
            return handleHttpError(res, err)
        }

    }
}
