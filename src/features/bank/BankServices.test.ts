import { assert } from "@std/assert";
import mongoose from "mongoose";
import { BankService } from "./BankServices.ts";
import { UserRepository } from "../../models/User/UserRepository.ts";
import { TransactionLogRepository } from "../../models/TransactionLogs/TransactionLogsRepository.ts";
import { MockAuthRepository } from "../auth/mocks/MockAuthRepository.ts";
import { MockTransactionLogRepository } from "./mocks/MockBankRepository.ts";

type SessionLike = {
    startTransaction: () => void;
    commitTransaction: () => Promise<void>;
    abortTransaction: () => Promise<void>;
    endSession: () => Promise<void>;
};

function createService() {
    const userRepository = new MockAuthRepository();
    const transactionLogRepository = new MockTransactionLogRepository();
    const service = new BankService(
        userRepository as unknown as UserRepository,
        transactionLogRepository as unknown as TransactionLogRepository,
    );

    return { service };
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

async function withMockedSession<T>(fn: () => Promise<T>) {
    const originalStartSession = mongoose.startSession;
    const fakeSession: SessionLike = {
        startTransaction: () => { },
        commitTransaction: () => Promise.resolve(),
        abortTransaction: () => Promise.resolve(),
        endSession: () => Promise.resolve(),
    };

    (mongoose as unknown as { startSession: () => Promise<SessionLike> }).startSession =
        () => Promise.resolve(fakeSession);

    try {
        return await fn();
    } finally {
        (mongoose as unknown as { startSession: typeof originalStartSession }).startSession =
            originalStartSession;
    }
}

Deno.test("BankService.transfer - should reject when receiver does not exist", async () => {
    const { service } = createService();

    await expectRejectMessage(
        () => service.transfer("507f1f77bcf86cd799439011", "missing-pix", 10),
        "Receiver not found",
    );
});

Deno.test("BankService.transfer - should reject transfer to self", async () => {
    const { service } = createService();

    await expectRejectMessage(
        () =>
            service.transfer(
                "507f1f77bcf86cd799439011",
                "joao.silva@example.com",
                5,
            ),
        "transfer to yourself",
    );
});

Deno.test("BankService.transfer - should reject when balance is insufficient", async () => {
    const { service } = createService();

    await expectRejectMessage(
        () =>
            service.transfer(
                "507f1f77bcf86cd799439011",
                "maria.santos@example.com",
                999,
            ),
        "Insufficient account balance",
    );
});

Deno.test("BankService.transfer - should transfer successfully with mocked transaction session", async () => {
    const { service } = createService();

    const result = await withMockedSession(() =>
        service.transfer(
            "507f1f77bcf86cd799439011",
            "maria.santos@example.com",
            5,
        )
    );

    assert(result.success);
    assert(result.transactionLog);
});

Deno.test("BankService.deposit - should reject invalid amount", async () => {
    const { service } = createService();

    await expectRejectMessage(
        () => service.deposit(0, "507f1f77bcf86cd799439011"),
        "Invalid deposit amount",
    );
});

Deno.test("BankService.getTransactions - should reject when user does not exist", async () => {
    const { service } = createService();

    await expectRejectMessage(
        () => service.getTransactions("000000000000000000000000", 1, 10),
        "User not found",
    );
});

Deno.test("BankService.getTransactionById - should reject unauthorized access", async () => {
    const { service } = createService();

    await expectRejectMessage(
        () =>
            service.getTransactionById(
                "6a0485b346f293e21cd310d5",
                "507f1f77bcf86cd799439013",
            ),
        "permission",
    );
});

Deno.test("BankService.addPixKey - should reject duplicated key in same account", async () => {
    const { service } = createService();

    await expectRejectMessage(
        () =>
            service.addPixKey(
                "507f1f77bcf86cd799439011",
                "joao.silva@example.com",
            ),
        "already registered in your account",
    );
});

Deno.test("BankService.removePixKey - should reject unknown key", async () => {
    const { service } = createService();

    await expectRejectMessage(
        () => service.removePixKey("507f1f77bcf86cd799439011", "missing-key"),
        "PIX key not found",
    );
});
