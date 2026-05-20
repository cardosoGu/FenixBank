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
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: OK
 *               code: 200
 *               success: true
 *               message: Transfer successful.
 *               data: null
 *       400:
 *         description: Invalid payload, receiver not found, or insufficient balance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *             example:
 *               status: BAD_REQUEST
 *               code: 400
 *               success: false
 *               message: Insufficient balance to complete this transfer.
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *             example:
 *               status: UNAUTHORIZED
 *               code: 401
 *               success: false
 *               message: Authentication required.
 */
router.post('/transfer', authMiddleware.isLogged, bankController.transfer)

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
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: OK
 *               code: 200
 *               success: true
 *               message: Deposit successful.
 *               data: null
 *       400:
 *         description: Invalid payload or amount outside the allowed limit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *             example:
 *               status: BAD_REQUEST
 *               code: 400
 *               success: false
 *               message: Deposit amount exceeds the maximum limit of 10,000.00.
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *             example:
 *               status: UNAUTHORIZED
 *               code: 401
 *               success: false
 *               message: Authentication required.
 */
router.post('/deposit', authMiddleware.isLogged, bankController.deposit)

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
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: OK
 *               code: 200
 *               success: true
 *               message: Withdrawal successful.
 *               data: null
 *       400:
 *         description: Invalid payload or insufficient balance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *             example:
 *               status: BAD_REQUEST
 *               code: 400
 *               success: false
 *               message: Insufficient balance to complete this withdrawal.
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *             example:
 *               status: UNAUTHORIZED
 *               code: 401
 *               success: false
 *               message: Authentication required.
 */
router.post('/withdraw', authMiddleware.isLogged, bankController.withdraw)

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
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: OK
 *               code: 200
 *               success: true
 *               message: Transactions retrieved successfully.
 *               data:
 *                 transactions:
 *                   - transactionId: txn_abc123
 *                     type: DEPOSIT
 *                     value: 500.00
 *                     status: COMPLETED
 *                   - transactionId: txn_def456
 *                     type: TRANSFER
 *                     value: 50.00
 *                     status: COMPLETED
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *             example:
 *               status: UNAUTHORIZED
 *               code: 401
 *               success: false
 *               message: Authentication required.
 */
router.get('/transactions', authMiddleware.isLogged, bankController.getTransactions)

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
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: OK
 *               code: 200
 *               success: true
 *               message: Transaction retrieved successfully.
 *               data:
 *                 transactionId: txn_abc123
 *                 type: TRANSFER
 *                 value: 50.00
 *                 status: COMPLETED
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *             example:
 *               status: UNAUTHORIZED
 *               code: 401
 *               success: false
 *               message: Authentication required.
 *       403:
 *         description: No permission to access this transaction
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error403'
 *             example:
 *               status: FORBIDDEN
 *               code: 403
 *               success: false
 *               message: You do not have permission to access this transaction.
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *             example:
 *               status: NOT_FOUND
 *               code: 404
 *               success: false
 *               message: Transaction not found.
 */
router.get('/transactions/:id', authMiddleware.isLogged, bankController.getTransactionById)

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
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: OK
 *               code: 200
 *               success: true
 *               message: Account information retrieved successfully.
 *               data:
 *                 balance: 250.00
 *                 pixKeys:
 *                   - maria@fenixbank.com
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *             example:
 *               status: UNAUTHORIZED
 *               code: 401
 *               success: false
 *               message: Authentication required.
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *             example:
 *               status: NOT_FOUND
 *               code: 404
 *               success: false
 *               message: User not found.
 */
router.get('/account', authMiddleware.isLogged, bankController.getAccountInfo)

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
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: OK
 *               code: 200
 *               success: true
 *               message: Pix key added successfully.
 *               data: null
 *       400:
 *         description: Pix key already exists or invalid payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *             example:
 *               status: BAD_REQUEST
 *               code: 400
 *               success: false
 *               message: This Pix key is already registered.
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *             example:
 *               status: UNAUTHORIZED
 *               code: 401
 *               success: false
 *               message: Authentication required.
 */
router.post('/pixKey', authMiddleware.isLogged, bankController.addPixKey)

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
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: OK
 *               code: 200
 *               success: true
 *               message: Pix key removed successfully.
 *               data: null
 *       400:
 *         description: Pix key not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *             example:
 *               status: BAD_REQUEST
 *               code: 400
 *               success: false
 *               message: Pix key not found on this account.
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *             example:
 *               status: UNAUTHORIZED
 *               code: 401
 *               success: false
 *               message: Authentication required.
 */
router.delete('/pixKey/:key', authMiddleware.isLogged, bankController.removePixKey)

export default router
