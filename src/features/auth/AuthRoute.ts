import { Router } from 'express'
import { AuthController } from "./AuthController.ts";
import { UserRepository } from "../../models/User/UserRepository.ts";
import { AuthService } from "./AuthService.ts";
import { AuthRules } from "./AuthRules.ts";
import { AuthMiddleware } from "../../middleware/AuthMiddleware.ts";

/**
 * Prefix: api/auth/
 */

// Dependency Injection / without acopling
const userRepository = new UserRepository()
const authRules = new AuthRules()
const authMiddleware = new AuthMiddleware(userRepository)
const authService = new AuthService(userRepository)
const authController = new AuthController(authService, authRules)


const router: Router = Router()
// non require login
router.post('/api/auth/register', authMiddleware.notLogged, authController.register)
router.post('/api/auth/login', authMiddleware.notLogged, authController.login)
// required login routes
router.get('/api/auth/sessions', authMiddleware.isLogged, authController.sessions)
router.post('/api/auth/logout', authMiddleware.isLogged, authController.logout)
router.post('/api/auth/logoutAll', authMiddleware.isLogged, authController.logoutAll)
router.put('/api/auth/refresh', authController.refresh)
router.get('/api/auth/me', authMiddleware.isLogged, authController.me)

export default router
