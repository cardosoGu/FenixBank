import { Router } from 'express'
import { AuthController } from "./AuthController.ts";
import { UserRepository } from "../../models/User/UserRepository.ts";
import { AuthService } from "./AuthService.ts";
import { AuthRules } from "./AuthRules.ts";
import { AuthMiddleware } from "../../middleware/AuthMiddleware.ts";

/**
 * Prefix: api/auth/
 */

const userRepository = new UserRepository()
const authRules = new AuthRules()
const authMiddleware = new AuthMiddleware(userRepository)
const authService = new AuthService(userRepository)
const authController = new AuthController(authService, authRules)

const router: Router = Router()

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Creates a new user account on the platform. No prior authentication is required.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *       400:
 *         description: Invalid payload or email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: User is already logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/api/auth/register', authMiddleware.notLogged, authController.register)

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in
 *     description: Authenticates the user and returns an access token for subsequent requests.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid credentials or invalid payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: User is already logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/api/auth/login', authMiddleware.notLogged, authController.login)

/**
 * @openapi
 * /api/auth/sessions:
 *   get:
 *     tags: [Auth]
 *     summary: List active sessions
 *     description: Returns all active sessions for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       clientIp:
 *                         type: string
 *                       userAgent:
 *                         type: string
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/api/auth/sessions', authMiddleware.isLogged, authController.sessions)

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out current session
 *     description: Invalidates the current session token for the user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current session logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User logged out successfully!
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/api/auth/logout', authMiddleware.isLogged, authController.logout)

/**
 * @openapi
 * /api/auth/logoutAll:
 *   post:
 *     tags: [Auth]
 *     summary: Log out all sessions
 *     description: Invalidates all active user tokens across every device.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All sessions logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User logged out successfully!
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/api/auth/logoutAll', authMiddleware.isLogged, authController.logoutAll)

/**
 * @openapi
 * /api/auth/refresh:
 *   put:
 *     tags: [Auth]
 *     summary: Refresh the current session token
 *     description: Generates a new JWT access token for the current session without requiring a new login.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Missing or invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/api/auth/refresh', authController.refresh)

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get authenticated user profile
 *     description: Returns the profile data of the currently authenticated user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: Maria Silva
 *                 email:
 *                   type: string
 *                   example: maria@fenixbank.com
 *                 cpf:
 *                   type: string
 *                   example: 181.990.300-11
 *                 pixKeys:
 *                   type: array
 *                   items:
 *                     type: string
 *                 balance:
 *                   type: number
 *                   example: 250.00
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
router.get('/api/auth/me', authMiddleware.isLogged, authController.me)

export default router
