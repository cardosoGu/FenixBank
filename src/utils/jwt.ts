import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.ts';



class JWTService {

    generateAccessToken(userId: string): string {
        return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, {
            expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
        });
    }

    generateRefreshToken(userId: string): string {
        return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, {
            expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
        });
    }

verifyAccessToken(token: string): { sub: string } {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string };
}

verifyRefreshToken(token: string): { sub: string } {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string };
}
}

export const jwtService = new JWTService();
