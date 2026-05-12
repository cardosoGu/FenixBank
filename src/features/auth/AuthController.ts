import { RequestHandler } from 'express'
import { AuthService } from "./AuthService.ts";
import { AuthRules } from "./AuthRules.ts";

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
            const validation = this.authRules.login(data)
            if (!validation.success) {
                return res.send_badRequest("Invalid Body", validation.errors)
            }

            const user = await this.authService.login(data, clientIp, userAgent)
            if (!user.success) {
                return res.send_badRequest(user.message)
            }

            // set Refresh Token in HttpOnly cookie and return Access Token
            res.cookie('refreshToken', user.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });
            res.send_ok("Login successfully!", user.accessToken)

        } catch (error: any) {
            return res.send_internalServerError("Error logging in", error)
        }
    }

    register: RequestHandler = async (req, res) => {
        try {
            const clientIp = req.ip ?? 'unknown';
            const userAgent = req.headers['user-agent'] ?? 'unknown';
            const data = req.body

            const validation = this.authRules.register(data)
            if (!validation.success) {
                return res.send_badRequest("Invalid Body", validation.errors)
            }

            const user = await this.authService.register(data, clientIp, userAgent)
            if (!user.success) {
                return res.send_badRequest(user.message)
            }

            res.cookie('refreshToken', user.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });
            res.send_created("User created successfully!", { user: { name: user.user?.name, email: user.user?.email }, accessToken: user.accessToken })
        } catch (error: any) {
            return res.send_internalServerError("Error creating user", error)
        }
    }

    logout: RequestHandler = async (req, res) => {
        try {
            const { userId } = req.user!
            const refreshToken = req.cookies['refreshToken']

            const deleteSession = await this.authService.logout(userId, refreshToken)
            if (!deleteSession.success) {
                return res.send_badRequest(deleteSession.message)
            }

            res.clearCookie('refreshToken');
            res.send_ok("Logout with success!")
        } catch (error: any) {
            return res.send_internalServerError("Error logging out", error)
        }
    }

    logoutAll: RequestHandler = async (req, res) => {
        try {
            const { userId } = req.user!
            const deleteSession = await this.authService.logoutAll(userId)

            if (!deleteSession.success) {
                return res.send_badRequest(deleteSession.message)
            }

            res.clearCookie('refreshToken');
            res.send_ok("Logout all sessions with success!")
        } catch (error: any) {
            return res.send_internalServerError("Error logging out", error)
        }
    }

    refresh: RequestHandler = async (req, res) => {
        const clientIp = req.ip ?? 'unknown';
        const userAgent = req.headers['user-agent'] ?? 'unknown';
        const { userId } = req.user!
        const refreshToken = req.cookies['refreshToken']

        try {
            const user = await this.authService.refresh(userId, refreshToken, clientIp, userAgent);
            if (!user.success) {
                res.clearCookie('refreshToken');
                return res.send_badRequest(user.message)
            }

            // set Refresh Token in HttpOnly cookie and return Access Token
            res.cookie('refreshToken', user.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });
            res.send_ok("Token refreshed successfully!", user.accessToken)
        } catch (error: any) {
            res.clearCookie('refreshToken');
            return res.send_internalServerError("Error refreshing token", error)
        }
    }

    me: RequestHandler = async (req, res) => {
        const { userId } = req.user!

        try {
            const user = await this.authService.me(userId)
            res.send_ok(user.message, user.user)
        } catch (error: any) {
            return res.send_internalServerError("Error fetching user info", error)
        }
        }
    }
