import { Response, Request } from 'express'
import { AuthService } from "./AuthService.ts";
import { AuthRules } from "./AuthRules.ts";
import { handleHttpError } from "../../utils/HttpErrorHandle.ts";
import { UserDTO } from "./AuthDTOs.ts";
export class AuthController {
    constructor(authService: AuthService, authRules: AuthRules) {
        this.authService = authService;
        this.authRules = authRules;
    }
    private authService: AuthService
    private authRules: AuthRules

    login = async (req: Request, res: Response) => {
        const clientIp = req.ip ?? 'unknown';
        const userAgent = req.headers['user-agent'] ?? 'unknown';
        const data = req.body

        try {

            // request checker validation
            this.authRules.login(data)

            const response = await this.authService.login({ ...data, clientIp, userAgent })
            // set Refresh Token in HttpOnly cookie and return Access Token
            res.cookie('refreshToken', response.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });
            res.send_ok(response.message, { accessToken: response.accessToken })

        } catch (error: unknown) {
            return handleHttpError(res, error)
        }
    }

    register = async (req: Request, res: Response) => {
        try {
            const clientIp = req.ip ?? 'unknown';
            const userAgent = req.headers['user-agent'] ?? 'unknown';
            const data = req.body

            this.authRules.register(data)

            const response = await this.authService.register(data, clientIp, userAgent)
            res.cookie('refreshToken', response.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });
            res.send_created(response.message, { user: { name: response.user.name, email: response.user.email }, accessToken: response.accessToken })
        } catch (error: unknown) {
            return handleHttpError(res, error)
        }
    }

    logout = async (req: Request, res: Response) => {
        try {
            const { userId } = req.user!
            const refreshToken = req.cookies['refreshToken']

            const response = await this.authService.logout(userId, refreshToken)

            res.clearCookie('refreshToken');
            res.send_ok(response.message)
        } catch (error: unknown) {
            return handleHttpError(res, error)
        }
    }

    logoutAll = async (req: Request, res: Response) => {
        try {
            const { userId } = req.user!
            const { refreshToken } = req.cookies
            const response = await this.authService.logoutAll(userId, refreshToken)

            res.clearCookie('refreshToken');
            res.send_ok(response.message)
        } catch (error: unknown) {
            return handleHttpError(res, error)
        }
    }

    refresh = async (req: Request, res: Response) => {
        const clientIp = req.ip ?? 'unknown';
        const userAgent = req.headers['user-agent'] ?? 'unknown';
        const refreshToken = req.cookies['refreshToken']

        try {
            const response = await this.authService.refresh(refreshToken, clientIp, userAgent);

            // set Refresh Token in HttpOnly cookie and return Access Token
            res.cookie('refreshToken', response.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });
            res.send_ok(response.message, { accessToken: response.accessToken })
        } catch (error: unknown) {
            res.clearCookie('refreshToken');
            return handleHttpError(res, error)
        }
    }

    me = async (req: Request, res: Response) => {
        const { userId } = req.user!

        try {
            const response = await this.authService.me(userId)

            const userInfo: Omit<UserDTO, 'password'> = {
                name: response.user.name,
                email: response.user.email,
                cpf: response.user.cpf,
                pixKeys: response.user.pixKeys,
                balance: response.user.balance,
            }

            res.send_ok(response.message, { user: userInfo })
        } catch (error: unknown) {
            return handleHttpError(res, error)
        }
    }

    sessions = async (req: Request, res: Response) => {
        const { userId } = req.user!

        try {
            const response = await this.authService.sessions(userId)

            const formattedSessions = response.sessions?.map(session => ({
                clientIp: session.clientIp,
                userAgent: session.userAgent,
            }))
            res.send_ok(response.message, { sessions: formattedSessions })
        } catch (error: unknown) {
            return handleHttpError(res, error)
        }
    }
}
