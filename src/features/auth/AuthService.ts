import { UserRepository } from "../../models/User/UserRepository.ts";

import { jwtService } from "../../utils/jwt.ts"
import { ISession, IUser } from "../../models/User/IUser.ts";
import { Types } from "mongoose";
import { hashToken } from "../../utils/Crypto.ts";
import throwlhos from "throwlhos";
import { UserDTO, LoginInputDTO, AuthResponseDTO, RefreshResponseDTO, MeResponseDTO, SessionsResponseDTO } from "./AuthDTOs.ts";
import { IBaseResponseDTO } from "../../base/IBaseInterface.ts";
import { userFormat } from "../../utils/formatters.ts";


export class AuthService {
    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }
    private userRepository: UserRepository

    async register(data: UserDTO, clientIp: string, userAgent: string): Promise<AuthResponseDTO> {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw throwlhos.default.err_badRequest("Email already in use!");
        }
        const user = await this.userRepository.create({
            name: data.name,
            email: data.email,
            cpf: data.cpf,
            password: data.password,
            account: {
                pixKeys: [...new Set([...data.pixKeys, data.email, data.cpf])],
                balance: data.balance ?? 0,
            },
        });
        if (!user) {
            throw throwlhos.default.err_internalServerError("Error creating user!");
        }
        const refreshToken = await jwtService.generateRefreshToken(user._id.toString());
        const accessToken = await jwtService.generateAccessToken(user._id.toString());

        user.sessions.push({ refreshToken: hashToken(refreshToken), clientIp, userAgent });
        await user.save()

        const userInfo = userFormat(user)
        return {
            success: true, message: "User created successfully!", accessToken, refreshToken,
            user: userInfo
        };
    }

    async login(data: LoginInputDTO): Promise<AuthResponseDTO> {
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw throwlhos.default.err_unauthorized("Invalid credentials!");
        }

        const isPasswordValid = await user.passwordMatches(data.password);
        if (!isPasswordValid) {
            throw throwlhos.default.err_unauthorized("Invalid credentials!");
        }

        const refreshToken = await jwtService.generateRefreshToken(user._id.toString());
        const accessToken = await jwtService.generateAccessToken(user._id.toString());

        user.sessions.push({ refreshToken: hashToken(refreshToken), clientIp: data.clientIp, userAgent: data.userAgent });
        await user.save()
        const userInfo = userFormat(user)

        return {
            success: true, message: "User logged in successfully!", accessToken, refreshToken,
            user: userInfo
        };
    }

    async logout(userId: string, refreshToken: string): Promise<IBaseResponseDTO> {
        const user = await this.userRepository.findById(new Types.ObjectId(userId));
        if (!user) {
            throw throwlhos.default.err_notFound("User not found!");
        }
        const actualSession = user.sessions.some((session: ISession) => session.refreshToken === hashToken(refreshToken))
        if (!actualSession) {
            throw throwlhos.default.err_notFound("Session not found!");
        }

        await this.userRepository.deleteSessionByRefreshToken(userId, hashToken(refreshToken))

        return { success: true, message: "User logged out successfully!" };
    }
    async logoutAll(userId: string, refreshToken: string): Promise<IBaseResponseDTO> {
        const user = await this.userRepository.findById(new Types.ObjectId(userId));
        if (!user) {
            throw throwlhos.default.err_notFound("User not found!");
        }
        const actualSession = user.sessions.some((session: ISession) => session.refreshToken === hashToken(refreshToken))
        if (!actualSession) {
            throw throwlhos.default.err_notFound("Session not found!");
        }


        await this.userRepository.deleteAllSessionsByUserId(userId)

        return { success: true, message: "User logged out successfully!" };
    }
    async refresh(refreshToken: string, clientIp: string, userAgent: string): Promise<RefreshResponseDTO> {

        //validate refresh token
        const payload = await jwtService.verifyRefreshToken(refreshToken)
        if (!payload) {
            throw throwlhos.default.err_unauthorized("Invalid refresh token!");
        }

        // validate if user exists and if session exists
        const user = await this.userRepository.findById(new Types.ObjectId(payload.sub));
        if (!user) {
            throw throwlhos.default.err_notFound("User not found!");
        }
        if (!user.sessions.some((session: ISession) => session.refreshToken === hashToken(refreshToken))) {
            throw throwlhos.default.err_notFound("Session not found!");
        }

        // delete old session
        await this.userRepository.deleteSessionByRefreshToken(payload.sub, hashToken(refreshToken))


        // create new session
        const newRefreshToken = await jwtService.generateRefreshToken(user._id.toString());
        const accessToken = await jwtService.generateAccessToken(user._id.toString());

        user.sessions.push({ refreshToken: hashToken(newRefreshToken), clientIp, userAgent });
        await user.save()

        return { success: true, message: "User logged in successfully!", accessToken, refreshToken: newRefreshToken };
    }
    async me(userId: string): Promise<MeResponseDTO> {

        const user = await this.userRepository.findById(new Types.ObjectId(userId));
        if (!user) {
            throw throwlhos.default.err_notFound("User not found!");
        }
        const userInfo = userFormat(user)

        return { success: true, message: "User info fetched successfully!", user: userInfo };
    }

    async sessions(userId: string): Promise<SessionsResponseDTO> {
        const user = await this.userRepository.findById(new Types.ObjectId(userId));
        if (!user) {
            throw throwlhos.default.err_notFound("User not found!");
        }

        return { success: true, message: "User sessions fetched successfully!", sessions: user.sessions };

    }


}



