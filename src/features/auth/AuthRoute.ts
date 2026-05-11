import { Router } from 'express'
import { AuthController } from "./AuthController.ts";
import { UserRepository } from "../../models/User/UserRepository.ts";
import { AuthMiddleware } from "../../../middleware/authMiddleware.ts";
import { AuthService } from "./authService.ts";
/**
 * Prefix: api/auth/
 */

const userRepository = new UserRepository()
const authMiddleware = new AuthMiddleware(userRepository)
const authService = new AuthService(userRepository)
const authController = new AuthController(authService)


const router: Router = Router()

// non require login
router.post('/register', authMiddleware.notLogged, authController.register)
router.post('/login', authMiddleware.notLogged, authController.login)

// required login routes
router.post('/logout', authMiddleware.isLogged, authController.logout)
router.post('/refresh', authMiddleware.isLogged, authController.refresh)
router.get('/me', authMiddleware.isLogged, authController.me)

export default router
