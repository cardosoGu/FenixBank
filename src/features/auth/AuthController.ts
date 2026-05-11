import { RequestHandler } from 'express'
import { AuthService } from "./authService.ts";

export class AuthController {
    constructor(authService: AuthService) {
        this.authService = authService;
    }
    private authService: AuthService

    login: RequestHandler = (req, res) => {
        res.send_ok("Login bem-sucedido!")
    }

    register: RequestHandler = (req, res) => {
        res.send_ok("Registro bem-sucedido!")
    }

    logout: RequestHandler = (req, res) => {
        res.send_ok("Logout bem-sucedido!")
    }

    refresh: RequestHandler = (req, res) => {
        res.send_ok("Token refreshado!")
    }
    me: RequestHandler = (req, res) => {
        res.send_ok("Me endpoint!")
    }
}
