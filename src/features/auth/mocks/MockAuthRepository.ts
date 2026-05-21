import { Types } from "mongoose";
import { IAccount, ISession, IUser, IUserMethods, UserRole } from "../../../models/User/IUser.ts";
import { hashToken } from "../../../utils/Crypto.ts";

// Mock User model
type MockUserDocument = IUser & IUserMethods & {
    _id: Types.ObjectId;
    save: () => Promise<MockUserDocument>;
};

// Helper function to create a mock user document
function createMockUser(data: {
    _id: string;
    name: string;
    email: string;
    password: string;
    cpf: string;
    sessions?: ISession[];
    account?: IAccount;
}): MockUserDocument {
    const user: MockUserDocument = {
        _id: new Types.ObjectId(data._id),
        name: data.name,
        email: data.email,
        password: data.password,
        cpf: data.cpf,
        role: UserRole.Customer,
        account: data.account ?? { pixKeys: [], balance: 0 },
        sessions: data.sessions ?? [],
        transactionLogs: [],
        get isAdmin() {
            return this.role === UserRole.Admin;
        },
        get hasPixKeys() {
            return this.account.pixKeys.length > 0;
        },
        passwordMatches: (plainPassword: string) => Promise.resolve(plainPassword === data.password),
        save: () => Promise.resolve(user),
    };

    return user;
}

export class MockAuthRepository {
    private users: MockUserDocument[] = [
        createMockUser({
            _id: '507f1f77bcf86cd799439011',
            name: 'João Silva',
            email: 'joao.silva@example.com',
            password: 'password-1',
            cpf: '06552942010',
            sessions: [
                { refreshToken: 'hashed_refresh_token_mock_1', clientIp: '192.168.1.100', userAgent: 'Mozilla/5.0' },
            ],
            account: { pixKeys: ['joao.silva@example.com'], balance: 20 },
        }),
        createMockUser({
            _id: '507f1f77bcf86cd799439012',
            name: 'Maria Santos',
            email: 'maria.santos@example.com',
            password: 'password-2',
            cpf: '72023899087',
            sessions: [
                { refreshToken: hashToken('hashed_refresh_token_mock_2'), clientIp: '192.168.1.101', userAgent: 'Mozilla/5.0' },
            ],
            account: { pixKeys: ['maria.santos@example.com'], balance: 200 },
        }),
        createMockUser({
            _id: '507f1f77bcf86cd799439013',
            name: 'Pedro Oliveira',
            email: 'pedro.oliveira@example.com',
            password: 'password-3',
            cpf: '42815967049',
            sessions: [
                { refreshToken: 'hashed_refresh_token_mock_3', clientIp: '192.168.1.102', userAgent: 'Mozilla/5.0' },
            ],
            account: { pixKeys: ['pedro.oliveira@example.com'], balance: 300 },
        }),
    ];

    findByEmail(email: string) {
        return Promise.resolve(this.users.find((user) => user.email === email) ?? null);
    }

    findById(id: Types.ObjectId) {
        return Promise.resolve(this.users.find((user) => user._id.toString() === id.toString()) ?? null);
    }

    create(data: Partial<IUser>) {
        const user = createMockUser({
            _id: new Types.ObjectId().toString(),
            name: data.name ?? 'Mock User',
            email: data.email ?? 'mock@example.com',
            password: data.password ?? 'password-123',
            cpf: data.cpf ?? '00000000000',
            sessions: [],
            account: data.account ?? { pixKeys: [], balance: 0 },
        });

        this.users.push(user);
        return Promise.resolve(user);
    }

    deleteSessionByRefreshToken(userId: string, refreshToken: string) {
        const user = this.users.find((candidate) => candidate._id.toString() === userId);
        if (!user) {
            return Promise.resolve({ acknowledged: false, matchedCount: 0, modifiedCount: 0 });
        }

        user.sessions = user.sessions.filter((session) => session.refreshToken !== refreshToken);
        return Promise.resolve({ acknowledged: true, matchedCount: 1, modifiedCount: 1 });
    }

    deleteAllSessionsByUserId(userId: string) {
        const user = this.users.find((candidate) => candidate._id.toString() === userId);
        if (!user) {
            return Promise.resolve({ acknowledged: false, matchedCount: 0, modifiedCount: 0 });
        }

        user.sessions = [];
        return Promise.resolve({ acknowledged: true, matchedCount: 1, modifiedCount: 1 });
    }

    pixKeyExists(pixKey: string) {
        return Promise.resolve(this.users.find((user) => user.account.pixKeys.includes(pixKey)) ?? null);
    }

    findByPixKey(pixKey: string) {
        return Promise.resolve(this.users.find((user) => user.account.pixKeys.includes(pixKey)) ?? null);
    }
    update(filter: Partial<IUser>, data: Partial<IUser>): Promise<IUser | null> {
        const user = this.users.find((u) => u._id.toString() === filter._id?.toString())

        if (!user) {
            return Promise.resolve(null)
        }

        Object.assign(user, data)

        return Promise.resolve(user)
    }
    updateById(id: Types.ObjectId, data: Partial<IUser>) {
        const user = this.users.find((candidate) => candidate._id.toString() === id.toString());
        if (!user) {
            return Promise.resolve(null);
        }
        Object.assign(user, data);
        return Promise.resolve(user);
    }

    get mockData() {
        return this.users;
    }
}
