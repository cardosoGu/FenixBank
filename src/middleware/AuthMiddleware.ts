import { Request, Response, NextFunction } from "express";
import { jwtService } from "../utils/jwt.ts";
import { Types } from "mongoose";
import { UserRepository } from "../models/User/UserRepository.ts";
import { ISession } from "../models/User/IUser.ts";
import { hashToken } from "../utils/Crypto.ts";

/**
 * Middlewares to verify if user is'nt logged or if user is logged
 *
 */

class AuthMiddleware {
    constructor(private userRepository: UserRepository) { }


    // Middleware to verify if user is logged
    isLogged = async (req: Request, res: Response, next: NextFunction) => {
        const accessToken = req.headers['authorization']?.split(' ')[1]
        const refreshToken = req.cookies['refreshToken']
        if (!accessToken || !refreshToken) return res.send_unauthorized("You must be logged!")

        try {

            const payload = await jwtService.verifyAccessToken(accessToken)
            const user = await this.userRepository.findById(new Types.ObjectId(payload.sub))

            if (!user) return res.send_unauthorized("User not found!")

            const session = user.sessions.find((session: ISession) => {
                return session.refreshToken === hashToken(refreshToken)
            })

            if (!session) return res.send_unauthorized("Session not found!")

            await jwtService.verifyRefreshToken(refreshToken)

            req.user = { userId: payload.sub }

            return next()
        } catch {
            return res.send_unauthorized("Invalid tokens or session")
        }
    }

    // Middleware to verify if user is'nt logged
    notLogged = async (req: Request, res: Response, next: NextFunction) => {
        const accessToken = req.headers['authorization']?.split(' ')[1]
        const refreshToken = req.cookies['refreshToken']

        if (!accessToken || !refreshToken) return next()

        if (accessToken) {
            try {
                const isValid = await jwtService.verifyAccessToken(accessToken)
                if (isValid) {
                    return res.send_unauthorized("You are already Logged in!")
                }
            } catch {
                // Do nothing, just let the user pass
            }
        }

        if (refreshToken && !accessToken) {
            try {
                const isValid = await jwtService.verifyRefreshToken(refreshToken)
                if (isValid) {
                    return res.send_unauthorized("You are already Logged in!")
                }
            } catch {
                // Do nothing, just let the user pass
            }
        }

        next()
    }

}
export const authMiddleware = new AuthMiddleware(new UserRepository())
