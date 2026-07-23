import { AuthService } from '../AuthService.ts'
import { MockAuthRepository } from './MockAuthRepository.ts'
import { UserRepository } from '../../../models/User/UserRepository.ts'
import throwlhos from "throwlhos";
import { RefreshResponseDTO } from "../AuthDTOs.ts";


export class MockAuthService extends AuthService {
    constructor() {
        super(new MockAuthRepository() as unknown as UserRepository)
    }

    override refresh(refreshToken: string, _clientIp: string, _userAgent: string): Promise<RefreshResponseDTO> {
        if (refreshToken === 'hashed_refresh_token_mock_1') {
            return Promise.resolve({
                success: true,
                message: "Token refreshed successfully",
                accessToken: "mocked-access-token",
                refreshToken: "mocked-refresh-token",
            });
        }
        throw throwlhos.default.err_unauthorized("Invalid refresh token!");
    }
}
