// deno-lint-ignore no-import-prefix
import {
    assert,
    assertEquals,
} from "https://deno.land/std@0.220.0/assert/mod.ts";
import { AuthService } from "./AuthService.ts";
import { MockAuthRepository } from "./mocks/MockAuthRepository.ts";
import { UserRepository } from "../../models/User/UserRepository.ts";

function createService() {
    const repository = new MockAuthRepository();
    const service = new AuthService(repository as unknown as UserRepository);
    return { service, repository };
}

async function expectRejectMessage(
    fn: () => Promise<unknown>,
    messagePart: string,
) {
    try {
        await fn();
        throw new Error("Expected promise to reject");
    } catch (error: unknown) {
        const message = error instanceof Error
            ? error.message
            : String((error as { message?: unknown })?.message ?? error);

        assert(
            message.toLowerCase().includes(messagePart.toLowerCase()),
            `Expected rejection message to include \"${messagePart}\", got \"${message}\"`,
        );
    }
}

Deno.test("AuthService.register - should reject duplicate email", async () => {
    const { service } = createService();

    await expectRejectMessage(
        () =>
            service.register(
                {
                    name: "Duplicated",
                    email: "pedro.oliveira@example.com",
                    cpf: "00000000000",
                    password: "password",
                    pixKeys: [],
                    balance: 100,
                },
                "127.0.0.1",
                "Deno",
            ),
        "Email already in use",
    );
});

Deno.test("AuthService.register - should append email and cpf to pix keys", async () => {
    const { service } = createService();

    const result = await service.register(
        {
            name: "New User",
            email: "new.user@example.com",
            cpf: "12345678900",
            password: "password",
            pixKeys: ["custom-key"],
            balance: 10,
        },
        "127.0.0.1",
        "Deno",
    );

    assert(result.success);
    assert(result.user.pixKeys.includes("custom-key"));
    assert(result.user.pixKeys.includes("new.user@example.com"));
    assert(result.user.pixKeys.includes("12345678900"));
});

Deno.test("AuthService.refresh - should reject invalid refresh token", async () => {
    const { service } = createService();

    await expectRejectMessage(
        () => service.refresh("invalid-token", "127.0.0.1", "Deno"),
        "jwt",
    );
});

Deno.test("AuthService.me - should reject when user does not exist", async () => {
    const { service } = createService();

    await expectRejectMessage(
        () => service.me("000000000000000000000000"),
        "User not found",
    );
});

Deno.test("AuthService.sessions - should reject when user does not exist", async () => {
    const { service } = createService();

    await expectRejectMessage(
        () => service.sessions("000000000000000000000000"),
        "User not found",
    );
});

Deno.test("AuthService.login - should reject invalid password", async () => {
    const { service } = createService();

    await expectRejectMessage(
        () =>
            service.login(
                {
                    email: "pedro.oliveira@example.com",
                    password: "wrong-password",

                    clientIp: "127.0.0.1",
                    userAgent: "Deno"
                }
            ),
        "Invalid credentials",
    );
});

Deno.test("AuthService.logoutAll - should clear all user sessions", async () => {
    const { service, repository } = createService();
    const userId = "507f1f77bcf86cd799439012";

    const before = await repository.findById({ toString: () => userId } as never);
    assert(before);
    assert(before.sessions.length > 0);

    const currentRefreshToken = "hashed_refresh_token_mock_2";
    const result = await service.logoutAll(userId, currentRefreshToken);

    assert(result.success);
    const after = await repository.findById({ toString: () => userId } as never);
    assert(after);
    assertEquals(after.sessions.length, 0);
});
