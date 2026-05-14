import { RequestHandler } from 'express'
import { AuthService, IUserDTO } from "./AuthService.ts";
import { AuthRules } from "./AuthRules.ts";
import { handleHttpError } from "../../utils/HttpErrorHandle.ts";
export class AuthController {
    constructor(authService: AuthService, authRules: AuthRules) {
        this.authService = authService;
        this.authRules = authRules;
    }
    private authService: AuthService
    private authRules: AuthRules

    login: RequestHandler = async (req, res) => {
        const clientIp = req.ip ?? 'unknown';
        const userAgent = req.headers['user-agent'] ?? 'unknown';
        const data = req.body

        try {

            // request checker validation
            this.authRules.login(data)

            const user = await this.authService.login(data, clientIp, userAgent)
            // set Refresh Token in HttpOnly cookie and return Access Token
            res.cookie('refreshToken', user.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });
            res.send_ok("Login successfully!", { accessToken: user.accessToken })

        } catch (error: unknown) {
            return handleHttpError(res, error)
        }
    }

    register: RequestHandler = async (req, res) => {
        try {
            const clientIp = req.ip ?? 'unknown';
            const userAgent = req.headers['user-agent'] ?? 'unknown';
            const data = req.body

            this.authRules.register(data)

            const user = await this.authService.register(data, clientIp, userAgent)
            res.cookie('refreshToken', user.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });
            res.send_created("User created successfully!", { user: { name: user.user?.name, email: user.user?.email }, accessToken: user.accessToken })
        } catch (error: unknown) {
            return handleHttpError(res, error)
        }
    }

    logout: RequestHandler = async (req, res) => {
        try {
            const { userId } = req.user!
            const refreshToken = req.cookies['refreshToken']

            await this.authService.logout(userId, refreshToken)

            res.clearCookie('refreshToken');
            res.send_ok("Logout with success!")
        } catch (error: unknown) {
            return handleHttpError(res, error)
        }
    }

    logoutAll: RequestHandler = async (req, res) => {
        try {
            const { userId } = req.user!
            await this.authService.logoutAll(userId)

            res.clearCookie('refreshToken');
            res.send_ok("Logout all sessions with success!")
        } catch (error: unknown) {
            return handleHttpError(res, error)
        }
    }

    refresh: RequestHandler = async (req, res) => {
        const clientIp = req.ip ?? 'unknown';
        const userAgent = req.headers['user-agent'] ?? 'unknown';
        const refreshToken = req.cookies['refreshToken']

        try {
            const user = await this.authService.refresh(refreshToken, clientIp, userAgent);

            // set Refresh Token in HttpOnly cookie and return Access Token
            res.cookie('refreshToken', user.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });
            res.send_ok("Token refreshed successfully!", { accessToken: user.accessToken })
        } catch (error: unknown) {
            res.clearCookie('refreshToken');
            return handleHttpError(res, error)
        }
    }

    me: RequestHandler = async (req, res) => {
        const { userId } = req.user!

        try {
            const user = await this.authService.me(userId)

            const userInfo: Omit<IUserDTO, 'password'> = {
                name: user.user.name,
                email: user.user.email,
                cpf: user.user.cpf!,
                pixKeys: user.user.account.pixKeys!,
                balance: user.user.account.balance!,
            }

            res.send_ok(user.message, { user: userInfo })
        } catch (error: unknown) {
            return handleHttpError(res, error)
        }
    }

    sessions: RequestHandler = async (req, res) => {
        const { userId } = req.user!

        try {
            const user = await this.authService.sessions(userId)

            const formattedSessions = user.sessions?.map(session => ({
                clientIp: session.clientIp,
                userAgent: session.userAgent,
            }))
            res.send_ok(user.message, { sessions: formattedSessions })
        } catch (error: unknown) {
            return handleHttpError(res, error)
        }
    }
}
