import { Router } from 'express';
import { BankController } from "./BankControllers.ts";
import { BankService } from "./BankServices.ts";
import { TransactionLogRepository } from "../../models/TransactionLogs/TransactionLogsRepository.ts";
import { UserRepository } from "../../models/User/UserRepository.ts";
import { BankRules } from "./BankRules.ts";
import { authMiddleware } from "../../middleware/AuthMiddleware.ts";

/**
 * Prefix: api/bank/
 */

const router: Router = Router()

const userRepository = new UserRepository()
const bankRules = new BankRules()
const transactionLogRepository = new TransactionLogRepository()
const bankService = new BankService(userRepository, transactionLogRepository)
const bankController = new BankController(bankService, bankRules)

//bank operations
router.post('/api/bank/transfer', authMiddleware.isLogged, bankController.transfer)
router.post('/api/bank/deposit', authMiddleware.isLogged, bankController.deposit)
router.post('/api/bank/withdraw', authMiddleware.isLogged, bankController.withdraw)

// transaction logs
router.get('/api/bank/transactions', authMiddleware.isLogged, bankController.getTransactions)
router.get('/api/bank/transactions/:id', authMiddleware.isLogged, bankController.getTransactionById)

// account management
router.get('/api/bank/account', authMiddleware.isLogged, bankController.getAccountInfo)
router.post('/api/bank/pixKey', authMiddleware.isLogged, bankController.addPixKey)
router.delete('/api/bank/pixKey/:key', authMiddleware.isLogged, bankController.removePixKey)

export default router
