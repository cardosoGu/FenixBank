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
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: CREATED
 *               code: 201
 *               success: true
 *               message: User created successfully.
 *               data: null
 *       400:
 *         description: Invalid payload or email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *             example:
 *               status: BAD_REQUEST
 *               code: 400
 *               success: false
 *               message: Email is already in use.
 *       401:
 *         description: User is already logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *             example:
 *               status: UNAUTHORIZED
 *               code: 401
 *               success: false
 *               message: You are already logged in.
 */
router.post('/register', authMiddleware.notLogged, authController.register)

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
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: OK
 *               code: 200
 *               success: true
 *               message: User logged in successfully.
 *               data:
 *                 accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid credentials or invalid payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *             example:
 *               status: BAD_REQUEST
 *               code: 400
 *               success: false
 *               message: Invalid email or password.
 *       401:
 *         description: User is already logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *             example:
 *               status: UNAUTHORIZED
 *               code: 401
 *               success: false
 *               message: You are already logged in.
 */
router.post('/login', authMiddleware.notLogged, authController.login)

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
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: OK
 *               code: 200
 *               success: true
 *               message: Sessions retrieved successfully.
 *               data:
 *                 sessions:
 *                   - clientIp: 192.168.0.1
 *                     userAgent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
 *                   - clientIp: 10.0.0.5
 *                     userAgent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)
 *       401:
 *         description: Missing or invalid token
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
router.get('/sessions', authMiddleware.isLogged, authController.sessions)

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
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: OK
 *               code: 200
 *               success: true
 *               message: User logged out successfully.
 *               data: null
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
router.post('/logout', authMiddleware.isLogged, authController.logout)

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
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: OK
 *               code: 200
 *               success: true
 *               message: All sessions logged out successfully.
 *               data: null
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
router.post('/logoutAll', authMiddleware.isLogged, authController.logoutAll)

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
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: OK
 *               code: 200
 *               success: true
 *               message: Token refreshed successfully.
 *               data:
 *                 accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Missing or invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *             example:
 *               status: UNAUTHORIZED
 *               code: 401
 *               success: false
 *               message: Invalid or expired token.
 */
router.put('/refresh', authController.refresh)

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
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: OK
 *               code: 200
 *               success: true
 *               message: Profile retrieved successfully.
 *               data:
 *                 name: Maria Silva
 *                 email: maria@fenixbank.com
 *                 cpf: 181.990.300-11
 *                 pixKeys:
 *                   - maria@fenixbank.com
 *                 balance: 250.00
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
router.get('/me', authMiddleware.isLogged, authController.me)

export default router
