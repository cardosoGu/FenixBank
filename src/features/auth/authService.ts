import { UserRepository } from "../../models/User/UserRepository.ts";
import { IUserDTO, IUserLoginDTO } from "./AuthDTOs.ts";
import { jwtService } from "../../utils/Jwt.ts"
import { ISession } from "../../models/User/IUser.ts";
import { Types } from "mongoose";

export class AuthService {
    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }
    private userRepository: UserRepository

    async register(data: IUserDTO, clientIp: string, userAgent: string) {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            return { success: false, message: "Email already in use!" };
        }

        const user = await this.userRepository.create({
            name: data.name,
            email: data.email,
            cpf: data.cpf,
            password: data.password,
            account: {
                pixKeys: data.pixKeys,
                balance: data.balance,
            },
        });
        if (!user) {
            return { success: false, message: "Error creating user!" };
        }
        const refreshToken = await jwtService.generateRefreshToken(user._id.toString());
        const accessToken = await jwtService.generateAccessToken(user._id.toString());

        await user.sessions.push({ refreshToken, clientIp, userAgent });
        await user.save()

        return { success: true, message: "User created successfully!", accessToken, refreshToken, user };
    }

    async login(data: IUserLoginDTO, clientIp: string, userAgent: string) {
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            return { success: false, message: "Invalid email or password!" };
        }

        const isPasswordValid = await user.passwordMatches(data.password);
        if (!isPasswordValid) {
            return { success: false, message: "Invalid email or password!" };
        }

        const refreshToken = await jwtService.generateRefreshToken(user._id.toString());
        const accessToken = await jwtService.generateAccessToken(user._id.toString());

        await user.sessions.push({ refreshToken, clientIp, userAgent });
        await user.save()

        return { success: true, message: "User logged in successfully!", user, accessToken, refreshToken };
    }

    async logout(userId: string, refreshToken: string) {
        const user = await this.userRepository.findById(new Types.ObjectId(userId));
        if (!user) {
            return { success: false, message: "User not found!" };
        }
        const actualSession = await user.sessions.find((session: ISession) => session.refreshToken === refreshToken);
        if (!actualSession) {
            return { success: false, message: "Session not found!" };
        }

        await this.userRepository.deleteSessionByRefreshToken(userId, refreshToken)

        return { success: true, message: "User logged out successfully!" };
    }
    async logoutAll(userId: string) {
        const user = await this.userRepository.findById(new Types.ObjectId(userId));
        if (!user) {
            return { success: false, message: "User not found!" };
        }

        await this.userRepository.deleteAllSessionsByUserId(userId)

        return { success: true, message: "User logged out successfully!" };
    }
    async refresh(refreshToken: string, clientIp: string, userAgent: string) {

        //validate refresh token
        const payload = await jwtService.verifyRefreshToken(refreshToken)
        if (!payload) {
            return { success: false, message: "Invalid refresh token!" };
        }

        // validate if user exists and if session exists
        const user = await this.userRepository.findById(new Types.ObjectId(payload.sub));
        if (!user) {
            return { success: false, message: "User not found!" };
        }
        if (!user.sessions.some((session: ISession) => session.refreshToken === refreshToken)) {
            return { success: false, message: "Session not found!" };
        }

        // delete old session
        await this.userRepository.deleteSessionByRefreshToken(payload.sub, refreshToken)


        // create new session
        const newRefreshToken = await jwtService.generateRefreshToken(user._id.toString());
        const accessToken = await jwtService.generateAccessToken(user._id.toString());

        await user.sessions.push({ refreshToken: newRefreshToken, clientIp, userAgent });
        await user.save()

        return { success: true, message: "User logged in successfully!", user, accessToken, refreshToken: newRefreshToken };
    }
    async me(userId: string) {

        const user = await this.userRepository.findById(new Types.ObjectId(userId));
        if (!user) {
            return { success: false, message: "User not found!" };
        }
        return { success: true, message: "User info fetched successfully!", user };
    }
}
