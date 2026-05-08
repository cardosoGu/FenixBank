import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.ts';

type JWTPayload = {
    _id: string;
}

class JWTService {

    generateAccessToken(payload: JWTPayload): string {
        return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
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
    parseExpiresInToMs(expiresIn: string): number {
        const unit = expiresIn.slice(-1);
        const value = parseInt(expiresIn.slice(0, -1));

        switch (unit) {
            case 'd':
                return value * 24 * 60 * 60 * 1000;
            case 'h':
                return value * 60 * 60 * 1000;
            case 'm':
                return value * 60 * 1000;
            case 's':
                return value * 1000;
            default:
                throw new Error(`Invalid expiresIn format: ${expiresIn}`);
        }
    }
}

export const jwtService = new JWTService();
