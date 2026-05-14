import { AuthService } from '../AuthService.ts'
import { MockAuthRepository } from './MockAuthRepository.ts'
import { UserRepository } from '../../../models/User/UserRepository.ts'
import throwlhos from "throwlhos";


export class MockAuthService extends AuthService {
    constructor() {
        super(new MockAuthRepository() as unknown as UserRepository)
    }

    override async refresh(refreshToken: string, clientIp: string, userAgent: string) {
        if (refreshToken === 'hashed_refresh_token_mock_1') {
            return {
                success: true,

                message: "Token refreshed successfully",

                accessToken: "mocked-access-token",

                refreshToken: "mocked-refresh-token",

                user: {
                    _id: "123",
                    email: "mock@example.com",
                },
            } as any
        }
        throw throwlhos.default.err_unauthorized("Invalid refresh token!");
    }
}
