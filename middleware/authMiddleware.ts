import { RequestHandler } from "express";
import { jwtService } from "../src/utils/jwt.ts";
import { Types } from "mongoose";
import { UserRepository } from "../src/features/auth/userRepository.ts";
import { ISession } from "../src/models/User/IUser.ts";

/**
 * Middlewares to verify if user is'nt logged or if user is logged
 *
 */

export class AuthMiddleware {
    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }
    private userRepository: UserRepository

    // Middleware to verify if user is logged
    isLogged: RequestHandler = async (req, res, next) => {
        const accessToken = req.headers['authorization']?.split(' ')[1]
        const refreshToken = req.cookies['refreshToken']

        if (!accessToken || !refreshToken) return res.send_unauthorized("You must be logged!")

        try {
            const payload = await jwtService.verifyAccessToken(accessToken)
            const user = await this.userRepository.findById(new Types.ObjectId(payload.sub))

            if (!user) return res.send_unauthorized("User not found!")

            const session = user.sessions.find((session: ISession) => session.refreshToken === refreshToken)

            if (!session) return res.send_unauthorized("Session not found!")

            await jwtService.verifyRefreshToken(refreshToken)

            req.user = { id: payload.sub }

            return next()
        } catch {
            return res.send_unauthorized("Invalid tokens or session")
        }
    }

    // Middleware to verify if user is'nt logged
    notLogged: RequestHandler = async (req, res, next) => {
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
