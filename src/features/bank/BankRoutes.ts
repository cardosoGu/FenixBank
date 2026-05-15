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

/**
 * @openapi
 * /api/bank/transfer:
 *   post:
 *     tags: [Bank - Operations]
 *     summary: Transfer money via Pix
 *     description: >
 *       Transfers an amount to another user using their Pix key.
 *       The sender cannot transfer to themselves.
 *       The account balance must cover the transfer amount.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransferRequest'
 *     responses:
 *       200:
 *         description: Transfer completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Transfer successful!
 *       400:
 *         description: Invalid payload, receiver not found, or insufficient balance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/api/bank/transfer', authMiddleware.isLogged, bankController.transfer)

/**
 * @openapi
 * /api/bank/deposit:
 *   post:
 *     tags: [Bank - Operations]
 *     summary: Make a deposit
 *     description: >
 *       Deposits an amount into the authenticated user's account.
 *       **Limit:** The maximum deposit amount is **10,000.00**.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AmountRequest'
 *           example:
 *             amount: 100
 *     responses:
 *       200:
 *         description: Deposit completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Deposit successful!
 *       400:
 *         description: Invalid payload or amount outside the allowed limit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/api/bank/deposit', authMiddleware.isLogged, bankController.deposit)

/**
 * @openapi
 * /api/bank/withdraw:
 *   post:
 *     tags: [Bank - Operations]
 *     summary: Make a withdrawal
 *     description: Withdraws an amount from the authenticated user's account. The balance must be sufficient to cover the request.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AmountRequest'
 *           example:
 *             amount: 40
 *     responses:
 *       200:
 *         description: Withdrawal completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Withdraw successful!
 *       400:
 *         description: Invalid payload or insufficient balance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/api/bank/withdraw', authMiddleware.isLogged, bankController.withdraw)

/**
 * @openapi
 * /api/bank/transactions:
 *   get:
 *     tags: [Bank - Transactions]
 *     summary: List user transactions
 *     description: Returns the transaction history for the authenticated user's account.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       transactionId:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [DEPOSIT, WITHDRAW, TRANSFER]
 *                       value:
 *                         type: number
 *                       status:
 *                         type: string
 *                         enum: [COMPLETED, FAILED, PENDING]
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/api/bank/transactions', authMiddleware.isLogged, bankController.getTransactions)

/**
 * @openapi
 * /api/bank/transactions/{id}:
 *   get:
 *     tags: [Bank - Transactions]
 *     summary: Get transaction by ID
 *     description: Returns the details of a specific transaction. The user can only access their own transactions or those where they are the receiver.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Unique transaction ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactionId:
 *                   type: string
 *                 type:
 *                   type: string
 *                   enum: [DEPOSIT, WITHDRAW, TRANSFER]
 *                 value:
 *                   type: number
 *                 status:
 *                   type: string
 *                   enum: [COMPLETED, FAILED, PENDING]
 *       403:
 *         description: No permission to access this transaction
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/api/bank/transactions/:id', authMiddleware.isLogged, bankController.getTransactionById)

/**
 * @openapi
 * /api/bank/account:
 *   get:
 *     tags: [Bank - Account]
 *     summary: Get account information
 *     description: Returns the authenticated user's bank account details, including balance and Pix keys.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Account information returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                   example: 250.00
 *                 pixKeys:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [maria@fenixbank.com]
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/api/bank/account', authMiddleware.isLogged, bankController.getAccountInfo)

/**
 * @openapi
 * /api/bank/pixKey:
 *   post:
 *     tags: [Bank - Pix Keys]
 *     summary: Add a Pix key
 *     description: Adds a new Pix key to the authenticated user's account.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddPixKeyRequest'
 *     responses:
 *       200:
 *         description: Pix key added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PIX key added successfully
 *       400:
 *         description: Pix key already exists or invalid payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/api/bank/pixKey', authMiddleware.isLogged, bankController.addPixKey)

/**
 * @openapi
 * /api/bank/pixKey/{key}:
 *   delete:
 *     tags: [Bank - Pix Keys]
 *     summary: Remove a Pix key
 *     description: Removes an existing Pix key from the authenticated user's account.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         description: Pix key to remove (email, CPF, phone number, or random key)
 *         schema:
 *           type: string
 *         example: maria@fenixbank.com
 *     responses:
 *       200:
 *         description: Pix key removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PIX key removed successfully
 *       400:
 *         description: Pix key not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/api/bank/pixKey/:key', authMiddleware.isLogged, bankController.removePixKey)

export default router
